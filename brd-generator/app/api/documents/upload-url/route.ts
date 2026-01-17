import { NextRequest, NextResponse } from 'next/server'
import { generateStoragePath } from '@/lib/storage/upload'
import { getAuthUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename, projectId } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'No project ID provided' }, { status: 400 })
    }

    // Generate storage path
    const storagePath = generateStoragePath(user.id, filename)

    return NextResponse.json({
      success: true,
      storagePath,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  } catch (error) {
    console.error('Error generating upload URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
