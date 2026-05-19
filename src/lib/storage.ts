import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE: 'roa_profile',
  VOTES: 'roa_votes',
  EVENTS: 'roa_client_events',
  LAST_LEADERBOARD_RANK: 'roa_last_leaderboard_rank',
  IMAGES_CACHE: 'roa_images_cache_v1',
} as const;

export const Storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write failures
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore remove failures
    }
  },
};

export {KEYS};
