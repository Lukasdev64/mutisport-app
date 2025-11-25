import { type ReactNode, useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  // Evolving Background Logic
  // We move a large gradient orb and change its color based on scroll progress
  
  // Y Position: Moves from top to bottom
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '80%']);
  
  // X Position: Sways slightly left to right
  const x = useTransform(scrollYProgress, [0, 0.5, 1], ['20%', '80%', '20%']);
  
  // Color Evolution: Blue -> Purple -> Emerald -> Blue
  const color = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ['#3b82f6', '#8b5cf6', '#10b981', '#3b82f6'] // Blue-500 -> Violet-500 -> Emerald-500 -> Blue-500
  );

  // Secondary Orb (Counter-movement)
  const y2 = useTransform(scrollYProgress, [0, 1], ['100%', '0%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['80%', '20%']);
  const opacity2 = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.2, 0.1]);

  return (
    <div 
      ref={containerRef}
      className="relative h-full bg-[#020617] font-sans antialiased overflow-x-hidden overflow-y-auto selection:bg-blue-500/30"
    >
      {/* --- UNIFIED EVOLVING BACKGROUND --- */}
      
      {/* 1. Base: Deep Slate/Black */}
      <div className="fixed inset-0 bg-[#020617] z-0" />

      {/* 2. Dynamic Evolving Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Primary Evolving Orb */}
        <motion.div 
          style={{ 
            top: y,
            left: x,
            backgroundColor: color,
          }}
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 mix-blend-screen transition-colors duration-1000"
        />

        {/* Secondary Counter Orb (Always Blue/Indigo for depth) */}
        <motion.div 
          style={{ 
            top: y2,
            left: x2,
            opacity: opacity2
          }}
          className="absolute w-[600px] h-[600px] rounded-full bg-indigo-900 blur-[120px] mix-blend-screen"
        />
      </div>

      {/* 3. Tech Grid (Subtle) */}
      <div className="fixed inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0))] opacity-20 pointer-events-none" />

      {/* 4. Content Wrapper */}
      <main className="relative z-10 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
}
