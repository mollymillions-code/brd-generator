import { transcribeAudio } from '@/lib/ai/embeddings'

export async function processAudio(
  buffer: Buffer,
  filename: string
): Promise<string> {
  try {
    const transcription = await transcribeAudio(buffer, filename)
    return transcription
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw new Error('Failed to transcribe audio file')
  }
}
