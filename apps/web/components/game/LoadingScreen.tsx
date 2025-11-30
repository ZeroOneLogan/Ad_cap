'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-safe"
      style={{
        background: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(245, 158, 11, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 20% 100%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          rgb(12, 12, 16)
        `,
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="mb-8"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 scale-150" />
          
          {/* Crown icon */}
          <div className="relative text-7xl">
            👑
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl font-black tracking-tight mb-2"
      >
        <span className="gradient-text">Empire</span>
        <span className="text-white"> Tycoon</span>
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-white/50 text-sm font-medium mb-12"
      >
        Build your business empire
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        <span className="text-white/40 text-xs font-medium tracking-wider uppercase">
          Loading your empire...
        </span>
      </motion.div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <div className="flex gap-4 text-2xl opacity-30">
          🏢 🏭 🛢️ 🚀 🌍
        </div>
      </motion.div>
    </motion.div>
  );
}
