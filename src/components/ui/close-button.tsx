import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'absolute';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const positionMap = {
  'top-right': 'absolute top-0 right-4',
  'top-left': 'absolute top-0 left-4',
  'bottom-right': 'absolute bottom-0 right-4',
  'bottom-left': 'absolute bottom-0 left-4',
  'absolute': 'absolute top-3 right-3',
};

export const CloseButton = ({
  onClick,
  className,
  size = 'md',
  position = 'absolute',
}: CloseButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className={cn(
        positionMap[position],
        'p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-20',
        className
      )}
    >
      <X className={sizeMap[size]} />
    </motion.button>
  );
};

