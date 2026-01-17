import { generateBRD } from './claude'
import { getProcessedDocuments } from '@/lib/db/documents'
import { getChunksByDocumentId } from '@/lib/db/vectors'

const MAX_CONTENT_TOKENS = 80000 // Leave room for prompt and response
const CHARS_PER_TOKEN = 4

export async function aggregateDocumentsContent(
  userId?: string,
  projectId?: string
): Promise<string> {
  const documents = await getProcessedDocuments(userId, projectId)

  if (documents.length === 0) {
    throw new Error('No processed documents found')
  }

  let totalContent = ''
  const maxChars = MAX_CONTENT_TOKENS * CHARS_PER_TOKEN

  for (const doc of documents) {
    // Get all chunks for this document
    const chunks = await getChunksByDocumentId(doc.id)

    // Combine chunks into full document content
    const docContent = chunks
      .sort((a, b) => a.chunk_index - b.chunk_index)
      .map(chunk => chunk.content)
      .join('\n\n')

    const docSection = `\n\n=== Document: ${doc.filename} ===\n\n${docContent}`

    // Check if adding this document would exceed limit
    if (totalContent.length + docSection.length > maxChars) {
      // Sample the content intelligently
      const availableChars = maxChars - totalContent.length - 200 // buffer
      const sampledContent = sampleContent(docContent, availableChars)
      totalContent += `\n\n=== Document: ${doc.filename} (sampled) ===\n\n${sampledContent}`
      break
    }

    totalContent += docSection
  }

  return totalContent.trim()
}

function sampleContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) {
    return content
  }

  // Take beginning and end, with indicator in middle
  const partSize = Math.floor((maxChars - 100) / 2)
  const beginning = content.slice(0, partSize)
  const end = content.slice(-partSize)

  return `${beginning}\n\n... [content truncated for length] ...\n\n${end}`
}

export async function generateBusinessRequirementDocument(
  userId?: string,
  projectId?: string
): Promise<string> {
  // Aggregate all document content
  const documentsContent = await aggregateDocumentsContent(userId, projectId)

  // Generate BRD using Claude
  const brdMarkdown = await generateBRD(documentsContent)

  return brdMarkdown
}
