import type { SupabaseClient } from '@supabase/supabase-js'

export type GeneratedNotice = {
  title: string
  signage_body: string
  poster_body: string
  circular_body: string
}

// メモを先に保存する（生成に失敗しても入力が消えないように）
export async function saveMemoDraft(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  memo: string,
): Promise<{ id: string } | { error: string }> {
  const { data: notice, error } = await supabase.from('notices').insert({
    organization_id: orgId,
    created_by: userId,
    title: memo.slice(0, 20),
    source_memo: memo,
  }).select().single()
  if (error || !notice) return { error: '保存に失敗しました' }
  return { id: notice.id }
}

export async function requestGeneration(
  memo: string,
): Promise<GeneratedNotice | { error: string }> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ memo }),
  })
  if (!res.ok) return { error: 'generation_failed' }
  return res.json()
}

export async function applyGeneratedContent(
  supabase: SupabaseClient,
  noticeId: string,
  generated: GeneratedNotice,
): Promise<void> {
  await supabase.from('notices').update({
    title: generated.title,
    signage_body: generated.signage_body,
    poster_body: generated.poster_body,
    circular_body: generated.circular_body,
  }).eq('id', noticeId)
}
