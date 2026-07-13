'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type NoticeSummary = { id: string; title: string; created_at: string }

export default function ArchivePage() {
  const supabase = createClient()
  const router = useRouter()
  const [notices, setNotices] = useState<NoticeSummary[] | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: m } = await supabase.from('memberships').select('organization_id').limit(1)
      const orgId = m?.[0]?.organization_id
      if (!orgId) return

      const { data } = await supabase.from('notices')
        .select('id, title, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
      setNotices(data ?? [])
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-washi p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-ink font-display text-lg font-extrabold text-ink">
            蔵
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink">蔵</h1>
            <p className="text-base text-[#5C544A]">これまでのお知らせをすべてご覧いただけます</p>
          </div>
        </div>

        {notices === null ? (
          <p className="text-lg">読み込んでいます…</p>
        ) : notices.length === 0 ? (
          <p className="rounded-xl border border-line bg-card p-4 text-lg">まだお知らせがありません。</p>
        ) : (
          <ul className="space-y-2 rounded-xl border border-line bg-card p-4">
            {notices.map((n) => (
              <li key={n.id} className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                <span className="text-lg">{n.title}</span>
                <span className="flex-none text-base text-[#5C544A]">
                  {new Date(n.created_at).toLocaleDateString('ja-JP')}
                </span>
              </li>
            ))}
          </ul>
        )}

        <Link href="/" className="inline-block min-h-[44px] py-2 text-lg font-bold text-ai underline">
          番頭さんに戻る
        </Link>
      </div>
    </main>
  )
}
