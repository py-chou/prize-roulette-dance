import { Participant } from '@/types/participant';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AvatarRowProps {
  participants: Participant[];
  direction: 'left' | 'right';
  isSpinning: boolean;
  rowIndex: number;
}

export const AvatarRow = ({ participants, direction, isSpinning, rowIndex }: AvatarRowProps) => {
  // Duplicate participants for seamless loop
  const duplicatedParticipants = [...participants, ...participants];
  
  // Offset for staggered layout
  const offset = rowIndex % 2 === 1 ? 'ml-8' : '';
  
  const baseAnimation = direction === 'left' 
    ? isSpinning ? 'animate-scroll-left-fast' : 'animate-scroll-left'
    : isSpinning ? 'animate-scroll-right-fast' : 'animate-scroll-right';

  return (
    <div className={cn("overflow-hidden py-2", offset)}>
      <motion.div
        className={cn(
          "flex gap-4",
          baseAnimation
        )}
        style={{
          width: 'max-content',
        }}
        animate={isSpinning ? { filter: 'blur(4px)' } : { filter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      >
        {duplicatedParticipants.map((participant, index) => (
          <motion.div
            key={`${participant.id}-${index}`}
            className="flex-shrink-0"
            whileHover={!isSpinning ? { scale: 1.1, zIndex: 10 } : {}}
          >
            <div className="relative group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-secondary bg-card shadow-lg">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {!isSpinning && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-xs bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md text-foreground border border-border">
                    {participant.name}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};