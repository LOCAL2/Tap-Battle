'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, LogOut } from 'lucide-react'
import Image from 'next/image'

interface GameTarget {
  id: string
  x: number
  y: number
  size: number
  color: string
  type: 'normal' | 'big' | 'bonus'
  points: number
  createdAt: number
  lifetime: number
}

export default function Game() {
  const { user, signOut } = useAuth()
  const [targets, setTargets] = useState<GameTarget[]>([])
  const [score, setScore] = useState(0)
  const [isLoadingScore, setIsLoadingScore] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const colorsRef = useRef(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'])

  // Load user's score from database
  const loadUserScore = useCallback(async () => {
    if (!user) return

    try {
      console.log('Loading score for user:', user.id)
      
      const { data: scoreData, error } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading user score:', error)
        setScore(0)
      } else {
        setScore(scoreData.score || 0)
      }
    } catch (error) {
      console.error('Error in loadUserScore:', error)
      setScore(0)
    } finally {
      setIsLoadingScore(false)
    }
  }, [user])

  // Initialize user and load score
  useEffect(() => {
    if (user) {
      loadUserScore()
    }
  }, [user, loadUserScore])

  // Generate a simple target - memoized with useCallback
  const generateTarget = useCallback(() => {
    if (typeof window === 'undefined') return

    const random = Math.random()
    let type: 'normal' | 'big' | 'bonus'
    let size, points
    
    if (random < 0.7) {
      type = 'normal'
      size = Math.floor(Math.random() * 30) + 40
      points = Math.floor(Math.random() * 3) + 1
    } else if (random < 0.85) {
      type = 'big'
      size = Math.floor(Math.random() * 30) + 50
      points = Math.floor(Math.random() * 3) + 5
    } else {
      type = 'bonus'
      size = Math.floor(Math.random() * 20) + 30
      points = Math.floor(Math.random() * 3) + 8
    }

    const target: GameTarget = {
      id: crypto.randomUUID(),
      x: Math.floor(Math.random() * (window.innerWidth - size - 100)) + 50,
      y: Math.floor(Math.random() * (window.innerHeight - size - 200)) + 100,
      size,
      color: colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)],
      type,
      points,
      createdAt: Date.now(),
      lifetime: type === 'bonus' ? 15000 : type === 'big' ? 12000 : 8000 // Bonus targets last longer
    }

    console.log('Generated target:', { id: target.id, type, points })

    setTargets(prev => {
      // Check if we already have too many targets
      if (prev.length >= 20) {
        console.log('Too many targets, skipping generation')
        return prev
      }
      return [...prev, target]
    })

    // Auto-remove target after its lifetime
    setTimeout(() => {
      console.log(`Auto-removing target ${target.id} after ${target.lifetime}ms`)
      setTargets(prev => prev.filter(t => t.id !== target.id))
    }, target.lifetime)
  }, []) // Empty dependency array since we use refs

  // Handle target click
  const handleTargetClick = async (target: GameTarget) => {
    if (!user) return

    console.log('Target clicked:', target.id, 'Points:', target.points)

    // Remove target immediately
    setTargets(prev => prev.filter(t => t.id !== target.id))

    // Add points
    const newScore = score + target.points
    setScore(newScore)

    // Update database
    try {
      await supabase
        .from('scores')
        .upsert({
          user_id: user.id,
          score: newScore
        }, {
          onConflict: 'user_id'
        })
    } catch (error) {
      console.error('Error updating score:', error)
    }
  }

  // Generate targets periodically - fixed useEffect
  useEffect(() => {
    if (!user) return

    // Clear any existing targets first
    setTargets([])
    console.log('Cleared existing targets, starting fresh')

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Generate initial targets quickly
    const initialTimeout1 = setTimeout(() => generateTarget(), 500)
    const initialTimeout2 = setTimeout(() => generateTarget(), 1000)
    const initialTimeout3 = setTimeout(() => generateTarget(), 1500)
    const initialTimeout4 = setTimeout(() => generateTarget(), 2000)
    const initialTimeout5 = setTimeout(() => generateTarget(), 2500)

    // Generate new targets every 1 second (เร็วมาก)
    intervalRef.current = setInterval(() => {
      generateTarget()
    }, 1000)

    return () => {
      clearTimeout(initialTimeout1)
      clearTimeout(initialTimeout2)
      clearTimeout(initialTimeout3)
      clearTimeout(initialTimeout4)
      clearTimeout(initialTimeout5)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setTargets([]) // Clear targets when component unmounts
    }
  }, [user, generateTarget])

  if (!user) {
    return null
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.name || 'User'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                {user.user_metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-white font-semibold">
                {user.user_metadata?.full_name || user.user_metadata?.name || 'Player'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Zap className="text-yellow-400" size={20} />
              <span className="text-white font-bold text-xl">
                {isLoadingScore ? '...' : score}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 text-white text-xs p-2 rounded">
          <div>Targets: {targets.length}/20</div>
          <div>Score: {score}</div>
          <div>Auto-remove: ON</div>
          <div>Generate: 1s</div>
          {targets.length > 2 && (
            <button 
              onClick={() => {
                setTargets([])
                console.log('Manually cleared all targets')
              }}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear All Targets
            </button>
          )}
        </div>
      )}

      {/* Game Area */}
      <div className="w-full h-full pt-20">
        <AnimatePresence>
          {targets.map((target) => (
            <motion.div
              key={target.id}
              className="absolute cursor-pointer select-none"
              style={{
                left: target.x,
                top: target.y,
                width: target.size,
                height: target.size,
                background: `radial-gradient(circle at 30% 30%, ${target.color}dd, ${target.color})`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.max(14, target.size / 3),
                fontWeight: '600',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.2),
                  0 2px 8px rgba(0,0,0,0.1),
                  inset 0 1px 0 rgba(255,255,255,0.2)
                `,
                border: '1px solid rgba(255,255,255,0.15)',
                position: 'relative',
                backdropFilter: 'blur(4px)'
              }}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ 
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: `
                  0 12px 40px rgba(0,0,0,0.3),
                  0 4px 12px rgba(0,0,0,0.15),
                  inset 0 1px 0 rgba(255,255,255,0.3)
                `
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTargetClick(target)}
            >
              <div className="text-center flex flex-col items-center gap-1">
                <div className="text-xl leading-none">
                  {target.type === 'big' && '🔥'}
                  {target.type === 'bonus' && '⚡'}
                  {target.type === 'normal' && '🎯'}
                </div>
                <div className="text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                  +{target.points}
                </div>
              </div>
              
              {/* Minimal timer bar */}
              <div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-black/20 rounded-full overflow-hidden"
                style={{ height: '2px' }}
              >
                <motion.div
                  className="h-full bg-white/80 backdrop-blur-sm"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ 
                    duration: target.lifetime / 1000,
                    ease: 'linear'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 