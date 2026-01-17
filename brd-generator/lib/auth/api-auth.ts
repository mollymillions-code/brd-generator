import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from './supabase-auth'

export async function requireAuth(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return { session, user: session.user }
}

export async function getAuthUser() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
