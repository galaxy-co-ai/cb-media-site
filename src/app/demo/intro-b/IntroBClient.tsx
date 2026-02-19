'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const CinematicIntro = dynamic(
  () => import('@/components/intro/CinematicIntro'),
  { ssr: false },
);

export default function IntroBClient() {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Cinematic intro — stays mounted as ambient background */}
      <CinematicIntro onComplete={handleIntroComplete} />

      {/* Hero content — appears after intro completes */}
      <AnimatePresence>
        {introComplete && (
          <motion.main
            className="relative z-[51] flex min-h-screen flex-col items-center justify-center px-4"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <motion.h1
              className="font-display text-6xl md:text-8xl lg:text-9xl text-center tracking-[0.08em]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 5, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
            >
              CB MEDIA
            </motion.h1>

            <motion.p
              className="mt-4 text-xl md:text-2xl text-muted-foreground tracking-widest"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 5, ease: [0.25, 0.1, 0.25, 1], delay: 1.5 }}
            >
              TURNING VISIBILITY INTO VALUE
            </motion.p>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
