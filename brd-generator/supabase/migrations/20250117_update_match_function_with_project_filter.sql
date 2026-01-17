-- Update the match_document_chunks function to support project_id filtering
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid DEFAULT NULL,
  filter_project_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.metadata
  FROM document_chunks dc
  INNER JOIN documents d ON dc.document_id = d.id
  WHERE
    1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (filter_user_id IS NULL OR d.user_id = filter_user_id)
    AND (filter_project_id IS NULL OR d.project_id = filter_project_id)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
