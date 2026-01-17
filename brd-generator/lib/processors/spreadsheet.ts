import * as XLSX from 'xlsx'

export async function processSpreadsheet(
  buffer: Buffer,
  fileType: 'csv' | 'xlsx'
): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    let text = ''

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName]
      const sheetText = XLSX.utils.sheet_to_csv(worksheet)
      text += `\n\n=== Sheet: ${sheetName} ===\n${sheetText}`
    })

    return text.trim()
  } catch (error) {
    console.error('Error processing spreadsheet:', error)
    throw new Error(`Failed to process ${fileType.toUpperCase()} file`)
  }
}
