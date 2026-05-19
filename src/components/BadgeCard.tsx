import {StyleSheet, Text, View} from 'react-native';
import {BADGE_LABELS, Badge} from '../lib/player-profile';
import {theme} from '../theme';

type BadgeCardProps = {
  badge: Badge;
};

export function BadgeCard({badge}: BadgeCardProps) {
  const meta = BADGE_LABELS[badge.id];
  const unlocked = Boolean(badge.unlocked_at);

  return (
    <View style={[styles.card, unlocked ? styles.cardUnlocked : styles.cardLocked]}>
      <Text style={[styles.title, unlocked && styles.titleUnlocked]}>
        {meta.title}
      </Text>
      <Text style={styles.description}>{meta.description}</Text>
      {!unlocked ? (
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, {width: `${badge.progress * 100}%`}]}
          />
        </View>
      ) : (
        <Text style={styles.unlocked}>Debloque</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.s4,
    marginBottom: theme.spacing.s3,
  },
  cardUnlocked: {
    borderColor: theme.colors.greenBorder,
    backgroundColor: theme.colors.greenGlow,
  },
  cardLocked: {
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.bgSurface,
    opacity: 0.75,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  titleUnlocked: {
    color: theme.colors.green,
  },
  description: {
    marginTop: theme.spacing.s1,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: theme.font.sans,
  },
  progressTrack: {
    marginTop: theme.spacing.s3,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bgElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.textTertiary,
  },
  unlocked: {
    marginTop: theme.spacing.s2,
    color: theme.colors.green,
    fontSize: 11,
    fontFamily: theme.font.mono,
    letterSpacing: 0.5,
  },
});
