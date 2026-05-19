import {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {theme} from '../theme';

const ROUND_MS = 8000;

type TimerBarProps = {
  active: boolean;
  imageIndex: number;
  overlay?: boolean;
};

export function TimerBar({active, imageIndex, overlay = false}: TimerBarProps) {
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = 1;
    if (active) {
      progress.value = withTiming(0, {
        duration: ROUND_MS,
        easing: Easing.linear,
      });
    }
  }, [active, imageIndex, progress]);

  useEffect(() => {
    if (!active) {
      cancelAnimation(progress);
    }
  }, [active, progress]);

  const barStyle = useAnimatedStyle(() => {
    const pct = progress.value;
    const color =
      pct > 0.5
        ? 'rgba(255,255,255,0.22)'
        : pct > 0.25
          ? theme.colors.amber
          : theme.colors.red;

    return {
      width: `${pct * 100}%`,
      backgroundColor: color,
    };
  });

  return (
    <View style={[styles.track, overlay && styles.trackOverlay]}>
      <Animated.View style={[styles.fill, barStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    marginHorizontal: theme.spacing.s5,
    marginBottom: theme.spacing.s3,
    backgroundColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  trackOverlay: {
    marginHorizontal: theme.spacing.s4,
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
});
