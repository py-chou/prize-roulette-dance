import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, DrawPhase } from '@/types/participant';
import { generateParticipants, selectRandomWinners } from '@/utils/generateParticipants';
import { AvatarRow } from './AvatarRow';
import { WinnerReveal } from './WinnerReveal';
import { DrawControls } from './DrawControls';

const ROWS_COUNT = 6;

export const LotteryDraw = () => {
  const [participantCount, setParticipantCount] = useState(100);
  const [winnerCount, setWinnerCount] = useState(3);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [phase, setPhase] = useState<DrawPhase>('idle');

  // Generate participants on count change
  useEffect(() => {
    if (phase === 'idle') {
      setParticipants(generateParticipants(participantCount));
    }
  }, [participantCount, phase]);

  // Split participants into rows
  const rows = useMemo(() => {
    const result: Participant[][] = [];
    const perRow = Math.ceil(participants.length / ROWS_COUNT);
    
    for (let i = 0; i < ROWS_COUNT; i++) {
      const start = i * perRow;
      const end = start + perRow;
      result.push(participants.slice(start, end));
    }
    
    return result;
  }, [participants]);

  const handleStartDraw = useCallback(() => {
    setPhase('spinning');
    
    // Spin for 3 seconds
    setTimeout(() => {
      setPhase('revealing');
      const selectedWinners = selectRandomWinners(participants, winnerCount);
      setWinners(selectedWinners);
      
      // Show reveal after a brief pause
      setTimeout(() => {
        setPhase('complete');
      }, 500);
    }, 3000);
  }, [participants, winnerCount]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setWinners([]);
    setParticipants(generateParticipants(participantCount));
  }, [participantCount]);

  const isSpinning = phase === 'spinning' || phase === 'revealing';

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_80%_15%_/_0.3)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(45_100%_20%_/_0.1)_0%,_transparent_50%)]" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(hsl(45 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(45 100% 50%) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center py-8 md:py-12"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-2">
          <span className="text-gradient-gold">Lucky Draw</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          線上抽獎系統
        </p>
      </motion.header>

      {/* Avatar rows */}
      <div className="relative z-10 py-4 md:py-8">
        <AnimatePresence>
          {phase !== 'complete' && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              {rows.map((rowParticipants, index) => (
                <AvatarRow
                  key={index}
                  participants={rowParticipants}
                  direction={index % 2 === 0 ? 'left' : 'right'}
                  isSpinning={isSpinning}
                  rowIndex={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spinning overlay */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
              className="text-6xl md:text-8xl"
            >
              🎰
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="relative z-10 py-8 px-4">
        <DrawControls
          phase={phase}
          participantCount={participantCount}
          winnerCount={winnerCount}
          onParticipantCountChange={setParticipantCount}
          onWinnerCountChange={setWinnerCount}
          onStartDraw={handleStartDraw}
          onReset={handleReset}
        />
      </div>

      {/* Winner reveal modal */}
      <WinnerReveal winners={winners} isVisible={phase === 'complete'} />
    </div>
  );
};