-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the documents table (using 'knowledge_base' to be compatible with your existing setup)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(2048), -- Dimension for nvidia/llama-nemotron-embed-vl-1b-v2
  fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- 3. Create indexes for performance
-- Vector index (HNSW)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING HNSW (embedding vector_cosine_ops);
-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_fts ON knowledge_base USING GIN(fts);

-- 4. Hybrid Search Function using Reciprocal Rank Fusion (RRF)
-- This combines Semantic (Vector) and Keyword (FTS) search.
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(2048),
  match_threshold FLOAT DEFAULT 0.0,
  match_count INT DEFAULT 10,
  full_text_weight FLOAT DEFAULT 1.0,
  vector_weight FLOAT DEFAULT 1.0
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE sql
AS $$
WITH semantic_search AS (
  SELECT id, 1 - (embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count
),
keyword_search AS (
  SELECT id, ts_rank(fts, websearch_to_tsquery('english', query_text)) AS similarity
  FROM knowledge_base
  WHERE fts @@ websearch_to_tsquery('english', query_text)
  ORDER BY similarity DESC
  LIMIT match_count
),
rrf_scores AS (
  SELECT id, SUM(score) AS rrf_score
  FROM (
    SELECT id, (1.0 / (60 + ROW_NUMBER() OVER (ORDER BY similarity DESC))) * vector_weight AS score FROM semantic_search
    UNION ALL
    SELECT id, (1.0 / (60 + ROW_NUMBER() OVER (ORDER BY similarity DESC))) * full_text_weight AS score FROM keyword_search
  ) AS combined_ranks
  GROUP BY id
)
SELECT k.id, k.content, k.metadata, r.rrf_score as similarity
FROM knowledge_base k
JOIN rrf_scores r ON k.id = r.id
ORDER BY r.rrf_score DESC
LIMIT match_count;
$$;
-- 5. Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id TEXT,
    project_id TEXT,
    session_id TEXT,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Project History Table
CREATE TABLE IF NOT EXISTS project_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id TEXT,
    project_name TEXT,
    user_id TEXT,
    event_type TEXT DEFAULT 'conversation',
    description TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
