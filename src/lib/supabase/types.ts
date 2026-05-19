import type {DeckImage} from '../../types/game';

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

/** Ligne table `public.images` — noms snake_case Supabase. */
export type ImageRow = {
  id: string;
  image_url: string;
  answer: 'real' | 'ai';
  difficulty: number;
  fake_social_stat: string;
  explanation: string | null;
  source_url: string;
  generator: DeckImage['generator'];
  category: DeckImage['category'];
  elo: number;
  human_error_rate: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ImagesFetchResult = {
  images: DeckImage[];
  source: 'supabase' | 'local_fallback';
};
