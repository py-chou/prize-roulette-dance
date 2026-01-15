import { Participant } from '@/types/participant';
import { motion, AnimatePresence } from 'framer-motion';
import { WinnerCard } from './WinnerCard';
import { AvatarDisplay } from './ui/avatar-display';
import { X, Plus, Grid3x3, List } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { PixiConfetti } from './PixiConfetti';

interface WinnerRevealProps {
  winners: Participant[];
  isVisible: boolean;
  onRedraw?: () => void;
  onAddWinner?: () => void;
  onClose?: () => void;
  totalParticipants?: number;
  eventName?: string;
}

// Component wrapper for content with CSS transition
const ContentWrapper = ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && contentRef.current) {
      // Force reflow to ensure initial state is painted, then trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldAnimate(true);
        });
      });
    } else {
      setShouldAnimate(false);
    }
  }, [isVisible]);

  return (
    <div
      ref={contentRef}
      className="relative z-10 w-full max-w-8xl mx-4 max-h-[90vh] overflow-y-auto hide-scrollbar p-4"
      style={{
        transform: shouldAnimate ? 'scale(1)' : 'scale(0.95)',
        opacity: shouldAnimate ? 1 : 0,
        transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export const WinnerReveal = ({ winners, isVisible, onRedraw, onAddWinner, onClose, totalParticipants = 0, eventName }: WinnerRevealProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-xl"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.1s ease-out',
              willChange: 'opacity'
            }}
          />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(45_100%_50%_/_0.1)_0%,_transparent_60%)]" />

          {/* Content */}
          <ContentWrapper isVisible={isVisible}>
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
              {eventName && (
                <h3 className="text-3xl font-extrabold text-gradient-gold mb-4">
                  {eventName}
                </h3>
              )}
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
              <div className="max-h-[50vh] overflow-y-auto p-8 hide-scrollbar">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                  {winners.map((winner, index) => (
                    <WinnerCard
                      key={winner.id}
                      winner={winner}
                      index={index}
                      total={winners.length}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto hide-scrollbar p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {winners.map((winner, index) => (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <AvatarDisplay
                          participant={winner}
                          size="sm"
                          showName={false}
                          showGlow={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gradient-gold line-clamp-2">
                          {winner.name}
                        </p>
                        {winner.isAdditional && (
                          <span className="inline-block mt-1 mb-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                            加抽
                          </span>
                        )}
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
            </motion.div>
          </ContentWrapper>

          {/* PixiJS Confetti particles */}
          <PixiConfetti 
            isActive={isVisible} 
            particleCount={20}
            width={typeof window !== 'undefined' ? window.innerWidth : 1000}
            height={typeof window !== 'undefined' ? window.innerHeight : 800}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};