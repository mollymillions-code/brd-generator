-- First, ensure the documents bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from documents bucket" ON storage.objects;

-- Allow anyone to upload files to the documents bucket
CREATE POLICY "Allow public uploads to documents bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

-- Allow anyone to read files from the documents bucket
CREATE POLICY "Allow public reads from documents bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Allow anyone to delete files from the documents bucket
CREATE POLICY "Allow public deletes from documents bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'documents');
