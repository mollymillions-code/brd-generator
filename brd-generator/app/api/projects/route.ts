import { NextRequest, NextResponse } from 'next/server'
import { createProject, getProjects } from '@/lib/db/projects'
import { getAuthUser } from '@/lib/auth/api-auth'

// GET - List all projects for the authenticated user
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projects = await getProjects(user.id)

    return NextResponse.json({
      success: true,
      projects,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST - Create new project for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = await createProject(name.trim(), description?.trim(), user.id)

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
