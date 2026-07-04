import { createBrowserClient } from '@supabase/ssr'

// ブラウザ（画面側）で使うSupabase接続を作る
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
