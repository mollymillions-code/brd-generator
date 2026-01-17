import { supabaseAdmin, TABLES } from './supabase'
import { DocumentChunk } from '@/types'

export interface SimilarChunk {
  id: string
  document_id: string
  content: string
  similarity: number
  metadata: {
    filename: string
    file_type: string
  }
}

export async function insertChunks(
  chunks: {
    document_id: string
    content: string
    embedding: number[]
    chunk_index: number
    metadata: Record<string, unknown>
  }[]
): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.DOCUMENT_CHUNKS)
    .insert(chunks)

  if (error) {
    console.error('Error inserting chunks:', error)
    throw new Error('Failed to insert document chunks')
  }
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit: number = 10,
  threshold: number = 0.7,
  userId?: string,
  projectId?: string
): Promise<SimilarChunk[]> {
  const { data, error } = await supabaseAdmin.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    filter_project_id: projectId || null,
  })

  if (error) {
    console.error('Error searching similar chunks:', error)
    throw new Error('Failed to search similar chunks')
  }

  return data || []
}

export async function getChunksByDocumentId(
  documentId: string
): Promise<DocumentChunk[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.DOCUMENT_CHUNKS)
    .select('*')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true })

  if (error) {
    console.error('Error fetching chunks:', error)
    throw new Error('Failed to fetch document chunks')
  }

  return data || []
}

export async function deleteChunksByDocumentId(
  documentId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.DOCUMENT_CHUNKS)
    .delete()
    .eq('document_id', documentId)

  if (error) {
    console.error('Error deleting chunks:', error)
    throw new Error('Failed to delete document chunks')
  }
}
