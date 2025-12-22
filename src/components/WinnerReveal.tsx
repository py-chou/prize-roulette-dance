import { Participant } from '@/types/participant';
import { motion, AnimatePresence } from 'framer-motion';
import { WinnerCard } from './WinnerCard';
import { RotateCcw, X, Plus, Grid3x3, List } from 'lucide-react';
import { useState } from 'react';

interface WinnerRevealProps {
  winners: Participant[];
  isVisible: boolean;
  onRedraw?: () => void;
  onAddWinner?: () => void;
  onClose?: () => void;
  totalParticipants?: number;
}

export const WinnerReveal = ({ winners, isVisible, onRedraw, onAddWinner, onClose, totalParticipants = 0 }: WinnerRevealProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const displayWinners = viewMode === 'grid' ? winners.slice(0, 50) : winners;
  const remainingCount = winners.length - displayWinners.length;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(45_100%_50%_/_0.1)_0%,_transparent_60%)]" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto hide-scrollbar"
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="absolute top-0 right-4 p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Title */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl md:text-6xl font-extrabold text-gradient-gold mb-2">
                恭喜以下中獎者
              </h2>
              <p className="text-muted-foreground text-lg">
                共 {winners.length} 位幸運兒
              </p>
            </motion.div>

            {/* View mode toggle */}
            {winners.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mb-6 gap-2"
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  卡片模式
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <List className="w-4 h-4" />
                  列表模式
                </button>
              </motion.div>
            )}

            {/* Winners display */}
            {viewMode === 'grid' ? (
              <>
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
                {remainingCount > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-8 text-muted-foreground"
                  >
                    還有 {remainingCount} 位中獎者...（請切換到列表模式查看全部）
                  </motion.p>
                )}
              </>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto px-4 hide-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {winners.map((winner, index) => (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold">
                          <img
                            src={winner.avatar}
                            alt={winner.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gradient-gold truncate">
                          {winner.name}
                        </p>
                        {winner.isAdditional && (
                          <span className="inline-block mt-1 mb-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                            加抽
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground">
                          #{winner.id}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center mt-8 gap-4"
            >
              {onAddWinner && winners.length < totalParticipants && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddWinner}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  加抽
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRedraw}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors border border-border"
              >
                <RotateCcw className="w-5 h-5" />
                重抽一次
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Confetti particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: -20,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
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