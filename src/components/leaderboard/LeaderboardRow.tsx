import {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {
  getMedalColor,
  LeaderboardEntry,
  LEADERBOARD_ROW_HEIGHT,
  LEADERBOARD_USER_ROW_HEIGHT,
} from '../../lib/leaderboard';
import {PlayerRank} from '../../lib/player-profile';
import {theme} from '../../theme';
import {RankBadge} from '../RankBadge';

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  rankColor: string;
  animIndex: number;
};

function formatResponseMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function LeaderboardRowComponent({
  entry,
  rankColor,
  animIndex,
}: LeaderboardRowProps) {
  const medalColor = getMedalColor(entry.rank);
  const rowHeight = entry.is_current_user
    ? LEADERBOARD_USER_ROW_HEIGHT
    : LEADERBOARD_ROW_HEIGHT;

  return (
    <Animated.View
      entering={
        animIndex < 20
          ? FadeInUp.delay(animIndex * 20).duration(200)
          : undefined
      }
      style={[
        styles.row,
        {minHeight: rowHeight},
        entry.is_current_user && {
          backgroundColor: `${rankColor}14`,
          borderLeftColor: rankColor,
        },
        entry.is_rival && styles.rivalRow,
      ]}>
      <Text
        style={[
          styles.rank,
          medalColor ? {color: medalColor} : null,
        ]}>
        #{entry.rank}
      </Text>
      <Text style={styles.flag}>{entry.country_flag ?? '🌍'}</Text>
      <View style={styles.nameCol}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.display_name}
          </Text>
          {entry.is_current_user ? (
            <Text style={[styles.youTag, {color: rankColor}]}>Vous</Text>
          ) : null}
          {entry.is_rival ? (
            <Text style={styles.rivalTag}>À dépasser</Text>
          ) : null}
        </View>
      </View>
      <RankBadge rank={entry.player_rank} size="sm" />
      <Text style={styles.accuracy}>
        {Math.round(entry.accuracy * 100)}%
      </Text>
      <Text style={styles.time}>{formatResponseMs(entry.avg_response_ms)}</Text>
    </Animated.View>
  );
}

export const LeaderboardRow = memo(LeaderboardRowComponent);

export function LeaderboardEllipsisRow() {
  return (
    <View style={styles.ellipsisRow}>
      <Text style={styles.ellipsis}>· · ·</Text>
    </View>
  );
}

export function getRowRankColor(rank: PlayerRank): string {
  return theme.colors.ranks[rank];
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s5,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    gap: theme.spacing.s2,
  },
  rivalRow: {
    borderWidth: 1,
    borderColor: theme.colors.amber,
    borderLeftWidth: 2,
    marginHorizontal: theme.spacing.s3,
    borderRadius: theme.radius.sm,
  },
  rank: {
    width: 36,
    color: theme.colors.textTertiary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.font.mono,
  },
  flag: {
    width: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
    flexWrap: 'wrap',
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.font.sans,
    flexShrink: 1,
  },
  youTag: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: theme.font.mono,
  },
  rivalTag: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    fontFamily: theme.font.sans,
  },
  accuracy: {
    width: 40,
    textAlign: 'right',
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontFamily: theme.font.mono,
  },
  time: {
    width: 36,
    textAlign: 'right',
    color: theme.colors.textTertiary,
    fontSize: 13,
    fontFamily: theme.font.mono,
  },
  ellipsisRow: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsis: {
    color: theme.colors.textTertiary,
    fontSize: 18,
    letterSpacing: 4,
    fontFamily: theme.font.sans,
  },
});
