# การตั้งค่า Tap Battle Game

## 1. สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com) และสร้าง project ใหม่
2. เก็บ URL และ anon key ไว้

## 2. สร้าง Database Tables

รัน SQL ต่อไปนี้ใน Supabase SQL Editor:

```sql
-- สร้างตาราง users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง scores
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index สำหรับ performance
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_score ON scores(score DESC);

-- สร้าง RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Users can read all users
CREATE POLICY "Users can read all users" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read all scores
CREATE POLICY "Users can read all scores" ON scores
  FOR SELECT USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "Users can update own scores" ON scores
  FOR UPDATE USING (auth.uid() = user_id);
```

## 3. ตั้งค่า Authentication

1. ไปที่ Authentication > Settings ใน Supabase Dashboard
2. เปิดใช้งาน Discord และ Google providers
3. ตั้งค่า redirect URLs:
   - `http://localhost:3000/game` (สำหรับ development)
   - `https://your-domain.com/game` (สำหรับ production)

### Discord OAuth Setup
1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. สร้าง application ใหม่
3. ไปที่ OAuth2 > General
4. เพิ่ม redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. คัดลอก Client ID และ Client Secret
6. ใส่ใน Supabase Discord provider settings

### Google OAuth Setup
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง project ใหม่หรือเลือก project ที่มีอยู่
3. เปิดใช้งาน Google+ API
4. ไปที่ Credentials > Create Credentials > OAuth 2.0 Client IDs
5. เพิ่ม redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. คัดลอก Client ID และ Client Secret
7. ใส่ใน Supabase Google provider settings

## 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 5. รันโปรเจค

```bash
npm run dev
```

## ฟีเจอร์ของเกม

- ✅ ระบบ Login ด้วย Discord และ Google
- ✅ เกมกดรูปภาพที่กลางจอ
- ✅ Realtime Scoreboard
- ✅ ข้อมูลอัปเดตทุก 100ms
- ✅ UI ที่สวยงามและ responsive
- ✅ ระบบ authentication ที่ปลอดภัย

## โครงสร้างโปรเจค

```
src/
├── app/
│   ├── game/
│   │   └── page.tsx          # หน้าเกม
│   ├── layout.tsx            # Layout หลัก
│   └── page.tsx              # หน้าแรก (Login)
├── components/
│   ├── AuthProvider.tsx      # Context สำหรับ authentication
│   ├── Game.tsx              # Component เกมหลัก
│   ├── LoginPage.tsx         # หน้า Login
│   └── Scoreboard.tsx        # Scoreboard แบบ realtime
└── lib/
    └── supabase.ts           # Supabase client configuration
``` 