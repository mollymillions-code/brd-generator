import { supabaseAdmin, TABLES } from './supabase'
import { Document } from '@/types'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function createDocument(
  filename: string,
  fileType: string,
  storagePath: string,
  fileSize?: number,
  projectId?: string
): Promise<Document> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .insert({
      project_id: projectId || '00000000-0000-0000-0000-000000000001',
      user_id: DEFAULT_USER_ID,
      filename,
      file_type: fileType,
      storage_path: storagePath,
      file_size: fileSize,
      processed: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw new Error('Failed to create document record')
  }

  return data
}

export async function updateDocumentStatus(
  documentId: string,
  processed: boolean,
  error?: string
): Promise<void> {
  const updateData: Record<string, unknown> = {
    processed,
    processed_at: new Date().toISOString(),
  }

  if (error) {
    updateData.error = error
  }

  const { error: updateError } = await supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .update(updateData)
    .eq('id', documentId)

  if (updateError) {
    console.error('Error updating document status:', updateError)
    throw new Error('Failed to update document status')
  }
}

export async function getDocuments(projectId?: string): Promise<Document[]> {
  let query = supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .select('*')

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query.order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    throw new Error('Failed to fetch documents')
  }

  return data || []
}

export async function getDocumentById(documentId: string): Promise<Document | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .select('*')
    .eq('id', documentId)
    .single()

  if (error) {
    console.error('Error fetching document:', error)
    return null
  }

  return data
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .delete()
    .eq('id', documentId)

  if (error) {
    console.error('Error deleting document:', error)
    throw new Error('Failed to delete document')
  }
}

export async function getProcessedDocuments(userId?: string, projectId?: string): Promise<Document[]> {
  let query = supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .select('*')
    .eq('user_id', userId || DEFAULT_USER_ID)
    .eq('processed', true)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query.order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching processed documents:', error)
    throw new Error('Failed to fetch processed documents')
  }

  return data || []
}
