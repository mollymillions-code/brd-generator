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

    // Retrieve relevant context using RAG
    const { context, sources } = await retrieveContext(message, projectId)

    // Get conversation history
    const messages = await getMessagesByConversationId(convId)
    const conversationHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Generate streaming response
    const stream = await streamChatResponse(conversationHistory, context)

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
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
