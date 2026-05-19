import {VoteOption} from '../types/game';
import {KEYS, Storage} from './storage';

export type VoteEvent = {
  session_id: string;
  session_run_id: string;
  image_id: string;
  vote: VoteOption;
  answer: VoteOption;
  correct: boolean;
  response_ms: number;
  difficulty: number;
  generator: string;
  category: string;
  timestamp: string;
  rank_at_vote: string;
  streak_at_vote: number;
};

type ClientEvent = {
  type: 'image_load_error';
  image_id: string;
  timestamp: string;
};

async function appendStorageEvent<T>(key: string, event: T): Promise<void> {
  const existing = (await Storage.get<T[]>(key)) ?? [];
  await Storage.set(key, [...existing, event]);
}

export async function trackVote(event: VoteEvent): Promise<void> {
  if (__DEV__) {
    console.log('[analytics]', event);
  }
  await appendStorageEvent<VoteEvent>(KEYS.VOTES, event);
}

export async function trackClientEvent(event: ClientEvent): Promise<void> {
  if (__DEV__) {
    console.log('[analytics]', event);
  }
  await appendStorageEvent<ClientEvent>(KEYS.EVENTS, event);
}
