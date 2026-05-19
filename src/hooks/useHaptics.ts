import {useMemo} from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function useHaptics() {
  return useMemo(
    () => ({
      success: () =>
        ReactNativeHapticFeedback.trigger('notificationSuccess', options),
      error: () =>
        ReactNativeHapticFeedback.trigger('notificationError', options),
      light: () => ReactNativeHapticFeedback.trigger('impactLight', options),
      medium: () => ReactNativeHapticFeedback.trigger('impactMedium', options),
      rankUp: () =>
        ReactNativeHapticFeedback.trigger('notificationSuccess', options),
    }),
    [],
  );
}
