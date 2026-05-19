import {VoteEvent} from './analytics';
import {KEYS, Storage} from './storage';
import {createUuid} from './uuid';

export type ImageCategory =
  | 'portrait'
  | 'landscape'
  | 'urban'
  | 'product'
  | 'animal'
  | 'architecture';

export type CategoryStats = {
  category: ImageCategory;
  total_votes: number;
  correct_votes: number;
  accuracy: number;
  avg_response_ms: number;
};

export type BadgeId =
  | 'ai_hunter'
  | 'human_detector'
  | 'face_swap_killer'
  | 'impossible_to_fool'
  | 'speed_demon'
  | 'top_1_percent'
  | 'reality_master'
  | 'inhumain';

export type Badge = {
  id: BadgeId;
  unlocked_at: string | null;
  progress: number;
};

export type PlayerRank =
  | 'Novice'
  | 'Observateur'
  | 'Analyste'
  | 'Expert'
  | 'Inhumain';

export type PlayerProfile = {
  session_id: string;
  display_name: string;
  created_at: string;
  total_votes: number;
  correct_votes: number;
  accuracy: number;
  best_streak: number;
  current_streak: number;
  total_sessions: number;
  avg_response_ms: number;
  rank: PlayerRank;
  rank_percentile: number;
  category_stats: CategoryStats[];
  badges: Badge[];
  recent_votes: VoteEvent[];
  strongest_category: ImageCategory | null;
  weakest_category: ImageCategory | null;
};

const RECENT_VOTES_LIMIT = 100;
const CATEGORIES: ImageCategory[] = [
  'portrait',
  'landscape',
  'urban',
  'product',
  'animal',
  'architecture',
];
const BADGE_IDS: BadgeId[] = [
  'ai_hunter',
  'human_detector',
  'face_swap_killer',
  'impossible_to_fool',
  'speed_demon',
  'top_1_percent',
  'reality_master',
  'inhumain',
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function createEmptyCategoryStats(): CategoryStats[] {
  return CATEGORIES.map(category => ({
    category,
    total_votes: 0,
    correct_votes: 0,
    accuracy: 0,
    avg_response_ms: 0,
  }));
}

function createInitialBadges(): Badge[] {
  return BADGE_IDS.map(id => ({
    id,
    unlocked_at: null,
    progress: 0,
  }));
}

function randomDisplayName(): string {
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `Joueur #${suffix}`;
}

export function computeRank(
  accuracy: number,
  total_votes: number,
): PlayerRank {
  const pct = accuracy * 100;
  if (total_votes < 5 || pct < 40) {
    return 'Novice';
  }
  if (pct < 60) {
    return 'Observateur';
  }
  if (pct < 75) {
    return 'Analyste';
  }
  if (pct < 90) {
    return 'Expert';
  }
  if (total_votes > 30) {
    return 'Inhumain';
  }
  return 'Expert';
}

function computeRankPercentile(accuracy: number, totalVotes: number): number {
  if (totalVotes === 0) {
    return 0;
  }
  const base = accuracy * 100;
  const volumeBonus = Math.min(18, Math.log10(totalVotes + 1) * 9);
  return Math.max(1, Math.min(99, Math.round(base * 0.82 + volumeBonus)));
}

function withStrongWeakCategories(profile: PlayerProfile): PlayerProfile {
  const activeCategories = profile.category_stats.filter(
    entry => entry.total_votes > 0,
  );
  if (activeCategories.length === 0) {
    return {
      ...profile,
      strongest_category: null,
      weakest_category: null,
    };
  }

  const strongest = [...activeCategories].sort(
    (a, b) => b.accuracy - a.accuracy || b.total_votes - a.total_votes,
  )[0];
  const weakest = [...activeCategories].sort(
    (a, b) => a.accuracy - b.accuracy || b.total_votes - a.total_votes,
  )[0];

  return {
    ...profile,
    strongest_category: strongest.category,
    weakest_category: weakest.category,
  };
}

function upsertBadge(
  existing: Badge,
  unlocked: boolean,
  progress: number,
  nowIso: string,
): Badge {
  if (unlocked) {
    return {
      ...existing,
      progress: 1,
      unlocked_at: existing.unlocked_at ?? nowIso,
    };
  }

  return {
    ...existing,
    progress: clamp01(progress),
  };
}

export function checkAndUnlockBadges(profile: PlayerProfile): PlayerProfile {
  const nowIso = new Date().toISOString();
  const votes = profile.recent_votes;
  const aiVotes = votes.filter(vote => vote.answer === 'ai');
  const realVotes = votes.filter(vote => vote.answer === 'real');
  const aiCorrect = aiVotes.filter(vote => vote.correct).length;
  const realCorrect = realVotes.filter(vote => vote.correct).length;
  const aiAccuracy = aiVotes.length === 0 ? 0 : aiCorrect / aiVotes.length;
  const realAccuracy =
    realVotes.length === 0 ? 0 : realCorrect / realVotes.length;

  let portraitStreak = 0;
  let bestPortraitStreak = 0;
  for (const vote of votes) {
    if (vote.category === 'portrait' && vote.correct) {
      portraitStreak += 1;
      if (portraitStreak > bestPortraitStreak) {
        bestPortraitStreak = portraitStreak;
      }
    } else {
      portraitStreak = 0;
    }
  }

  const fastCorrectCount = votes.filter(
    vote => vote.correct && vote.response_ms <= 800,
  ).length;

  const sessionGroups = new Map<string, VoteEvent[]>();
  for (const vote of votes) {
    const current = sessionGroups.get(vote.session_run_id) ?? [];
    current.push(vote);
    sessionGroups.set(vote.session_run_id, current);
  }
  let bestPerfectDeckProgress = 0;
  let hasPerfectDeck = false;
  for (const [, group] of sessionGroups) {
    const sorted = [...group].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
    const hasError = sorted.some(vote => !vote.correct);
    if (!hasError && sorted.length >= 20) {
      hasPerfectDeck = true;
    }
    const ratio = Math.min(
      1,
      sorted.filter(vote => vote.correct).length / 20,
    );
    if (ratio > bestPerfectDeckProgress) {
      bestPerfectDeckProgress = ratio;
    }
  }

  const updatedBadges = profile.badges.map(badge => {
    switch (badge.id) {
      case 'ai_hunter': {
        const unlocked = aiVotes.length >= 10 && aiAccuracy >= 0.8;
        const progress = Math.min(aiVotes.length / 10, aiAccuracy / 0.8);
        return upsertBadge(badge, unlocked, progress, nowIso);
      }
      case 'human_detector': {
        const unlocked = realVotes.length >= 10 && realAccuracy >= 0.8;
        const progress = Math.min(realVotes.length / 10, realAccuracy / 0.8);
        return upsertBadge(badge, unlocked, progress, nowIso);
      }
      case 'face_swap_killer': {
        const unlocked = bestPortraitStreak >= 5;
        const progress = bestPortraitStreak / 5;
        return upsertBadge(badge, unlocked, progress, nowIso);
      }
      case 'impossible_to_fool': {
        const unlocked = profile.best_streak >= 10;
        const progress = profile.best_streak / 10;
        return upsertBadge(badge, unlocked, progress, nowIso);
      }
      case 'speed_demon': {
        const unlocked = fastCorrectCount >= 5;
        const progress = fastCorrectCount / 5;
        return upsertBadge(badge, unlocked, progress, nowIso);
      }
      case 'top_1_percent': {
        const unlocked = profile.accuracy >= 0.9 && profile.total_votes >= 50;
        const progress = Math.min(
          profile.accuracy / 0.9,
          profile.total_votes / 50,
        );
        return upsertBadge(badge, unlocked, progress, nowIso);
      }
      case 'reality_master': {
        return upsertBadge(
          badge,
          hasPerfectDeck,
          bestPerfectDeckProgress,
          nowIso,
        );
      }
      case 'inhumain': {
        const unlocked = profile.accuracy >= 0.95 && profile.total_votes >= 100;
        const progress = Math.min(
          profile.accuracy / 0.95,
          profile.total_votes / 100,
        );
        return upsertBadge(badge, unlocked, progress, nowIso);
      }
      default:
        return badge;
    }
  });

  return {
    ...profile,
    badges: updatedBadges,
  };
}

export function initProfile(): PlayerProfile {
  const nowIso = new Date().toISOString();
  const sessionId = createUuid();

  return {
    session_id: sessionId,
    display_name: randomDisplayName(),
    created_at: nowIso,
    total_votes: 0,
    correct_votes: 0,
    accuracy: 0,
    best_streak: 0,
    current_streak: 0,
    total_sessions: 0,
    avg_response_ms: 0,
    rank: 'Novice',
    rank_percentile: 0,
    category_stats: createEmptyCategoryStats(),
    badges: createInitialBadges(),
    recent_votes: [],
    strongest_category: null,
    weakest_category: null,
  };
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  await Storage.set(KEYS.PROFILE, profile);
}

export async function loadProfile(): Promise<PlayerProfile> {
  const raw = await Storage.get<PlayerProfile>(KEYS.PROFILE);
  if (!raw) {
    const initial = initProfile();
    await saveProfile(initial);
    return initial;
  }

  try {
    if (!raw.session_id) {
      throw new Error('Invalid profile payload');
    }
    return raw;
  } catch {
    const reset = initProfile();
    await saveProfile(reset);
    return reset;
  }
}

export function updateProfileAfterVote(
  profile: PlayerProfile,
  vote: VoteEvent,
): PlayerProfile {
  const nextTotalVotes = profile.total_votes + 1;
  const nextCorrectVotes = profile.correct_votes + (vote.correct ? 1 : 0);
  const nextAccuracy =
    nextTotalVotes === 0 ? 0 : nextCorrectVotes / nextTotalVotes;

  const previousWeightedResponse =
    profile.avg_response_ms * profile.total_votes;
  const nextAvgResponse =
    (previousWeightedResponse + vote.response_ms) / nextTotalVotes;
  const nextCurrentStreak = vote.correct ? profile.current_streak + 1 : 0;
  const nextBestStreak = Math.max(profile.best_streak, nextCurrentStreak);
  const nextRank = computeRank(nextAccuracy, nextTotalVotes);
  const nextRankPercentile =
    nextAccuracy >= 0.9 && nextTotalVotes >= 50
      ? Math.min(99, Math.round(nextAccuracy * 110))
      : computeRankPercentile(nextAccuracy, nextTotalVotes);

  const nextCategoryStats = profile.category_stats.map(entry => {
    if (entry.category !== vote.category) {
      return entry;
    }
    const totalVotes = entry.total_votes + 1;
    const correctVotes = entry.correct_votes + (vote.correct ? 1 : 0);
    const accuracy = totalVotes === 0 ? 0 : correctVotes / totalVotes;
    const avgResponse =
      entry.total_votes === 0
        ? vote.response_ms
        : (entry.avg_response_ms * entry.total_votes + vote.response_ms) /
          totalVotes;
    return {
      ...entry,
      total_votes: totalVotes,
      correct_votes: correctVotes,
      accuracy,
      avg_response_ms: avgResponse,
    };
  });

  let nextProfile: PlayerProfile = {
    ...profile,
    total_votes: nextTotalVotes,
    correct_votes: nextCorrectVotes,
    accuracy: nextAccuracy,
    best_streak: nextBestStreak,
    current_streak: nextCurrentStreak,
    avg_response_ms: nextAvgResponse,
    rank: nextRank,
    rank_percentile: nextRankPercentile,
    category_stats: nextCategoryStats,
    recent_votes: [...profile.recent_votes, vote].slice(-RECENT_VOTES_LIMIT),
  };

  nextProfile = withStrongWeakCategories(nextProfile);
  nextProfile = checkAndUnlockBadges(nextProfile);
  return nextProfile;
}

function labelCategory(category: ImageCategory): string {
  switch (category) {
    case 'portrait':
      return 'les portraits';
    case 'landscape':
      return 'les paysages';
    case 'urban':
      return 'les scenes urbaines';
    case 'product':
      return 'les visuels produit';
    case 'animal':
      return 'les images animales';
    case 'architecture':
      return "l'architecture";
    default:
      return 'cette categorie';
  }
}

export function generateInsight(profile: PlayerProfile): string {
  if (profile.total_votes < 5) {
    return 'Votre profil se construit: encore quelques votes pour reveler votre signature perceptive.';
  }

  const strongest = profile.strongest_category
    ? labelCategory(profile.strongest_category)
    : 'vos meilleurs visuels';
  const weakest = profile.weakest_category
    ? labelCategory(profile.weakest_category)
    : 'les zones ambiguës';
  const responseSeconds = profile.avg_response_ms / 1000;

  if (profile.avg_response_ms > 0 && responseSeconds <= 1.2) {
    return `Vous detectez ${strongest} avec une vitesse exceptionnelle. ${weakest} vous resistent parfois, mais votre rythme est deja elite.`;
  }
  if (profile.accuracy >= 0.8) {
    return `Vous detectez ${strongest} mieux que la majorite des joueurs. Sur ${weakest}, vous progressez rapidement a chaque session.`;
  }
  return `Votre intuition est solide sur ${strongest}. Les pieges sur ${weakest} restent subtils, mais votre lecture devient plus precise a chaque partie.`;
}

export const BADGE_LABELS: Record<
  BadgeId,
  {title: string; description: string}
> = {
  ai_hunter: {
    title: 'Chasseur IA',
    description: '80%+ sur 10 images IA',
  },
  human_detector: {
    title: 'Detecteur humain',
    description: '80%+ sur 10 images reelles',
  },
  face_swap_killer: {
    title: 'Face-swap killer',
    description: '5 portraits corrects d affilee',
  },
  impossible_to_fool: {
    title: 'Impossible a tromper',
    description: 'Streak de 10',
  },
  speed_demon: {
    title: 'Speed demon',
    description: '5 bonnes reponses en moins de 800ms',
  },
  top_1_percent: {
    title: 'Top 1%',
    description: '90%+ avec 50 votes',
  },
  reality_master: {
    title: 'Maitre du reel',
    description: 'Deck parfait (20/20)',
  },
  inhumain: {
    title: 'Inhumain',
    description: '95%+ avec 100 votes',
  },
};

export const CATEGORY_LABELS: Record<ImageCategory, string> = {
  portrait: 'Portrait',
  landscape: 'Paysage',
  urban: 'Urbain',
  product: 'Produit',
  animal: 'Animal',
  architecture: 'Architecture',
};
