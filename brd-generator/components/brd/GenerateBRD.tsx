'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function GenerateBRD() {
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePreview = async () => {
    setGenerating(true)
    setError(null)
    setPreview(null)

    try {
      const response = await fetch('/api/generate-brd', {
        method: 'GET',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate BRD')
      }

      const data = await response.json()
      setPreview(data.markdown)
    } catch (err) {
      console.error('Error generating preview:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate preview')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadBRD = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-brd', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate BRD')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BRD_${Date.now()}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading BRD:', err)
      setError(err instanceof Error ? err.message : 'Failed to download BRD')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Business Requirements Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a comprehensive BRD based on all your uploaded and processed
            documents. The BRD will include executive summary, business objectives,
            stakeholder analysis, functional and non-functional requirements, and
            more.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={handleGeneratePreview}
              disabled={generating}
              variant="outline"
            >
              {generating && !preview ? 'Generating...' : 'Preview BRD'}
            </Button>
            <Button onClick={handleDownloadBRD} disabled={generating}>
              {generating && !error ? 'Generating...' : 'Download BRD (DOCX)'}
            </Button>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>BRD Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div
                className="p-6 bg-muted rounded-lg whitespace-pre-wrap text-sm font-mono"
                style={{ maxHeight: '600px', overflowY: 'auto' }}
              >
                {preview}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
