-- Supabase RAG System Health Check
-- Run these queries in Supabase SQL Editor to verify your setup

-- =====================================================
-- 1. CHECK PGVECTOR EXTENSION
-- =====================================================
SELECT
    extname AS extension_name,
    extversion AS version
FROM pg_extension
WHERE extname = 'vector';
-- Expected: 1 row showing 'vector' extension


-- =====================================================
-- 2. CHECK TABLES EXIST
-- =====================================================
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = 'public'
     AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('projects', 'documents', 'document_chunks', 'conversations', 'messages', 'brds')
ORDER BY table_name;
-- Expected: 6 rows


-- =====================================================
-- 3. CHECK MATCH_DOCUMENT_CHUNKS FUNCTION
-- =====================================================
SELECT
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'match_document_chunks';
-- Expected: 1 row showing the function


-- =====================================================
-- 4. CHECK INDEXES (INCLUDING VECTOR INDEX)
-- =====================================================
SELECT
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('documents', 'document_chunks')
ORDER BY tablename, indexname;
-- Should include 'idx_document_chunks_embedding' for HNSW vector search


-- =====================================================
-- 5. CHECK DOCUMENT PROCESSING STATUS
-- =====================================================
SELECT
    COUNT(*) FILTER (WHERE processed = true) as processed_count,
    COUNT(*) FILTER (WHERE processed = false) as unprocessed_count,
    COUNT(*) as total_documents,
    COUNT(DISTINCT project_id) as project_count
FROM documents;
-- Shows how many documents are processed


-- =====================================================
-- 6. CHECK DOCUMENT CHUNKS WITH EMBEDDINGS
-- =====================================================
SELECT
    d.filename,
    d.file_type,
    d.processed,
    COUNT(dc.id) as chunk_count,
    COUNT(dc.embedding) as chunks_with_embeddings,
    AVG(LENGTH(dc.content)) as avg_chunk_size
FROM documents d
LEFT JOIN document_chunks dc ON d.id = dc.document_id
GROUP BY d.id, d.filename, d.file_type, d.processed
ORDER BY d.uploaded_at DESC
LIMIT 10;
-- Shows chunk statistics per document


-- =====================================================
-- 7. CHECK EMBEDDING DIMENSIONS
-- =====================================================
SELECT
    d.filename,
    dc.chunk_index,
    vector_dims(dc.embedding) as embedding_dimensions,
    LENGTH(dc.content) as content_length
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
ORDER BY d.uploaded_at DESC, dc.chunk_index
LIMIT 5;
-- Should show 1536 dimensions for all embeddings


-- =====================================================
-- 8. TEST VECTOR SIMILARITY SEARCH
-- =====================================================
-- Generate a random test vector and search
SELECT
    d.filename,
    dc.content,
    1 - (dc.embedding <=> array_fill(0.1, ARRAY[1536])::vector) as similarity
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.processed = true
ORDER BY dc.embedding <=> array_fill(0.1, ARRAY[1536])::vector
LIMIT 5;
-- Should return results if documents are processed
-- Note: This uses a dummy vector, not a real query


-- =====================================================
-- 9. CHECK RLS POLICIES
-- =====================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('projects', 'documents', 'document_chunks', 'conversations', 'messages')
ORDER BY tablename, policyname;
-- Should show "Allow all operations" policies for each table


-- =====================================================
-- 10. OVERALL SYSTEM SUMMARY
-- =====================================================
SELECT
    'Projects' as entity,
    COUNT(*)::text as count
FROM projects
UNION ALL
SELECT 'Documents', COUNT(*)::text FROM documents
UNION ALL
SELECT 'Processed Documents', COUNT(*)::text FROM documents WHERE processed = true
UNION ALL
SELECT 'Document Chunks', COUNT(*)::text FROM document_chunks
UNION ALL
SELECT 'Chunks with Embeddings', COUNT(*)::text FROM document_chunks WHERE embedding IS NOT NULL
UNION ALL
SELECT 'Conversations', COUNT(*)::text FROM conversations
UNION ALL
SELECT 'Messages', COUNT(*)::text FROM messages
UNION ALL
SELECT 'BRDs', COUNT(*)::text FROM brds;


-- =====================================================
-- 11. TEST THE MATCH_DOCUMENT_CHUNKS FUNCTION
-- =====================================================
-- This calls your actual RAG function
-- Replace the dummy vector with a real query embedding in production
SELECT * FROM match_document_chunks(
    array_fill(0.1, ARRAY[1536])::vector,  -- Dummy query vector
    0.5,                                     -- Lower threshold for testing
    5,                                       -- Return top 5
    NULL                                     -- All projects
);
-- Should return results if you have processed documents


-- =====================================================
-- TROUBLESHOOTING QUERIES
-- =====================================================

-- Find documents that failed processing
SELECT
    filename,
    error,
    uploaded_at
FROM documents
WHERE processed = false
AND error IS NOT NULL;

-- Find chunks without embeddings
SELECT
    d.filename,
    COUNT(*) as chunks_without_embeddings
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE dc.embedding IS NULL
GROUP BY d.filename;

-- Check storage sizes
SELECT
    pg_size_pretty(pg_total_relation_size('documents')) as documents_size,
    pg_size_pretty(pg_total_relation_size('document_chunks')) as chunks_size,
    pg_size_pretty(pg_database_size(current_database())) as total_db_size;
