# Supabase Storage Setup Instructions

## The Problem
You're getting error "must be owner of table objects" because the SQL Editor doesn't have permissions to modify the `storage.objects` system table directly.

## The Solution: Use Supabase Dashboard UI

### Option 1: Make Bucket Public (Easiest)

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click on the **documents** bucket
4. Click the **Settings** or **Configuration** tab
5. Toggle **Public bucket** to **ON**
6. Click **Save**

This automatically allows public read/write access to the bucket.

---

### Option 2: Create Policies Manually (More Control)

If you need more granular control:

1. Go to **Storage** → **documents** bucket
2. Click on the **Policies** tab
3. Click **New Policy**

#### Create Upload Policy:
- Click **For full customization**
- **Policy name**: `Allow public uploads`
- **Allowed operation**: Check `INSERT`
- **Target roles**: Select `public`
- **Policy definition (WITH CHECK)**:
  ```sql
  bucket_id = 'documents'
  ```
- Click **Save**

#### Create Read Policy:
- Click **New Policy**
- **Policy name**: `Allow public reads`
- **Allowed operation**: Check `SELECT`
- **Target roles**: Select `public`
- **Policy definition (USING)**:
  ```sql
  bucket_id = 'documents'
  ```
- Click **Save**

#### Create Delete Policy:
- Click **New Policy**
- **Policy name**: `Allow public deletes`
- **Allowed operation**: Check `DELETE`
- **Target roles**: Select `public`
- **Policy definition (USING)**:
  ```sql
  bucket_id = 'documents'
  ```
- Click **Save**

---

## Verify It Works

After setting up the policies, try uploading a file through your application. The storage bucket should now accept uploads.

## Next Steps

After fixing storage, don't forget to run the second migration:
`supabase/migrations/20250117_update_match_function_with_project_filter.sql`

This one should work fine in the SQL Editor since it's modifying functions, not system tables.
