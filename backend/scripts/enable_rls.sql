-- ============================================================================
-- NagrikMitra — Row Level Security (RLS) & Security Policies
-- Resolves all 6 Supabase Security Advisor errors
-- ============================================================================

-- 1. Enable RLS on all 6 public tables
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_reports ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if re-running
DROP POLICY IF EXISTS "Schemes are viewable by everyone" ON public.schemes;
DROP POLICY IF EXISTS "Embeddings viewable by everyone" ON public.scheme_embeddings;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users manage own tracking" ON public.application_tracking;
DROP POLICY IF EXISTS "Anyone can report broken links" ON public.link_reports;
DROP POLICY IF EXISTS "Admins can view link reports" ON public.link_reports;

-- 3. Schemes Table Policy: Public Read (Citizens can freely browse all schemes)
CREATE POLICY "Schemes are viewable by everyone" 
ON public.schemes FOR SELECT 
USING (true);

-- 4. Embeddings Table Policy: Public Read (Enables vector similarity search)
CREATE POLICY "Embeddings viewable by everyone" 
ON public.scheme_embeddings FOR SELECT 
USING (true);

-- 5. User Profiles Policy: Strict privacy (Citizens can only view and edit their own account)
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- 6. Bookmarks Policy: Strict privacy (Citizens only access their own bookmarks)
CREATE POLICY "Users manage own bookmarks" 
ON public.bookmarks FOR ALL 
USING (auth.uid() = user_id);

-- 7. Application Tracking Policy: Strict privacy (Citizens only track their own applications)
CREATE POLICY "Users manage own tracking" 
ON public.application_tracking FOR ALL 
USING (auth.uid() = user_id);

-- 8. Broken Link Reports Policy: Anyone (anon or signed in) can report a broken link
CREATE POLICY "Anyone can report broken links" 
ON public.link_reports FOR INSERT 
WITH CHECK (true);
