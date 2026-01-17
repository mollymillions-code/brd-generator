-- Enable RLS on all tables for multi-tenant data isolation
-- This ensures users can only access their own data

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on document_chunks table
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Document chunks policies (access via parent document)
CREATE POLICY "Users can view chunks of their own documents"
  ON document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chunks for their own documents"
  ON document_chunks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chunks of their own documents"
  ON document_chunks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chunks of their own documents"
  ON document_chunks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages policies (access via parent conversation)
CREATE POLICY "Users can view messages in their own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their own conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their own conversations"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Enable RLS on brds table
ALTER TABLE brds ENABLE ROW LEVEL SECURITY;

-- BRDs policies (access via parent project)
CREATE POLICY "Users can view BRDs for their own projects"
  ON brds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brds.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create BRDs for their own projects"
  ON brds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brds.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update BRDs for their own projects"
  ON brds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brds.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete BRDs for their own projects"
  ON brds FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = brds.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Grant service role bypass for RLS (for server-side operations)
-- Service role already has bypassRLS privilege, but explicitly documented here
-- The application uses service role keys in supabaseAdmin for server operations
