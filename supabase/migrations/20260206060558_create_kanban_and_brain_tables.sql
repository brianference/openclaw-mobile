/*
  # Create kanban boards and brain notes tables

  1. New Tables
    - `kanban_cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text, nullable)
      - `column_id` (text: backlog/progress/done)
      - `priority` (text: high/medium/low)
      - `tags` (text array, default empty)
      - `position` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `brain_notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `category` (text: idea/note/todo/research)
      - `color` (text, default 'default')
      - `pinned` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS kanban_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text,
  column_id text NOT NULL DEFAULT 'backlog',
  priority text NOT NULL DEFAULT 'medium',
  tags text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kanban cards"
  ON kanban_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kanban cards"
  ON kanban_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kanban cards"
  ON kanban_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own kanban cards"
  ON kanban_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS brain_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'note',
  color text NOT NULL DEFAULT 'default',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brain_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brain notes"
  ON brain_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brain notes"
  ON brain_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brain notes"
  ON brain_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brain notes"
  ON brain_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_kanban_cards_user_id ON kanban_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column_id ON kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_brain_notes_user_id ON brain_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_notes_category ON brain_notes(category);
