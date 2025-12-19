export interface Participant {
  id: number;
  name: string;
  avatar: string;
}

export type DrawPhase = 'idle' | 'spinning' | 'revealing' | 'complete';