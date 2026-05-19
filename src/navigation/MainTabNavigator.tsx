import {Ionicons} from '@expo/vector-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GameScreen} from '../screens/GameScreen';
import {LeaderboardScreen} from '../screens/LeaderboardScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {theme} from '../theme';

export type MainTabParamList = {
  Feed: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

function FeedIcon({focused, color, size}: TabIconProps) {
  return (
    <Ionicons
      name={focused ? 'images' : 'images-outline'}
      size={size}
      color={color}
    />
  );
}

function LeaderboardIcon({focused, color, size}: TabIconProps) {
  return (
    <Ionicons
      name={focused ? 'trophy' : 'trophy-outline'}
      size={size}
      color={color}
    />
  );
}

function ProfileIcon({focused, color, size}: TabIconProps) {
  return (
    <Ionicons
      name={focused ? 'person' : 'person-outline'}
      size={size}
      color={color}
    />
  );
}

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 52 + insets.bottom;

  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bgSurface,
          borderTopColor: theme.colors.borderSubtle,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: insets.bottom + 4,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: theme.colors.textPrimary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: theme.font.sans,
          marginBottom: 4,
        },
      }}>
      <Tab.Screen
        name="Feed"
        component={GameScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: FeedIcon,
        }}
        sceneContainerStyle={styles.feedScene}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Classement',
          tabBarIcon: LeaderboardIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  feedScene: {
    backgroundColor: theme.colors.bgBase,
  },
});
