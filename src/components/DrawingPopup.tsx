import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface DrawingPopupProps {
  isVisible: boolean;
}

export const DrawingPopup = ({ isVisible }: DrawingPopupProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          
          {/* Main content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative"
          >
            {/* Outer glow rings */}
            <motion.div
              className="absolute inset-0 -m-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(45 100% 50% / 0.3) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Inner glow ring */}
            <motion.div
              className="absolute inset-0 -m-10 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(280 80% 60% / 0.4) 0%, transparent 60%)',
              }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Spinning particles ring */}
            <motion.div
              className="absolute inset-0 -m-16"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: i % 2 === 0 
                      ? 'linear-gradient(135deg, hsl(45 100% 60%), hsl(45 100% 40%))'
                      : 'linear-gradient(135deg, hsl(280 80% 60%), hsl(280 80% 40%))',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-80px) translateX(-50%)`,
                    boxShadow: i % 2 === 0 
                      ? '0 0 15px hsl(45 100% 50% / 0.8)'
                      : '0 0 15px hsl(280 80% 50% / 0.8)',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>

            {/* Counter-rotating particles */}
            <motion.div
              className="absolute inset-0 -m-24"
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-gold/60"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateY(-110px) translateX(-50%)`,
                    boxShadow: '0 0 10px hsl(45 100% 50% / 0.6)',
                  }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>

            {/* Main popup card */}
            <motion.div
              className="relative px-12 py-8 rounded-2xl border border-gold/30 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(280 30% 12%) 100%)',
                boxShadow: '0 0 60px hsl(45 100% 50% / 0.3), 0 0 120px hsl(280 80% 50% / 0.2), inset 0 1px 0 hsl(45 100% 50% / 0.2)',
              }}
            >
              {/* Shimmer sweep effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Content */}
              <div className="relative flex flex-col items-center gap-4">
                {/* Animated icon */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-12 h-12 text-gold" />
                </motion.div>

                {/* Text with gradient */}
                <motion.h2
                  className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, hsl(45 100% 60%), hsl(45 100% 40%), hsl(280 80% 60%))',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  抽獎中...
                </motion.h2>

                {/* Animated dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gold"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
