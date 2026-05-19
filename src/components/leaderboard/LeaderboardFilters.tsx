import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import {LeaderboardFilter} from '../../lib/leaderboard';
import {PlayerRank} from '../../lib/player-profile';
import {theme} from '../../theme';

const FILTERS: {id: LeaderboardFilter; label: string}[] = [
  {id: 'global', label: 'Mondial'},
  {id: 'weekly', label: 'Cette semaine'},
  {id: 'accuracy', label: 'Précision'},
  {id: 'streak', label: 'Streaks'},
];

type LeaderboardFiltersProps = {
  active: LeaderboardFilter;
  rankColor: string;
  onChange: (filter: LeaderboardFilter) => void;
};

export function LeaderboardFilters({
  active,
  rankColor,
  onChange,
}: LeaderboardFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {FILTERS.map(filter => {
        const selected = filter.id === active;
        return (
          <Pressable
            key={filter.id}
            onPress={() => onChange(filter.id)}
            style={[
              styles.pill,
              selected && {
                backgroundColor: `${rankColor}26`,
                borderColor: rankColor,
              },
            ]}>
            <Text
              style={[
                styles.pillLabel,
                selected && {color: rankColor},
              ]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function getRankColor(rank: PlayerRank): string {
  return theme.colors.ranks[rank];
}

const styles = StyleSheet.create({
  row: {
    gap: theme.spacing.s2,
    paddingHorizontal: theme.spacing.s5,
    paddingBottom: theme.spacing.s4,
  },
  pill: {
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s2,
    backgroundColor: 'transparent',
  },
  pillLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
});
