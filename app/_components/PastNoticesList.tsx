'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type NoticeSummary = { id: string; title: string; created_at: string }

const RECENT_DAYS = 7

type Filtered = { recent: NoticeSummary[]; hasOlder: boolean }

export default function PastNoticesList({ orgId }: { orgId: string }) {
  const supabase = createClient()
  const [filtered, setFiltered] = useState<Filtered | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('notices')
        .select('id, title, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
      const notices = data ?? []
      if (notices.length === 0) { setIsEmpty(true); return }

      const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000
      const recent = notices.filter((n) => new Date(n.created_at).getTime() >= cutoff)
      setFiltered({ recent, hasOlder: recent.length < notices.length })
    }
    load()
  }, [orgId])

  if (!isEmpty && filtered === null) return null

  if (isEmpty) {
    return (
      <div className="max-w-[92%] rounded-xl border border-line bg-card p-4 text-lg">
        まだお知らせがありません。
      </div>
    )
  }

  const { recent, hasOlder } = filtered!

  return (
    <div className="max-w-[92%] space-y-3">
      <ul className="space-y-2 rounded-xl border border-line bg-card p-4">
        {recent.map((n) => (
          <li key={n.id} className="border-b border-line pb-2 last:border-0 last:pb-0">
            <Link
              href={`/archive?id=${n.id}`}
              className="flex min-h-[44px] items-baseline justify-between gap-3 rounded-lg px-1 hover:bg-washi"
            >
              <span className="text-lg underline">{n.title}</span>
              <span className="flex-none text-base text-[#5C544A]">
                {new Date(n.created_at).toLocaleDateString('ja-JP')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {hasOlder && (
        <div className="rounded-xl border border-line bg-card p-4 text-lg">
          それより前に作成したお知らせは、こちらの蔵からご覧ください。
          <Link href="/archive" className="ml-1 font-bold text-ai underline">
            蔵を見る
          </Link>
        </div>
      )}
    </div>
  )
}
