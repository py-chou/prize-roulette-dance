import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, DrawPhase } from '@/types/participant';
import { generateParticipants, selectRandomWinners } from '@/utils/generateParticipants';
import { AvatarRow, SpinPhase } from './AvatarRow';
import { WinnerReveal } from './WinnerReveal';
import { DrawControls } from './DrawControls';
import { AddWinnerPopup } from './AddWinnerPopup';
import { DrawInProgressPopup } from './DrawInProgressPopup';
import { AddWinnerCountPopup } from './AddWinnerCountPopup';

const ROWS_COUNT = 6;

export const LotteryDraw = () => {
  const [participantCount, setParticipantCount] = useState(100);
  const [winnerCount, setWinnerCount] = useState(3);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [phase, setPhase] = useState<DrawPhase>('idle');
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('idle');
  const [newWinners, setNewWinners] = useState<Participant[]>([]);
  const [showAddWinnerPopup, setShowAddWinnerPopup] = useState(false);
  const [showAddWinnerCountPopup, setShowAddWinnerCountPopup] = useState(false);

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
    setSpinPhase('peak'); // Start spinning immediately
    
    // After spinning duration, show results
    setTimeout(() => {
      setPhase('revealing');
      const selectedWinners = selectRandomWinners(participants, winnerCount);
      setWinners(selectedWinners);
    }, 2000); // 2 seconds of spinning
    
    // Show winners modal
    setTimeout(() => {
      setPhase('complete');
    }, 2500);
  }, [participants, winnerCount]);

  const handleRedraw = useCallback(() => {
    // Reset to idle first to ensure animation restarts properly
    setPhase('idle');
    setSpinPhase('idle');
    setWinners([]);
    
    // Small delay to ensure state reset, then start draw
    setTimeout(() => {
      setPhase('spinning');
      setSpinPhase('peak'); // Start spinning immediately
      
      // After spinning duration, show results
      setTimeout(() => {
        setPhase('revealing');
        const selectedWinners = selectRandomWinners(participants, winnerCount);
        setWinners(selectedWinners);
      }, 2000); // 2 seconds of spinning
      
      // Show winners modal
      setTimeout(() => {
        setPhase('complete');
      }, 2500);
    }, 50);
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

  const handleAddWinner = useCallback(() => {
    // Get remaining participants (exclude already selected winners)
    const winnerIds = new Set(winners.map(w => w.id));
    const remainingParticipants = participants.filter(p => !winnerIds.has(p.id));
    
    if (remainingParticipants.length === 0) {
      // No more participants available
      return;
    }
    
    // Show count selection popup first
    setShowAddWinnerCountPopup(true);
  }, [participants, winners]);

  const handleConfirmAddWinnerCount = useCallback((count: number) => {
    // Get remaining participants (exclude already selected winners)
    const winnerIds = new Set(winners.map(w => w.id));
    const remainingParticipants = participants.filter(p => !winnerIds.has(p.id));
    
    if (remainingParticipants.length === 0) {
      return;
    }
    
    // Select random winners and mark as additional
    const selectedWinners = selectRandomWinners(remainingParticipants, count).map(winner => ({
      ...winner,
      isAdditional: true,
    }));
    
    // Close count popup
    setShowAddWinnerCountPopup(false);
    
    // Show individual winner popups
    setNewWinners(selectedWinners);
    setShowAddWinnerPopup(true);
    
    // Add to winners list after showing popups (new winners at the front for desc order)
    setTimeout(() => {
      setWinners([...selectedWinners, ...winners]);
    }, 500);
  }, [participants, winners]);

  const handleCloseAddWinnerCountPopup = useCallback(() => {
    setShowAddWinnerCountPopup(false);
  }, []);

  const handleCloseAddWinnerPopup = useCallback(() => {
    setShowAddWinnerPopup(false);
    setTimeout(() => {
      setNewWinners([]);
    }, 300);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_80%_15%_/_0.3)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(45_100%_20%_/_0.1)_0%,_transparent_50%)]" />
      
      {/* Animated background during spinning */}
      <AnimatePresence>
        {phase === 'spinning' && (
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
          <span className="text-gradient-gold">202512 日韓連線直播抽獎</span>
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
                  spinPhase={spinPhase}
                  phase={phase}
                  rowIndex={index}
                  totalRows={ROWS_COUNT}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>


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
        onAddWinner={handleAddWinner}
        onClose={handleCloseReveal}
        totalParticipants={participants.length}
      />

      {/* Add winner count popup */}
      <AddWinnerCountPopup
        isVisible={showAddWinnerCountPopup}
        maxCount={Math.min(
          participants.length - winners.length,
          participants.length
        )}
        onConfirm={handleConfirmAddWinnerCount}
        onClose={handleCloseAddWinnerCountPopup}
      />

      {/* Add winner popup */}
      {newWinners.length > 0 && (
        <AddWinnerPopup
          winners={newWinners}
          isVisible={showAddWinnerPopup}
          onClose={handleCloseAddWinnerPopup}
        />
      )}

      {/* Draw in progress popup */}
      <DrawInProgressPopup
        isVisible={phase === 'spinning'}
        winnerCount={winnerCount}
      />
    </div>
  );
};