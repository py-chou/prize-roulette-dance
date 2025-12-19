import { Participant } from '@/types/participant';
import { motion, AnimatePresence } from 'framer-motion';
import { WinnerCard } from './WinnerCard';

interface WinnerRevealProps {
  winners: Participant[];
  isVisible: boolean;
}

export const WinnerReveal = ({ winners, isVisible }: WinnerRevealProps) => {
  const displayWinners = winners.slice(0, 50); // Show max 50 at a time
  const remainingCount = winners.length - displayWinners.length;

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(45_100%_50%_/_0.1)_0%,_transparent_60%)]" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative z-10 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Title */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl md:text-6xl font-extrabold text-gradient-gold mb-2">
                🎉 恭喜中獎！
              </h2>
              <p className="text-muted-foreground text-lg">
                共 {winners.length} 位幸運兒
              </p>
            </motion.div>

            {/* Winners grid */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 px-4">
              {displayWinners.map((winner, index) => (
                <WinnerCard
                  key={winner.id}
                  winner={winner}
                  index={index}
                  total={displayWinners.length}
                />
              ))}
            </div>

            {/* Remaining count */}
            {remainingCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-8 text-muted-foreground"
              >
                還有 {remainingCount} 位中獎者...
              </motion.p>
            )}
          </motion.div>

          {/* Confetti particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: -20,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: window.innerHeight + 100,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['hsl(45 100% 50%)', 'hsl(280 80% 60%)', 'hsl(190 100% 50%)', 'hsl(0 84% 60%)'][i % 4],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};