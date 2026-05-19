import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PlayerProfileProvider} from './src/hooks/PlayerProfileContext';
import {AppNavigator} from './src/navigation/AppNavigator';
import {theme} from './src/theme';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PlayerProfileProvider>
          <AppNavigator />
        </PlayerProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
});

export default App;
