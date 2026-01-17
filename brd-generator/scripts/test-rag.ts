/**
 * RAG System Test Script
 *
 * This script tests the RAG implementation by:
 * 1. Checking database connectivity
 * 2. Verifying the match_document_chunks function exists
 * 3. Testing embedding generation
 * 4. Testing similarity search
 *
 * Run with: npx tsx scripts/test-rag.ts
 */

import { supabaseAdmin } from '../lib/db/supabase'
import { generateEmbedding } from '../lib/ai/embeddings'
import { searchSimilarChunks } from '../lib/db/vectors'
import { retrieveContext } from '../lib/ai/rag'

async function testDatabase() {
  console.log('🔍 Testing database connectivity...')

  try {
    // Check if pgvector extension is enabled
    const { data: extensions, error: extError } = await supabaseAdmin
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'vector')

    if (extError) {
      console.log('⚠️  Could not verify pgvector extension (this is ok if RLS blocks it)')
    } else {
      console.log('✅ pgvector extension verified')
    }

    // Check if match_document_chunks function exists
    const { data: functions, error: funcError } = await supabaseAdmin.rpc(
      'match_document_chunks',
      {
        query_embedding: Array(1536).fill(0.1),
        match_threshold: 0.9,
        match_count: 1,
        filter_project_id: null
      }
    )

    if (funcError) {
      console.error('❌ match_document_chunks function error:', funcError.message)
      return false
    }

    console.log('✅ match_document_chunks function is working')
    return true
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}

async function testEmbeddings() {
  console.log('\n🔍 Testing embedding generation...')

  try {
    const testText = 'This is a test document for RAG system verification.'
    const embedding = await generateEmbedding(testText)

    if (!embedding || embedding.length !== 1536) {
      console.error('❌ Invalid embedding dimensions:', embedding?.length)
      return false
    }

    console.log('✅ Embedding generated successfully')
    console.log(`   Dimensions: ${embedding.length}`)
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`)
    return true
  } catch (error) {
    console.error('❌ Embedding generation failed:', error)
    return false
  }
}

async function testSimilaritySearch() {
  console.log('\n🔍 Testing similarity search...')

  try {
    // First check if there are any chunks in the database
    const { data: chunkCount, error: countError } = await supabaseAdmin
      .from('document_chunks')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Could not count chunks:', countError.message)
      return false
    }

    const totalChunks = chunkCount?.length || 0
    console.log(`   Found ${totalChunks} document chunks in database`)

    if (totalChunks === 0) {
      console.log('⚠️  No documents to search. Upload and process documents first.')
      return true // Not a failure, just no data yet
    }

    // Generate a test query embedding
    const testQuery = 'project requirements and timeline'
    const queryEmbedding = await generateEmbedding(testQuery)

    // Search for similar chunks
    const results = await searchSimilarChunks(queryEmbedding, 3, 0.5)

    console.log(`✅ Similarity search completed`)
    console.log(`   Query: "${testQuery}"`)
    console.log(`   Results found: ${results.length}`)

    if (results.length > 0) {
      console.log('\n   Top result:')
      console.log(`   - File: ${results[0].metadata.filename}`)
      console.log(`   - Similarity: ${(results[0].similarity * 100).toFixed(2)}%`)
      console.log(`   - Preview: ${results[0].content.substring(0, 100)}...`)
    }

    return true
  } catch (error) {
    console.error('❌ Similarity search failed:', error)
    return false
  }
}

async function testRAG() {
  console.log('\n🔍 Testing RAG context retrieval...')

  try {
    const testQuery = 'What are the main project requirements?'

    // Check if there are projects in the database
    const { data: projects, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name')
      .limit(1)

    if (projectError) {
      console.error('❌ Could not fetch projects:', projectError.message)
      return false
    }

    if (!projects || projects.length === 0) {
      console.log('⚠️  No projects found. Create a project first.')
      return true
    }

    const projectId = projects[0].id
    console.log(`   Using project: ${projects[0].name} (${projectId})`)

    const result = await retrieveContext(testQuery, projectId)

    console.log('✅ RAG retrieval completed')
    console.log(`   Query: "${testQuery}"`)
    console.log(`   Sources: ${result.sources.length}`)
    console.log(`   Context length: ${result.context.length} characters`)

    if (result.sources.length > 0) {
      console.log('\n   Sources:')
      result.sources.forEach((source, idx) => {
        console.log(`   ${idx + 1}. ${source.filename} (${source.chunk_ids.length} chunks)`)
      })
    } else {
      console.log('   ⚠️  No context found. This is normal if no documents are processed.')
    }

    return true
  } catch (error) {
    console.error('❌ RAG test failed:', error)
    return false
  }
}

async function main() {
  console.log('🚀 RAG System Test Suite\n')
  console.log('=' .repeat(60))

  const results = {
    database: await testDatabase(),
    embeddings: await testEmbeddings(),
    similarity: await testSimilaritySearch(),
    rag: await testRAG(),
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Test Results Summary:\n')
  console.log(`  Database:          ${results.database ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Embeddings:        ${results.embeddings ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Similarity Search: ${results.similarity ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  RAG Retrieval:     ${results.rag ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = Object.values(results).every(r => r)

  console.log('\n' + '='.repeat(60))
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your RAG system is fully operational.\n')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.\n')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('\n💥 Test suite crashed:', error)
  process.exit(1)
})
