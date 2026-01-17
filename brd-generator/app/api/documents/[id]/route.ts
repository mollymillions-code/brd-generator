import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/api-auth'
import { getDocumentById, deleteDocument } from '@/lib/db/documents'
import { deleteChunksByDocumentId } from '@/lib/db/vectors'
import { deleteFile } from '@/lib/storage/upload'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = params.id

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Get document details to retrieve storage path
    const document = await getDocumentById(documentId)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete in order: chunks -> document -> storage file
    // Note: chunks will be automatically deleted due to CASCADE constraint,
    // but we'll explicitly delete them for clarity and error handling
    try {
      await deleteChunksByDocumentId(documentId)
    } catch (error) {
      console.error('Error deleting chunks (may not exist):', error)
      // Continue even if chunks don't exist
    }

    // Delete document record from database
    await deleteDocument(documentId)

    // Delete file from storage
    try {
      await deleteFile(document.storage_path)
    } catch (error) {
      console.error('Error deleting file from storage:', error)
      // Log but don't fail if storage file is already gone
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
