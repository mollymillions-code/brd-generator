export interface TextChunk {
  content: string
  index: number
}

const CHUNK_SIZE = 800 // tokens (approximately 800 words)
const CHUNK_OVERLAP = 200 // tokens overlap between chunks
const CHARS_PER_TOKEN = 4 // rough estimate

export function chunkText(text: string): TextChunk[] {
  const chunks: TextChunk[] = []
  const chunkSizeChars = CHUNK_SIZE * CHARS_PER_TOKEN
  const overlapChars = CHUNK_OVERLAP * CHARS_PER_TOKEN

  // Split by paragraphs first to maintain context
  const paragraphs = text.split(/\n\n+/)
  let currentChunk = ''
  let chunkIndex = 0

  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds chunk size, save current chunk
    if (
      currentChunk.length + paragraph.length > chunkSizeChars &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
      })
      chunkIndex++

      // Start new chunk with overlap from previous chunk
      const overlapText = currentChunk.slice(-overlapChars)
      currentChunk = overlapText + '\n\n' + paragraph
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    }
  }

  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
    })
  }

  // Handle edge case: if text is too small, return as single chunk
  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push({
      content: text.trim(),
      index: 0,
    })
  }

  return chunks
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}
