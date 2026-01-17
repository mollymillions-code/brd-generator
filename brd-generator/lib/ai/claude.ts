import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function generateChatResponse(
  messages: ClaudeMessage[],
  context: string
): Promise<string> {
  const systemPrompt = `You are a helpful assistant with access to a knowledge base of documents.
Answer questions based on the provided context. If the answer isn't in the context, say so clearly.
Always cite which documents you're referencing when providing information.

Context from knowledge base:
${context}`

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ],
  })

  return response.choices[0]?.message?.content || ''
}

export async function streamChatResponse(
  messages: ClaudeMessage[],
  context: string
): Promise<ReadableStream> {
  const systemPrompt = `You are a helpful assistant with access to a knowledge base of documents.
Answer questions based on the provided context. If the answer isn't in the context, say so clearly.
Always cite which documents you're referencing when providing information.

Context from knowledge base:
${context}`

  const stream = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    max_tokens: 4096,
    stream: true,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ],
  })

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          controller.enqueue(encoder.encode(content))
        }
      }
      controller.close()
    },
  })
}

export async function generateBRD(
  documentsContent: string
): Promise<string> {
  const prompt = `Analyze the following documents and create a comprehensive Business Requirements Document (BRD).

Documents:
${documentsContent}

Generate a detailed BRD with these sections:

1. EXECUTIVE SUMMARY
   - Brief overview of the project
   - Key objectives and expected outcomes

2. BUSINESS OBJECTIVES
   - List the main business goals
   - Expected business value

3. STAKEHOLDER ANALYSIS
   - Create a table with columns: Name/Role, Responsibilities, Level of Involvement
   - Include all stakeholders mentioned or implied in the documents

4. FUNCTIONAL REQUIREMENTS
   - List all functional requirements in numbered format
   - Each requirement should have: ID, Description, Priority (High/Medium/Low)
   - Format as: FR-001: [Description] - Priority: [High/Medium/Low]

5. NON-FUNCTIONAL REQUIREMENTS
   - Performance requirements
   - Security requirements
   - Scalability requirements
   - Usability requirements

6. ASSUMPTIONS AND CONSTRAINTS
   - List assumptions made
   - List constraints and limitations

7. SUCCESS CRITERIA
   - Define measurable success metrics
   - Acceptance criteria

Format the output in markdown with proper headings, tables, and bullet points. Be thorough and professional.`

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return response.choices[0]?.message?.content || ''
}
