# BRD Generator - AI-Powered Business Requirements Document Generator

An intelligent web application that automatically generates comprehensive Business Requirement Documents (BRDs) from various file formats including call recordings, transcripts, PDFs, spreadsheets, and more.

## Features

### 1. Knowledge Base Management
- **Multi-format support**: Upload PDFs, Word documents, text files, spreadsheets (CSV/XLSX), and audio files
- **Audio transcription**: Automatically transcribe call recordings using OpenAI Whisper
- **Intelligent processing**: Extract text from all document types
- **Vector embeddings**: Create searchable knowledge base using semantic search

### 2. AI Chatbot
- **Conversational Q&A**: Ask questions about your uploaded documents
- **RAG (Retrieval Augmented Generation)**: Get accurate answers with source citations
- **Context-aware**: Maintains conversation history for follow-up questions
- **Powered by Claude**: Uses Anthropic's Claude 3.5 Sonnet for intelligent responses

### 3. BRD Generator
- **One-click generation**: Create comprehensive BRDs from all your documents
- **Professional formatting**: Exports to properly formatted DOCX files
- **Structured output**: Includes all standard BRD sections:
  - Executive Summary
  - Business Objectives
  - Stakeholder Analysis (tables)
  - Functional Requirements (prioritized)
  - Non-Functional Requirements
  - Assumptions & Constraints
  - Success Criteria
- **Preview before download**: Review the BRD content before exporting

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL + pgvector for vector similarity search)
- **Storage**: Supabase Storage
- **AI/ML Services**:
  - Anthropic Claude 3.5 Sonnet (chat & BRD generation)
  - OpenAI Whisper (audio transcription)
  - OpenAI text-embedding-3-small (vector embeddings)
- **Document Processing**:
  - pdf-parse (PDF extraction)
  - mammoth (Word documents)
  - xlsx (spreadsheets)
  - docx (DOCX export)
- **UI**: Tailwind CSS + custom components
- **Deployment**: Vercel-ready

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Anthropic API key

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the schema from `lib/db/schema.sql` to create tables and functions
4. Go to Storage and create a bucket named `documents`
5. Set the bucket to public or configure appropriate policies

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

Required environment variables:

\`\`\`env
# Supabase (get from Supabase dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_api_key

# Anthropic (get from https://console.anthropic.com/)
ANTHROPIC_API_KEY=your_anthropic_api_key
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Uploading Documents

1. Navigate to **Knowledge Base** from the sidebar
2. Drag and drop files or click to select
3. Supported formats:
   - Documents: PDF, DOCX, TXT
   - Spreadsheets: CSV, XLSX
   - Audio: MP3, WAV, M4A, OGG, WEBM
4. Files are automatically processed and indexed

### Using the Chatbot

1. Navigate to **Chat** from the sidebar
2. Ensure you have uploaded and processed documents first
3. Type questions about your documents
4. The AI will answer based on the content with source citations
5. Conversation history is maintained for context

### Generating BRD

1. Navigate to **Generate BRD** from the sidebar
2. Click **Preview BRD** to see the generated content
3. Review the markdown preview
4. Click **Download BRD (DOCX)** to export as a formatted Word document
5. The BRD includes all standard sections with professional formatting

## Project Structure

\`\`\`
brd-generator/
├── app/
│   ├── (dashboard)/          # Dashboard pages (with layout)
│   │   ├── page.tsx         # Dashboard home
│   │   ├── knowledge-base/  # File upload & management
│   │   ├── chat/            # Chatbot interface
│   │   └── generate-brd/    # BRD generation
│   ├── api/                 # API routes
│   │   ├── documents/       # Upload, process, list
│   │   ├── chat/            # Chat endpoint
│   │   └── generate-brd/    # BRD generation
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Base UI components
│   ├── documents/           # File management components
│   ├── chat/                # Chat components
│   ├── brd/                 # BRD generation components
│   └── layout/              # Layout components
├── lib/
│   ├── db/                  # Database utilities
│   ├── ai/                  # AI service clients
│   ├── processors/          # Document processors
│   ├── storage/             # File storage utilities
│   └── docx/                # DOCX formatting
└── types/                   # TypeScript type definitions
\`\`\`

## Key Features Explained

### Vector Search (RAG)

The application uses pgvector for semantic search:
1. Documents are split into ~800 token chunks with 200 token overlap
2. Each chunk is embedded using OpenAI's text-embedding-3-small
3. When you ask a question, it's embedded and similar chunks are retrieved
4. Top relevant chunks are sent to Claude as context
5. Claude generates an answer based on the retrieved context

### Document Processing Pipeline

1. **Upload**: File stored in Supabase Storage
2. **Extract**: Text extracted based on file type
   - Audio → Whisper transcription
   - PDF → pdf-parse
   - DOCX → mammoth
   - Spreadsheet → xlsx
3. **Chunk**: Text split into overlapping segments
4. **Embed**: Each chunk converted to vector embedding
5. **Store**: Chunks and embeddings stored in database

### BRD Generation

1. Aggregate all document content from processed files
2. Send to Claude with structured prompt for BRD format
3. Claude analyzes and generates comprehensive BRD
4. Markdown output parsed into DOCX format
5. Professional styling applied (headings, tables, bullet points)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Important Notes

- Ensure Supabase database is set up with the schema
- Configure CORS settings in Supabase if needed
- Monitor API usage (OpenAI and Anthropic have usage limits)
- Audio transcription can be slow for large files
- Maximum file size is 100MB

## Troubleshooting

### Documents not processing

- Check that all environment variables are set correctly
- Verify Supabase database has the correct schema
- Check API keys are valid
- Look at browser console and server logs for errors

### Chatbot not responding

- Ensure documents are fully processed (check status in Knowledge Base)
- Verify Anthropic API key is valid
- Check that pgvector extension is enabled in Supabase

### BRD generation failing

- Ensure at least one document is processed
- Check Anthropic API quota
- Verify all required tables exist in Supabase

## Future Enhancements

- Multi-user authentication and workspaces
- Document tagging and filtering
- Custom BRD templates
- Collaborative editing
- Batch processing queue
- Export to PDF and Markdown
- Advanced analytics dashboard
- API access for integrations

## License

MIT

## Support

For issues and questions, please check the documentation or create an issue in the repository.
