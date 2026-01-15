import { Participant, DrawPhase, SpinPhase } from '@/types/participant';
import { selectRandomWinners } from './generateParticipants';

/**
 * 抽獎動畫持續時間（毫秒）
 */
export const DRAW_ANIMATION_DURATION = 2500;

/**
 * 彈窗顯示延遲（毫秒）
 */
export const POPUP_DELAY = 200;

/**
 * 狀態重置延遲（毫秒）
 */
export const RESET_DELAY = 50;

/**
 * 重置抽獎狀態的參數
 */
export interface ResetDrawStateParams {
  setPhase: (phase: DrawPhase) => void;
  setSpinPhase: (spinPhase: SpinPhase) => void;
  setWinners: (winners: Participant[]) => void;
  setShowDrawInProgress: (show: boolean) => void;
}

/**
 * 重置抽獎狀態到初始狀態
 */
export const resetDrawState = ({
  setPhase,
  setSpinPhase,
  setWinners,
  setShowDrawInProgress,
}: ResetDrawStateParams) => {
  setPhase('idle');
  setSpinPhase('idle');
  setWinners([]);
  setShowDrawInProgress(false);
};

/**
 * 開始抽獎流程的參數
 */
export interface StartDrawProcessParams {
  participants: Participant[];
  winnerCount: number;
  setPhase: (phase: DrawPhase) => void;
  setSpinPhase: (spinPhase: SpinPhase) => void;
  setWinners: (winners: Participant[]) => void;
  setShowDrawInProgress: (show: boolean) => void;
  onComplete?: () => void;
}

/**
 * 開始抽獎流程的核心邏輯
 * @returns 返回 timeout ID，用於清理
 */
export const startDrawProcess = ({
  participants,
  winnerCount,
  setPhase,
  setSpinPhase,
  setWinners,
  setShowDrawInProgress,
  onComplete,
}: StartDrawProcessParams): NodeJS.Timeout => {
  // 設置抽獎狀態
  setPhase('spinning');
  setSpinPhase('peak');
  setShowDrawInProgress(true);
  
  // 在指定時間後選擇獲獎者
  const timeoutId = setTimeout(() => {
    const selectedWinners = selectRandomWinners(participants, winnerCount);
    setWinners(selectedWinners);
    setPhase('complete');
    
    // 延遲隱藏抽獎進行中彈窗，確保獲獎者揭示彈窗先顯示
    setTimeout(() => {
      setShowDrawInProgress(false);
      onComplete?.();
    }, POPUP_DELAY);
  }, DRAW_ANIMATION_DURATION);
  
  // 返回 timeout ID
  return timeoutId;
};

