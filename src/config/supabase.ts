import type {SupabaseConfig} from '../lib/supabase/types';

let localConfig: SupabaseConfig | null = null;

try {
  // Fichier local optionnel (non versionné)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const env = require('./supabase.env') as SupabaseConfig;
  localConfig = env;
} catch {
  localConfig = null;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = localConfig?.url?.trim() ?? '';
  const anonKey = localConfig?.anonKey?.trim() ?? '';

  if (!url || !anonKey) {
    return null;
  }

  if (url.includes('YOUR_PROJECT') || anonKey.includes('YOUR_SUPABASE')) {
    return null;
  }

  return {url, anonKey};
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
