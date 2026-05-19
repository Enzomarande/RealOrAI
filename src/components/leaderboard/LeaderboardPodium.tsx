import {StyleSheet, Text, View} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {
  getMedalColor,
  LeaderboardEntry,
} from '../../lib/leaderboard';
import {RankBadge} from '../RankBadge';
import {theme} from '../../theme';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

type LeaderboardPodiumProps = {
  topThree: LeaderboardEntry[];
};

function truncateName(name: string): string {
  return name.length > 10 ? `${name.slice(0, 9)}…` : name;
}

function PodiumCard({
  entry,
  place,
  delay,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  delay: number;
}) {
  const isFirst = place === 1;
  const medalColor = getMedalColor(place);
  const accuracySize = isFirst ? 36 : 28;

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400)}
      style={[
        styles.card,
        place === 1 && styles.cardFirst,
        place === 2 && styles.cardSecond,
        place === 3 && styles.cardThird,
        medalColor && place === 1
          ? {borderColor: `${medalColor}4D`, backgroundColor: `${medalColor}14`}
          : null,
      ]}>
      <Text style={styles.medal}>{MEDALS[place - 1]}</Text>
      <Text style={styles.flag}>{entry.country_flag ?? '🌍'}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {truncateName(entry.display_name)}
      </Text>
      <Text
        style={[
          styles.accuracy,
          {fontSize: accuracySize},
          medalColor ? {color: medalColor} : null,
        ]}>
        {Math.round(entry.accuracy * 100)}%
      </Text>
      <RankBadge rank={entry.player_rank} size="sm" />
    </Animated.View>
  );
}

export function LeaderboardPodium({topThree}: LeaderboardPodiumProps) {
  if (topThree.length < 3) {
    return null;
  }

  const [first, second, third] = topThree;

  return (
    <View style={styles.podium}>
      <PodiumCard entry={second} place={2} delay={0} />
      <PodiumCard entry={first} place={1} delay={80} />
      <PodiumCard entry={third} place={3} delay={160} />
    </View>
  );
}

const styles = StyleSheet.create({
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: theme.spacing.s2,
    paddingHorizontal: theme.spacing.s5,
    marginBottom: theme.spacing.s6,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgSurface,
    paddingHorizontal: theme.spacing.s2,
    paddingVertical: theme.spacing.s3,
    gap: theme.spacing.s1,
  },
  cardFirst: {
    height: 110,
    justifyContent: 'center',
  },
  cardSecond: {
    height: 88,
    justifyContent: 'center',
  },
  cardThird: {
    height: 80,
    justifyContent: 'center',
  },
  medal: {
    fontSize: 20,
  },
  flag: {
    fontSize: 18,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  accuracy: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontFamily: theme.font.mono,
  },
});
