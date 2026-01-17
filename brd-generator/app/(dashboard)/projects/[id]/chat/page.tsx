import ChatInterface from '@/components/chat/ChatInterface'

interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Chat</h1>
        <p className="text-muted-foreground">
          Ask questions about your uploaded documents
        </p>
      </div>
      <div className="h-[calc(100%-5rem)] border border-border rounded-lg">
        <ChatInterface projectId={id} />
      </div>
    </div>
  )
}
