export type VoteOption = 'real' | 'ai';

export type DeckImage = {
  id: string;
  imageUrl: string;
  answer: VoteOption;
  difficulty: 1 | 2 | 3 | 4 | 5;
  fakeSocialStat: string;
  /** Taux d'erreur humain agrégé (0-1), prêt pour analytics Supabase. */
  human_error_rate?: number;
  explanation?: string;
  source_url: string;
  generator:
    | 'unsplash'
    | 'midjourney-v6'
    | 'flux-dev'
    | 'dall-e-3'
    | 'stable-diffusion-xl'
    | 'firefly';
  category:
    | 'portrait'
    | 'landscape'
    | 'urban'
    | 'product'
    | 'animal'
    | 'architecture';
  elo: number;
};

import type {PlayerRank} from '../lib/player-profile';

export type RoundResult = {
  isCorrect: boolean;
  pts: number;
  correctAnswer: VoteOption;
  fastBonus: boolean;
  rankPromotion: PlayerRank | null;
};

export type SessionStats = {
  score: number;
  accuracy: number;
  sessionBestStreak: number;
  correctCount: number;
  answeredCount: number;
  maxScore: number;
};
