import 'react-native-url-polyfill/auto';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {getSupabaseConfig} from '../../config/supabase';
import type {ImageRow} from './types';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  if (!client) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}

export type ImagesTableClient = SupabaseClient;

export async function queryActiveImages(
  supabase: SupabaseClient,
): Promise<ImageRow[]> {
  const {data, error} = await supabase
    .from('images')
    .select(
      'id, image_url, answer, difficulty, fake_social_stat, explanation, source_url, generator, category, elo, human_error_rate, is_active',
    )
    .eq('is_active', true)
    .order('difficulty', {ascending: true});

  if (error) {
    throw error;
  }

  return (data ?? []) as ImageRow[];
}
