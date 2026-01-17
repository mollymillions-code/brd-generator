import { supabaseAdmin } from '@/lib/db/supabase'

const BUCKET_NAME = 'documents'

export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }

  return data.path
}

export async function downloadFile(path: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .download(path)

  if (error) {
    console.error('Error downloading file:', error)
    throw new Error('Failed to download file')
  }

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

export function generateStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${userId}/${timestamp}_${sanitizedFilename}`
}
