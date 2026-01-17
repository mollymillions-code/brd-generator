import { supabaseAdmin, TABLES } from './supabase'
import { Project, BRD } from '@/types'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function createProject(
  name: string,
  description?: string,
  userId?: string
): Promise<Project> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.PROJECTS)
    .insert({
      user_id: userId || DEFAULT_USER_ID,
      name,
      description,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }

  return data
}

export async function getProjects(userId?: string): Promise<Project[]> {
  const { data, error} = await supabaseAdmin
    .from(TABLES.PROJECTS)
    .select('*')
    .eq('user_id', userId || DEFAULT_USER_ID)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    throw new Error('Failed to fetch projects')
  }

  return data || []
}

export async function getProjectById(projectId: string, userId?: string): Promise<Project | null> {
  let query = supabaseAdmin
    .from(TABLES.PROJECTS)
    .select('*')
    .eq('id', projectId)

  // If userId is provided, ensure user owns the project
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'description'>>,
  userId?: string
): Promise<void> {
  let query = supabaseAdmin
    .from(TABLES.PROJECTS)
    .update(updates)
    .eq('id', projectId)

  // If userId is provided, ensure user owns the project
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { error } = await query

  if (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }
}

export async function deleteProject(projectId: string, userId?: string): Promise<void> {
  let query = supabaseAdmin
    .from(TABLES.PROJECTS)
    .delete()
    .eq('id', projectId)

  // If userId is provided, ensure user owns the project
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { error } = await query

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }
}

// BRD operations
export async function saveBRD(
  projectId: string,
  title: string,
  content: string,
  markdownContent: string
): Promise<BRD> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.BRDS)
    .insert({
      project_id: projectId,
      title,
      content,
      markdown_content: markdownContent,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving BRD:', error)
    throw new Error('Failed to save BRD')
  }

  return data
}

export async function getBRDsByProject(projectId: string): Promise<BRD[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.BRDS)
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching BRDs:', error)
    throw new Error('Failed to fetch BRDs')
  }

  return data || []
}

export async function getBRDById(brdId: string): Promise<BRD | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.BRDS)
    .select('*')
    .eq('id', brdId)
    .single()

  if (error) {
    console.error('Error fetching BRD:', error)
    return null
  }

  return data
}

export async function deleteBRD(brdId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.BRDS)
    .delete()
    .eq('id', brdId)

  if (error) {
    console.error('Error deleting BRD:', error)
    throw new Error('Failed to delete BRD')
  }
}

// Get project statistics
export async function getProjectStats(projectId: string) {
  // Get document counts
  const { count: documentCount } = await supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  const { count: processedCount } = await supabaseAdmin
    .from(TABLES.DOCUMENTS)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('processed', true)

  // Get conversation count
  const { count: conversationCount } = await supabaseAdmin
    .from(TABLES.CONVERSATIONS)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  // Get BRD count
  const { count: brdCount } = await supabaseAdmin
    .from(TABLES.BRDS)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  return {
    totalDocuments: documentCount || 0,
    processedDocuments: processedCount || 0,
    conversations: conversationCount || 0,
    brds: brdCount || 0,
  }
}
