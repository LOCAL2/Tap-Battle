'use client'

import { useAuth } from './AuthProvider'
import { MessageCircle, Chrome } from 'lucide-react'

export default function LoginPage() {
  const { signInWithDiscord, signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tap Battle</h1>
          <p className="text-white/80">เข้าสู่ระบบเพื่อเริ่มเกม</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={signInWithDiscord}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <MessageCircle size={20} />
            เข้าสู่ระบบด้วย Discord
          </button>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <Chrome size={20} />
            เข้าสู่ระบบด้วย Google
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            เกมกดรูปภาพที่กลางจอ - แข่งขันกับผู้เล่นอื่นแบบ realtime
          </p>
        </div>
      </div>
    </div>
  )
} 