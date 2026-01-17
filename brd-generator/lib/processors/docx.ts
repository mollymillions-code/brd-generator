import mammoth from 'mammoth'

export async function processDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('Error processing DOCX:', error)
    throw new Error('Failed to process DOCX file')
  }
}
