import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx'

export async function convertMarkdownToDOCX(
  markdown: string,
  title: string = 'Business Requirements Document'
): Promise<Buffer> {
  const sections = parseMarkdown(markdown)
  const children: (Paragraph | Table)[] = []

  // Add title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    })
  )

  // Add generated date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleDateString()}`,
          italics: true,
        }),
      ],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    })
  )

  // Process sections
  sections.forEach(section => {
    children.push(...section)
  })

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
}

function parseMarkdown(markdown: string): (Paragraph | Table)[][] {
  const lines = markdown.split('\n')
  const sections: (Paragraph | Table)[][] = []
  let currentSection: (Paragraph | Table)[] = []
  let inTable = false
  let tableLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Heading 1
    if (line.startsWith('# ')) {
      if (tableLines.length > 0) {
        currentSection.push(createTable(tableLines))
        tableLines = []
        inTable = false
      }
      if (currentSection.length > 0) {
        sections.push(currentSection)
        currentSection = []
      }
      currentSection.push(
        new Paragraph({
          text: line.replace('# ', ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      )
    }
    // Heading 2
    else if (line.startsWith('## ')) {
      if (tableLines.length > 0) {
        currentSection.push(createTable(tableLines))
        tableLines = []
        inTable = false
      }
      currentSection.push(
        new Paragraph({
          text: line.replace('## ', ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      )
    }
    // Heading 3
    else if (line.startsWith('### ')) {
      if (tableLines.length > 0) {
        currentSection.push(createTable(tableLines))
        tableLines = []
        inTable = false
      }
      currentSection.push(
        new Paragraph({
          text: line.replace('### ', ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      )
    }
    // Table detection
    else if (line.includes('|')) {
      inTable = true
      tableLines.push(line)
    }
    // End of table or continue table
    else if (inTable && !line.trim()) {
      currentSection.push(createTable(tableLines))
      tableLines = []
      inTable = false
    }
    // Bullet point
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (tableLines.length > 0) {
        currentSection.push(createTable(tableLines))
        tableLines = []
        inTable = false
      }
      currentSection.push(
        new Paragraph({
          text: line.replace(/^[\s]*[-*]\s/, ''),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      )
    }
    // Numbered list
    else if (line.trim().match(/^\d+\.\s/)) {
      if (tableLines.length > 0) {
        currentSection.push(createTable(tableLines))
        tableLines = []
        inTable = false
      }
      currentSection.push(
        new Paragraph({
          text: line.replace(/^\d+\.\s/, ''),
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { after: 100 },
        })
      )
    }
    // Regular paragraph
    else if (line.trim()) {
      if (tableLines.length > 0) {
        currentSection.push(createTable(tableLines))
        tableLines = []
        inTable = false
      }
      currentSection.push(
        new Paragraph({
          text: line,
          spacing: { after: 150 },
        })
      )
    }
    // Empty line
    else if (!inTable) {
      currentSection.push(
        new Paragraph({
          text: '',
          spacing: { after: 100 },
        })
      )
    }
  }

  // Handle remaining table
  if (tableLines.length > 0) {
    currentSection.push(createTable(tableLines))
  }

  if (currentSection.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

function createTable(lines: string[]): Table {
  // Filter out separator lines
  const dataLines = lines.filter(line => !line.match(/^\|[\s-:|]+\|$/))

  const rows = dataLines.map((line, index) => {
    const cells = line
      .split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim())

    const isHeader = index === 0

    return new TableRow({
      children: cells.map(
        cellText =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cellText,
                    bold: isHeader,
                  }),
                ],
              }),
            ],
            shading: isHeader
              ? { fill: 'D9E1F2' }
              : undefined,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          })
      ),
    })
  })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  })
}
