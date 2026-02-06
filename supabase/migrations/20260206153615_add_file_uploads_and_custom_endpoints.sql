/*
  # Add File Uploads and Custom API Endpoints

  ## New Features
  
  1. **Message Attachments**
     - New `message_attachments` table to store file metadata
     - Supports images (png, jpg, jpeg, gif, webp) and markdown files
     - Stores file name, type, size, and storage path
     - Links to messages table via foreign key

  2. **Storage Bucket**
     - Creates `chat-attachments` storage bucket
     - Authenticated users can upload files (max 10MB)
     - Public read access for authenticated users only
     - Automatic cleanup when messages are deleted

  3. **Message Queue Support**
     - Adds `status` column to messages table
     - Tracks: pending, sending, sent, failed
     - Enables queue visualization in UI

  4. **Custom API Endpoints**
     - Adds `api_endpoint` JSONB column to profiles
     - Stores custom OpenClaw connection settings
     - Supports local, cloud, or default endpoints
     - Schema: { type: 'default' | 'local' | 'cloud', url?: string, enabled: boolean }

  ## Security
  - RLS enabled on message_attachments table
  - Storage policies restrict access to authenticated users
  - Users can only access their own attachments
  - File type validation enforced at storage level
*/

-- Add status column to messages table for queue tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'status'
  ) THEN
    ALTER TABLE messages 
    ADD COLUMN status text DEFAULT 'sent' CHECK (status IN ('pending', 'sending', 'sent', 'failed'));
  END IF;
END $$;

-- Add api_endpoint column to profiles for custom OpenClaw connections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'api_endpoint'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN api_endpoint jsonb DEFAULT '{"type": "default", "enabled": false}'::jsonb;
  END IF;
END $$;

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'markdown')),
  mime_type text NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- Max 10MB
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_user_id ON message_attachments(user_id);

-- Enable RLS on message_attachments
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_attachments
CREATE POLICY "Users can view own attachments"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attachments"
  ON message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
  ON message_attachments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'text/markdown', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat-attachments bucket
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own chat attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own chat attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
