'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// ログイン状態と所属組合を読み込む（組合が無ければ自動で作る）
export function useOrgSession() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUser(user)

      const { data: m } = await supabase.from('memberships').select('organization_id').limit(1)
      let currentOrgId = m && m.length > 0 ? m[0].organization_id : null

      if (!currentOrgId) {
        const { data: org } = await supabase.from('organizations')
          .insert({ name: 'さくら台マンション管理組合' }).select().single()
        if (org) {
          await supabase.from('memberships')
            .insert({ user_id: user.id, organization_id: org.id, role: 'chair' })
          currentOrgId = org.id
        }
      }

      if (currentOrgId) {
        setOrgId(currentOrgId)
        const { data: org } = await supabase.from('organizations')
          .select('name').eq('id', currentOrgId).single()
        if (org) setOrgName(org.name)
      }
    }
    load()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return { user, orgId, orgName, logout }
}
