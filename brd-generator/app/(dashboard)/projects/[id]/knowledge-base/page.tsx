'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import FileUploader from '@/components/documents/FileUploader'
import FileList from '@/components/documents/FileList'

export default function KnowledgeBasePage() {
  const params = useParams()
  const projectId = params.id as string
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload and manage your documents
        </p>
      </div>

      <FileUploader projectId={projectId} onUploadComplete={handleUploadComplete} />

      <FileList projectId={projectId} refreshTrigger={refreshTrigger} />
    </div>
  )
}
