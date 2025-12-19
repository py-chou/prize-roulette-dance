import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, DrawPhase } from '@/types/participant';
import { generateParticipants, selectRandomWinners } from '@/utils/generateParticipants';
import { AvatarRow, SpinPhase } from './AvatarRow';
import { WinnerReveal } from './WinnerReveal';
import { DrawControls } from './DrawControls';

const ROWS_COUNT = 6;

export const LotteryDraw = () => {
  const [participantCount, setParticipantCount] = useState(100);
  const [winnerCount, setWinnerCount] = useState(3);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [phase, setPhase] = useState<DrawPhase>('idle');
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('idle');

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
    setSpinPhase('accelerating');
    
    // Phase 1: Accelerating (0-1s)
    setTimeout(() => {
      setSpinPhase('peak');
    }, 1000);
    
    // Phase 2: Peak speed (1-3s)
    setTimeout(() => {
      setSpinPhase('decelerating');
    }, 3000);
    
    // Phase 3: Decelerating (3-4.5s)
    setTimeout(() => {
      setSpinPhase('stopped');
      setPhase('revealing');
      const selectedWinners = selectRandomWinners(participants, winnerCount);
      setWinners(selectedWinners);
    }, 4500);
    
    // Phase 4: Show winners (5s)
    setTimeout(() => {
      setPhase('complete');
    }, 5500);
  }, [participants, winnerCount]);

  const handleRedraw = useCallback(() => {
    setPhase('spinning');
    setSpinPhase('accelerating');
    setWinners([]);
    
    setTimeout(() => {
      setSpinPhase('peak');
    }, 800);
    
    setTimeout(() => {
      setSpinPhase('decelerating');
    }, 2500);
    
    setTimeout(() => {
      setSpinPhase('stopped');
      setPhase('revealing');
      const selectedWinners = selectRandomWinners(participants, winnerCount);
      setWinners(selectedWinners);
    }, 3500);
    
    setTimeout(() => {
      setPhase('complete');
    }, 4500);
  }, [participants, winnerCount]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setSpinPhase('idle');
    setWinners([]);
    setParticipants(generateParticipants(participantCount));
  }, [participantCount]);

  const handleCloseReveal = useCallback(() => {
    setPhase('idle');
    setSpinPhase('idle');
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_80%_15%_/_0.3)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(45_100%_20%_/_0.1)_0%,_transparent_50%)]" />
      
      {/* Animated background during spinning */}
      <AnimatePresence>
        {spinPhase === 'peak' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(45_100%_50%_/_0.15)_0%,_transparent_50%)]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
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
        
        {/* Phase indicator */}
        <AnimatePresence>
          {spinPhase !== 'idle' && spinPhase !== 'stopped' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-gold border border-gold/30">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  🎰
                </motion.span>
                {spinPhase === 'accelerating' && '加速中...'}
                {spinPhase === 'peak' && '抽選中！'}
                {spinPhase === 'decelerating' && '即將揭曉...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
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
                  spinPhase={spinPhase}
                  rowIndex={index}
                  totalRows={ROWS_COUNT}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center spotlight during reveal */}
      <AnimatePresence>
        {spinPhase === 'stopped' && phase === 'revealing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 0.5 }}
              className="w-64 h-64 rounded-full bg-gold/10 blur-3xl"
            />
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
      <WinnerReveal 
        winners={winners} 
        isVisible={phase === 'complete'} 
        onRedraw={handleRedraw}
        onClose={handleCloseReveal}
      />
    </div>
  );
};