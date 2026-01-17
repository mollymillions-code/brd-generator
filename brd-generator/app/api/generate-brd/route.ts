import { NextRequest, NextResponse } from 'next/server'
import { generateBusinessRequirementDocument } from '@/lib/ai/brd-generator'
import { convertMarkdownToDOCX } from '@/lib/docx/formatter'
import { getAuthUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Generate BRD markdown
    const brdMarkdown = await generateBusinessRequirementDocument(user.id, projectId)

    // Convert to DOCX
    const docxBuffer = await convertMarkdownToDOCX(
      brdMarkdown,
      'Business Requirements Document'
    )

    // Return DOCX file
    return new NextResponse(Buffer.from(docxBuffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="BRD_${Date.now()}.docx"`,
      },
    })
  } catch (error) {
    console.error('BRD generation error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to generate BRD: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// Also provide a preview endpoint that returns markdown
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const projectId = url.searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const brdMarkdown = await generateBusinessRequirementDocument(user.id, projectId)

    return NextResponse.json({
      success: true,
      markdown: brdMarkdown,
    })
  } catch (error) {
    console.error('BRD preview error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to generate BRD preview: ${errorMessage}` },
      { status: 500 }
    )
  }
}
