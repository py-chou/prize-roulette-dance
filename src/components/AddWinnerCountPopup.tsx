import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';

interface AddWinnerCountPopupProps {
  isVisible: boolean;
  maxCount: number;
  onConfirm: (count: number) => void;
  onClose: () => void;
}

export const AddWinnerCountPopup = ({ 
  isVisible, 
  maxCount, 
  onConfirm, 
  onClose 
}: AddWinnerCountPopupProps) => {
  const [count, setCount] = useState(1);

  const handleDecrease = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const handleIncrease = () => {
    if (count < maxCount) {
      setCount(count + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? 1 : parseInt(value, 10);
      if (numValue >= 1 && numValue <= maxCount) {
        setCount(numValue);
      } else if (numValue > maxCount) {
        setCount(maxCount);
      } else if (numValue < 1) {
        setCount(1);
      }
    }
  };

  const handleInputBlur = () => {
    // Ensure count is within valid range when input loses focus
    if (count < 1) {
      setCount(1);
    } else if (count > maxCount) {
      setCount(maxCount);
    }
  };

  const handleConfirm = () => {
    onConfirm(count);
    setCount(1); // Reset after confirm
  };

  const handleClose = () => {
    setCount(1); // Reset on close
    onClose();
  };

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
            onClick={handleClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 bg-card rounded-2xl shadow-2xl border-2 border-gold/30 w-[90vw] max-w-[400px] mx-4 p-6 md:p-8"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-6"
            >
              <h3 className="text-xl md:text-2xl font-extrabold text-gradient-gold mb-2">
                選擇加抽人數
              </h3>
              <p className="text-sm text-muted-foreground">
                最多可加抽 {maxCount} 位
              </p>
            </motion.div>

            {/* Stepper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-6 mb-6"
            >
              <div className="flex items-center gap-4">
                {/* Decrease button */}
                <motion.button
                  whileHover={{ scale: count > 1 ? 1.1 : 1 }}
                  whileTap={{ scale: count > 1 ? 0.9 : 1 }}
                  onClick={handleDecrease}
                  disabled={count <= 1}
                  className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center border-2 border-border"
                >
                  <Minus className="w-5 h-5" />
                </motion.button>

                {/* Count input */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={count}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="w-24 h-16 rounded-xl bg-secondary border-2 border-gold/30 text-3xl font-bold text-gradient-gold text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(38 90% 40%))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                />

                {/* Increase button */}
                <motion.button
                  whileHover={{ scale: count < maxCount ? 1.1 : 1 }}
                  whileTap={{ scale: count < maxCount ? 0.9 : 1 }}
                  onClick={handleIncrease}
                  disabled={count >= maxCount}
                  className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center border-2 border-border"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors border border-border"
              >
                取消
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(38 90% 40%))',
                }}
              >
                確認
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

