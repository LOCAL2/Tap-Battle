-- Clean Database - Delete everything and start fresh
-- Run this in Supabase SQL Editor

-- 1. Drop all existing tables
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS game_targets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create clean users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create clean scores table
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Create indexes
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_score ON scores(score DESC);

-- 5. Disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE scores DISABLE ROW LEVEL SECURITY;

-- 6. Verify tables
SELECT 'Tables created successfully' as status;

-- 7. Show table structure
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'scores')
ORDER BY table_name, ordinal_position; 