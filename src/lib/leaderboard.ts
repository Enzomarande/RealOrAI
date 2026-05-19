import {getCachedDeckImages} from './images-repository';
import type {DeckImage} from '../types/game';
import {
  computeRank,
  PlayerProfile,
  PlayerRank,
} from './player-profile';
import {KEYS, Storage} from './storage';

/** Identifiant stable — prêt pour Supabase `player_id` / `leaderboard_entry.id`. */
export type LeaderboardEntryId = string;

export type LeaderboardFilter = 'global' | 'weekly' | 'accuracy' | 'streak';

export type LeaderboardEntry = {
  id: LeaderboardEntryId;
  rank: number;
  display_name: string;
  accuracy: number;
  total_votes: number;
  best_streak: number;
  avg_response_ms: number;
  player_rank: PlayerRank;
  is_current_user: boolean;
  country_flag?: string;
  joined_days_ago: number;
  /** Joueurs juste au-dessus du joueur actuel (mécanique virale). */
  is_rival?: boolean;
};

/** Réponse agrégée — structure V2 Supabase-ready. */
export type LeaderboardResult = {
  filter: LeaderboardFilter;
  entries: LeaderboardEntry[];
  current_user_rank: number;
  total_players: number;
  current_user_in_top: boolean;
  rival_ids: LeaderboardEntryId[];
};

export type MisleadingImageStat = {
  image_id: string;
  human_error_rate: number;
};

export const LEADERBOARD_TOTAL_PLAYERS = 2847;
export const LEADERBOARD_TOP_SIZE = 50;

const MEDAL_RANK_COLORS = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
} as const;

export function getMedalColor(rank: number): string | undefined {
  if (rank === 1 || rank === 2 || rank === 3) {
    return MEDAL_RANK_COLORS[rank as 1 | 2 | 3];
  }
  return undefined;
}

const FLAG_POOL: {flag: string; weight: number}[] = [
  {flag: '🇫🇷', weight: 25},
  {flag: '🇺🇸', weight: 20},
  {flag: '🇯🇵', weight: 10},
  {flag: '🇪🇸', weight: 8},
  {flag: '🇩🇪', weight: 8},
  {flag: '🇧🇷', weight: 7},
  {flag: '🇬🇧', weight: 7},
  {flag: '🇰🇷', weight: 6},
  {flag: '🇮🇹', weight: 5},
  {flag: '🇨🇦', weight: 4},
];

const MOCK_NAMES = [
  'NadiaB.',
  'Kenji_T',
  'Lucas.M',
  'SakuraV',
  'Elena_R',
  'MarcusW',
  'Yuki.A',
  'Sofia_L',
  'Hans.K',
  'Priya_9',
  'Theo.D',
  'Maya.S',
  'OliverP',
  'Ines.C',
  'Ravi_K',
  'Clara.B',
  'Diego_M',
  'Aiko.N',
  'Felix_H',
  'Lea.V',
  'Noah.J',
  'Zara.A',
  'Ivan.P',
  'Chloe_W',
  'Mateo_R',
  'Hana.L',
  'Victor_S',
  'Amelie_T',
  'Jinwoo.K',
  'Bianca_F',
  'Arjun_M',
  'Camille_D',
  'Leo.S',
  'Yara.B',
  'Emil_N',
  'Lucia_P',
  'Kaito_M',
  'Nora_H',
  'Andre_G',
  'Mei.L',
  'Ruben_C',
  'Isla_W',
  'Tomas_V',
  'Aya.F',
  'Paul_K',
  'Sienna_R',
  'Hugo_B',
  'Mina.J',
  'Carlos_A',
  'Lina_T',
];

let rngState = 7919;

function nextRandom(): number {
  rngState = (rngState * 16807) % 2147483647;
  return (rngState - 1) / 2147483646;
}

function pickFlag(): string {
  const total = FLAG_POOL.reduce((sum, item) => sum + item.weight, 0);
  let roll = nextRandom() * total;
  for (const item of FLAG_POOL) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.flag;
    }
  }
  return FLAG_POOL[0].flag;
}

function accuracyForSlot(slot: number): number {
  const rank = slot + 1;
  if (rank <= 3) {
    return 0.94 + nextRandom() * 0.03;
  }
  if (rank <= 10) {
    return 0.88 + nextRandom() * 0.06;
  }
  return 0.65 + nextRandom() * 0.23;
}

function responseMsForAccuracy(accuracy: number): number {
  const base = 3200 - accuracy * 2400;
  return Math.round(base + nextRandom() * 400);
}

function streakForAccuracy(accuracy: number): number {
  return Math.max(2, Math.round(accuracy * 14 + nextRandom() * 6));
}

function votesForSlot(slot: number): number {
  return Math.round(120 + (50 - slot) * 18 + nextRandom() * 80);
}

function buildMockEntry(slot: number, filter: LeaderboardFilter): LeaderboardEntry {
  const accuracy = accuracyForSlot(slot);
  const total_votes = votesForSlot(slot);
  const joined_days_ago =
    filter === 'weekly'
      ? Math.max(1, Math.floor(nextRandom() * 7))
      : Math.floor(1 + nextRandom() * 179);

  return {
    id: `mock-${slot}-${filter}`,
    rank: 0,
    display_name: MOCK_NAMES[slot % MOCK_NAMES.length],
    accuracy,
    total_votes,
    best_streak: streakForAccuracy(accuracy),
    avg_response_ms: responseMsForAccuracy(accuracy),
    player_rank: computeRank(accuracy, total_votes),
    is_current_user: false,
    country_flag: pickFlag(),
    joined_days_ago,
  };
}

function profileToEntry(profile: PlayerProfile): LeaderboardEntry {
  const accuracy = profile.total_votes > 0 ? profile.accuracy : 0;
  const avgMs =
    profile.avg_response_ms > 0 ? profile.avg_response_ms : 2200;

  return {
    id: profile.session_id,
    rank: 0,
    display_name: profile.display_name,
    accuracy,
    total_votes: Math.max(profile.total_votes, 1),
    best_streak: profile.best_streak,
    avg_response_ms: avgMs,
    player_rank: profile.rank,
    is_current_user: true,
    country_flag: '🇫🇷',
    joined_days_ago: Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    ),
  };
}

function compareEntries(
  a: LeaderboardEntry,
  b: LeaderboardEntry,
  filter: LeaderboardFilter,
): number {
  if (filter === 'streak') {
    if (b.best_streak !== a.best_streak) {
      return b.best_streak - a.best_streak;
    }
    return b.accuracy - a.accuracy;
  }

  if (b.accuracy !== a.accuracy) {
    return b.accuracy - a.accuracy;
  }
  if (a.avg_response_ms !== b.avg_response_ms) {
    return a.avg_response_ms - b.avg_response_ms;
  }
  return b.total_votes - a.total_votes;
}

function extrapolateGlobalRank(
  profile: PlayerProfile,
  sortedMocks: LeaderboardEntry[],
): number {
  const user = profileToEntry(profile);
  let better = 0;
  for (const entry of sortedMocks) {
    if (compareEntries(entry, user, 'global') < 0) {
      better += 1;
    }
  }

  const accuracy = user.accuracy;
  const tailPlayers = Math.max(0, LEADERBOARD_TOTAL_PLAYERS - sortedMocks.length);
  const tailBetter = Math.floor((1 - accuracy) * tailPlayers * 0.85);
  const rank = better + tailBetter + 1;
  return Math.min(LEADERBOARD_TOTAL_PLAYERS, Math.max(1, rank));
}

function assignRanks(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

function markRivals(
  entries: LeaderboardEntry[],
  userRank: number,
): LeaderboardEntry[] {
  return entries.map(entry => ({
    ...entry,
    is_rival:
      !entry.is_current_user &&
      entry.rank < userRank &&
      entry.rank >= userRank - 2,
  }));
}

export function getMotivationalMessage(
  currentRank: number,
  totalPlayers: number = LEADERBOARD_TOTAL_PLAYERS,
): string {
  const topPercent = (currentRank / totalPlayers) * 100;
  if (topPercent <= 1) {
    return "Vous faites partie de l'élite mondiale.";
  }
  if (topPercent <= 5) {
    return 'Votre cerveau voit ce que les autres ratent.';
  }
  if (topPercent <= 10) {
    return 'Vous êtes dans le top 10% mondial.';
  }
  if (topPercent <= 25) {
    return 'Meilleur que 3 joueurs sur 4.';
  }
  if (topPercent <= 50) {
    return 'Vous êtes au-dessus de la moyenne mondiale.';
  }
  return 'Chaque partie vous rapproche du sommet.';
}

export function deriveHumanErrorRate(image: DeckImage): number {
  const hash = image.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const base = 0.52 + (image.difficulty / 5) * 0.38;
  return Math.min(0.97, Math.round((base + (hash % 13) / 100) * 100) / 100);
}

export function getMostMisleadingImage(): MisleadingImageStat {
  const images = getCachedDeckImages();
  let best = images[0];
  let bestRate = best.human_error_rate ?? deriveHumanErrorRate(best);

  for (const image of images) {
    const rate = image.human_error_rate ?? deriveHumanErrorRate(image);
    if (rate > bestRate) {
      best = image;
      bestRate = rate;
    }
  }

  return {image_id: best.id, human_error_rate: bestRate};
}

export function buildShareMessage(
  rank: number,
  profile: PlayerProfile,
): string {
  const accuracyPct = Math.round(profile.accuracy * 100);
  return (
    `Je suis #${rank} mondial sur Real or AI.\n` +
    `Rang ${profile.rank} · ${accuracyPct}% de précision.\n` +
    `Vous pouvez faire mieux ? 👁\n` +
    `→ realoriai.app`
  );
}

export async function getLastLeaderboardRank(): Promise<number | null> {
  return Storage.get<number>(KEYS.LAST_LEADERBOARD_RANK);
}

export async function saveLastLeaderboardRank(rank: number): Promise<void> {
  await Storage.set(KEYS.LAST_LEADERBOARD_RANK, rank);
}

export async function getRankProgressDelta(
  currentRank: number,
): Promise<number | null> {
  const previous = await getLastLeaderboardRank();
  if (previous === null || previous === currentRank) {
    return null;
  }
  return previous - currentRank;
}

function resolveFilter(filter: LeaderboardFilter): LeaderboardFilter {
  return filter === 'accuracy' ? 'global' : filter;
}

export function getLeaderboard(
  filter: LeaderboardFilter,
  profile: PlayerProfile,
): LeaderboardResult {
  const sortFilter = resolveFilter(filter);
  const mocks: LeaderboardEntry[] = [];
  for (let i = 0; i < LEADERBOARD_TOP_SIZE; i += 1) {
    mocks.push(buildMockEntry(i, sortFilter));
  }

  if (sortFilter === 'weekly') {
    for (let i = 0; i < mocks.length; i += 1) {
      mocks[i] = {
        ...mocks[i],
        joined_days_ago: Math.max(1, Math.floor(nextRandom() * 7)),
      };
    }
  }

  const userEntry = profileToEntry(profile);
  const sortedMocks = assignRanks(
    [...mocks].sort((a, b) => compareEntries(a, b, sortFilter)),
  );

  const userRank =
    sortFilter === 'global'
      ? extrapolateGlobalRank(profile, sortedMocks)
      : (() => {
          const pool = assignRanks(
            [...sortedMocks, userEntry].sort((a, b) =>
              compareEntries(a, b, sortFilter),
            ),
          );
          return pool.find(entry => entry.is_current_user)?.rank ?? 50;
        })();

  const userInTop = userRank <= LEADERBOARD_TOP_SIZE;
  let entries: LeaderboardEntry[];

  if (userInTop) {
    entries = assignRanks(
      [...sortedMocks, userEntry]
        .sort((a, b) => compareEntries(a, b, sortFilter))
        .slice(0, LEADERBOARD_TOP_SIZE),
    ).map(entry =>
      entry.is_current_user ? {...entry, rank: userRank} : entry,
    );
  } else {
    entries = [
      ...sortedMocks.slice(0, LEADERBOARD_TOP_SIZE),
      {...userEntry, rank: userRank},
    ];
  }

  entries = markRivals(entries, userRank);

  return {
    filter,
    entries,
    current_user_rank: userRank,
    total_players: LEADERBOARD_TOTAL_PLAYERS,
    current_user_in_top: userInTop,
    rival_ids: entries.filter(entry => entry.is_rival).map(entry => entry.id),
  };
}

export type LeaderboardListRow =
  | {type: 'entry'; entry: LeaderboardEntry}
  | {type: 'ellipsis'; id: 'ellipsis'};

export function buildListRows(result: LeaderboardResult): LeaderboardListRow[] {
  const {entries, current_user_in_top, current_user_rank} = result;
  const user = entries.find(entry => entry.is_current_user);

  if (current_user_in_top || !user) {
    return entries.map(entry => ({type: 'entry' as const, entry}));
  }

  const top = entries.filter(entry => !entry.is_current_user);
  return [
    ...top.map(entry => ({type: 'entry' as const, entry})),
    {type: 'ellipsis' as const, id: 'ellipsis'},
    {type: 'entry' as const, entry: user},
  ];
}

export const LEADERBOARD_ROW_HEIGHT = 49;
export const LEADERBOARD_USER_ROW_HEIGHT = 57;

export function getLeaderboardItemLayout(
  rows: LeaderboardListRow[],
  index: number,
): {length: number; offset: number; index: number} {
  let offset = 0;
  for (let i = 0; i < index; i += 1) {
    const row = rows[i];
    offset +=
      row.type === 'ellipsis'
        ? 36
        : row.entry.is_current_user
          ? LEADERBOARD_USER_ROW_HEIGHT
          : LEADERBOARD_ROW_HEIGHT;
  }
  const current = rows[index];
  const length =
    current.type === 'ellipsis'
      ? 36
      : current.entry.is_current_user
        ? LEADERBOARD_USER_ROW_HEIGHT
        : LEADERBOARD_ROW_HEIGHT;
  return {length, offset, index};
}
