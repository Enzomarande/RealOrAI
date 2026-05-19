import {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  getRankColor,
  LeaderboardFilters,
} from '../components/leaderboard/LeaderboardFilters';
import {LeaderboardPodium} from '../components/leaderboard/LeaderboardPodium';
import {
  LeaderboardEllipsisRow,
  LeaderboardRow,
} from '../components/leaderboard/LeaderboardRow';
import {usePlayerProfile} from '../hooks/PlayerProfileContext';
import {
  buildListRows,
  buildShareMessage,
  getLeaderboard,
  getLeaderboardItemLayout,
  getMostMisleadingImage,
  getMotivationalMessage,
  getRankProgressDelta,
  LeaderboardFilter,
  LeaderboardListRow,
  LeaderboardResult,
  saveLastLeaderboardRank,
} from '../lib/leaderboard';
import {theme} from '../theme';

const SHARE_BUTTON_HEIGHT = 52;

export function LeaderboardScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {profile, isLoading} = usePlayerProfile();

  const [filter, setFilter] = useState<LeaderboardFilter>('global');
  const [rankDelta, setRankDelta] = useState<number | null>(null);
  const listOpacity = useSharedValue(1);

  const showBack = navigation.canGoBack();

  const result: LeaderboardResult | null = useMemo(() => {
    if (!profile) {
      return null;
    }
    return getLeaderboard(filter, profile);
  }, [filter, profile]);

  const rankColor = profile ? getRankColor(profile.rank) : theme.colors.textSecondary;

  const listRows = useMemo(
    () => (result ? buildListRows(result) : []),
    [result],
  );

  const topThree = useMemo(
    () => result?.entries.filter(entry => entry.rank <= 3).slice(0, 3) ?? [],
    [result],
  );

  const listData = useMemo(
    () =>
      listRows.filter(
        row => row.type === 'ellipsis' || row.entry.rank > 3,
      ),
    [listRows],
  );

  const misleading = useMemo(() => getMostMisleadingImage(), []);

  const listAnimatedStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  const applyFilter = useCallback((next: LeaderboardFilter) => {
    listOpacity.value = withTiming(0, {duration: 100}, finished => {
      if (finished) {
        runOnJS(setFilter)(next);
        listOpacity.value = withTiming(1, {duration: 200});
      }
    });
  }, [listOpacity]);

  useFocusEffect(
    useCallback(() => {
      if (!result) {
        return;
      }

      let active = true;
      void getRankProgressDelta(result.current_user_rank).then(delta => {
        if (active) {
          setRankDelta(delta);
        }
      });
      void saveLastLeaderboardRank(result.current_user_rank);

      return () => {
        active = false;
      };
    }, [result]),
  );

  const handleShare = useCallback(async () => {
    if (!profile || !result) {
      return;
    }
    await Share.share({
      message: buildShareMessage(result.current_user_rank, profile),
    });
  }, [profile, result]);

  const bottomInset = Math.max(tabBarHeight, insets.bottom);

  const renderItem: ListRenderItem<LeaderboardListRow> = useCallback(
    ({item, index}) => {
      if (item.type === 'ellipsis') {
        return <LeaderboardEllipsisRow />;
      }
      return (
        <LeaderboardRow
          entry={item.entry}
          rankColor={rankColor}
          animIndex={index}
        />
      );
    },
    [rankColor],
  );

  const keyExtractor = useCallback((item: LeaderboardListRow) => {
    if (item.type === 'ellipsis') {
      return 'ellipsis';
    }
    return item.entry.id;
  }, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<LeaderboardListRow> | null | undefined, index: number) =>
      getLeaderboardItemLayout(listData, index),
    [listData],
  );

  if (isLoading || !profile || !result) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.loading}>Chargement du classement...</Text>
      </SafeAreaView>
    );
  }

  const accuracyPct = Math.round(profile.accuracy * 100);
  const headerMessage = getMotivationalMessage(result.current_user_rank);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.listWrap, listAnimatedStyle]}>
        <FlatList
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: SHARE_BUTTON_HEIGHT + bottomInset + theme.spacing.s8,
          }}
          ListHeaderComponent={
            <>
              {showBack ? (
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.back}
                  hitSlop={8}>
                  <Text style={styles.backLabel}>← Retour</Text>
                </Pressable>
              ) : null}

              <Text style={styles.message}>{headerMessage}</Text>
              <Text style={[styles.globalRank, {color: rankColor}]}>
                #{result.current_user_rank} mondial
              </Text>
              <Text style={styles.subline}>
                {accuracyPct}% de précision · Rang {profile.rank}
              </Text>

              {rankDelta !== null && rankDelta > 0 ? (
                <Text style={styles.progress}>
                  ↑ +{rankDelta} places depuis hier
                </Text>
              ) : null}

              <LeaderboardFilters
                active={filter}
                rankColor={rankColor}
                onChange={applyFilter}
              />

              <LeaderboardPodium topThree={topThree} />
            </>
          }
          ListFooterComponent={
            <View style={styles.misleadingBlock}>
              <Text style={styles.misleadingText}>
                Image la plus trompeuse : {misleading.image_id} ·{' '}
                {Math.round(misleading.human_error_rate * 100)}% d'erreurs
              </Text>
            </View>
          }
        />
      </Animated.View>

      <View
        style={[
          styles.shareSticky,
          {paddingBottom: bottomInset + theme.spacing.s3},
        ]}>
        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareLabel}>Partager ma position</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  listWrap: {
    flex: 1,
  },
  loading: {
    color: theme.colors.textSecondary,
    padding: theme.spacing.s6,
    fontFamily: theme.font.sans,
  },
  back: {
    paddingHorizontal: theme.spacing.s5,
    paddingTop: theme.spacing.s2,
    paddingBottom: theme.spacing.s2,
  },
  backLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.font.sans,
  },
  message: {
    paddingHorizontal: theme.spacing.s5,
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.font.sans,
  },
  globalRank: {
    paddingHorizontal: theme.spacing.s5,
    marginTop: theme.spacing.s4,
    fontSize: 42,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  subline: {
    paddingHorizontal: theme.spacing.s5,
    marginTop: theme.spacing.s2,
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.font.sans,
  },
  progress: {
    paddingHorizontal: theme.spacing.s5,
    marginTop: theme.spacing.s3,
    color: theme.colors.green,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
  misleadingBlock: {
    marginHorizontal: theme.spacing.s5,
    marginTop: theme.spacing.s6,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.s4,
    backgroundColor: theme.colors.bgSurface,
  },
  misleadingText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: theme.font.sans,
  },
  shareSticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.s4,
    backgroundColor: theme.colors.bgBase,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  shareButton: {
    height: SHARE_BUTTON_HEIGHT,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareLabel: {
    color: theme.colors.bgBase,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: theme.font.sans,
  },
});
