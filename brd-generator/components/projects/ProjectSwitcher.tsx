'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'

export default function ProjectSwitcher() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    // Get project from URL or localStorage
    const projectId = searchParams.get('project') || localStorage.getItem('currentProjectId')
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setCurrentProject(project)
        localStorage.setItem('currentProjectId', projectId)
      } else if (projects.length > 0) {
        // If project not found, use first project
        switchToProject(projects[0].id)
      }
    } else if (projects.length > 0) {
      // Use first project by default
      switchToProject(projects[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchParams])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      if (data.success) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchToProject = (projectId: string) => {
    localStorage.setItem('currentProjectId', projectId)
    const url = new URL(window.location.href)
    url.searchParams.set('project', projectId)
    router.push(url.pathname + url.search)
    setShowDropdown(false)

    // Reload to fetch new project data
    window.location.reload()
  }

  const handleNewProject = () => {
    router.push('/projects/new')
  }

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="text-sm text-muted-foreground">Loading projects...</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="px-3 py-2">
        <Button onClick={handleNewProject} className="w-full" size="sm">
          Create First Project
        </Button>
      </div>
    )
  }

  return (
    <div className="relative px-3 py-2">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-background hover:bg-accent transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-medium truncate">
            {currentProject?.name || 'Select Project'}
          </div>
          <div className="text-xs text-muted-foreground">Current Project</div>
        </div>
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute left-3 right-3 mt-2 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => switchToProject(project.id)}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors ${
                  currentProject?.id === project.id ? 'bg-accent' : ''
                }`}
              >
                <div className="font-medium text-sm">{project.name}</div>
                {project.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {project.description}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-border p-2">
            <Button onClick={handleNewProject} variant="outline" className="w-full" size="sm">
              + New Project
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
