-- MobileClaw Database Schema
-- Phase 2: Supabase Integration
-- Created: 2026-02-13

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ============================================================================
-- TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Task data
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL CHECK (category IN ('work', 'personal', 'shopping', 'health', 'other')),
  due_date TIMESTAMPTZ,
  reminder TEXT CHECK (reminder IN ('none', 'at_time', '15_min', '1_hour', '1_day')),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Conflict resolution
  version INTEGER DEFAULT 1,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_category ON tasks(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);

-- Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tasks
CREATE POLICY tasks_user_isolation ON tasks
  FOR ALL
  USING (auth.uid() = user_id);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- VAULT SECRETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vault_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Metadata (unencrypted)
  type TEXT NOT NULL CHECK (type IN ('login', 'card', 'key', 'note')),
  name TEXT NOT NULL,
  tags TEXT[], -- Array of tags
  favorite BOOLEAN DEFAULT FALSE,
  
  -- Encrypted data (AES-256-CTR + HMAC)
  -- Format: IV + EncryptedData + HMAC (hex-encoded)
  encrypted_data TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ,
  
  -- Conflict resolution
  version INTEGER DEFAULT 1,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_vault_secrets_user_id ON vault_secrets(user_id);
CREATE INDEX idx_vault_secrets_type ON vault_secrets(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_vault_secrets_favorite ON vault_secrets(favorite) WHERE favorite = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_vault_secrets_tags ON vault_secrets USING GIN(tags);
CREATE INDEX idx_vault_secrets_updated_at ON vault_secrets(updated_at DESC);

-- Row Level Security
ALTER TABLE vault_secrets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own secrets
CREATE POLICY vault_secrets_user_isolation ON vault_secrets
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger: Auto-update updated_at
CREATE TRIGGER vault_secrets_updated_at
  BEFORE UPDATE ON vault_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- BRAIN NOTES TABLE (optional - if not already exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Note data
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('quick', 'research', 'project', 'meeting', 'idea')),
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Conflict resolution
  version INTEGER DEFAULT 1,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_brain_notes_user_id ON brain_notes(user_id);
CREATE INDEX idx_brain_notes_category ON brain_notes(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_brain_notes_tags ON brain_notes USING GIN(tags);
CREATE INDEX idx_brain_notes_updated_at ON brain_notes(updated_at DESC);

-- Row Level Security
ALTER TABLE brain_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own notes
CREATE POLICY brain_notes_user_isolation ON brain_notes
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger: Auto-update updated_at
CREATE TRIGGER brain_notes_updated_at
  BEFORE UPDATE ON brain_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SYNC STATUS TABLE (for offline sync tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Sync data
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  payload JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_sync_queue_table_record ON sync_queue(table_name, record_id);

-- Row Level Security
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own sync queue
CREATE POLICY sync_queue_user_isolation ON sync_queue
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE vault_secrets;
ALTER PUBLICATION supabase_realtime ADD TABLE brain_notes;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Soft delete (set deleted_at instead of hard delete)
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Get active (non-deleted) records count
CREATE OR REPLACE FUNCTION get_active_count(table_name TEXT, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  EXECUTE format('SELECT COUNT(*) FROM %I WHERE user_id = $1 AND deleted_at IS NULL', table_name)
  INTO count_result
  USING user_uuid;
  
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA / SEED (Optional)
-- ============================================================================

-- No seed data for production
-- Users will create their own tasks, secrets, and notes

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Version: 001
-- Description: Initial schema for tasks, vault_secrets, brain_notes, sync_queue
-- Date: 2026-02-13
