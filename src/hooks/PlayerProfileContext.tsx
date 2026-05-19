import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadProfile,
  PlayerProfile,
  saveProfile,
} from '../lib/player-profile';

type PlayerProfileContextValue = {
  profile: PlayerProfile | null;
  isLoading: boolean;
  setProfile: (profile: PlayerProfile) => void;
  updateProfile: (profile: PlayerProfile) => Promise<void>;
};

const PlayerProfileContext = createContext<PlayerProfileContextValue | null>(
  null,
);

export function PlayerProfileProvider({children}: {children: ReactNode}) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const loaded = await loadProfile();
      const nextProfile = {
        ...loaded,
        total_sessions: loaded.total_sessions + 1,
      };
      await saveProfile(nextProfile);
      if (mounted) {
        setProfile(nextProfile);
        setIsLoading(false);
      }
    };

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const updateProfile = useCallback(async (next: PlayerProfile) => {
    await saveProfile(next);
    setProfile(next);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      setProfile,
      updateProfile,
    }),
    [profile, isLoading, updateProfile],
  );

  return (
    <PlayerProfileContext.Provider value={value}>
      {children}
    </PlayerProfileContext.Provider>
  );
}

export function usePlayerProfile(): PlayerProfileContextValue {
  const context = useContext(PlayerProfileContext);
  if (!context) {
    throw new Error('usePlayerProfile must be used within PlayerProfileProvider');
  }
  return context;
}
