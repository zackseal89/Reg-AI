-- Enable pg_net so we can make HTTP calls from Postgres triggers.
create extension if not exists pg_net with schema extensions;

-- The shared webhook secret is stored in Supabase Vault (not a GUC — hosted
-- Supabase blocks custom GUCs). Insert once via the Dashboard SQL editor:
--   select vault.create_secret('<random-string>', 'webhook_secret', 'on_briefing_sent shared secret');
-- The same value must be set as WEBHOOK_SECRET in the Edge Function secrets.

-- Trigger function: when a briefing's status transitions INTO 'sent',
-- POST the row to the on_briefing_sent Edge Function asynchronously.
create or replace function public.notify_on_briefing_sent()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  webhook_url    text := 'https://uacfpdxmgzidecyvlyfm.supabase.co/functions/v1/on_briefing_sent';
  webhook_secret text;
begin
  -- Only fire on a real transition into 'sent' (matches Edge Function guard).
  if TG_OP <> 'UPDATE' then return NEW; end if;
  if NEW.status <> 'sent' then return NEW; end if;
  if OLD.status = 'sent' then return NEW; end if;

  -- Best-effort read of the shared secret from Vault; empty string if unset.
  begin
    select decrypted_secret into webhook_secret
    from vault.decrypted_secrets
    where name = 'webhook_secret'
    limit 1;
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
