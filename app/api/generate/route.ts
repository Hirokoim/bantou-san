import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 番頭さんの生成プロンプト。3形式をJSONで一度に返させる（API呼び出し1回で済ませてコスト削減）
const SYSTEM_PROMPT = `あなたはマンション管理組合のお知らせ文を作る専門家です。
理事が書いたメモから、以下の3形式のお知らせを作成してください。

読者はマンションの居住者で、高齢の方が多く含まれます。
- 平易な日本語を使う（難しい熟語・カタカナ語を避ける）
- 短い文で書く
- 日時・場所など重要な情報は必ず含める

以下のJSON形式のみで回答してください（前後の説明文・コードブロック記号は不要）：
{
  "title": "お知らせのタイトル（20文字以内）",
  "signage_body": "サイネージ用。1画面で読み切れる分量（見出し＋本文3〜5行）。改行で構成",
  "poster_body": "掲示板ポスター用。タイトル・本文・日付・管理組合名の構成で、印刷して貼れる完成文",
  "circular_body": "回覧板用。ですます調の丁寧な文章。宛名（居住者各位）と結び（管理組合）を含む"
}`

export async function POST(request: Request) {
  // 1. ログイン確認（未ログインの呼び出しを拒否）
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 2. 入力検証（空・長すぎるメモを弾く）
  const { memo, templateHint } = await request.json()
  if (typeof memo !== 'string' || memo.trim().length === 0 || memo.length > 2000) {
    return NextResponse.json({ error: 'invalid_memo' }, { status: 400 })
  }

  try {
    // 3. Gemini API呼び出し（タイムアウト30秒。生成は数秒〜十数秒かかるため長めに設定）
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{
            role: 'user',
            parts: [{
              text: `メモ：${memo}\n${templateHint ? `補足：これは「${templateHint}」の類型のお知らせです` : ''}`,
            }],
          }],
        }),
        signal: AbortSignal.timeout(30000),
      },
    )

    if (!res.ok) {
      const body = await res.text()
      console.error('gemini api error body:', body)
      throw new Error(`gemini_api_${res.status}`)
    }

    const data = await res.json()
    // 念のためコードブロック記号を除去してからJSONとして読む
    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').replace(/```json|```/g, '').trim()
    const generated = JSON.parse(text)

    return NextResponse.json(generated)
  } catch (e) {
    // 4. エラーの翻訳：外部APIの生エラーをユーザーに見せない
    console.error('generate failed:', e)
    return NextResponse.json({ error: 'generation_failed' }, { status: 502 })
  }
}
