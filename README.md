# Tap Battle - เกมกดรูปภาพ

เกมกดรูปภาพที่กลางจอแบบ realtime ที่ผู้เล่นสามารถแข่งขันกันได้ โดยต้อง login ด้วย Discord หรือ Google ก่อน

## ฟีเจอร์หลัก

- 🔐 **ระบบ Authentication** - Login ด้วย Discord และ Google
- 🎯 **เกมกดรูปภาพ** - รูปภาพปรากฏที่กลางจอแบบสุ่ม
- 📊 **Realtime Scoreboard** - แสดงคะแนนผู้เล่นแบบ realtime
- ⚡ **อัปเดตทุก 100ms** - ข้อมูลอัปเดตแบบ realtime
- 🎨 **UI สวยงาม** - ใช้ Tailwind CSS และ Framer Motion
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ

## การติดตั้ง

1. Clone โปรเจค
```bash
git clone <repository-url>
cd tapbattle_auth
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตั้งค่า Supabase และ Environment Variables (ดูรายละเอียดใน [SETUP.md](./SETUP.md))

4. รันโปรเจค
```bash
npm run dev
```

## เทคโนโลยีที่ใช้

- **Next.js 15** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Supabase** - Database และ Authentication
- **Framer Motion** - Animations
- **Lucide React** - Icons

## การเล่นเกม

1. เข้าสู่ระบบด้วย Discord หรือ Google
2. รูปภาพวงกลมจะปรากฏที่กลางจอแบบสุ่ม
3. กดที่วงกลมให้เร็วที่สุดเพื่อได้คะแนน
4. ดูคะแนนใน Scoreboard ด้านล่าง
5. แข่งขันกับผู้เล่นอื่นแบบ realtime

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

## การตั้งค่า

ดูรายละเอียดการตั้งค่าทั้งหมดใน [SETUP.md](./SETUP.md)

## License

MIT
