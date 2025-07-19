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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#10131a] relative overflow-hidden">
      {/* Custom Cursor */}
      <style>{`
        body, html { cursor: none !important; }
        .custom-cursor {
          pointer-events: none;
          position: fixed;
          top: 0; left: 0;
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2px solid #7f9cf5;
          box-shadow: 0 0 16px #7f9cf5aa;
          background: rgba(127,156,245,0.08);
          transform: translate(-50%, -50%);
          z-index: 50;
          transition: background 0.2s, border 0.2s;
          mix-blend-mode: lighten;
        }
      `}</style>
      <CursorEffect />
      {/* 3D Model Section */}
      <div className="w-full flex flex-col items-center justify-center pt-8 pb-2 select-none">
        <div className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] mx-auto">
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
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">Tap Battle</h1>
          <p className="text-white/80 text-lg">เข้าสู่ระบบเพื่อเริ่มเกม</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={signInWithDiscord}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer shadow-md hover:scale-[1.03] active:scale-95"
          >
            <MessageCircle size={20} />
            เข้าสู่ระบบด้วย Discord
          </button>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer shadow-md hover:scale-[1.03] active:scale-95"
          >
            <Chrome size={20} />
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
        {/* <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            เกมกดรูปภาพที่กลางจอ - แข่งขันกับผู้เล่นอื่นแบบ realtime
          </p>
        </div> */}
      </div>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
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

// Custom cursor effect
function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return <div ref={cursorRef} className="custom-cursor" />
} 