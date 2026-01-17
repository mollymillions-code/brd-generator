import { supabaseAdmin, TABLES } from './supabase'
import { Conversation, Message } from '@/types'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function createConversation(
  userId?: string,
  title?: string,
  projectId?: string
): Promise<Conversation> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.CONVERSATIONS)
    .insert({
      user_id: userId || DEFAULT_USER_ID,
      title,
      project_id: projectId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    throw new Error('Failed to create conversation')
  }

  return data
}

export async function getConversations(userId?: string): Promise<Conversation[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.CONVERSATIONS)
    .select('*')
    .eq('user_id', userId || DEFAULT_USER_ID)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    throw new Error('Failed to fetch conversations')
  }

  return data || []
}

export async function getConversationById(
  conversationId: string
): Promise<Conversation | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.CONVERSATIONS)
    .select('*')
    .eq('id', conversationId)
    .single()

  if (error) {
    console.error('Error fetching conversation:', error)
    return null
  }

  return data
}

export async function createMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  sources?: Message['sources']
): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.MESSAGES)
    .insert({
      conversation_id: conversationId,
      role,
      content,
      sources: sources || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating message:', error)
    throw new Error('Failed to create message')
  }

  return data
}

export async function getMessagesByConversationId(
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.MESSAGES)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    throw new Error('Failed to fetch messages')
  }

  return data || []
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLES.CONVERSATIONS)
    .delete()
    .eq('id', conversationId)

  if (error) {
    console.error('Error deleting conversation:', error)
    throw new Error('Failed to delete conversation')
  }
}
