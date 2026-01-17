# Supabase Database Setup for BRD Generator

This guide will help you set up the Supabase database to enable document search in chat.

## Step 1: Run the Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `aayaejllovqyyqpujedo`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the ENTIRE contents of this file: `brd-generator/lib/db/schema-with-projects.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ All necessary tables (projects, documents, document_chunks, conversations, messages, brds)
- ✅ The `match_document_chunks` function for vector search
- ✅ Indexes for performance
- ✅ Row Level Security policies

## Step 2: Verify the Setup

Run this query to check if everything was created:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('projects', 'documents', 'document_chunks', 'conversations', 'messages', 'brds');

-- Check if the vector search function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'match_document_chunks';

-- Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see:
- 6 tables listed
- The `match_document_chunks` function
- The `vector` extension

## Step 3: Check Your Documents

Run this to see if your uploaded documents have been processed:

```sql
SELECT
    d.id,
    d.filename,
    d.processed,
    d.uploaded_at,
    COUNT(dc.id) as chunk_count
FROM documents d
LEFT JOIN document_chunks dc ON d.id = dc.document_id
GROUP BY d.id, d.filename, d.processed, d.uploaded_at
ORDER BY d.uploaded_at DESC;
```

**What to look for:**
- If `processed = true` and `chunk_count > 0`: ✅ Documents are ready!
- If `processed = false` or `chunk_count = 0`: ⚠️ Documents need to be reprocessed

## Step 4: Reprocess Documents (if needed)

If your documents aren't processed with embeddings, you'll need to reprocess them:

### Option A: Delete and Re-upload (Easiest)
1. Go to your app
2. Delete the existing documents
3. Upload them again
4. The new upload will automatically create embeddings

### Option B: Trigger Processing via API
You can call the document processing endpoint manually for each document.

## Step 5: Test the Chat

After setup:
1. Go to your app's chat page
2. Ask a question about your documents
3. The chat should now access document content!

## Troubleshooting

### "Failed to search similar chunks" error
- Make sure you ran the schema SQL
- Check that the `match_document_chunks` function exists
- Verify the `vector` extension is enabled

### Chat says "No documents available"
- Check if documents have `processed = true`
- Check if document_chunks have embeddings
- Run the query in Step 3 to diagnose

### Need Help?
Check the logs when uploading/processing documents:
- Local: Check your terminal running `npm run dev`
- Vercel: Check the Function Logs in Vercel dashboard
