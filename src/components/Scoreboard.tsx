'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy, ChevronUp, ChevronDown, Zap, Activity, Medal } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'

interface Score {
  id: string
  user_id: string
  score: number
  user: {
    name: string
    avatar_url: string | null
  }
  last_click?: number
  clicks_per_second?: number
  scoreIncrease?: number
}

interface ActivePlayer {
  user_id: string
  name: string
  avatar_url: string | null
  last_click: number
  clicks_per_second: number
  score_increase: number
}

interface UserData {
  name: string
  avatar_url: string | null
}

export default function Scoreboard() {
  const { user } = useAuth()
  const [scores, setScores] = useState<Score[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([])
  const [rankingChanges, setRankingChanges] = useState<{[key: string]: 'up' | 'down' | 'same'}>({})
  
  // Use refs to track previous values without causing re-renders
  const previousScoresRef = useRef<{[key: string]: number}>({})
  const previousRankingsRef = useRef<{[key: string]: number}>({})

  const fetchScores = useCallback(async () => {
    try {
      // First, get all scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)

      if (scoresError) {
        console.error('Error fetching scores:', {
          error: scoresError,
          message: scoresError.message,
          details: scoresError.details,
          hint: scoresError.hint,
          code: scoresError.code
        })
        return
      }

      if (scoresData) {
        // Get user data for each score
        const userIds = scoresData.map(score => score.user_id)
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, avatar_url')
          .in('id', userIds)

        if (usersError) {
          console.error('Error fetching users:', {
            error: usersError,
            message: usersError.message,
            details: usersError.details,
            hint: usersError.hint,
            code: usersError.code
          })
          return
        }

        // Create a map of user data
        const userMap = new Map()
        if (usersData) {
          usersData.forEach(user => {
            userMap.set(user.id, user)
          })
        }

        const formattedScores = scoresData.map(item => {
          const user = userMap.get(item.user_id) || { name: `Player ${item.user_id.slice(0, 8)}`, avatar_url: null }
          return {
            id: item.id,
            user_id: item.user_id,
            score: item.score,
            last_click: new Date(item.created_at).getTime(),
            user: {
              name: user.name || `Player ${item.user_id.slice(0, 8)}`,
              avatar_url: user.avatar_url || null
            }
          }
        })
        
        // Check for score increases and trigger animations
        const newScores = formattedScores.map(score => {
          const previousScore = previousScoresRef.current[score.user_id] || 0
          const scoreIncrease = score.score - previousScore
          
          return { ...score, scoreIncrease }
        })

        // Check for ranking changes
        const newRankingChanges: {[key: string]: 'up' | 'down' | 'same'} = {}
        formattedScores.forEach((score, index) => {
          const currentRank = index + 1
          const previousRank = previousRankingsRef.current[score.user_id] || currentRank
          
          if (currentRank < previousRank) {
            newRankingChanges[score.user_id] = 'up'
          } else if (currentRank > previousRank) {
            newRankingChanges[score.user_id] = 'down'
          } else {
            newRankingChanges[score.user_id] = 'same'
          }
        })

        // Update previous scores and rankings in refs
        const newPreviousScores = formattedScores.reduce((acc, score) => {
          acc[score.user_id] = score.score
          return acc
        }, {} as {[key: string]: number})
        
        const newPreviousRankings = formattedScores.reduce((acc, score, index) => {
          acc[score.user_id] = index + 1
          return acc
        }, {} as {[key: string]: number})
        
        previousScoresRef.current = newPreviousScores
        previousRankingsRef.current = newPreviousRankings
        setRankingChanges(newRankingChanges)
        
        // Only update if scores actually changed significantly
        setScores(prevScores => {
          const prevString = JSON.stringify(prevScores.map(s => ({ user_id: s.user_id, score: s.score })))
          const newString = JSON.stringify(formattedScores.map(s => ({ user_id: s.user_id, score: s.score })))
          
          if (prevString !== newString) {
            console.log('Scores updated:', formattedScores)
            console.log('Ranking changes:', newRankingChanges)
            return formattedScores
          }
          return prevScores
        })
      }
    } catch (error) {
      console.error('Error in fetchScores:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, []) // Remove all dependencies to prevent infinite re-renders

  const calculateClicksPerSecond = useCallback(() => {
    const now = Date.now()
    console.log('Calculating CPS, current time:', now)
    console.log('Scores:', scores)
    
    const active = scores
      .filter(score => {
        const timeSinceLastClick = now - (score.last_click || 0)
        console.log(`Player ${score.user.name}: time since last click = ${timeSinceLastClick}ms`)
        return timeSinceLastClick < 30000 // Active if clicked within 30 seconds
      })
      .map(score => {
        const timeSinceLastClick = now - (score.last_click || 0)
        // Simulate CPS based on recent activity
        const clicksPerSecond = timeSinceLastClick < 10000 ? 1.5 : 0.8
        const previousScore = previousScoresRef.current[score.user_id] || 0
        const scoreIncrease = score.score - previousScore
        
        return {
          user_id: score.user_id,
          name: score.user.name,
          avatar_url: score.user.avatar_url,
          last_click: score.last_click || 0,
          clicks_per_second: clicksPerSecond,
          score_increase: scoreIncrease
        }
      })
      .sort((a, b) => b.clicks_per_second - a.clicks_per_second)

    console.log('Active players:', active)
    setActivePlayers(active)
  }, [scores]) // Only depend on scores

  useEffect(() => {
    // Fetch initial scores immediately
    fetchScores()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('scores-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores'
        },
        (payload) => {
          console.log('Scoreboard realtime update:', {
            eventType: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            new: payload.new,
            old: payload.old
          })
          // Fetch updated scores immediately
          fetchScores()
        }
      )
      .subscribe()

    // Set up interval to fetch scores every 2 seconds (less frequent)
    const interval = setInterval(() => {
      fetchScores()
    }, 2000)

    // Set up interval to calculate clicks per second every 5 seconds
    const cpsInterval = setInterval(() => {
      calculateClicksPerSecond()
    }, 5000)

    return () => {
      console.log('Cleaning up scoreboard subscriptions')
      supabase.removeChannel(channel)
      clearInterval(interval)
      clearInterval(cpsInterval)
    }
  }, [fetchScores, calculateClicksPerSecond])

  // Calculate clicks per second whenever scores change
  useEffect(() => {
    if (scores.length > 0) {
      calculateClicksPerSecond()
    }
  }, [scores, calculateClicksPerSecond])

  useEffect(() => {
    // Show scoreboard after 1 second
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return rank.toString()
    }
  }

  // Check if a player is active
  const isPlayerActive = (userId: string) => {
    return activePlayers.some(p => p.user_id === userId)
  }

  // Get player's CPS
  const getPlayerCPS = (userId: string) => {
    const activePlayer = activePlayers.find(p => p.user_id === userId)
    return activePlayer ? activePlayer.clicks_per_second : 0
  }

  if (!isVisible) return null

  return (
    <>
      {/* Sliding Scoreboard Panel */}
      <div className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-black/95 backdrop-blur-lg border border-white/20 rounded-t-xl z-30 w-[50vw] transition-all duration-500 ease-in-out ${
        isExpanded ? 'h-[50vh]' : 'h-16'
      }`}>
        {/* Header Bar - Always Visible */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400" size={18} />
            <h3 className="text-white font-semibold text-sm">Leaderboard</h3>
          </div>
          <div className="flex items-center gap-2">
            {activePlayers.length > 0 && (
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <Activity size={12} />
                <span>{activePlayers.length}</span>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Content Area - Slides Up */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'h-[calc(50vh-4rem)] opacity-100' : 'h-0 opacity-0'
        }`}>
          <div className={`p-4 overflow-y-auto transition-all duration-500 ease-in-out scrollbar-hide ${
            isExpanded ? 'h-full' : 'h-0'
          }`}>
            {/* Top Players Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Medal className="text-yellow-400" size={16} />
                <h4 className="text-white font-semibold text-sm">Top Players</h4>
              </div>
              <div className="space-y-2">
                {scores.map((score, index) => {
                  const rank = index + 1
                  const isActive = isPlayerActive(score.user_id)
                  const cps = getPlayerCPS(score.user_id)
                  const rankingChange = rankingChanges[score.user_id] || 'same'
                  
                  return (
                    <motion.div
                      key={score.user_id}
                      layout
                      initial={false}
                      animate={{
                        y: 0,
                        opacity: 1,
                        scale: rankingChange === 'up' ? 1.1 : rankingChange === 'down' ? 0.95 : 1,
                        backgroundColor: rankingChange === 'up' ? 'rgba(34, 197, 94, 0.3)' : 
                                        rankingChange === 'down' ? 'rgba(239, 68, 68, 0.3)' : 
                                        'rgba(255, 255, 255, 0.05)',
                        boxShadow: rankingChange === 'up' ? '0 0 20px rgba(34, 197, 94, 0.5)' :
                                  rankingChange === 'down' ? '0 0 20px rgba(239, 68, 68, 0.5)' :
                                  '0 4px 8px rgba(0,0,0,0.3)'
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        duration: 0.8,
                        mass: 1.2
                      }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 relative overflow-hidden ${
                        isActive 
                          ? 'ring-2 ring-green-400/50 bg-green-500/10 border-green-400/30' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Animated background effect */}
                      {rankingChange === 'up' && (
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent"
                        />
                      )}
                      {rankingChange === 'down' && (
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent"
                        />
                      )}

                      {/* Rank with enhanced animation */}
                      <motion.div 
                        className="text-sm font-bold text-white/60 min-w-[24px] relative z-10"
                        animate={{
                          scale: rankingChange === 'up' ? 1.4 : rankingChange === 'down' ? 0.8 : 1,
                          color: rankingChange === 'up' ? '#10b981' : 
                                 rankingChange === 'down' ? '#ef4444' : 
                                 'rgba(255, 255, 255, 0.6)',
                          rotate: rankingChange === 'up' ? [0, -10, 10, 0] : 
                                  rankingChange === 'down' ? [0, 10, -10, 0] : 0
                        }}
                        transition={{ 
                          duration: 0.6,
                          type: "tween",
                          ease: "easeInOut"
                        }}
                      >
                        {getRankIcon(rank)}
                      </motion.div>
                      
                      {/* Avatar with animation */}
                      <motion.div 
                        className="relative"
                        animate={{
                          scale: rankingChange === 'up' ? 1.15 : rankingChange === 'down' ? 0.9 : 1,
                          rotate: rankingChange === 'up' ? [0, -5, 5, 0] : 
                                  rankingChange === 'down' ? [0, 5, -5, 0] : 0
                        }}
                        transition={{ 
                          duration: 0.5,
                          type: "tween",
                          ease: "easeInOut"
                        }}
                      >
                        {score.user.avatar_url ? (
                          <Image
                            src={score.user.avatar_url}
                            alt={score.user.name}
                            width={40}
                            height={40}
                            className="rounded-full border border-white/20"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/20">
                            {score.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        {/* Active Indicator with enhanced animation */}
                        {isActive && (
                          <motion.div 
                            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </motion.div>
                      
                      {/* Name and CPS */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <motion.div 
                          className="text-white text-sm font-medium truncate flex items-center gap-2"
                          animate={{
                            x: rankingChange === 'up' ? [0, 5, 0] : 
                                rankingChange === 'down' ? [0, -5, 0] : 0
                          }}
                          transition={{ 
                            duration: 0.3,
                            type: "tween",
                            ease: "easeInOut"
                          }}
                        >
                          {score.user.name}
                          {user && score.user_id === user.id && (
                            <motion.span 
                              className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold"
                              animate={{
                                scale: rankingChange === 'up' ? [1, 1.2, 1] : 
                                        rankingChange === 'down' ? [1, 0.8, 1] : 1
                              }}
                              transition={{ 
                                duration: 0.4,
                                type: "tween",
                                ease: "easeInOut"
                              }}
                            >
                              คุณ
                            </motion.span>
                          )}
                        </motion.div>
                        {isActive && cps > 0 && (
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <Zap size={10} />
                            <span>{cps.toFixed(1)}/s</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Score with enhanced animation */}
                      <motion.div 
                        className="text-right relative z-10"
                        animate={{
                          scale: rankingChange === 'up' ? 1.3 : rankingChange === 'down' ? 0.9 : 1,
                          color: rankingChange === 'up' ? '#10b981' : 
                                 rankingChange === 'down' ? '#ef4444' : 
                                 rank === 1 ? '#fbbf24' : 
                                 rank === 2 ? '#d1d5db' : 
                                 rank === 3 ? '#d97706' : '#ffffff',
                          y: rankingChange === 'up' ? [0, -10, 0] : 
                             rankingChange === 'down' ? [0, 10, 0] : 0
                        }}
                        transition={{ 
                          duration: 0.6,
                          type: "tween",
                          ease: "easeInOut"
                        }}
                      >
                        <div className={`text-xl font-bold`}>
                          {score.score}
                        </div>
                      </motion.div>

                      {/* Enhanced ranking change indicators */}
                      {rankingChange === 'up' && (
                        <motion.div
                          initial={{ opacity: 0, x: -30, y: -20, scale: 0 }}
                          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 30, y: -20, scale: 0 }}
                          transition={{ 
                            type: "tween",
                            duration: 0.5,
                            ease: "easeOut"
                          }}
                          className="absolute -left-3 top-1/2 transform -translate-y-1/2 text-green-400 text-2xl drop-shadow-lg"
                        >
                          ⬆️
                        </motion.div>
                      )}
                      {rankingChange === 'down' && (
                        <motion.div
                          initial={{ opacity: 0, x: -30, y: 20, scale: 0 }}
                          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 30, y: 20, scale: 0 }}
                          transition={{ 
                            type: "tween",
                            duration: 0.5,
                            ease: "easeOut"
                          }}
                          className="absolute -left-3 top-1/2 transform -translate-y-1/2 text-red-400 text-2xl drop-shadow-lg"
                        >
                          ⬇️
                        </motion.div>
                      )}

                      {/* Particle effects for ranking up */}
                      {rankingChange === 'up' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 pointer-events-none"
                        >
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-green-400 rounded-full"
                              initial={{
                                x: '50%',
                                y: '50%',
                                scale: 0
                              }}
                              animate={{
                                x: `${20 + i * 15}%`,
                                y: `${20 + i * 10}%`,
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0]
                              }}
                              transition={{
                                duration: 1,
                                delay: i * 0.1,
                                ease: "easeOut"
                              }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 