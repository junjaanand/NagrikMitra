-- Enable vector in extensions schema
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA extensions;

-- Ensure scheme_embeddings table exists with vector(384)
CREATE TABLE IF NOT EXISTS public.scheme_embeddings (
    slug VARCHAR(255) PRIMARY KEY REFERENCES public.schemes(slug) ON DELETE CASCADE,
    embedding extensions.vector(384),
    indexed_text TEXT,
    last_embedded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure column type is vector(384)
ALTER TABLE public.scheme_embeddings ALTER COLUMN embedding TYPE extensions.vector(384);

-- Create HNSW high-speed vector index
DROP INDEX IF EXISTS public.idx_scheme_embeddings_hnsw;
CREATE INDEX idx_scheme_embeddings_hnsw 
ON public.scheme_embeddings 
USING hnsw (embedding extensions.vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Create hybrid search stored procedure
CREATE OR REPLACE FUNCTION public.match_schemes_hybrid(
    query_embedding extensions.vector(384),
    match_threshold float DEFAULT 0.20,
    match_count int DEFAULT 5,
    filter_state text DEFAULT NULL,
    filter_gender text DEFAULT 'all'
)
RETURNS TABLE (
    slug varchar,
    name varchar,
    state varchar,
    category varchar,
    benefits text,
    eligibility_text text,
    documents_required text,
    apply_url text,
    official_url text,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.slug,
        s.name,
        s.state,
        s.category,
        s.benefits,
        s.eligibility_text,
        s.documents_required,
        s.apply_url,
        s.official_url,
        (1 - (se.embedding <=> query_embedding))::float AS similarity
    FROM public.scheme_embeddings se
    JOIN public.schemes s ON s.slug = se.slug
    WHERE se.embedding IS NOT NULL
      AND (1 - (se.embedding <=> query_embedding)) >= match_threshold
      AND (
          filter_state IS NULL 
          OR s.state = 'Central' 
          OR LOWER(s.state) = LOWER(filter_state)
          OR s.eligibility_state LIKE '%All%'
      )
      AND (
          filter_gender = 'all' 
          OR s.eligibility_gender = 'all' 
          OR LOWER(s.eligibility_gender) = LOWER(filter_gender)
      )
    ORDER BY se.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.match_schemes_hybrid TO postgres, anon, authenticated, service_role;
