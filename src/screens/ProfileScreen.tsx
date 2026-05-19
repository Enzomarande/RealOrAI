import {useCallback} from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {BadgeCard} from '../components/BadgeCard';
import {CategoryBar} from '../components/CategoryBar';
import {RankBadge} from '../components/RankBadge';
import {usePlayerProfile} from '../hooks/PlayerProfileContext';
import {generateInsight} from '../lib/player-profile';
import {RootStackParamList} from '../navigation/AppNavigator';
import {MainTabParamList} from '../navigation/MainTabNavigator';
import {theme} from '../theme';

type ProfileNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const tabBarHeight = useBottomTabBarHeight();
  const {profile, isLoading} = usePlayerProfile();

  const width0 = useSharedValue(0);
  const width1 = useSharedValue(0);
  const width2 = useSharedValue(0);
  const width3 = useSharedValue(0);
  const width4 = useSharedValue(0);
  const width5 = useSharedValue(0);
  const widths = [width0, width1, width2, width3, width4, width5];

  useFocusEffect(
    useCallback(() => {
      if (!profile) {
        return;
      }

      profile.category_stats.forEach((stat, index) => {
        widths[index].value = 0;
        widths[index].value = withDelay(
          index * 70,
          withTiming(stat.accuracy, {
            duration: 700,
            easing: Easing.out(Easing.cubic),
          }),
        );
      });
    }, [profile, width0, width1, width2, width3, width4, width5]),
  );

  const handleLeaderboard = useCallback(() => {
    navigation.navigate('Leaderboard');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!profile) {
      return;
    }

    await Share.share({
      message:
        `Mon profil Real or AI :\n` +
        `Rang : ${profile.rank}\n` +
        `Precision : ${Math.round(profile.accuracy * 100)}%\n` +
        `${generateInsight(profile)}\n` +
        `Testez-vous → https://realoriai.app`,
    });
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  const insight = generateInsight(profile);
  const unlockedBadges = profile.badges.filter(b => b.unlocked_at);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: theme.spacing.s10 + tabBarHeight},
        ]}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.name}>{profile.display_name}</Text>
        <RankBadge rank={profile.rank} size="lg" />

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(profile.accuracy * 100)}%
            </Text>
            <Text style={styles.statLabel}>Precision</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.total_votes}</Text>
            <Text style={styles.statLabel}>Votes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.best_streak}</Text>
            <Text style={styles.statLabel}>Meilleur streak</Text>
          </View>
        </View>

        <Text style={styles.insight}>{insight}</Text>

        <Pressable onPress={handleLeaderboard} style={styles.leaderboardLink}>
          <Text style={styles.leaderboardLinkLabel}>
            Voir le classement mondial →
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Par categorie</Text>
        {profile.category_stats.map((stat, index) => (
          <CategoryBar key={stat.category} stat={stat} animatedWidth={widths[index]} />
        ))}

        <Text style={styles.sectionTitle}>
          Badges ({unlockedBadges.length}/{profile.badges.length})
        </Text>
        {profile.badges.map(badge => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}

        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareLabel}>Partager mon profil</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  scroll: {
    padding: theme.spacing.s5,
  },
  loading: {
    color: theme.colors.textSecondary,
    padding: theme.spacing.s6,
    fontFamily: theme.font.sans,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  name: {
    marginTop: theme.spacing.s2,
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.font.sans,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
    marginTop: theme.spacing.s6,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgSurface,
    padding: theme.spacing.s3,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: theme.font.mono,
  },
  statLabel: {
    marginTop: theme.spacing.s1,
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontFamily: theme.font.sans,
  },
  insight: {
    marginTop: theme.spacing.s5,
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    fontFamily: theme.font.sans,
  },
  leaderboardLink: {
    marginTop: theme.spacing.s5,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.s4,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  leaderboardLinkLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  sectionTitle: {
    marginTop: theme.spacing.s8,
    marginBottom: theme.spacing.s4,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  shareButton: {
    marginTop: theme.spacing.s6,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.s4,
    alignItems: 'center',
  },
  shareLabel: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
});
