-- Enable pg_net so we can make HTTP calls from Postgres triggers.
create extension if not exists pg_net with schema extensions;

-- Trigger function: when a briefing's status transitions INTO 'sent',
-- POST the row to the on_briefing_sent Edge Function asynchronously.
-- We read WEBHOOK_SECRET from a GUC set per-database so it doesn't live
-- in the migration file. Set it once via:
--   ALTER DATABASE postgres SET app.webhook_secret = '<random-string>';
create or replace function public.notify_on_briefing_sent()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  webhook_url    text := 'https://uacfpdxmgzidecyvlyfm.supabase.co/functions/v1/on_briefing_sent';
  webhook_secret text;
begin
  -- Only fire on a real transition into 'sent' (matches Edge Function guard).
  if TG_OP <> 'UPDATE' then return NEW; end if;
  if NEW.status <> 'sent' then return NEW; end if;
  if OLD.status = 'sent' then return NEW; end if;

  -- Best-effort read of the shared secret GUC; empty string if unset.
  begin
    webhook_secret := current_setting('app.webhook_secret', true);
  exception when others then
    webhook_secret := '';
  end;

  perform net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', coalesce(webhook_secret, '')
    ),
    body := jsonb_build_object(
      'type', 'UPDATE',
      'table', 'briefings',
      'schema', 'public',
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    )
  );

  return NEW;
end;
$$;

-- Trigger — AFTER UPDATE on status so we only fire when the status column itself changes.
drop trigger if exists trg_on_briefing_sent on public.briefings;
create trigger trg_on_briefing_sent
after update of status on public.briefings
for each row
execute function public.notify_on_briefing_sent();

comment on function public.notify_on_briefing_sent() is
  'Fires on briefings.status -> sent transition; POSTs payload to on_briefing_sent Edge Function (REG-13).';
