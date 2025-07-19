-- database_setup.sql
-- ลบตารางเดิม (ถ้ามี) และสร้างใหม่ทั้งหมด

-- ลบตาราง (ถ้ามีอยู่)
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS users;

-- สร้างตาราง users
CREATE TABLE users (
  id uuid PRIMARY KEY,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- สร้างตาราง scores
CREATE TABLE scores (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Trigger: อัปเดต updated_at อัตโนมัติเมื่อมีการเปลี่ยนแปลงคะแนน
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

-- Index สำหรับการเรียงลำดับคะแนน
CREATE INDEX idx_scores_score_desc ON scores(score DESC); 