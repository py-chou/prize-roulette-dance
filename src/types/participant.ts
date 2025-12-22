export interface Participant {
  id: number;
  name: string;
  avatar: string;
  isAdditional?: boolean; // 標記是否為加抽的得獎者
}

export type DrawPhase = 'idle' | 'spinning' | 'revealing' | 'complete';