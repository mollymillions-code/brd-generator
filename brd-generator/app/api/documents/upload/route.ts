import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, generateStoragePath } from '@/lib/storage/upload'
import { createDocument } from '@/lib/db/documents'
import { getFileType, isValidFileType } from '@/lib/processors'
import { getAuthUser } from '@/lib/auth/api-auth'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('project_id') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'No project ID provided' }, { status: 400 })
    }

    // Validate file type
    if (!isValidFileType(file.name)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Supported: PDF, DOCX, TXT, CSV, XLSX, Audio (MP3, WAV, M4A)',
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      )
    }

    const fileType = getFileType(file.name)!

    // Upload to Supabase Storage
    const storagePath = generateStoragePath(user.id, file.name)
    await uploadFile(file, storagePath)

    // Create document record
    const document = await createDocument(
      file.name,
      fileType,
      storagePath,
      file.size,
      projectId
    )

    return NextResponse.json({
      success: true,
      document,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
