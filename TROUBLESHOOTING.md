# การแก้ไขปัญหา

## ปัญหา: หน้าจอดำหลังจาก login

### สาเหตุ:
1. **Environment variables ไม่ได้ตั้งค่า**
2. **Supabase configuration ไม่ถูกต้อง**
3. **Middleware มีปัญหา**

### วิธีแก้ไข:

#### 1. ตรวจสอบ Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### 2. ตรวจสอบ Console

เปิด Developer Tools (F12) และดู Console tab เพื่อดู error messages

#### 3. ตรวจสอบ Supabase Project

1. ไปที่ [supabase.com](https://supabase.com)
2. เลือก project ของคุณ
3. ไปที่ Settings > API
4. คัดลอก URL และ anon key

#### 4. ตรวจสอบ Authentication Settings

ใน Supabase Dashboard:
1. ไปที่ Authentication > Settings
2. ตรวจสอบว่า Discord และ Google providers เปิดใช้งานแล้ว
3. ตรวจสอบ redirect URLs:
   - `http://localhost:3001/game` (development)
   - `https://your-domain.com/game` (production)

#### 5. รีสตาร์ท Development Server

```bash
# หยุด server (Ctrl+C)
# แล้วรันใหม่
npm run dev
```

#### 6. ล้าง Browser Cache

1. เปิด Developer Tools (F12)
2. คลิกขวาที่ปุ่ม Refresh
3. เลือก "Empty Cache and Hard Reload"

## ปัญหาอื่นๆ

### Login ไม่ทำงาน
- ตรวจสอบ OAuth settings ใน Google Cloud Console และ Discord Developer Portal
- ตรวจสอบ redirect URIs

### Scoreboard ไม่แสดง
- ตรวจสอบ database tables ว่าสร้างแล้ว
- ตรวจสอบ RLS policies

### เกมไม่ทำงาน
- ตรวจสอบ console errors
- ตรวจสอบ network tab ใน Developer Tools 