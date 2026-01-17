import { FileType } from '@/types'
import { processText } from './text'
import { processPDF } from './pdf'
import { processDOCX } from './docx'
import { processSpreadsheet } from './spreadsheet'
import { processAudio } from './audio'

export async function processDocument(
  buffer: Buffer,
  fileType: FileType,
  filename: string
): Promise<string> {
  switch (fileType) {
    case 'txt':
      return processText(buffer)
    case 'pdf':
      return processPDF(buffer)
    case 'docx':
      return processDOCX(buffer)
    case 'csv':
      return processSpreadsheet(buffer, 'csv')
    case 'xlsx':
      return processSpreadsheet(buffer, 'xlsx')
    case 'audio':
      return processAudio(buffer, filename)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

export function getFileType(filename: string): FileType | null {
  const extension = filename.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'txt':
      return 'txt'
    case 'pdf':
      return 'pdf'
    case 'docx':
    case 'doc':
      return 'docx'
    case 'csv':
      return 'csv'
    case 'xlsx':
    case 'xls':
      return 'xlsx'
    case 'mp3':
    case 'wav':
    case 'm4a':
    case 'ogg':
    case 'webm':
      return 'audio'
    default:
      return null
  }
}

export function isValidFileType(filename: string): boolean {
  return getFileType(filename) !== null
}
