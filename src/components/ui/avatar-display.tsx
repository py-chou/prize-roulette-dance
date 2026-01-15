import { Participant } from '@/types/participant';
import { generateAvatarColor, generateAvatarLetter } from '@/utils/avatarUtils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  participant: Participant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showGlow?: boolean;
  withPulsingShadow?: boolean;
  className?: string;
  nameClassName?: string;
}

const sizeMap = {
  sm: {
    avatar: 'w-12 h-12',
    text: 'text-sm',
    letter: 'text-sm',
  },
  md: {
    avatar: 'w-16 h-16 md:w-20 md:h-20',
    text: 'text-sm md:text-base',
    letter: 'text-xl md:text-2xl',
  },
  lg: {
    avatar: 'w-20 h-20 md:w-24 md:h-24',
    text: 'text-sm md:text-base',
    letter: 'text-2xl md:text-3xl',
  },
  xl: {
    avatar: 'w-24 h-24 md:w-32 md:h-32',
    text: 'text-base md:text-lg',
    letter: 'text-3xl md:text-4xl',
  },
};

export const AvatarDisplay = ({
  participant,
  size = 'md',
  showName = false,
  showGlow = false,
  withPulsingShadow = false,
  className,
  nameClassName,
}: AvatarDisplayProps) => {
  const bgColor = generateAvatarColor(participant.id);
  const letter = generateAvatarLetter(participant.id, participant.name);
  const sizeClasses = sizeMap[size];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ borderRadius: '50%' }}>
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-gold via-gold-glow to-gold animate-pulse-glow"
            style={{ padding: '3px', borderRadius: '50%' }}
          >
            <div className="w-full h-full rounded-full bg-background" />
          </div>
        )}
        <motion.div
          className={cn(
            sizeClasses.avatar,
            'rounded-full overflow-hidden border-4 border-gold relative z-10 flex items-center justify-center font-bold text-white',
            sizeClasses.letter
          )}
          style={{ backgroundColor: bgColor }}
          animate={
            withPulsingShadow
              ? {
                  filter: [
                    'drop-shadow(0 0 6px hsl(45 100% 50% / 0.4))',
                    'drop-shadow(0 0 12px hsl(45 100% 50% / 0.7))',
                    'drop-shadow(0 0 6px hsl(45 100% 50% / 0.4))',
                  ],
                }
              : undefined
          }
          transition={
            withPulsingShadow
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
        >
          {letter}
        </motion.div>
      </div>
      {showName && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center w-full"
        >
          <p className={cn(sizeClasses.text, 'font-bold text-gradient-gold line-clamp-2', nameClassName)}>
            {participant.name}
          </p>
          {participant.isAdditional && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
              加抽
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
};

