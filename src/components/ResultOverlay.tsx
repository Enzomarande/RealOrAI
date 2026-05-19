import {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useHaptics} from '../hooks/useHaptics';
import {PlayerRank} from '../lib/player-profile';
import {DeckImage, RoundResult, VoteOption} from '../types/game';
import {theme} from '../theme';

const AUTO_NEXT_SECONDS = 3;
const OVERLAY_DURATION_MS = AUTO_NEXT_SECONDS * 1000;
const SLIDE_DISTANCE = Dimensions.get('window').height * 0.45;

type ResultOverlayProps = {
  result: RoundResult;
  image: DeckImage;
  onNext: () => void;
};

function SourcePill({image, answer}: {image: DeckImage; answer: VoteOption}) {
  const label =
    answer === 'real'
      ? `Unsplash · ${image.category}`
      : `IA · ${image.generator} · ${image.category}`;

  return (
    <View style={styles.sourcePill}>
      <Text style={styles.sourceText}>{label}</Text>
    </View>
  );
}

function buildRoundKey(imageId: string, result: RoundResult): string {
  return `${imageId}:${result.isCorrect}:${result.rankPromotion ?? 'none'}`;
}

export function ResultOverlay({result, image, onNext}: ResultOverlayProps) {
  const haptics = useHaptics();
  const opacity = useSharedValue(0);
  const sheetY = useSharedValue(SLIDE_DISTANCE);
  const iconScale = useSharedValue(0.6);
  const onNextRef = useRef(onNext);
  const animatedRoundRef = useRef<string | null>(null);
  const [countdown, setCountdown] = useState(AUTO_NEXT_SECONDS);

  const roundKey = buildRoundKey(image.id, result);

  onNextRef.current = onNext;

  useEffect(() => {
    if (animatedRoundRef.current === roundKey) {
      return;
    }
    animatedRoundRef.current = roundKey;

    cancelAnimation(opacity);
    cancelAnimation(sheetY);
    cancelAnimation(iconScale);

    opacity.value = 0;
    sheetY.value = SLIDE_DISTANCE;
    iconScale.value = 0.6;

    opacity.value = withTiming(1, {duration: 220});
    sheetY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    iconScale.value = withSpring(1, {
      damping: 14,
      stiffness: 200,
      mass: 0.7,
    });

    if (result.isCorrect) {
      haptics.success();
    } else {
      haptics.error();
    }
    // roundKey uniquement : évite de relancer l'animation à chaque re-render parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey]);

  useEffect(() => {
    setCountdown(AUTO_NEXT_SECONDS);

    const timer = setTimeout(() => {
      onNextRef.current();
    }, OVERLAY_DURATION_MS);

    const interval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [roundKey]);

  const handleNext = useCallback(() => {
    onNextRef.current();
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: sheetY.value}],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{scale: iconScale.value}],
  }));

  if (result.rankPromotion) {
    return (
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <Animated.View style={[styles.rankSheet, sheetStyle]}>
          <Text style={styles.rankUpText}>
            {(result.rankPromotion as PlayerRank).toUpperCase()}
          </Text>
          <Pressable onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextLabel}>
              Suivant{countdown > 0 ? ` (${countdown})` : ''} →
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View
          style={[
            styles.flash,
            result.isCorrect ? styles.flashGreen : styles.flashRed,
          ]}
        />
        <Animated.Text style={[styles.icon, iconStyle]}>
          {result.isCorrect ? '✓' : '✗'}
        </Animated.Text>
        <Text
          style={[
            styles.resultTitle,
            {color: result.isCorrect ? theme.colors.green : theme.colors.red},
          ]}>
          {result.isCorrect ? 'Bonne reponse' : 'Rate'}
        </Text>
        {result.fastBonus ? (
          <Text style={styles.bonus}>Bonus rapidite +{result.pts}</Text>
        ) : null}
        <Text style={styles.socialStat}>{image.fakeSocialStat}</Text>
        {image.explanation ? (
          <Text style={styles.explanation}>{image.explanation}</Text>
        ) : null}
        <SourcePill image={image} answer={result.correctAnswer} />
        <Pressable onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextLabel}>
            Suivant{countdown > 0 ? ` (${countdown})` : ''} →
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,8,0.55)',
  },
  sheet: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s6,
    paddingTop: theme.spacing.s6,
    paddingBottom: theme.spacing.s8,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    backgroundColor: 'rgba(12,12,12,0.96)',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.borderDefault,
    overflow: 'hidden',
  },
  rankSheet: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s6,
    paddingVertical: theme.spacing.s8,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    backgroundColor: 'rgba(12,12,12,0.96)',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.borderDefault,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  flashGreen: {
    backgroundColor: theme.colors.green,
  },
  flashRed: {
    backgroundColor: theme.colors.red,
  },
  icon: {
    fontSize: 56,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s3,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: theme.font.sans,
    marginBottom: theme.spacing.s2,
  },
  bonus: {
    color: theme.colors.amber,
    fontSize: 13,
    marginBottom: theme.spacing.s2,
    fontFamily: theme.font.mono,
  },
  socialStat: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: theme.spacing.s3,
    fontFamily: theme.font.sans,
  },
  explanation: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: theme.spacing.s3,
    lineHeight: 19,
    fontFamily: theme.font.sans,
  },
  sourcePill: {
    marginTop: theme.spacing.s4,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
  },
  sourceText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: theme.font.mono,
  },
  nextButton: {
    marginTop: theme.spacing.s6,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.s6,
    paddingVertical: theme.spacing.s3,
  },
  nextLabel: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  rankUpText: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: theme.font.sans,
    marginBottom: theme.spacing.s4,
  },
});
