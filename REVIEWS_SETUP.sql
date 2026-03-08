-- -- 1. DROP the table if it exists with wrong types
DROP TABLE IF EXISTS public.course_reviews;

-- 2. Create the reviews table
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_avatar TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Allow anyone to read reviews
CREATE POLICY "Allow public read access to course reviews"
ON public.course_reviews FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "Allow authenticated users to insert reviews"
ON public.course_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update own reviews"
ON public.course_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete own reviews"
ON public.course_reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
