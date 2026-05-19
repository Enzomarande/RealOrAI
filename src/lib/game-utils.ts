import {baseImages} from '../data/images';
import {DeckImage} from '../types/game';
import {createUuid} from './uuid';

export function shuffleDeck(list: DeckImage[]): DeckImage[] {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export function prepareDeck(list: DeckImage[] = baseImages): DeckImage[] {
  const byDifficulty: Record<1 | 2 | 3 | 4 | 5, DeckImage[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  for (const image of list) {
    byDifficulty[image.difficulty].push(image);
  }

  return ([1, 2, 3, 4, 5] as const).flatMap(difficulty =>
    shuffleDeck(byDifficulty[difficulty]),
  );
}

export function createSessionRunId(): string {
  return createUuid();
}

export function rankLevel(rank: string): number {
  switch (rank) {
    case 'Novice':
      return 1;
    case 'Observateur':
      return 2;
    case 'Analyste':
      return 3;
    case 'Expert':
      return 4;
    case 'Inhumain':
      return 5;
    default:
      return 1;
  }
}
