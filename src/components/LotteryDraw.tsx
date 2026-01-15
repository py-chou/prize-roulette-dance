import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, DrawPhase, SpinPhase } from '@/types/participant';
import { generateParticipants, selectRandomWinners } from '@/utils/generateParticipants';
import { getRemainingParticipants } from '@/utils/participantUtils';
import { resetDrawState, startDrawProcess, RESET_DELAY } from '@/utils/drawUtils';
import { PixiAvatarRow } from './PixiAvatarRow';
import { PixiBackground } from './PixiBackground';
import { WinnerReveal } from './WinnerReveal';
import { DrawControls } from './DrawControls';
import { AddWinnerPopup } from './AddWinnerPopup';
import { DrawInProgressPopup } from './DrawInProgressPopup';
import { AddWinnerCountPopup } from './AddWinnerCountPopup';

const ROWS_COUNT = 6;

export const LotteryDraw = () => {
  const [participantCount, setParticipantCount] = useState(1000);
  const [winnerCount, setWinnerCount] = useState(100);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [phase, setPhase] = useState<DrawPhase>('idle');
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('idle');
  const [newWinners, setNewWinners] = useState<Participant[]>([]);
  const [showAddWinnerPopup, setShowAddWinnerPopup] = useState(false);
  const [showAddWinnerCountPopup, setShowAddWinnerCountPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showDrawInProgress, setShowDrawInProgress] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

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
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 使用共用的抽獎邏輯
    timeoutRef.current = startDrawProcess({
      participants,
      winnerCount,
      setPhase,
      setSpinPhase,
      setWinners,
      setShowDrawInProgress,
      onComplete: () => {
        timeoutRef.current = null;
      },
    });
  }, [participants, winnerCount]);

  const handleRedraw = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset to idle first to ensure animation restarts properly
    resetDrawState({
      setPhase,
      setSpinPhase,
      setWinners,
      setShowDrawInProgress,
    });
    
    // Small delay to ensure state reset, then start draw
    setTimeout(() => {
      timeoutRef.current = startDrawProcess({
        participants,
        winnerCount,
        setPhase,
        setSpinPhase,
        setWinners,
        setShowDrawInProgress,
        onComplete: () => {
          timeoutRef.current = null;
        },
      });
    }, RESET_DELAY);
  }, [participants, winnerCount]);

  const handleReset = useCallback(() => {
    resetDrawState({
      setPhase,
      setSpinPhase,
      setWinners,
      setShowDrawInProgress,
    });
    setParticipants(generateParticipants(participantCount));
  }, [participantCount]);

  const handleCloseReveal = useCallback(() => {
    // Completely reset all state to trigger full page re-render
    setWinners([]);
    setNewWinners([]);
    setShowAddWinnerPopup(false);
    setShowAddWinnerCountPopup(false);
    setShowDrawInProgress(false);
    // Reset phase and spin phase
    setPhase('idle');
    setSpinPhase('idle');
    // Force complete re-render by clearing and regenerating participants
    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      setParticipants([]);
      setTimeout(() => {
        setParticipants(generateParticipants(participantCount));
      }, 0);
    }, 0);
  }, [participantCount]);

  const handleAddWinner = useCallback(() => {
    // Get remaining participants (exclude already selected winners)
    const remainingParticipants = getRemainingParticipants(participants, winners);
    
    if (remainingParticipants.length === 0) {
      // No more participants available
      return;
    }
    
    // Show count selection popup first
    setShowAddWinnerCountPopup(true);
  }, [participants, winners]);

  const handleConfirmAddWinnerCount = useCallback((count: number) => {
    // Get remaining participants (exclude already selected winners)
    const remainingParticipants = getRemainingParticipants(participants, winners);
    
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
    <div className="relative h-screen bg-background overflow-hidden flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_80%_15%_/_0.3)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(45_100%_20%_/_0.1)_0%,_transparent_50%)]" />
      
      {/* PixiJS animated background during spinning */}
      <PixiBackground isSpinning={phase === 'spinning'} />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(hsl(45 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(45 100% 50%) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 flex flex-col relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 md:pt-12 flex-shrink-0"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2">
            <span className="text-gradient-gold">202512 日韓連線直播抽獎</span>
          </h1>
          <p className="text-white font-bold text-lg">
            抽獎名額：{winnerCount} / 參加人數：{participantCount}
          </p>
        </motion.header>

        {/* PixiJS Avatar rows - always rendered, covered by WinnerReveal when visible */}
        {/* Container height adapts to remaining space after Header and Controls */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="py-4 md:py-8 space-y-2">
            {rows.map((rowParticipants, index) => (
              <PixiAvatarRow
                key={`${index}-${participants.length}`}
                participants={rowParticipants}
                direction={index % 2 === 0 ? 'left' : 'right'}
                spinPhase={spinPhase}
                phase={phase}
                rowIndex={index}
                totalRows={ROWS_COUNT}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls - Fixed at bottom */}
      <div className="relative z-10 py-4 md:py-6 px-4 bg-background/95 backdrop-blur-xl border-t border-border/50 flex-shrink-0">
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
        eventName="202512 日韓連線直播抽獎"
      />

      {/* Add winner count popup */}
      <AddWinnerCountPopup
        isVisible={showAddWinnerCountPopup}
        maxCount={Math.min(
          100, // 单次加抽最高100位
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
        isVisible={showDrawInProgress}
        winnerCount={winnerCount}
      />
    </div>
  );
};