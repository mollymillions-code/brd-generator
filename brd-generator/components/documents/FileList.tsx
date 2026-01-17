'use client'

import { useEffect, useState } from 'react'
import { Document } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FileListProps {
  projectId: string
  refreshTrigger?: number
}

export default function FileList({ projectId, refreshTrigger }: FileListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/list?project_id=${projectId}`)
      const data = await response.json()
      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      // Refresh the document list
      await fetchDocuments()
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading documents...</p>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No documents uploaded yet. Upload files to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary uppercase">
                      {doc.file_type}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{doc.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.file_size)} • Uploaded{' '}
                      {formatDate(doc.uploaded_at)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.processed ? (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Processed
                  </span>
                ) : doc.error ? (
                  <span
                    className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full"
                    title={doc.error}
                  >
                    Error
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                    Processing...
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(doc)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{documentToDelete?.filename}&quot;?
              This action cannot be undone. The document and all its associated data
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
