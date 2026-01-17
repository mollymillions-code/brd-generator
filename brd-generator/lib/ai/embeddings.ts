import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  })

  return response.data[0].embedding
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    encoding_format: 'float',
  })

  return response.data.map(item => item.embedding)
}

export async function transcribeAudio(
  audioFile: File | Buffer,
  filename: string
): Promise<string> {
  // Convert Buffer to File if necessary
  const file: File = audioFile instanceof Buffer
    ? new File([new Uint8Array(audioFile)], filename, { type: 'audio/mpeg' })
    : (audioFile as File)

  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
  })

  return response.text
}
