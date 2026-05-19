import {useCallback, useEffect, useState} from 'react';
import {prepareDeck} from '../lib/game-utils';
import {loadShuffledDeck} from '../lib/images-repository';
import type {DeckImage} from '../types/game';

type DeckSource = 'loading' | 'supabase' | 'local_fallback';

type UseImageDeckResult = {
  deck: DeckImage[];
  isLoading: boolean;
  source: DeckSource;
  error: string | null;
  reload: () => Promise<void>;
  reshuffleDeck: () => void;
};

export function useImageDeck(): UseImageDeckResult {
  const [deck, setDeck] = useState<DeckImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<DeckSource>('loading');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loadShuffledDeck();
      setDeck(result.images);
      setSource(result.source);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible de charger les images';
      setError(message);
      setSource('local_fallback');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reshuffleDeck = useCallback(() => {
    setDeck(prev => prepareDeck(prev));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {deck, isLoading, source, error, reload, reshuffleDeck};
}
