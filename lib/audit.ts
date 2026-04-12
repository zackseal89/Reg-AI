import { SupabaseClient } from '@supabase/supabase-js'

export async function logAudit(
  supabase: SupabaseClient,
  params: {
    userId: string
    action: string
    entityType: string
    entityId?: string
    details?: Record<string, unknown>
  }
) {
  await supabase.from('audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    details: params.details,
  })
}
