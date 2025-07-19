-- เพิ่ม column updated_at ในตาราง scores
ALTER TABLE scores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- อัพเดท updated_at ให้เท่ากับ created_at สำหรับข้อมูลเดิม
UPDATE scores SET updated_at = created_at WHERE updated_at IS NULL;

-- สร้าง function สำหรับอัพเดท updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับ scores table
DROP TRIGGER IF EXISTS update_scores_updated_at ON scores;
CREATE TRIGGER update_scores_updated_at
    BEFORE UPDATE ON scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- เพิ่ม unique constraint สำหรับ user_id (ถ้ายังไม่มี)
ALTER TABLE scores ADD CONSTRAINT IF NOT EXISTS scores_user_id_unique UNIQUE (user_id); 