import { Participant } from '@/types/participant';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SpinPhase = 'idle' | 'accelerating' | 'peak' | 'decelerating' | 'stopped';

interface AvatarRowProps {
  participants: Participant[];
  direction: 'left' | 'right';
  spinPhase: SpinPhase;
  rowIndex: number;
  totalRows: number;
}

export const AvatarRow = ({ participants, direction, spinPhase, rowIndex, totalRows }: AvatarRowProps) => {
  // Duplicate participants for seamless loop
  const duplicatedParticipants = [...participants, ...participants, ...participants];
  
  // Offset for staggered layout
  const offset = rowIndex % 2 === 1 ? 'ml-10' : '';
  
  // Calculate animation duration based on phase
  const getAnimationDuration = () => {
    switch (spinPhase) {
      case 'idle': return 40;
      case 'accelerating': return 8;
      case 'peak': return 1.5;
      case 'decelerating': return 12;
      case 'stopped': return 0;
      default: return 40;
    }
  };

  // Staggered stop - rows stop one by one
  const stopDelay = rowIndex * 0.15;
  const isRowStopped = spinPhase === 'stopped';
  
  // Wave effect - rows have different timing
  const waveOffset = Math.sin(rowIndex * 0.8) * 0.3;
  
  const duration = getAnimationDuration();
  const isPeakPhase = spinPhase === 'peak';
  const isSpinning = spinPhase !== 'idle' && spinPhase !== 'stopped';

  return (
    <div className={cn("overflow-hidden py-2 relative", offset)}>
      {/* Spotlight scan effect during peak */}
      {isPeakPhase && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-gold/20 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: rowIndex * 0.1,
              ease: 'linear',
            }}
          />
        </motion.div>
      )}

      <motion.div
        className="flex gap-4"
        style={{ width: 'max-content' }}
        animate={
          isRowStopped
            ? { x: 0 }
            : {
                x: direction === 'left' 
                  ? ['0%', '-33.33%'] 
                  : ['-33.33%', '0%'],
              }
        }
        transition={
          isRowStopped
            ? { 
                type: 'spring', 
                stiffness: 100, 
                damping: 20,
                delay: stopDelay,
              }
            : {
                duration: duration + waveOffset,
                repeat: Infinity,
                ease: isPeakPhase ? 'linear' : 'easeInOut',
              }
        }
      >
        {duplicatedParticipants.map((participant, index) => (
          <motion.div
            key={`${participant.id}-${index}`}
            className="flex-shrink-0"
            animate={
              isPeakPhase
                ? {
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.7, 1],
                  }
                : isRowStopped
                ? { scale: 1, opacity: 1, filter: 'blur(0px)' }
                : {}
            }
            transition={
              isPeakPhase
                ? {
                    duration: 0.3,
                    repeat: Infinity,
                    delay: (index % 5) * 0.05,
                  }
                : { duration: 0.3 }
            }
            whileHover={spinPhase === 'idle' ? { scale: 1.1, zIndex: 10 } : {}}
          >
            <motion.div 
              className="relative group"
              animate={{
                filter: isPeakPhase ? 'blur(3px)' : isSpinning ? 'blur(1px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 bg-card shadow-lg transition-all duration-300",
                isPeakPhase ? "border-gold/50" : "border-secondary"
              )}>
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {spinPhase === 'idle' && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  <span className="text-xs bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md text-foreground border border-border">
                    {participant.name}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};