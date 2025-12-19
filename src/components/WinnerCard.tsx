import { Participant } from '@/types/participant';
import { motion } from 'framer-motion';

interface WinnerCardProps {
  winner: Participant;
  index: number;
  total: number;
}

export const WinnerCard = ({ winner, index, total }: WinnerCardProps) => {
  const isMainWinner = total <= 5 || index < 5;
  const size = isMainWinner ? 'w-24 h-24 md:w-32 md:h-32' : 'w-16 h-16 md:w-20 md:h-20';
  const textSize = isMainWinner ? 'text-base md:text-lg' : 'text-xs md:text-sm';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: index * 0.1,
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

        {/* Crown for top winners */}
        {index < 3 && total > 1 && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            className="absolute -top-4 -right-2 text-2xl md:text-3xl"
          >
            {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
        className="text-center"
      >
        <p className={`${textSize} font-bold text-gradient-gold`}>
          {winner.name}
        </p>
        <p className="text-xs text-muted-foreground">
          #{winner.id}
        </p>
      </motion.div>
    </motion.div>
  );
};