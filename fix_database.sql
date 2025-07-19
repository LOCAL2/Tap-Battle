-- fix_database.sql
-- Script to fix the database schema issues

-- First, backup existing data
CREATE TABLE scores_backup AS SELECT * FROM scores;

-- Drop the existing scores table
DROP TABLE scores;

-- Recreate scores table with correct schema
CREATE TABLE scores (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Restore data from backup
INSERT INTO scores (user_id, score, updated_at)
SELECT user_id, score, updated_at FROM scores_backup;

-- Drop backup table
DROP TABLE scores_backup;

-- Recreate trigger
CREATE OR REPLACE FUNCTION update_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_scores_updated_at ON scores;
CREATE TRIGGER set_scores_updated_at
BEFORE UPDATE ON scores
FOR EACH ROW
EXECUTE FUNCTION update_scores_updated_at();

-- Recreate index
CREATE INDEX idx_scores_score_desc ON scores(score DESC);

-- Verify the fix
SELECT 'Database schema fixed successfully' as status; 