'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.status === 401) {
        // User not authenticated, redirect to login
        window.location.href = '/auth/login'
        return
      }
      const data = await response.json()
      if (data.success) {
        setProjects(data.projects)
      } else if (data.error) {
        console.error('Error fetching projects:', data.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchToProject = (projectId: string) => {
    window.location.href = `/projects/${projectId}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Projects</h1>
          <p className="text-muted-foreground">
            Manage your BRD projects and their knowledge bases
          </p>
        </div>
        <Link href="/projects/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Link href="/projects/new">
              <Button>Create Project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{project.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mb-4">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </div>
                <Button
                  onClick={() => switchToProject(project.id)}
                  variant="outline"
                  className="w-full"
                >
                  Open Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
