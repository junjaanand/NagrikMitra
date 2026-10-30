-- ============================================================================
-- NagrikMitra (नागरिक मित्र) — Master Production Database Schema (Supabase PostgreSQL 16)
-- Target Database: Supabase PostgreSQL 16 with pgvector & UUID Extensions
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Core Government Welfare Schemes Table (4,728 Schemes)
CREATE TABLE IF NOT EXISTS public.schemes (
    slug VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    ministry VARCHAR(300),
    department VARCHAR(300),
    state VARCHAR(100) DEFAULT 'Central',
    category VARCHAR(255) DEFAULT 'General Welfare',
    beneficiary_type TEXT,
    benefits TEXT,
    eligibility_text TEXT,
    application_process TEXT,
    documents_required TEXT,
    apply_url TEXT,
    official_url TEXT,
    eligibility_age_min INTEGER,
    eligibility_age_max INTEGER,
    eligibility_gender VARCHAR(50) DEFAULT 'all',
    eligibility_caste TEXT DEFAULT '[]',
    eligibility_income_max BIGINT,
    eligibility_residence VARCHAR(50) DEFAULT 'both',
    eligibility_state TEXT DEFAULT '["All"]',
    eligibility_disability BOOLEAN DEFAULT FALSE,
    eligibility_bpl BOOLEAN DEFAULT FALSE,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Generated Computed Columns replacing Python runtime UDFs
    application_mode VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN apply_url IS NOT NULL AND apply_url != '' AND apply_url NOT LIKE '%null%' THEN 'online'
            WHEN LOWER(application_process) LIKE '%offline%' OR LOWER(application_process) LIKE '%gram panchayat%' THEN 'offline'
            ELSE 'hybrid'
        END
    ) STORED,
    
    lifecycle_status VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN LOWER(name) LIKE '%discontinued%' OR LOWER(description) LIKE '%closed%' THEN 'discontinued'
            ELSE 'active'
        END
    ) STORED
);

-- 3. High-Performance B-Tree Indexes for Rule Matching & Catalog Filtering
CREATE INDEX IF NOT EXISTS idx_schemes_state ON public.schemes(state);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_gender ON public.schemes(eligibility_gender);
CREATE INDEX IF NOT EXISTS idx_schemes_bpl ON public.schemes(eligibility_bpl);
CREATE INDEX IF NOT EXISTS idx_schemes_disability ON public.schemes(eligibility_disability);
CREATE INDEX IF NOT EXISTS idx_schemes_residence ON public.schemes(eligibility_residence);
CREATE INDEX IF NOT EXISTS idx_schemes_app_mode ON public.schemes(application_mode);
CREATE INDEX IF NOT EXISTS idx_schemes_lifecycle ON public.schemes(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_schemes_income_max ON public.schemes(eligibility_income_max);

-- 4. Vector Embeddings Table for 100% Corpus Semantic RAG Search (Phase 02)
CREATE TABLE IF NOT EXISTS public.scheme_embeddings (
    slug VARCHAR(255) PRIMARY KEY REFERENCES public.schemes(slug) ON DELETE CASCADE,
    embedding vector(768), -- Gemini text-embedding-004 (768 dimensions)
    indexed_text TEXT,
    last_embedded_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW Vector Index for Sub-10ms Approximate Nearest Neighbor Retrieval
CREATE INDEX IF NOT EXISTS idx_scheme_embeddings_hnsw 
ON public.scheme_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. User Profiles Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'citizen', -- 'citizen', 'csc_vle', 'admin'
    preferred_language VARCHAR(10) DEFAULT 'hi', -- 'hi', 'mr', 'ta', 'en'
    state VARCHAR(100),
    district VARCHAR(100),
    ration_card_type VARCHAR(50), -- 'yellow', 'orange', 'white', 'none'
    social_category VARCHAR(50),  -- 'General', 'OBC', 'SC', 'ST', 'Minority'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Citizen Scheme Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scheme_slug VARCHAR(255) NOT NULL REFERENCES public.schemes(slug) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, scheme_slug)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- 7. Application Tracking & CSC Handoff Logs
CREATE TABLE IF NOT EXISTS public.application_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scheme_slug VARCHAR(255) NOT NULL REFERENCES public.schemes(slug) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'checklist_created', -- 'checklist_created', 'slip_downloaded', 'csc_visited', 'submitted', 'approved'
    csc_center_name VARCHAR(255),
    reference_number VARCHAR(100),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_user ON public.application_tracking(user_id);

-- 8. Broken Link Feedback & Gazette Sync Reports
CREATE TABLE IF NOT EXISTS public.link_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_slug VARCHAR(255) NOT NULL REFERENCES public.schemes(slug) ON DELETE CASCADE,
    reported_url TEXT NOT NULL,
    http_status INTEGER,
    error_type VARCHAR(100), -- '404_not_found', 'soft_200_closed', 'ssl_error', 'portal_down'
    reporter_ip VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_reports_slug ON public.link_reports(scheme_slug);

-- 9. Automatic Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
