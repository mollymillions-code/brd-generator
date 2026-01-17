'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Project } from '@/types'

export default function Sidebar() {
  const pathname = usePathname()
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  // Extract project ID from URL
  const projectId = pathname.includes('/projects/')
    ? pathname.split('/projects/')[1]?.split('/')[0]
    : null

  useEffect(() => {
    if (projectId && projectId !== 'new') {
      fetchProject(projectId)
    }
  }, [projectId])

  const fetchProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (response.status === 401) {
        // User not authenticated, redirect to login
        window.location.href = '/auth/login'
        return
      }
      if (response.status === 404) {
        // Project not found or access denied
        console.error('Project not found or access denied')
        window.location.href = '/'
        return
      }
      const data = await response.json()
      if (data.success) {
        setCurrentProject(data.project)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  // Top-level links (when not in a project)
  const topLinks = [
    { href: '/', label: 'All Projects', icon: '📁' },
  ]

  // Project-level links (when inside a project)
  const projectLinks = projectId && projectId !== 'new' ? [
    { href: `/projects/${projectId}`, label: 'Dashboard', icon: '📊' },
    { href: `/projects/${projectId}/knowledge-base`, label: 'Knowledge Base', icon: '📚' },
    { href: `/projects/${projectId}/chat`, label: 'Chat', icon: '💬' },
    { href: `/projects/${projectId}/generate-brd`, label: 'Generate BRD', icon: '📄' },
  ] : []

  const links = projectId && projectId !== 'new' ? projectLinks : topLinks

  return (
    <div className="w-64 bg-background border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80">
            BRD Generator
          </h1>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          AI-Powered Requirements
        </p>
      </div>

      {currentProject && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Projects
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium truncate">{currentProject.name}</span>
          </div>
        </div>
      )}

      <nav className="px-3 flex-1 border-t border-border pt-3">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors ${
              pathname === link.href
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span>{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}

        {projectId && projectId !== 'new' && (
          <div className="mt-4 pt-4 border-t border-border">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span>←</span>
              <span className="font-medium">All Projects</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Need Help?</p>
          <p>Check the documentation or contact support</p>
        </div>
      </div>
    </div>
  )
}
