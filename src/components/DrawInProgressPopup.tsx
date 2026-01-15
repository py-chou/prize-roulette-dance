import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { PixiConvergingParticles } from './PixiConvergingParticles';
import { useEffect, useRef, useState } from 'react';

interface DrawInProgressPopupProps {
  isVisible: boolean;
  winnerCount: number;
}

// Component wrapper for main content with CSS transition
const MainContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force reflow to ensure initial state is painted, then trigger animation
    if (contentRef.current) {
      // Double RAF to ensure browser has painted initial state
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldAnimate(true);
        });
      });
    }
  }, []);

  return (
    <div
      ref={contentRef}
      className="relative"
      style={{
        width: '100%',
        height: '100%',
        transform: shouldAnimate ? 'scale(1)' : 'scale(0.3)',
        opacity: shouldAnimate ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export const DrawInProgressPopup = ({ isVisible, winnerCount }: DrawInProgressPopupProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[50] flex items-center justify-center"
        >
          {/* Backdrop with vignette */}
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, hsl(var(--background) / 0.95) 70%)',
            }}
          />
          
          {/* Energy accumulation rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2"
                style={{
                  width: 120 + i * 80,
                  height: 120 + i * 80,
                  borderColor: i % 2 === 0 
                    ? 'hsl(45 100% 50% / 0.4)' 
                    : 'hsl(30 100% 55% / 0.4)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.1, 1],
                  opacity: [0, 0.6, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                }}
              />
            ))}
          </div>

          {/* Converging particles - PixiJS version */}
          <PixiConvergingParticles particleCount={12} isVisible={isVisible} />

          {/* Main content */}
          <MainContentWrapper>
            {/* Pulsing glow behind */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '180px',
                height: '180px',
                top: '50%',
                left: '50%',
                marginTop: '-90px',
                marginLeft: '-90px',
                background: 'radial-gradient(circle, hsl(45 100% 50% / 0.4) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Center orb with circular loading */}
            <motion.div
              className="absolute w-40 h-40 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                marginTop: '-80px',
                marginLeft: '-80px',
                background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(30 100% 55% / 0.2))',
                boxShadow: '0 0 60px hsl(45 100% 50% / 0.5), inset 0 0 40px hsl(45 100% 50% / 0.3)',
                border: '2px solid hsl(45 100% 50% / 0.5)',
              }}
              animate={{
                boxShadow: [
                  '0 0 60px hsl(45 100% 50% / 0.5), inset 0 0 40px hsl(45 100% 50% / 0.3)',
                  '0 0 100px hsl(45 100% 50% / 0.8), inset 0 0 60px hsl(45 100% 50% / 0.5)',
                  '0 0 60px hsl(45 100% 50% / 0.5), inset 0 0 40px hsl(45 100% 50% / 0.3)',
                ],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Circular loading progress */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="hsl(45 100% 50% / 0.2)"
                  strokeWidth="8"
                />
                {/* Progress circle - 4-stage animation completing in 2.5 seconds */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: [0, 0.25, 0.5, 0.75, 1] // Match 4 stages: 0%, 25%, 50%, 75%, 100%
                  }}
                  transition={{
                    duration: 2.5, // Total 2.5 seconds
                    times: [0, 0.25, 0.5, 0.75, 1], // 4 stages: 0.625s each stage
                    ease: [
                      [0.4, 0, 0.2, 1], // Stage 1: Slow start (0.625 seconds)
                      [0.2, 0, 0.4, 1], // Stage 2: Medium acceleration (0.625 seconds)
                      [0.1, 0, 0.3, 1], // Stage 3: Fast acceleration (0.625 seconds)
                      [0, 0, 0.2, 1],   // Stage 4: Very fast (0.625 seconds)
                    ],
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(45 100% 50%)" />
                    <stop offset="50%" stopColor="hsl(30 100% 55%)" />
                    <stop offset="100%" stopColor="hsl(45 100% 50%)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Trophy icon with bounce */}
              <motion.div
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-32px',
                  marginLeft: '-32px',
                  zIndex: 10,
                }}
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Trophy className="w-16 h-16" style={{ color: 'hsl(45 100% 50%)' }} />
              </motion.div>
            </motion.div>

            {/* Text below */}
            <motion.div
              className="absolute text-center z-20"
              style={{
                top: '50%',
                left: '50%',
                marginTop: '100px',
                marginLeft: '-100px',
                
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-gradient-gold mb-2"
                animate={{
                  opacity: [1,1,1],
                  textShadow: [
                    '0 0 20px hsl(45 100% 50% / 0.5)',
                    '0 0 40px hsl(45 100% 50% / 0.8)',
                    '0 0 20px hsl(45 100% 50% / 0.5)',
                  ],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                抽獎中
              </motion.h2>
              <p className="text-lg md:text-xl text-white">
                正在抽出 {winnerCount} 位得獎者
              </p>
            </motion.div>
          </MainContentWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
