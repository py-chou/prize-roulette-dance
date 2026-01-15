import { motion } from 'framer-motion';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { DrawPhase } from '@/types/participant';

interface DrawControlsProps {
  phase: DrawPhase;
  participantCount: number;
  winnerCount: number;
  onParticipantCountChange: (count: number) => void;
  onWinnerCountChange: (count: number) => void;
  onStartDraw: () => void;
  onReset: () => void;
}

export const DrawControls = ({
  phase,
  participantCount,
  winnerCount,
  onParticipantCountChange,
  onWinnerCountChange,
  onStartDraw,
  onReset,
}: DrawControlsProps) => {
  const isIdle = phase === 'idle';
  const isComplete = phase === 'complete';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      {/* Action buttons */}
      {isComplete ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          重新抽獎
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartDraw}
          disabled={!isIdle}
          className="relative flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-primary-foreground disabled:opacity-50 overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(38 90% 40%))',
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <Sparkles className="w-5 h-5" />
          開始抽獎
          <Play className="w-4 h-4" />
        </motion.button>
      )}

      {/* Input controls - moved below button and centered */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-2">
        {/* Winner count (抽獎名額) */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            抽獎名額
          </label>
          <input
            type="number"
            min={1}
            max={200}
            value={winnerCount}
            onChange={(e) => onWinnerCountChange(Math.min(200, Math.max(1, parseInt(e.target.value) || 1)))}
            disabled={!isIdle}
            className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-center disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Participant count */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            參加人數
          </label>
          <input
            type="number"
            min={1}
            max={10000}
            value={participantCount}
            onChange={(e) => onParticipantCountChange(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
            disabled={!isIdle}
            className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-center disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </motion.div>
  );
};