import { generateEmbedding } from './embeddings'
import { searchSimilarChunks, SimilarChunk } from '@/lib/db/vectors'

export interface RAGContext {
  context: string
  sources: {
    document_id: string
    filename: string
    chunk_ids: string[]
  }[]
}

export async function retrieveContext(
  query: string,
  projectId?: string,
  topK: number = 8
): Promise<RAGContext> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query)

  // Search for similar chunks
  const similarChunks = await searchSimilarChunks(
    queryEmbedding,
    topK,
    0.7,
    undefined,
    projectId
  )

  if (similarChunks.length === 0) {
    return {
      context: 'No relevant information found in the knowledge base.',
      sources: [],
    }
  }

  // Build context string from retrieved chunks
  const contextParts: string[] = []
  const sourceMap = new Map<
    string,
    { filename: string; chunk_ids: string[] }
  >()

  similarChunks.forEach((chunk: SimilarChunk) => {
    // Add chunk content to context
    contextParts.push(
      `[From: ${chunk.metadata.filename}]\n${chunk.content}\n`
    )

    // Track sources
    if (!sourceMap.has(chunk.document_id)) {
      sourceMap.set(chunk.document_id, {
        filename: chunk.metadata.filename,
        chunk_ids: [],
      })
    }
    sourceMap.get(chunk.document_id)!.chunk_ids.push(chunk.id)
  })

  // Convert source map to array
  const sources = Array.from(sourceMap.entries()).map(
    ([document_id, data]) => ({
      document_id,
      filename: data.filename,
      chunk_ids: data.chunk_ids,
    })
  )

  return {
    context: contextParts.join('\n---\n\n'),
    sources,
  }
}
