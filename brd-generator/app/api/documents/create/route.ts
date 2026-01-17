import { NextRequest, NextResponse } from 'next/server'
import { createDocument } from '@/lib/db/documents'
import { getFileType } from '@/lib/processors'
import { getAuthUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename, storagePath, fileSize, projectId } = await request.json()

    if (!filename || !storagePath || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const fileType = getFileType(filename)

    if (!fileType) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Create document record
    const document = await createDocument(
      filename,
      fileType,
      storagePath,
      fileSize,
      projectId
    )

    return NextResponse.json({
      success: true,
      document,
    })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document record' },
      { status: 500 }
    )
  }
}
