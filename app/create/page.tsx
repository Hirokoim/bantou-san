'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES, type TemplateId } from '@/lib/templates'

export default function CreatePage() {
  const supabase = createClient()
  const router = useRouter()
  const [memo, setMemo] = useState('')
  const [templateId, setTemplateId] = useState<TemplateId>('free')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 「番頭さんに作ってもらう」ボタン
  const generate = async () => {
    setLoading(true)
    setErrorMsg('')

    // 1. 先にメモ原文をDBに保存（生成に失敗しても入力が消えないように）
    const { data: m } = await supabase.from('memberships').select('organization_id').limit(1)
    const orgId = m?.[0]?.organization_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!orgId || !user) { setErrorMsg('ログインし直してください'); setLoading(false); return }

    const { data: notice, error: insertError } = await supabase.from('notices').insert({
      organization_id: orgId,
      created_by: user.id,
      title: memo.slice(0, 20),
      source_memo: memo,
    }).select().single()
    if (insertError || !notice) { setErrorMsg('保存に失敗しました'); setLoading(false); return }

    // 2. 番頭さん（Claude API）に3形式を作ってもらう
    const template = TEMPLATES.find((t) => t.id === templateId)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ memo, templateHint: template?.label === '自由に書く' ? '' : template?.label }),
    })

    if (!res.ok) {
      // メモは保存済みであることを伝える（主機能が生きている安心感）
      setErrorMsg('番頭さんが席を外しているようです。メモは保存されていますので、もう一度お試しください。')
      setLoading(false)
      return
    }

    const generated = await res.json()

    // 3. 生成結果をDBに書き込んでプレビュー画面へ
    await supabase.from('notices').update({
      title: generated.title,
      signage_body: generated.signage_body,
      poster_body: generated.poster_body,
      circular_body: generated.circular_body,
    }).eq('id', notice.id)

    router.push(`/preview/${notice.id}`)  // プレビュー画面は次のステップで作成
  }

  // ローディング中は「番頭さんが考えています…」の全画面表示（AIという言葉は出さない）
  if (loading) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <p className="text-2xl">番頭さんが考えています…</p>
      <p className="text-lg text-gray-600">少々お待ちください</p>
    </main>
  )

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">お知らせを作る</h1>

      {/* テンプレート選択（大きなボタンで横並び） */}
      <div>
        <p className="mb-2 text-lg">どんなお知らせですか？</p>
        <div className="flex flex-wrap gap-3">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => setTemplateId(t.id)}
              className={`min-h-[44px] rounded-lg border-2 px-5 py-3 text-lg ${
                templateId === t.id ? 'border-blue-600 bg-blue-50 font-bold' : 'border-gray-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        {TEMPLATES.find((t) => t.id === templateId)?.hint && (
          <p className="mt-2 text-base text-gray-600">
            ヒント：{TEMPLATES.find((t) => t.id === templateId)?.hint}
          </p>
        )}
      </div>

      {/* メモ入力（大きな入力欄1つだけ） */}
      <div>
        <p className="mb-2 text-lg">どんなことをお知らせしたいですか？メモ書きで大丈夫です。</p>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={6}
          className="w-full rounded-lg border-2 border-gray-300 p-4 text-lg"
          placeholder="例：今月の理事会でエントランスの電球交換が決まりました。来週の水曜日に業者が来ます。" />
      </div>

      {errorMsg && (
        <p className="rounded-lg bg-red-50 p-4 text-lg text-red-700">{errorMsg}</p>
      )}

      <button onClick={generate} disabled={!memo.trim()}
        className="min-h-[56px] w-full rounded-lg bg-blue-600 text-xl font-bold text-white disabled:opacity-40">
        番頭さんに作ってもらう
      </button>
    </main>
  )
}
