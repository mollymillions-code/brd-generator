import { NextRequest, NextResponse } from 'next/server'
import { streamChatResponse } from '@/lib/ai/claude'
import { retrieveContext } from '@/lib/ai/rag'
import {
  createConversation,
  createMessage,
  getMessagesByConversationId,
} from '@/lib/db/conversations'
import { getAuthUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, projectId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Create or get conversation
    let convId = conversationId
    if (!convId) {
      const conversation = await createConversation(user.id, undefined, projectId)
      convId = conversation.id
    }

    // Save user message
    await createMessage(convId, 'user', message)
    console.log('[Chat] User message saved')

    // Retrieve relevant context using RAG
    console.log('[Chat] Retrieving context...')
    let context = ''
    let sources: any[] = []

    try {
      const ragResult = await retrieveContext(message, projectId)
      context = ragResult.context
      sources = ragResult.sources
      console.log('[Chat] Context retrieved, sources:', sources.length)
    } catch (error) {
      console.warn('[Chat] RAG retrieval failed, continuing without context:', error)
      context = 'No document context available. Please answer based on general knowledge.'
      sources = []
    }

    // Get conversation history
    const messages = await getMessagesByConversationId(convId)
    const conversationHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    console.log('[Chat] Conversation history loaded, messages:', conversationHistory.length)

    // Generate streaming response
    console.log('[Chat] Calling OpenAI...')
    const stream = await streamChatResponse(conversationHistory, context)
    console.log('[Chat] Stream created successfully')

    // Create a readable stream that saves the complete response
    let fullResponse = ''
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        fullResponse += text
        controller.enqueue(chunk)
      },
      async flush() {
        // Save assistant message after stream completes
        await createMessage(convId, 'assistant', fullResponse, sources)
      },
    })

    const transformedStream = stream.pipeThrough(transformStream)

    return new NextResponse(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Conversation-Id': convId,
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', errorMessage)
    console.error('Error stack:', errorStack)
    return NextResponse.json(
      { error: errorMessage, stack: errorStack },
      { status: 500 }
    )
  }
}
