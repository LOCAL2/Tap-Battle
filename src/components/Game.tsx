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
        .select('score, updated_at')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading user score:', error)
        setScore(0)
      } else {
        console.log('Loaded score data:', scoreData)
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
    
    if (random < 0.6) {
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
      color: type === 'bonus' ? '#FFD700' : 
             type === 'big' ? '#FF6B6B' : 
             colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)],
      type,
      points,
      createdAt: Date.now(),
      lifetime: type === 'bonus' ? 20000 : type === 'big' ? 15000 : 10000 // Different lifetimes for each type
    }



    setTargets(prev => {
      // Check if we already have too many targets
      if (prev.length >= 12) {
        return prev
      }
      return [...prev, target]
    })

    // Auto-remove target after its lifetime
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== target.id))
    }, target.lifetime)
  }, []) // Empty dependency array since we use refs

  // Handle target click
  const handleTargetClick = async (target: GameTarget) => {
    if (!user) return

    // Remove target immediately
    setTargets(prev => prev.filter(t => t.id !== target.id))

    // Add points
    const newScore = score + target.points
    setScore(newScore)

    // Update database with current timestamp
    try {
      const { data, error } = await supabase
        .from('scores')
        .upsert({
          user_id: user.id,
          score: newScore
          // updated_at จะถูกอัพเดทอัตโนมัติโดย trigger
        }, {
          onConflict: 'user_id'
        })
      
      if (error) {
        console.error('Supabase error updating score:', error)
      }
    } catch (error) {
      console.error('Error updating score:', error)
    }
  }

  // Generate targets periodically - fixed useEffect
  useEffect(() => {
    if (!user) return

    // Clear any existing targets first
    setTargets([])

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Generate initial targets quickly
    const initialTimeout1 = setTimeout(() => generateTarget(), 500)
    const initialTimeout2 = setTimeout(() => generateTarget(), 1000)
    const initialTimeout3 = setTimeout(() => generateTarget(), 1500)

    // Generate new targets every 500ms
    intervalRef.current = setInterval(() => {
      generateTarget()
    }, 500)

    return () => {
      clearTimeout(initialTimeout1)
      clearTimeout(initialTimeout2)
      clearTimeout(initialTimeout3)
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
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10 p-2 sm:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.name || 'User'}
                width={32}
                height={32}
                className="rounded-full sm:w-10 sm:h-10"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {user.user_metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm sm:text-base truncate">
                {user.user_metadata?.full_name || user.user_metadata?.name || 'Player'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-lg px-2 sm:px-4 py-1 sm:py-2">
              <Zap className="text-yellow-400" size={16} />
              <span className="text-white font-bold text-lg sm:text-xl">
                {isLoadingScore ? '...' : score.toLocaleString()}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1 sm:gap-2 bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors cursor-pointer text-xs sm:text-sm"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
              <span className="sm:hidden">ออก</span>
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-black/50 text-white text-xs p-2 rounded">
          <div className="hidden sm:block">Targets: {targets.length}/12</div>
          <div className="sm:hidden">T: {targets.length}/12</div>
          <div className="hidden sm:block">Score: {score.toLocaleString()}</div>
          <div className="sm:hidden">S: {score.toLocaleString()}</div>
          <div className="hidden sm:block">Auto-remove: ON</div>
          <div className="hidden sm:block">Generate: 500ms</div>
          {targets.length > 2 && (
            <button 
              onClick={() => {
                setTargets([])
              }}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              <span className="hidden sm:inline">Clear All Targets</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>
      )}

      {/* Game Area */}
      <div className="w-full h-full pt-16 sm:pt-20">
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
                  0 4px 16px rgba(0,0,0,0.2),
                  0 2px 4px rgba(0,0,0,0.1)
                `,
                border: '1px solid rgba(255,255,255,0.15)',
                position: 'relative',
                backdropFilter: 'blur(2px)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
                scale: {
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                },
                opacity: {
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1]
                }
              }}
              whileHover={{ 
                scale: 1.08,
                transition: { 
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1]
                }
              }}
              whileTap={{ 
                scale: 0.92,
                transition: { 
                  duration: 0.15,
                  ease: [0.4, 0.0, 0.2, 1]
                }
              }}
              onClick={() => handleTargetClick(target)}
            >
              <motion.div 
                className="text-center flex flex-col items-center gap-1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.1,
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <motion.div 
                  className="text-xl leading-none"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: target.type === 'bonus' ? 2 : target.type === 'big' ? 2.5 : 3,
                    repeat: Infinity,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                >
                  {target.type === 'big' && '🔥'}
                  {target.type === 'bonus' && '⚡'}
                  {target.type === 'normal' && '🎯'}
                </motion.div>
                <motion.div 
                  className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full border border-white/20"
                  animate={{ 
                    y: [0, -2, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: target.type === 'bonus' ? 1.5 : target.type === 'big' ? 1.8 : 2,
                    repeat: Infinity,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                >
                  +{target.points}
                </motion.div>
              </motion.div>
              
              {/* Enhanced timer bar */}
              <motion.div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-black/30 rounded-full overflow-hidden"
                style={{ height: '3px' }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.2,
                  duration: 0.5,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-white/90 to-white/70"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ 
                    duration: target.lifetime / 1000,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 