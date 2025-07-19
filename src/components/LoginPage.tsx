'use client'

import { useAuth } from './AuthProvider'
import { MessageCircle, Chrome } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function LoginPage() {
  const { signInWithDiscord, signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#10131a] relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse"></div>
      
      {/* 3D Model Section */}
      <div className="w-full flex flex-col items-center justify-center pt-4 sm:pt-6 lg:pt-8 pb-2 select-none relative z-10">
        <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] lg:w-[380px] lg:h-[380px] xl:w-[400px] xl:h-[400px] mx-auto relative">
          {/* Glow effect behind 3D model */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <Canvas
            camera={{ 
              position: [0, 0, 6], 
              fov: 45,
              near: 0.1,
              far: 1000
            }}
            style={{ outline: 'none', border: 'none', boxShadow: 'none', background: 'none', display: 'block' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 4, 2]} intensity={1.2} />
            <Suspense fallback={null}>
              <Stage environment={null} intensity={0.8}>
                <SpinningModel />
              </Stage>
            </Suspense>
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              autoRotate 
              autoRotateSpeed={1.2}
              minDistance={3}
              maxDistance={12}
              zoomSpeed={0.8}
            />
          </Canvas>
        </div>
      </div>
      
      {/* Login Box */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg border border-white/20 shadow-2xl relative z-10 mx-4 transform hover:scale-[1.02] transition-transform duration-300">
        {/* Enhanced Spider Web Frame */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {/* Web corners with glow */}
          <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-t-2 border-white/30 rounded-tl-2xl shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-t-2 border-white/30 rounded-tr-2xl shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-b-2 border-white/30 rounded-bl-2xl shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-b-2 border-white/30 rounded-br-2xl shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
          
          {/* Animated web lines */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 rounded-full animate-pulse"></div>
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          
          {/* Connecting web lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern id="web-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 20 40 M 0 20 L 40 20" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#web-pattern)" />
            
            {/* Main web connections */}
            <line x1="20" y1="0" x2="20" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2"/>
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2"/>
            
            {/* Corner connections */}
            <path d="M 0 0 Q 50% 0 100% 0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
            <path d="M 0 100% Q 50% 100% 100% 100%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
          </svg>
        </div>
        
        <div className="text-center mb-6 sm:mb-8 relative z-20">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 tracking-tight drop-shadow-lg bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-pulse">
            Tap Battle
          </h1>
          <p className="text-white/80 text-sm sm:text-base lg:text-lg font-medium">เข้าสู่ระบบเพื่อเริ่มเกม</p>
        </div>
        
        <div className="space-y-3 sm:space-y-4 relative z-20">
          <button
            onClick={signInWithDiscord}
            className="group w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3a45a3] text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 text-sm sm:text-base relative overflow-hidden"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-[#4752C4] rounded-full group-hover:scale-110 transition-transform duration-200">
              <DiscordLogo />
            </span>
            <span className="ml-1 relative z-10">เข้าสู่ระบบด้วย Discord</span>
          </button>
          
          {/* Enhanced Stylish Divider */}
          <div className="relative flex items-center justify-center my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-white/30 to-transparent h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#10131a] rounded-full border border-white/20 shadow-lg backdrop-blur-sm">
                <span className="text-white/80 font-semibold tracking-wider text-xs sm:text-sm bg-gradient-to-r from-white/60 to-white/40 bg-clip-text text-transparent">หรือ</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={signInWithGoogle}
            className="group w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-800 font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 text-sm sm:text-base relative overflow-hidden"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full group-hover:scale-110 transition-transform duration-200 shadow-sm">
              <GoogleLogo />
            </span>
            <span className="ml-1 relative z-10">เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>
      </div>
      
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <svg width="100%" height="100%" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a2e3a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  )
}

// 3D Model: Beautiful spinning torus knot (original)
function SpinningModel() {
  const torusRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (torusRef.current) torusRef.current.rotation.y = time * 0.3
  })
  
  return (
    <mesh ref={torusRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusKnotGeometry args={[1, 0.35, 128, 32]} />
      <meshPhysicalMaterial
        color="#7f9cf5"
        roughness={0.18}
        metalness={0.7}
        clearcoat={0.7}
        clearcoatRoughness={0.1}
        transmission={0.5}
        thickness={0.7}
        ior={1.4}
        reflectivity={0.8}
        envMapIntensity={1.2}
      />
    </mesh>
  )
}

// Add SVGs for Discord and Google logos
  const DiscordLogo = () => (
    <svg viewBox="0 -28.5 256 256" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="none">
      <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#ffffff" fillRule="nonzero"/>
    </svg>
  )

const GoogleLogo = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7.5-11.3 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.2-2.7-.4-3.5z"/>
      <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 13 24 13c2.6 0 5 .8 7 2.3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.3 7.6 6.3 14.7z"/>
      <path fill="#FBBC05" d="M24 45c5.4 0 10.5-1.8 14.4-5l-6.7-5.5c-2 1.4-4.5 2.2-7.7 2.2-5.6 0-10.3-3.6-12-8.5l-6.6 5.1C9.3 40.4 16.3 45 24 45z"/>
      <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-.7 2-2.1 3.7-4.1 4.9l6.7 5.5c1.9-1.8 3.4-4.1 4.1-6.7.4-1.2.6-2.5.6-3.7 0-1.4-.2-2.7-.4-3.5z"/>
    </g>
  </svg>
) 