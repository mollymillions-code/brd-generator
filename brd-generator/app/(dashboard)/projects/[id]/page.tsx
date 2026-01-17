'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = params.id as string

  const [stats, setStats] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    conversations: 0,
    brds: 0,
  })
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()
      if (data.success) {
        setProject(data.project)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The project you&apos;re looking for doesn&apos;t exist
        </p>
        <Link href="/">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalDocuments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats.processedDocuments}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {stats.conversations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              BRDs Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{stats.brds}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/projects/${projectId}/knowledge-base`}>
              <Button className="w-full" variant="outline">
                📚 Manage Knowledge Base
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/chat`}>
              <Button className="w-full" variant="outline">
                💬 Chat with Documents
              </Button>
            </Link>
            <Link href={`/projects/${projectId}/generate-brd`}>
              <Button className="w-full">📄 Generate BRD</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>
                  Upload documents (call recordings, transcripts, PDFs,
                  spreadsheets)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Wait for documents to be processed and indexed</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Chat with your knowledge base to explore insights</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>
                  Generate a comprehensive BRD document in one click
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Activity tracking coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
