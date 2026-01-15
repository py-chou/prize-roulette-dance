import { Participant } from '@/types/participant';

/**
 * 確保每行有足夠的參與者數量，用於無縫循環滾動
 * @param participants 原始參與者列表
 * @param minCount 最小參與者數量（默認 20）
 * @returns 擴展後的參與者列表（重複 3 次以實現無縫循環）
 */
export const getEnoughParticipants = (
  participants: Participant[],
  minCount: number = 20
): Participant[] => {
  if (participants.length === 0) return [];
  
  let result = [...participants];
  let idCounter = Math.max(...participants.map(p => p.id), 0);
  
  // 如果參與者不足，隨機複製直到達到最小數量
  while (result.length < minCount) {
    const randomIndex = Math.floor(Math.random() * participants.length);
    idCounter++;
    result.push({ 
      ...participants[randomIndex], 
      id: idCounter
    });
  }
  
  // 重複 3 次以實現無縫無限循環
  return [...result, ...result, ...result];
};

/**
 * 獲取剩餘的參與者（排除已選中的獲獎者）
 * @param participants 所有參與者
 * @param winners 已選中的獲獎者
 * @returns 剩餘的參與者列表
 */
export const getRemainingParticipants = (
  participants: Participant[],
  winners: Participant[]
): Participant[] => {
  const winnerIds = new Set(winners.map(w => w.id));
  return participants.filter(p => !winnerIds.has(p.id));
};

