import {NavigatorScreenParams} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EndScreen} from '../screens/EndScreen';
import {LeaderboardScreen} from '../screens/LeaderboardScreen';
import {SessionStats} from '../types/game';
import {theme} from '../theme';
import {MainTabNavigator, MainTabParamList} from './MainTabNavigator';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  End: {sessionStats: SessionStats};
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: theme.colors.bgBase},
          animation: 'slide_from_right',
          animationTypeForReplace: 'push',
        }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{animation: 'slide_from_right'}}
        />
        <Stack.Screen
          name="End"
          component={EndScreen}
          options={{animation: 'fade'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
