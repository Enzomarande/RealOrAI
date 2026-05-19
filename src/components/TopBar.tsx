import {Ionicons} from '@expo/vector-icons';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {PlayerProfile} from '../lib/player-profile';
import {theme} from '../theme';
import {RankBadge} from './RankBadge';

type TopBarProps = {
  score: number;
  streak: number;
  profile: PlayerProfile;
  onProfilePress: () => void;
  onEndSession?: () => void;
  overlay?: boolean;
};

export function TopBar({
  score,
  streak,
  profile,
  onProfilePress,
  onEndSession,
  overlay = false,
}: TopBarProps) {
  return (
    <View style={[styles.container, overlay && styles.containerOverlay]}>
      <View style={styles.left}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.scoreLabel}>pts</Text>
      </View>
      <Pressable onPress={onProfilePress} style={styles.center}>
        <RankBadge rank={profile.rank} size="sm" />
      </Pressable>
      <View style={styles.right}>
        {onEndSession ? (
          <Pressable
            onPress={onEndSession}
            style={({pressed}) => [
              styles.endSession,
              pressed && styles.endSessionPressed,
            ]}
            hitSlop={6}
            accessibilityLabel="Terminer la session"
            accessibilityRole="button">
            <Ionicons
              name="flag-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.endSessionLabel}>Fin</Text>
          </Pressable>
        ) : null}
        <Text style={styles.streak}>{streak > 0 ? `${streak}🔥` : '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: theme.spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    backgroundColor: 'rgba(8,8,8,0.85)',
  },
  containerOverlay: {
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    minWidth: 72,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.s3,
    minWidth: 72,
  },
  endSession: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgElevated,
  },
  endSessionPressed: {
    opacity: 0.7,
    backgroundColor: theme.colors.bgSurface,
  },
  endSessionLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  score: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  scoreLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontFamily: theme.font.mono,
  },
  streak: {
    color: theme.colors.amber,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
});
