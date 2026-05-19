import {useCallback, useEffect} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {Image} from 'expo-image';
import LinearGradient from 'react-native-linear-gradient';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useHaptics} from '../hooks/useHaptics';
import {DeckImage, VoteOption} from '../types/game';
import {theme} from '../theme';

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.08;

type ImageCardProps = {
  image: DeckImage;
  disabled: boolean;
  onVote: (vote: VoteOption) => void;
  onImageError?: (imageId: string) => void;
  fullscreen?: boolean;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function ImageCard({
  image,
  disabled,
  onVote,
  onImageError,
  fullscreen = false,
}: ImageCardProps) {
  const haptics = useHaptics();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const enterY = useSharedValue(SCREEN_HEIGHT);
  const hintTriggered = useSharedValue(false);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    hintTriggered.value = false;
    enterY.value = SCREEN_HEIGHT * 0.35;
    enterY.value = withTiming(0, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [image.id, enterY, hintTriggered, translateX, translateY]);

  const triggerMedium = useCallback(() => {
    haptics.medium();
  }, [haptics]);

  const submitVote = useCallback(
    (vote: VoteOption) => {
      onVote(vote);
    },
    [onVote],
  );

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.15;

      const progress = Math.abs(event.translationX) / SWIPE_THRESHOLD;
      if (progress >= 1 && !hintTriggered.value) {
        hintTriggered.value = true;
        runOnJS(triggerMedium)();
      }
      if (progress < 0.9) {
        hintTriggered.value = false;
      }
    })
    .onEnd(event => {
      const shouldSwipe =
        Math.abs(event.translationX) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityX) > 800;

      if (shouldSwipe) {
        const direction: VoteOption = event.translationX > 0 ? 'real' : 'ai';
        const targetX = direction === 'real' ? 500 : -500;

        translateX.value = withTiming(targetX, {duration: 250}, finished => {
          if (finished) {
            runOnJS(submitVote)(direction);
          }
        });
        translateY.value = withTiming(event.translationY * 2, {duration: 250});
      } else {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
          mass: 0.8,
        });
        translateY.value = withSpring(0, {damping: 15, stiffness: 150});
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: enterY.value + translateY.value},
      {rotate: `${translateX.value * ROTATION_FACTOR}deg`},
    ],
  }));

  const hintRealStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [30, 90],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [30, 90],
          [0.85, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const hintAIStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-30, -90],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-30, -90],
          [0.85, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const handleError = useCallback(() => {
    onImageError?.(image.id);
  }, [image.id, onImageError]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.card, fullscreen && styles.cardFullscreen, cardStyle]}>
        <Image
          source={{uri: image.imageUrl}}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={handleError}
        />
        <LinearGradient
          colors={
            fullscreen
              ? [
                  'rgba(8,8,8,0.72)',
                  'rgba(8,8,8,0.2)',
                  'transparent',
                  'rgba(8,8,8,0.35)',
                  'rgba(8,8,8,0.92)',
                ]
              : ['transparent', 'rgba(8,8,8,0.5)', 'rgba(8,8,8,0.9)']
          }
          locations={fullscreen ? [0, 0.14, 0.45, 0.72, 1] : [0.4, 0.7, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />
        <Animated.View style={[styles.hintReal, hintRealStyle]} pointerEvents="none">
          <Text style={styles.hintTextReal}>REEL</Text>
        </Animated.View>
        <Animated.View style={[styles.hintAI, hintAIStyle]} pointerEvents="none">
          <Text style={styles.hintTextAI}>IA</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: theme.spacing.s4,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  cardFullscreen: {
    ...StyleSheet.absoluteFillObject,
    margin: 0,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: theme.colors.bgBase,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  hintReal: {
    position: 'absolute',
    top: '40%',
    right: theme.spacing.s6,
    borderWidth: 2,
    borderColor: theme.colors.green,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
  },
  hintAI: {
    position: 'absolute',
    top: '40%',
    left: theme.spacing.s6,
    borderWidth: 2,
    borderColor: theme.colors.red,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
  },
  hintTextReal: {
    color: theme.colors.green,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: theme.font.sans,
  },
  hintTextAI: {
    color: theme.colors.red,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: theme.font.sans,
  },
});
