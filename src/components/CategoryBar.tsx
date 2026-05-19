import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {CATEGORY_LABELS, CategoryStats} from '../lib/player-profile';
import {theme} from '../theme';

type CategoryBarProps = {
  stat: CategoryStats;
  animatedWidth: SharedValue<number>;
};

export function CategoryBar({stat, animatedWidth}: CategoryBarProps) {
  const color = theme.colors.categories[stat.category];

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
    backgroundColor: color,
  }));

  const pct = Math.round(stat.accuracy * 100);

  return (
    <View style={styles.row}>
      <Text style={[styles.label, {color}]}>{CATEGORY_LABELS[stat.category]}</Text>
      <View style={[styles.track, {backgroundColor: `${color}22`}]}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Text style={[styles.pct, stat.total_votes > 0 && {color}]}>
        {stat.total_votes > 0 ? `${pct}%` : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
    marginBottom: theme.spacing.s3,
  },
  label: {
    width: 88,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: theme.font.sans,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bgElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
  pct: {
    width: 36,
    textAlign: 'right',
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontFamily: theme.font.mono,
  },
});
