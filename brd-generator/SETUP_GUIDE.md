# Complete Setup Guide for BRD Generator

This guide walks you through setting up the BRD Generator application from scratch.

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in/create an account
2. Click "New Project"
3. Fill in:
   - Name: `brd-generator` (or your preferred name)
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for it to initialize (2-3 minutes)

## Step 2: Set Up Database Schema

1. In your Supabase project, go to the **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `lib/db/schema.sql` from this project
4. Paste into the SQL Editor
5. Click "Run" to execute
6. You should see success messages for all tables and functions created

### Verify Database Setup

Go to **Table Editor** and verify these tables exist:
- documents
- document_chunks
- conversations
- messages

## Step 3: Set Up Storage Bucket

1. In Supabase, go to **Storage** (left sidebar)
2. Click "Create a new bucket"
3. Name: `documents`
4. Make it **public** (or configure RLS policies for authenticated access)
5. Click "Create bucket"

### Configure Storage Policies (Optional)

If you made the bucket private, add this policy:
- Go to Storage > documents > Policies
- Add policy to allow service role to upload/read/delete

## Step 4: Get Supabase Credentials

1. In your Supabase project, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

⚠️ **Important**: Keep the service_role key secret! Never commit it to version control.

## Step 5: Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign in or create an account
3. Go to **API keys** (https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Name it (e.g., "BRD Generator")
6. Copy the key → `OPENAI_API_KEY`

⚠️ **Note**: OpenAI API usage costs money. Set up usage limits in your OpenAI dashboard.

### Pricing to Consider:
- Whisper API: $0.006 per minute of audio
- text-embedding-3-small: $0.02 per 1M tokens
- Typical usage: ~$0.10 per 10-minute audio file + embeddings

## Step 6: Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Go to **API Keys** section
4. Click "Create Key"
5. Name it (e.g., "BRD Generator")
6. Copy the key → `ANTHROPIC_API_KEY`

⚠️ **Note**: Anthropic API also costs money. Check pricing at https://www.anthropic.com/pricing

### Pricing to Consider:
- Claude 3.5 Sonnet: $3 per million input tokens, $15 per million output tokens
- Typical BRD generation: ~$0.50-$2.00 depending on document size

## Step 7: Configure Environment Variables

1. In the project root, copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Open `.env` and fill in all the keys you collected:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   OPENAI_API_KEY=sk-your-openai-key-here

   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
   \`\`\`

3. Save the file

⚠️ **Security**: Never commit `.env` to git. It's already in `.gitignore`.

## Step 8: Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install all required packages. May take a few minutes.

## Step 9: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The application should start on http://localhost:3000

## Step 10: Test the Application

### Test 1: Upload a Document

1. Go to http://localhost:3000
2. Navigate to "Knowledge Base"
3. Upload a test text file (create a simple .txt file with some content)
4. Wait for "Processing..." to change to "Processed"
5. Check the browser console for any errors

### Test 2: Chat with Documents

1. Navigate to "Chat"
2. Type a question related to your uploaded document
3. You should get a response with information from the document
4. If this works, your RAG system is functioning correctly

### Test 3: Generate BRD

1. Navigate to "Generate BRD"
2. Click "Preview BRD"
3. Review the generated BRD content
4. Click "Download BRD (DOCX)"
5. Open the downloaded file in Microsoft Word or Google Docs

## Common Issues and Solutions

### Issue: "Failed to upload file"

**Solution:**
- Check Supabase Storage bucket exists and is named "documents"
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check browser console for specific error

### Issue: "Failed to process document"

**Solution:**
- For audio files: Verify OPENAI_API_KEY is valid
- Check that you have available balance in OpenAI account
- Look at server console (terminal) for detailed error

### Issue: Chatbot not responding

**Solution:**
- Ensure document is fully processed (status shows "Processed")
- Verify ANTHROPIC_API_KEY is valid
- Check that pgvector extension is enabled (run schema.sql again if needed)

### Issue: "No relevant information found"

**Solution:**
- Upload more documents
- Make sure documents are processed
- Try more specific questions
- Check that embeddings were generated (look in database)

### Issue: BRD generation timeout

**Solution:**
- You may have too many large documents
- The aggregation limit is set to ~80K tokens
- Try with fewer documents first

## Verifying Database Setup

You can verify your setup in Supabase:

1. **Check Tables**: Go to Table Editor and verify all 4 tables exist
2. **Check Vector Extension**: Run this query in SQL Editor:
   \`\`\`sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   \`\`\`
   Should return one row

3. **Check Documents**: After uploading, run:
   \`\`\`sql
   SELECT * FROM documents;
   \`\`\`

4. **Check Chunks**: After processing, run:
   \`\`\`sql
   SELECT COUNT(*) FROM document_chunks;
   \`\`\`
   Should show number of chunks created

## Production Deployment Checklist

When deploying to production (Vercel):

- [ ] Push code to GitHub
- [ ] Create Vercel project connected to GitHub repo
- [ ] Add all environment variables in Vercel dashboard
- [ ] Set up Supabase production database (separate from dev)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/error tracking (Sentry, etc.)
- [ ] Set up API usage alerts (OpenAI, Anthropic)
- [ ] Review and tighten Supabase RLS policies
- [ ] Set up backups for Supabase database

## Cost Estimation

For moderate usage (100 documents, 200 chat messages/month):

- **Supabase**: Free tier covers most needs ($0)
- **OpenAI**:
  - Embeddings: ~$2/month
  - Whisper (if using audio): ~$5-10/month
- **Anthropic**:
  - Chat: ~$5-10/month
  - BRD generation: ~$2-5/month
- **Total**: ~$15-30/month

Heavy usage will cost more. Monitor your API dashboards.

## Getting Help

If you encounter issues:

1. Check browser console (F12) for errors
2. Check terminal/server logs for backend errors
3. Verify all environment variables are set correctly
4. Check Supabase dashboard for database issues
5. Review the README.md for additional information

## Next Steps

Once everything is working:

1. Customize the UI to match your branding
2. Add user authentication (NextAuth.js recommended)
3. Implement multi-user support
4. Add more document types if needed
5. Customize BRD template for your needs
6. Set up analytics to track usage

Happy building!
