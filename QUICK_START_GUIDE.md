# Quick Start Guide - RAG System

## 🎯 Your System is Ready!

All code modifications are complete. Your RAG (Retrieval-Augmented Generation) system is fully implemented and operational.

---

## 🚀 Getting Started (3 Simple Steps)

### 1. Start the Development Server

```bash
cd brd-generator
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Upload & Process a Document

1. **Create a Project**
   - Navigate to the dashboard
   - Click "New Project"
   - Give it a name and description

2. **Upload a Document**
   - Select your project
   - Click "Upload Document"
   - Choose a file (PDF, DOCX, TXT, CSV, XLSX, or Audio)
   - Supported formats:
     - PDFs (reports, manuals)
     - Word documents (.docx, .doc)
     - Text files (.txt)
     - Spreadsheets (.csv, .xlsx)
     - Audio files (.mp3, .wav, .m4a) - transcribed automatically

3. **Process the Document**
   - Click "Process" on the uploaded document
   - Wait for processing to complete (shows progress)
   - Document will be chunked and embedded automatically

### 3. Chat with Your Documents

1. **Open Chat Interface**
   - Go to your project
   - Open the chat tab

2. **Ask Questions**
   - Type: "What are the main requirements?"
   - Or: "Summarize the key points from the documents"
   - Or: "What is the project timeline?"

3. **Get Context-Aware Answers**
   - AI retrieves relevant chunks from your documents
   - Provides answers based on your actual content
   - Shows source references below the response

---

## 📁 Example Workflow

```
1. Upload: project_spec.pdf → Uploaded
2. Process: project_spec.pdf → Processing... → ✅ Processed (150 chunks)
3. Chat:
   You: "What are the technical requirements?"
   AI: "Based on your documents, the technical requirements include..."
       [Sources: project_spec.pdf, requirements.docx]
```

---

## 🧪 Testing the System

### Option 1: Use the Test Script

```bash
npm install -D tsx  # If not already installed
npx tsx scripts/test-rag.ts
```

This will verify:
- ✅ Database connectivity
- ✅ Embedding generation
- ✅ Similarity search
- ✅ RAG retrieval

### Option 2: Manual Testing in Supabase

1. Open Supabase dashboard: https://supabase.com/dashboard
2. Go to SQL Editor
3. Copy queries from `scripts/check-embeddings.sql`
4. Run each query to verify setup

---

## 📊 Check System Status

### View Processed Documents

```sql
-- Run in Supabase SQL Editor
SELECT
    filename,
    processed,
    COUNT(dc.id) as chunk_count
FROM documents d
LEFT JOIN document_chunks dc ON d.id = dc.document_id
GROUP BY d.id, d.filename, d.processed
ORDER BY d.uploaded_at DESC;
```

### View Chat Conversations

```sql
SELECT
    c.id as conversation_id,
    c.title,
    COUNT(m.id) as message_count,
    c.created_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id
ORDER BY c.updated_at DESC;
```

---

## 🔧 Configuration

### Adjust RAG Parameters

**File**: `/lib/ai/rag.ts`

```typescript
export async function retrieveContext(
  query: string,
  projectId?: string,
  topK: number = 8,        // Change: number of chunks to retrieve
): Promise<RAGContext> {
  // ...
  const similarChunks = await searchSimilarChunks(
    queryEmbedding,
    topK,
    0.7,  // Change: similarity threshold (0.0-1.0)
    // ...
  )
}
```

**Recommendations**:
- `topK = 5-10`: Good balance
- `threshold = 0.7`: Standard (lower = more results, higher = more relevant)

### Adjust Chunking

**File**: `/lib/processors/chunker.ts`

```typescript
const CHUNK_SIZE = 800    // Change: tokens per chunk
const CHUNK_OVERLAP = 200  // Change: overlap between chunks
```

**Recommendations**:
- Larger chunks: More context but less precision
- Smaller chunks: More precision but less context
- Keep overlap at 20-25% of chunk size

---

## 📝 API Endpoints Reference

### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

Body:
- file: [file data]
- projectId: string (UUID)

Response:
{
  "document": {
    "id": "uuid",
    "filename": "example.pdf",
    "processed": false
  }
}
```

### Process Document
```http
POST /api/documents/process
Content-Type: application/json

Body:
{
  "documentId": "uuid"
}

Response:
{
  "success": true,
  "chunksCount": 150,
  "message": "Document processed successfully"
}
```

### Chat
```http
POST /api/chat
Content-Type: application/json

Body:
{
  "message": "What are the requirements?",
  "projectId": "uuid",
  "conversationId": "uuid" (optional)
}

Response: Streaming text/event-stream
Headers:
- X-Conversation-Id: "uuid"
```

### List Documents
```http
GET /api/documents/list?projectId=uuid

Response:
{
  "documents": [
    {
      "id": "uuid",
      "filename": "example.pdf",
      "processed": true,
      "uploaded_at": "2026-01-17T..."
    }
  ]
}
```

---

## 🎨 Frontend Components

### Chat Interface
**Location**: `/components/chat/ChatInterface.tsx`

Features:
- ✅ Streaming responses
- ✅ Message history
- ✅ Source tracking
- ✅ Error handling
- ✅ Auto-scroll

### Document Upload
**Location**: `/components/projects/DocumentUpload.tsx`

Features:
- ✅ Drag & drop
- ✅ File validation
- ✅ Progress tracking
- ✅ Multiple file support

---

## 🐛 Troubleshooting

### "Document processing failed"

**Check**:
1. File is not corrupted
2. File type is supported
3. OpenAI API key is valid
4. File size is under 100MB

**Solution**:
```bash
# Check API key
echo $OPENAI_API_KEY

# Check logs
npm run dev
# Look for processing errors in console
```

### "No relevant information found"

**Possible Causes**:
1. Document not processed yet
2. Query not related to documents
3. Similarity threshold too high

**Solution**:
```sql
-- Check if documents are processed
SELECT filename, processed FROM documents;

-- Check if chunks have embeddings
SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL;
```

### "Chat not showing sources"

**Check**:
1. RAG retrieval is working
2. Sources array is populated
3. Frontend is rendering sources

**Solution**:
```typescript
// Add logging in /app/api/chat/route.ts
console.log('Sources:', sources)
```

---

## 📚 File Structure Reference

```
brd-generator/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # Chat endpoint (RAG integrated)
│   │   ├── documents/
│   │   │   ├── upload/route.ts        # Document upload
│   │   │   ├── process/route.ts       # Document processing
│   │   │   └── list/route.ts          # List documents
│   └── (dashboard)/
│       └── projects/[id]/             # Project pages
├── lib/
│   ├── ai/
│   │   ├── embeddings.ts              # OpenAI embeddings
│   │   ├── rag.ts                     # RAG logic ⭐
│   │   └── claude.ts                  # Chat generation
│   ├── db/
│   │   ├── vectors.ts                 # Vector operations ⭐
│   │   ├── documents.ts               # Document CRUD
│   │   ├── conversations.ts           # Chat history
│   │   └── supabase.ts               # Supabase client
│   └── processors/
│       ├── index.ts                   # Main processor
│       ├── chunker.ts                 # Text chunking ⭐
│       ├── pdf.ts                     # PDF extraction
│       ├── docx.ts                    # Word extraction
│       └── audio.ts                   # Audio transcription
├── components/
│   ├── chat/ChatInterface.tsx         # Chat UI
│   └── projects/DocumentUpload.tsx    # Upload UI
└── scripts/
    ├── test-rag.ts                    # Test script
    └── check-embeddings.sql           # Health check queries
```

⭐ = Core RAG files

---

## 🎓 Understanding RAG Flow

```
┌─────────────┐
│  User Query │
└──────┬──────┘
       ↓
┌──────────────────────┐
│ Generate Embedding   │  (OpenAI text-embedding-3-small)
└──────┬───────────────┘
       ↓
┌──────────────────────────────┐
│ Search Similar Chunks        │  (Supabase match_document_chunks)
│ - Vector similarity search   │
│ - Cosine distance            │
│ - Filter by project          │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────┐
│ Retrieve Top K Chunks    │  (Default: top 8)
│ - Similarity > 0.7       │
│ - With source metadata   │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Build Context String     │
│ - Format chunks          │
│ - Track sources          │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Send to LLM              │  (OpenAI GPT-5-mini)
│ - Context + History      │
│ - Stream response        │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Save & Display Response  │
│ - With sources           │
└──────────────────────────┘
```

---

## ✨ Advanced Features

### 1. Filter by Document Type
```typescript
// In /lib/db/vectors.ts - add file_type filter
WHERE d.file_type = 'pdf'
```

### 2. Search by Date Range
```typescript
// In /lib/db/vectors.ts - add date filter
WHERE d.uploaded_at >= '2026-01-01'
```

### 3. Custom Metadata
```typescript
// In /app/api/documents/process/route.ts
metadata: {
  filename: document.filename,
  file_type: document.file_type,
  author: 'John Doe',         // Add custom fields
  department: 'Engineering',
}
```

---

## 📞 Need Help?

1. **Check Documentation**: `RAG_IMPLEMENTATION_COMPLETE.md`
2. **Run Tests**: `npx tsx scripts/test-rag.ts`
3. **Check Logs**: Browser console + terminal
4. **Verify Database**: Use `check-embeddings.sql` queries

---

## 🎉 You're All Set!

Your RAG system is fully operational. Start by:
1. ✅ Creating a project
2. ✅ Uploading documents
3. ✅ Processing them
4. ✅ Chatting with your knowledge base

**Happy building! 🚀**

---

*Last Updated: 2026-01-17*
*System Status: Fully Operational ✅*
