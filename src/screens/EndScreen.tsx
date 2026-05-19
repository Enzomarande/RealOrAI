import {useCallback} from 'react';
import {Pressable, Share, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {usePlayerProfile} from '../hooks/PlayerProfileContext';
import {createSessionRunId, prepareDeck} from '../lib/game-utils';
import {generateInsight, saveProfile} from '../lib/player-profile';
import {RootStackParamList} from '../navigation/AppNavigator';
import {RankBadge} from '../components/RankBadge';
import {theme} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'End'>;

export function EndScreen({navigation, route}: Props) {
  const {sessionStats} = route.params;
  const {profile, setProfile} = usePlayerProfile();

  const handleProfile = useCallback(() => {
    navigation.navigate('Main', {screen: 'Profile'});
  }, [navigation]);

  const handleLeaderboard = useCallback(() => {
    navigation.navigate('Leaderboard');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!profile) {
      return;
    }

    await Share.share({
      message:
        `Je viens de scorer ${sessionStats.score} sur Real or AI.\n` +
        `Rang : ${profile.rank}\n` +
        `Precision session : ${sessionStats.accuracy}%\n` +
        `Testez-vous → https://realoriai.app`,
    });
  }, [profile, sessionStats]);

  const handleNewSession = useCallback(async () => {
    if (!profile) {
      return;
    }

    const nextProfile = {
      ...profile,
      total_sessions: profile.total_sessions + 1,
    };
    await saveProfile(nextProfile);
    setProfile(nextProfile);
    createSessionRunId();
    prepareDeck();
    navigation.reset({
      index: 0,
      routes: [{name: 'Main', params: {screen: 'Feed'}}],
    });
  }, [navigation, profile, setProfile]);

  const insight = profile ? generateInsight(profile) : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.caption}>SESSION TERMINEE</Text>
        <Text style={styles.title}>Real or AI</Text>

        <View style={styles.block}>
          <Text style={styles.row}>
            Score session :{' '}
            <Text style={styles.value}>{sessionStats.score} pts</Text>
          </Text>
          <Text style={styles.row}>
            Precision :{' '}
            <Text style={styles.value}>{sessionStats.accuracy}%</Text>
          </Text>
          <Text style={styles.row}>
            Streak max :{' '}
            <Text style={styles.value}>{sessionStats.sessionBestStreak}</Text>
          </Text>
        </View>

        {profile ? (
          <View style={styles.blockDivider}>
            <RankBadge rank={profile.rank} size="sm" />
            <Text style={styles.row}>
              Total votes :{' '}
              <Text style={styles.value}>{profile.total_votes}</Text>
            </Text>
            <Text style={styles.row}>
              Precision globale :{' '}
              <Text style={styles.value}>
                {Math.round(profile.accuracy * 100)}%
              </Text>
            </Text>
          </View>
        ) : null}

        <Text style={styles.insight}>{insight}</Text>

        <Pressable onPress={handleNewSession} style={styles.primary}>
          <Text style={styles.primaryLabel}>Rejouer</Text>
        </Pressable>
        <Pressable onPress={handleLeaderboard}>
          <Text style={styles.leaderboardLink}>Voir ma position mondiale</Text>
        </Pressable>
        <Pressable onPress={handleProfile} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>Voir mon profil →</Text>
        </Pressable>
        <Pressable onPress={handleShare} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>Partager</Text>
        </Pressable>

        <Text style={styles.footer}>
          Score max theorique : {sessionStats.maxScore} pts
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    justifyContent: 'center',
    padding: theme.spacing.s5,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bgSurface,
    padding: theme.spacing.s6,
  },
  caption: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: theme.font.mono,
  },
  title: {
    marginTop: theme.spacing.s3,
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '500',
    letterSpacing: -0.5,
    fontFamily: theme.font.sans,
  },
  block: {
    marginTop: theme.spacing.s5,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.s4,
    gap: theme.spacing.s2,
  },
  blockDivider: {
    marginTop: theme.spacing.s4,
    paddingVertical: theme.spacing.s4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.s2,
  },
  row: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontFamily: theme.font.sans,
  },
  value: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  insight: {
    marginTop: theme.spacing.s4,
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    fontFamily: theme.font.sans,
  },
  primary: {
    marginTop: theme.spacing.s6,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.s4,
    alignItems: 'center',
  },
  primaryLabel: {
    color: theme.colors.bgBase,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  leaderboardLink: {
    marginTop: theme.spacing.s3,
    color: theme.colors.textTertiary,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: theme.font.sans,
  },
  secondary: {
    marginTop: theme.spacing.s3,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.s4,
    alignItems: 'center',
  },
  secondaryLabel: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.font.sans,
  },
  footer: {
    marginTop: theme.spacing.s4,
    color: theme.colors.textTertiary,
    fontSize: 11,
    textAlign: 'center',
    fontFamily: theme.font.sans,
  },
});
