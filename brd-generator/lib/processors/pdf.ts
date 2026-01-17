import pdf from 'pdf-parse'

export async function processPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error('Failed to process PDF file')
  }
}
