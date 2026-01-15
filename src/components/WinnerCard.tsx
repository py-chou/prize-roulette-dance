import { Participant } from '@/types/participant';
import { motion } from 'framer-motion';
import { AvatarDisplay } from './ui/avatar-display';

interface WinnerCardProps {
  winner: Participant;
  index: number;
  total: number;
}

export const WinnerCard = ({ winner, index, total }: WinnerCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
      }}
      className="flex flex-col items-center gap-2"
    >
      <AvatarDisplay
        participant={winner}
        size="lg"
        showName={true}
        showGlow={true}
        nameClassName="w-[96px] text-center"
        withPulsingShadow={true}
      />
    </motion.div>
  );
};