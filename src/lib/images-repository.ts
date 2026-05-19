import {baseImages} from '../data/images';
import {prepareDeck} from './game-utils';
import {getSupabaseClient, queryActiveImages} from './supabase/client';
import type {ImageRow, ImagesFetchResult} from './supabase/types';
import {KEYS, Storage} from './storage';
import type {DeckImage} from '../types/game';

const CACHE_KEY = KEYS.IMAGES_CACHE;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

type ImagesCachePayload = {
  fetchedAt: string;
  images: DeckImage[];
};

let memoryCache: DeckImage[] | null = null;

const GENERATORS: DeckImage['generator'][] = [
  'unsplash',
  'midjourney-v6',
  'flux-dev',
  'dall-e-3',
  'stable-diffusion-xl',
  'firefly',
];

const CATEGORIES: DeckImage['category'][] = [
  'portrait',
  'landscape',
  'urban',
  'product',
  'animal',
  'architecture',
];

function isDifficulty(value: number): value is DeckImage['difficulty'] {
  return value >= 1 && value <= 5;
}

function isGenerator(value: string): value is DeckImage['generator'] {
  return GENERATORS.includes(value as DeckImage['generator']);
}

function isCategory(value: string): value is DeckImage['category'] {
  return CATEGORIES.includes(value as DeckImage['category']);
}

export function mapImageRowToDeckImage(row: ImageRow): DeckImage | null {
  if (row.answer !== 'real' && row.answer !== 'ai') {
    return null;
  }
  if (!isDifficulty(row.difficulty)) {
    return null;
  }
  if (!isGenerator(row.generator)) {
    return null;
  }
  if (!isCategory(row.category)) {
    return null;
  }
  if (!row.image_url?.trim()) {
    return null;
  }

  return {
    id: row.id,
    imageUrl: row.image_url,
    answer: row.answer,
    difficulty: row.difficulty,
    fakeSocialStat: row.fake_social_stat,
    explanation: row.explanation ?? undefined,
    source_url: row.source_url,
    generator: row.generator,
    category: row.category,
    elo: row.elo ?? 1000,
    human_error_rate: row.human_error_rate ?? undefined,
  };
}

function mapRowsToDeckImages(rows: ImageRow[]): DeckImage[] {
  return rows
    .map(mapImageRowToDeckImage)
    .filter((image): image is DeckImage => image !== null);
}

async function readDiskCache(): Promise<DeckImage[] | null> {
  const payload = await Storage.get<ImagesCachePayload>(CACHE_KEY);
  if (!payload?.images?.length) {
    return null;
  }

  const age = Date.now() - new Date(payload.fetchedAt).getTime();
  if (age > CACHE_TTL_MS) {
    return null;
  }

  return payload.images;
}

async function writeDiskCache(images: DeckImage[]): Promise<void> {
  const payload: ImagesCachePayload = {
    fetchedAt: new Date().toISOString(),
    images,
  };
  await Storage.set(CACHE_KEY, payload);
}

export function getCachedDeckImages(): DeckImage[] {
  return memoryCache ?? baseImages;
}

export async function fetchActiveImages(): Promise<ImagesFetchResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const local = prepareDeck(baseImages);
    memoryCache = local;
    return {images: local, source: 'local_fallback'};
  }

  try {
    const rows = await queryActiveImages(supabase);
    const images = mapRowsToDeckImages(rows);

    if (images.length === 0) {
      throw new Error('Supabase returned zero active images');
    }

    const deck = prepareDeck(images);
    memoryCache = deck;
    await writeDiskCache(deck);
    return {images: deck, source: 'supabase'};
  } catch (error) {
    console.warn('[images] Supabase fetch failed, using cache or local fallback', error);

    const cached = await readDiskCache();
    if (cached?.length) {
      const deck = prepareDeck(cached);
      memoryCache = deck;
      return {images: deck, source: 'local_fallback'};
    }

    const local = prepareDeck(baseImages);
    memoryCache = local;
    return {images: local, source: 'local_fallback'};
  }
}

export async function loadShuffledDeck(): Promise<ImagesFetchResult> {
  return fetchActiveImages();
}
