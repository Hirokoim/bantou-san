'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type NoticeSummary = { id: string; title: string; created_at: string }

export default function PastNoticesList({ orgId }: { orgId: string }) {
  const supabase = createClient()
  const [notices, setNotices] = useState<NoticeSummary[] | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('notices')
        .select('id, title, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
      setNotices(data ?? [])
    }
    load()
  }, [orgId])

  if (notices === null) return null

  if (notices.length === 0) {
    return (
      <div className="max-w-[92%] rounded-xl border border-line bg-card p-4 text-base">
        まだお知らせがありません。
      </div>
    )
  }

  return (
    <ul className="max-w-[92%] space-y-2 rounded-xl border border-line bg-card p-4">
      {notices.map((n) => (
        <li key={n.id} className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
          <span className="text-base">{n.title}</span>
          <span className="flex-none text-sm text-[#5C544A]">
            {new Date(n.created_at).toLocaleDateString('ja-JP')}
          </span>
        </li>
      ))}
    </ul>
  )
}
