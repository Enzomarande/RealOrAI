import {StyleSheet, Text, View} from 'react-native';
import {PlayerRank} from '../lib/player-profile';
import {theme} from '../theme';

type RankBadgeProps = {
  rank: PlayerRank;
  size?: 'sm' | 'lg';
};

export function RankBadge({rank, size = 'sm'}: RankBadgeProps) {
  const isLarge = size === 'lg';
  const color = theme.colors.ranks[rank];

  return (
    <View
      style={[
        styles.badge,
        isLarge ? styles.badgeLg : styles.badgeSm,
        {borderColor: color},
      ]}>
      <Text
        style={[
          styles.label,
          isLarge ? styles.labelLg : styles.labelSm,
          {color},
        ]}>
        {rank.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.s2,
    paddingVertical: theme.spacing.s1,
  },
  badgeLg: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
  },
  label: {
    fontFamily: theme.font.mono,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 10,
  },
  labelLg: {
    fontSize: 13,
  },
});
