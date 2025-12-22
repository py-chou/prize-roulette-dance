import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

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
                className="absolute rounded-full border-2 border-gold/40"
                style={{
                  width: 120 + i * 80,
                  height: 120 + i * 80,
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

          {/* Converging particles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const startX = Math.cos(angle) * 400;
              const startY = Math.sin(angle) * 400;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 2 === 0 
                      ? 'linear-gradient(135deg, hsl(45 100% 60%), hsl(45 100% 40%))'
                      : 'linear-gradient(135deg, hsl(280 80% 60%), hsl(280 80% 40%))',
                    boxShadow: i % 2 === 0 
                      ? '0 0 10px hsl(45 100% 50% / 0.8)'
                      : '0 0 10px hsl(280 80% 50% / 0.8)',
                  }}
                  initial={{ x: startX, y: startY, opacity: 0, scale: 0 }}
                  animate={{
                    x: [startX, 0],
                    y: [startY, 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: 'easeIn',
                  }}
                />
              );
            })}
          </div>

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative"
          >
            {/* Pulsing glow behind */}
            <motion.div
              className="absolute inset-0 -m-12 rounded-full"
              style={{
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

            {/* Center orb */}
            <motion.div
              className="relative w-40 h-40 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(280 80% 50% / 0.2))',
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
              {/* Rotating inner ring */}
              <motion.div
                className="absolute inset-4 rounded-full border-2 border-dashed border-gold/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Trophy icon with bounce */}
              <motion.div
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
                <Trophy className="w-16 h-16 text-gold" />
              </motion.div>
            </motion.div>

            {/* Text below */}
            <motion.div
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.p
                className="text-2xl md:text-3xl font-bold text-gold"
                animate={{
                  opacity: [0.7, 1, 0.7],
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
                幸運之星即將誕生
              </motion.p>
              
              {/* Loading bar */}
              <motion.div
                className="mt-4 h-1 rounded-full overflow-hidden bg-gold/20"
                style={{ width: 200 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, hsl(45 100% 50%), hsl(280 80% 60%), hsl(45 100% 50%))',
                    backgroundSize: '200% 100%',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: '100%',
                    backgroundPosition: ['0% 50%', '100% 50%'],
                  }}
                  transition={{
                    width: { duration: 4.5, ease: 'easeInOut' },
                    backgroundPosition: { duration: 1, repeat: Infinity, ease: 'linear' },
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
