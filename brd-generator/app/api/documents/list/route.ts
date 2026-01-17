import { NextRequest, NextResponse } from 'next/server'
import { getDocuments } from '@/lib/db/documents'
import { getAuthUser } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('project_id')

    const documents = await getDocuments(projectId || undefined)

    return NextResponse.json({
      success: true,
      documents,
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
