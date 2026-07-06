'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Notice = {
  id: string
  title: string
  signage_body: string | null
  poster_body: string | null
  circular_body: string | null
}

const TABS = [
  { id: 'signage', label: 'サイネージ', field: 'signage_body' },
  { id: 'poster', label: '掲示板ポスター', field: 'poster_body' },
  { id: 'circular', label: '回覧板', field: 'circular_body' },
] as const

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('signage')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('notices')
        .select('id, title, signage_body, poster_body, circular_body')
        .eq('id', id).single()
      setNotice(data)
    }
    load()
  }, [id])

  if (!notice) return (
    <main style={{ background: '#f3ecdd', minHeight: '100vh' }} className="flex items-center justify-center">
      <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", color: '#5c554a' }} className="text-lg">
        読み込んでいます…
      </p>
    </main>
  )

  const activeTab = TABS.find((t) => t.id === tab)!
  const body = notice[activeTab.field]

  return (
    <main style={{ background: '#f3ecdd', minHeight: '100vh' }} className="p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1
          style={{ fontFamily: "'Shippori Mincho', serif", color: '#1b4a6e', letterSpacing: '0.04em' }}
          className="text-2xl font-bold"
        >
          {notice.title}
        </h1>

        {/* 形式タブ */}
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                background: tab === t.id ? '#1b4a6e' : '#fff',
                color: tab === t.id ? '#fbf6ea' : '#3d372e',
                borderRadius: '8px',
              }}
              className="min-h-[44px] px-5 py-2 text-base font-bold shadow-sm"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 本文カード */}
        <div
          style={{
            background: '#fff',
            borderRadius: '11px',
            boxShadow: '0 2px 8px rgba(43,38,32,0.06)',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            color: '#2b2620',
          }}
          className="whitespace-pre-wrap p-8 text-lg leading-relaxed"
        >
          {body || 'この形式の文章はまだ生成されていません。'}
        </div>

        <button
          onClick={() => router.push('/')}
          style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", color: '#1b4a6e' }}
          className="underline"
        >
          トップに戻る
        </button>
      </div>
    </main>
  )
}
