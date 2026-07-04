import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Googleでのログイン完了後、Supabaseがここに戻してくる
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)  // 認可コードをログイン状態に交換
  }
  return NextResponse.redirect(origin)  // ホームに戻る
}
