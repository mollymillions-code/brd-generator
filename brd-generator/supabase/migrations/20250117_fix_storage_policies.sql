-- Note: This migration must be run by the Supabase service role or via the Supabase CLI
-- It cannot be run through the SQL Editor as a regular user

-- Enable RLS on storage.objects if not already enabled
DO $$
BEGIN
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping: insufficient privileges to alter storage.objects';
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public uploads to documents bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public reads from documents bucket" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public deletes from documents bucket" ON storage.objects;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping: insufficient privileges to drop policies';
END $$;

-- Allow anyone to upload files to the documents bucket
DO $$
BEGIN
  CREATE POLICY "Allow public uploads to documents bucket"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'documents');
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping: insufficient privileges to create upload policy';
END $$;

-- Allow anyone to read files from the documents bucket
DO $$
BEGIN
  CREATE POLICY "Allow public reads from documents bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'documents');
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping: insufficient privileges to create read policy';
END $$;

-- Allow anyone to delete files from the documents bucket
DO $$
BEGIN
  CREATE POLICY "Allow public deletes from documents bucket"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'documents');
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping: insufficient privileges to create delete policy';
END $$;
