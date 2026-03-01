-- Run this in Supabase SQL Editor to create the certificates table

CREATE TABLE IF NOT EXISTS certificates (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  template_url TEXT NOT NULL,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON certificates FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Auth users can manage" ON certificates FOR ALL USING (true);

-- ALSO: Create a storage bucket called "certificate-templates" in Supabase Dashboard
-- Go to Storage > New Bucket > Name: "certificate-templates" > Public: ON
