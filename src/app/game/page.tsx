'use client'

import { useAuth } from '@/components/AuthProvider'
import Game from '@/components/Game'
import Scoreboard from '@/components/Scoreboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function GamePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <Game />
      <Scoreboard />
    </div>
  )
} 