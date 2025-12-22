import { Participant } from '@/types/participant';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AddWinnerPopupProps {
  winners: Participant[];
  isVisible: boolean;
  onClose: () => void;
}

export const AddWinnerPopup = ({ winners, isVisible, onClose }: AddWinnerPopupProps) => {
  if (!winners || winners.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 bg-card rounded-2xl shadow-2xl border-2 border-gold/30 w-[90vw] max-w-[600px] mx-4 overflow-visible"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content wrapper with padding */}
            <div className="relative p-6 md:p-8 flex flex-col items-center justify-center z-10">
              {/* Title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <h3 className="text-xl md:text-2xl font-extrabold text-gradient-gold mb-1">
                  🎊 加抽 {winners.length} 位！
                </h3>
                <p className="text-sm text-muted-foreground">
                  恭喜新的幸運兒
                </p>
              </motion.div>

              {/* Winners grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-h-[60vh] overflow-y-auto hide-scrollbar px-2">
                {winners.map((winner, index) => (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    {/* Enhanced glow effect with rotating rings */}
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Rotating glow ring around avatar - yellow and orange */}
                      <motion.div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{
                          background: 'conic-gradient(from 0deg, hsl(45 100% 60% / 0.8) 0deg, hsl(30 100% 55% / 0.8) 90deg, hsl(45 100% 60% / 0.8) 180deg, hsl(30 100% 55% / 0.8) 270deg, hsl(45 100% 60% / 0.8) 360deg)',
                          padding: '6px',
                          borderRadius: '50%',
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-background" />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full" />
                      </motion.div>

                      {/* Breathing glow effect using scale */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{
                          background: 'radial-gradient(circle, hsl(45 100% 50% / 0.6) 0%, transparent 70%)',
                          filter: 'blur(20px)',
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.5,
                        }}
                        style={{
                          background: 'radial-gradient(circle, hsl(30 100% 50% / 0.5) 0%, transparent 70%)',
                          filter: 'blur(30px)',
                        }}
                      />

                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold via-gold-glow to-gold animate-pulse-glow" 
                        style={{ padding: '4px', borderRadius: '50%' }}
                      >
                        <div className="w-full h-full rounded-full bg-background" />
                      </div>
                      
                      {/* Avatar */}
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-gold relative z-10">
                        <img
                          src={winner.avatar}
                          alt={winner.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>

                    {/* Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-center"
                    >
                      <p className="text-lg md:text-xl font-extrabold text-gradient-gold mb-1">
                        {winner.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{winner.id}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

