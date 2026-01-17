import { NextRequest, NextResponse } from 'next/server'
import { downloadFile } from '@/lib/storage/upload'
import { getDocumentById, updateDocumentStatus } from '@/lib/db/documents'
import { processDocument } from '@/lib/processors'
import { chunkText } from '@/lib/processors/chunker'
import { generateEmbeddings } from '@/lib/ai/embeddings'
import { insertChunks } from '@/lib/db/vectors'
import { FileType } from '@/types'
import { getAuthUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // Get document from database
    const document = await getDocumentById(documentId)
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (document.processed) {
      return NextResponse.json(
        { error: 'Document already processed' },
        { status: 400 }
      )
    }

    try {
      // Download file from storage
      const fileBuffer = await downloadFile(document.storage_path)

      // Process document to extract text
      const text = await processDocument(
        fileBuffer,
        document.file_type as FileType,
        document.filename
      )

      if (!text || text.trim().length === 0) {
        throw new Error('No text extracted from document')
      }

      // Chunk the text
      const chunks = chunkText(text)

      // Generate embeddings for all chunks
      const chunkTexts = chunks.map(c => c.content)
      const embeddings = await generateEmbeddings(chunkTexts)

      // Prepare chunks for insertion
      const chunksToInsert = chunks.map((chunk, index) => ({
        document_id: documentId,
        content: chunk.content,
        embedding: embeddings[index],
        chunk_index: chunk.index,
        metadata: {
          filename: document.filename,
          file_type: document.file_type,
        },
      }))

      // Insert chunks into database
      await insertChunks(chunksToInsert)

      // Update document status
      await updateDocumentStatus(documentId, true)

      return NextResponse.json({
        success: true,
        chunksCount: chunks.length,
        message: 'Document processed successfully',
      })
    } catch (processingError) {
      // Update document with error
      const errorMessage =
        processingError instanceof Error
          ? processingError.message
          : 'Unknown error'
      await updateDocumentStatus(documentId, false, errorMessage)

      return NextResponse.json(
        { error: `Failed to process document: ${errorMessage}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}
