'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@supabase/supabase-js'

interface FileUploaderProps {
  onUploadComplete?: () => void
  projectId: string
}

export default function FileUploader({ onUploadComplete, projectId }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      await uploadFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)
    setUploadStatus(`Uploading ${files.length} file(s)...`)

    try {
      for (const file of files) {
        // Get upload URL and credentials
        const urlResponse = await fetch('/api/documents/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            projectId,
          }),
        })

        if (!urlResponse.ok) {
          const error = await urlResponse.json()
          throw new Error(error.error || 'Failed to get upload URL')
        }

        const { storagePath, supabaseUrl, supabaseAnonKey } = await urlResponse.json()

        // Initialize Supabase client with public credentials
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Upload file directly to Supabase Storage (client-side)
        setUploadStatus(`Uploading ${file.name}...`)
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Create document record
        const createResponse = await fetch('/api/documents/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            storagePath,
            fileSize: file.size,
            projectId,
          }),
        })

        if (!createResponse.ok) {
          const error = await createResponse.json()
          throw new Error(error.error || 'Failed to create document record')
        }

        const { document } = await createResponse.json()

        // Process document
        setUploadStatus(`Processing ${file.name}...`)
        const processResponse = await fetch('/api/documents/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: document.id }),
        })

        if (!processResponse.ok) {
          try {
            const contentType = processResponse.headers.get('content-type')
            if (contentType?.includes('application/json')) {
              const error = await processResponse.json()
              console.error(`Failed to process ${file.name}:`, error.error)
            } else {
              const textError = await processResponse.text()
              console.error(`Failed to process ${file.name}:`, textError)
            }
          } catch (parseError) {
            console.error(`Failed to process ${file.name}: HTTP ${processResponse.status}`)
          }
        }
      }

      setUploadStatus('All files uploaded and processed successfully!')
      setTimeout(() => {
        setUploadStatus('')
        onUploadComplete?.()
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : 'Upload failed'}`
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-background'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-16 h-16 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div>
            <p className="text-lg font-medium mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: PDF, DOCX, TXT, CSV, XLSX, Audio (MP3, WAV, M4A)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: 100MB
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls,.mp3,.wav,.m4a,.ogg,.webm"
          />
          <Button disabled={uploading} onClick={() => document.getElementById('file-upload')?.click()}>
            {uploading ? 'Uploading...' : 'Select Files'}
          </Button>
        </div>
      </div>

      {uploadStatus && (
        <div
          className={`mt-4 p-3 rounded-md ${
            uploadStatus.includes('Error')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  )
}
