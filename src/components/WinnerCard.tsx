import { Participant } from '@/types/participant';
import { motion } from 'framer-motion';

interface WinnerCardProps {
  winner: Participant;
  index: number;
  total: number;
}

export const WinnerCard = ({ winner, index, total }: WinnerCardProps) => {
  // All winners have the same size
  const size = 'w-20 h-20 md:w-24 md:h-24';
  const textSize = 'text-sm md:text-base';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
      }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        className="relative"
        animate={{
          boxShadow: [
            '0 0 20px hsl(45 100% 50% / 0.3)',
            '0 0 40px hsl(45 100% 50% / 0.6)',
            '0 0 20px hsl(45 100% 50% / 0.3)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ borderRadius: '50%' }}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold via-gold-glow to-gold animate-pulse-glow" 
          style={{ padding: '3px', borderRadius: '50%' }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>
        
        {/* Avatar */}
        <div className={`${size} rounded-full overflow-hidden border-4 border-gold relative z-10`}>
          <img
            src={winner.avatar}
            alt={winner.name}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <p className={`${textSize} font-bold text-gradient-gold`}>
          {winner.name}
        </p>
        {winner.isAdditional && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
            加抽
          </span>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          #{winner.id}
        </p>
      </motion.div>
    </motion.div>
  );
};