'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import NoticeDetailPanel from '../_components/NoticeDetailPanel'

type NoticeSummary = { id: string; title: string; created_at: string }

function ArchiveContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedId = searchParams.get('id')
  const [notices, setNotices] = useState<NoticeSummary[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
      const list = data ?? []
      setNotices(list)
      const wanted = requestedId && list.some((n) => n.id === requestedId) ? requestedId : list[0]?.id
      if (wanted) setSelectedId(wanted)
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-washi p-6">
      <div className="mx-auto max-w-5xl space-y-6">
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
          <div className="flex flex-col gap-4 md:flex-row">
            <ul className="space-y-1 rounded-xl border border-line bg-card p-2 md:w-[40%] md:flex-none">
              {notices.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setSelectedId(n.id)}
                    className={`flex min-h-[52px] w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left ${
                      selectedId === n.id ? 'bg-ai text-white' : 'text-ink'
                    }`}
                  >
                    <span className="text-lg">{n.title}</span>
                    <span className={`flex-none text-base ${selectedId === n.id ? 'text-white/80' : 'text-[#5C544A]'}`}>
                      {new Date(n.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="md:flex-1">
              {selectedId && <NoticeDetailPanel key={selectedId} noticeId={selectedId} />}
            </div>
          </div>
        )}

        <Link href="/" className="inline-block min-h-[44px] py-2 text-lg font-bold text-ai underline">
          番頭さんに戻る
        </Link>
      </div>
    </main>
  )
}

export default function ArchivePage() {
  return (
    <Suspense fallback={null}>
      <ArchiveContent />
    </Suspense>
  )
}
