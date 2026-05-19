import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {trackClientEvent, trackVote, VoteEvent} from '../lib/analytics';
import {
  PlayerRank,
  updateProfileAfterVote,
} from '../lib/player-profile';
import {createSessionRunId, rankLevel} from '../lib/game-utils';
import {useImageDeck} from '../hooks/useImageDeck';
import {usePlayerProfile} from '../hooks/PlayerProfileContext';
import {ImageCard} from '../components/ImageCard';
import {ResultOverlay} from '../components/ResultOverlay';
import {TimerBar} from '../components/TimerBar';
import {TopBar} from '../components/TopBar';
import {RootStackParamList} from '../navigation/AppNavigator';
import {MainTabParamList} from '../navigation/MainTabNavigator';
import {RoundResult, VoteOption} from '../types/game';
import {theme} from '../theme';

type GameNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Feed'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function GameScreen() {
  const navigation = useNavigation<GameNav>();
  const insets = useSafeAreaInsets();
  const {profile, isLoading: isProfileLoading, updateProfile} = usePlayerProfile();
  const {deck, isLoading: isDeckLoading, reshuffleDeck} = useImageDeck();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionBestStreak, setSessionBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);

  const isVotingRef = useRef(false);
  const sessionRunIdRef = useRef(createSessionRunId());
  const roundStartedAtRef = useRef(Date.now());

  const currentImage = deck[currentIndex];
  const roundNumber = answeredCount + (result ? 0 : 1);
  const cardKey = `${answeredCount}-${currentImage?.id ?? 'loading'}`;

  const accuracy = useMemo(() => {
    if (answeredCount === 0) {
      return 0;
    }
    return Math.round((correctCount / answeredCount) * 100);
  }, [answeredCount, correctCount]);

  const maxScore = useMemo(
    () => deck.reduce((total, image) => total + image.difficulty * 2, 0),
    [deck],
  );

  useEffect(() => {
    roundStartedAtRef.current = Date.now();
  }, [currentIndex]);

  const endSession = useCallback(() => {
    if (!profile || answeredCount === 0) {
      return;
    }

    navigation.navigate('End', {
      sessionStats: {
        score,
        accuracy,
        sessionBestStreak,
        correctCount,
        answeredCount,
        maxScore,
      },
    });
  }, [
    profile,
    answeredCount,
    navigation,
    score,
    accuracy,
    sessionBestStreak,
    correctCount,
    maxScore,
  ]);

  const goToNext = useCallback(() => {
    isVotingRef.current = false;
    setResult(null);

    setCurrentIndex(prev => {
      if (deck.length === 0) {
        return prev;
      }
      if (prev >= deck.length - 1) {
        reshuffleDeck();
        return 0;
      }
      return prev + 1;
    });
  }, [deck.length, reshuffleDeck]);

  useEffect(() => {
    if (deck.length > 0 && currentIndex >= deck.length) {
      setCurrentIndex(0);
    }
  }, [deck.length, currentIndex]);

  const handleVote = useCallback(
    async (vote: VoteOption) => {
      if (!currentImage || !profile || isVotingRef.current || result) {
        return;
      }

      isVotingRef.current = true;
      const responseMs = Date.now() - roundStartedAtRef.current;
      const isCorrect = currentImage.answer === vote;
      const fastBonus = isCorrect && responseMs <= 1000;
      const pts = isCorrect
        ? currentImage.difficulty + (fastBonus ? currentImage.difficulty : 0)
        : 0;

      const voteEvent: VoteEvent = {
        session_id: profile.session_id,
        session_run_id: sessionRunIdRef.current,
        image_id: currentImage.id,
        vote,
        answer: currentImage.answer,
        correct: isCorrect,
        response_ms: responseMs,
        difficulty: currentImage.difficulty,
        generator: currentImage.generator,
        category: currentImage.category,
        timestamp: new Date().toISOString(),
        rank_at_vote: profile.rank,
        streak_at_vote: streak,
      };

      const prevRank = profile.rank;
      const updatedProfile = updateProfileAfterVote(profile, voteEvent);
      await updateProfile(updatedProfile);
      await trackVote(voteEvent);

      const rankPromotion: PlayerRank | null =
        rankLevel(updatedProfile.rank) > rankLevel(prevRank)
          ? updatedProfile.rank
          : null;

      setAnsweredCount(prev => prev + 1);
      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
        setStreak(prev => {
          const next = prev + 1;
          setSessionBestStreak(best => Math.max(best, next));
          return next;
        });
        setScore(prev => prev + pts);
      } else {
        setStreak(0);
      }

      setResult({
        isCorrect,
        pts,
        correctAnswer: currentImage.answer,
        fastBonus,
        rankPromotion,
      });
    },
    [currentImage, profile, result, streak, updateProfile],
  );

  const handleImageError = useCallback((imageId: string) => {
    void trackClientEvent({
      type: 'image_load_error',
      image_id: imageId,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const openProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  if (isProfileLoading || isDeckLoading || !profile || deck.length === 0) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={theme.colors.textPrimary} />
        <Text style={styles.loadingText}>Initialisation du laboratoire...</Text>
      </SafeAreaView>
    );
  }

  if (!currentImage) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={theme.colors.textPrimary} />
        <Text style={styles.loadingText}>Chargement de l image...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={[styles.stage, {top: insets.top}]}>
        <ImageCard
          key={`card-${cardKey}`}
          image={currentImage}
          onVote={handleVote}
          disabled={Boolean(result)}
          onImageError={handleImageError}
          fullscreen
        />
        {result ? (
          <ResultOverlay
            key={`overlay-${cardKey}`}
            result={result}
            image={currentImage}
            onNext={goToNext}
          />
        ) : null}
      </View>

      <View style={[styles.topChrome, {paddingTop: insets.top}]} pointerEvents="box-none">
        <TopBar
          score={score}
          streak={streak}
          profile={profile}
          onProfilePress={openProfile}
          onEndSession={endSession}
          overlay
        />
        <TimerBar active={!result} imageIndex={currentIndex} overlay />
      </View>

      {!result ? (
        <View style={styles.bottomChrome} pointerEvents="none">
          <Text style={styles.roundHint}>Image {roundNumber}</Text>
          <Text style={styles.swipeHint}>Glissez ← IA · REEL →</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s4,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.font.sans,
  },
  stage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  topChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: theme.spacing.s3,
    alignItems: 'center',
    zIndex: 10,
    gap: theme.spacing.s1,
  },
  roundHint: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.font.mono,
    backgroundColor: 'rgba(8,8,8,0.55)',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s1,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  swipeHint: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontFamily: theme.font.sans,
    backgroundColor: 'rgba(8,8,8,0.4)',
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
});
