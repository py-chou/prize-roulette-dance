import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalBackdropProps {
  onClick?: () => void;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  children?: ReactNode;
}

const blurMap = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

export const ModalBackdrop = ({
  onClick,
  className,
  blur = 'md',
  opacity = 0.8,
  children,
}: ModalBackdropProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className={cn(
        'absolute inset-0 bg-background',
        blurMap[blur],
        className
      )}
      style={{
        opacity,
      }}
    >
      {children}
    </motion.div>
  );
};

