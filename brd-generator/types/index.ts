export type FileType = 'audio' | 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx'

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface BRD {
  id: string
  project_id: string
  title: string
  content: string
  markdown_content: string
  created_at: string
}

export interface Document {
  id: string
  project_id: string
  user_id: string
  filename: string
  file_type: FileType
  storage_path: string
  processed: boolean
  uploaded_at: string
  file_size?: number
  error?: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  content: string
  embedding?: number[]
  chunk_index: number
  metadata: {
    filename: string
    file_type: FileType
    section?: string
  }
}

export interface Conversation {
  id: string
  project_id: string
  user_id: string
  created_at: string
  title?: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  sources?: {
    document_id: string
    filename: string
    chunk_ids: string[]
  }[]
  created_at: string
}

export interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export interface BRDSection {
  title: string
  content: string
}

export interface BRDData {
  executiveSummary: string
  businessObjectives: string[]
  stakeholders: {
    name: string
    role: string
    involvement: string
  }[]
  functionalRequirements: {
    id: string
    description: string
    priority: 'High' | 'Medium' | 'Low'
  }[]
  nonFunctionalRequirements: string[]
  assumptions: string[]
  constraints: string[]
  successCriteria: string[]
}
