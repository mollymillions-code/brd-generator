import { NextRequest, NextResponse } from 'next/server'
import { getBRDsByProject } from '@/lib/db/projects'
import { getAuthUser } from '@/lib/auth/api-auth'

// GET - List BRDs for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const brds = await getBRDsByProject(id)

    return NextResponse.json({
      success: true,
      brds,
    })
  } catch (error) {
    console.error('Error fetching BRDs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch BRDs' },
      { status: 500 }
    )
  }
}
