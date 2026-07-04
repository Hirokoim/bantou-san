'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [memo, setMemo] = useState('')
  const [notices, setNotices] = useState<{ id: string; title: string; source_memo: string }[]>([])

  // 起動時：ログイン状態と所属組合・お知らせ一覧を読み込む
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return
      const { data: m } = await supabase.from('memberships').select('organization_id').limit(1)
      if (m && m.length > 0) {
        setOrgId(m[0].organization_id)
        const { data: n } = await supabase.from('notices')
          .select('id, title, source_memo').order('created_at', { ascending: false })
        setNotices(n ?? [])
      }
    }
    load()
  }, [])

  // Googleでログイン
  const login = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/auth/callback` },
  })

  const logout = async () => { await supabase.auth.signOut(); location.reload() }

  // 組合を作成し、自分を理事長として登録する（初回のみ）
  const createOrg = async () => {
    const { data: org, error } = await supabase.from('organizations')
      .insert({ name: 'テスト管理組合' }).select().single()
    if (error || !org) { alert('組合の作成に失敗: ' + error?.message); return }
    await supabase.from('memberships')
      .insert({ user_id: user!.id, organization_id: org.id, role: 'chair' })
    setOrgId(org.id)
  }

  // お知らせを1件保存する（動作確認用。生成機能は次のステップで実装）
  const saveNotice = async () => {
    const { error } = await supabase.from('notices').insert({
      organization_id: orgId,
      created_by: user!.id,
      title: memo.slice(0, 20),
      source_memo: memo,
    })
    if (error) { alert('保存に失敗: ' + error.message); return }
    setMemo('')
    location.reload()
  }

  if (!user) return (
    <main className="p-8">
      <button onClick={login} className="rounded bg-blue-600 px-6 py-3 text-lg text-white">
        Googleでログイン
      </button>
    </main>
  )

  return (
    <main className="p-8 space-y-4">
      <div className="flex gap-4 items-center">
        <p>{user.email} でログイン中</p>
        <button onClick={logout} className="underline">ログアウト</button>
      </div>
      {!orgId ? (
        <button onClick={createOrg} className="rounded bg-green-600 px-6 py-3 text-lg text-white">
          テスト組合を作成
        </button>
      ) : (
        <>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)}
            className="w-full max-w-lg border p-3 text-lg" rows={3}
            placeholder="お知らせのメモを入力（動作確認用）" />
          <button onClick={saveNotice} disabled={!memo}
            className="block rounded bg-blue-600 px-6 py-3 text-lg text-white disabled:opacity-40">
            保存
          </button>
          <ul className="max-w-lg space-y-2">
            {notices.map((n) => (
              <li key={n.id} className="border p-3">{n.source_memo}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
