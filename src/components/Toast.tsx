import {StyleSheet, Text} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {theme} from '../theme';

type ToastProps = {
  message: string;
};

export function Toast({message}: ToastProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(theme.duration.fast)}
      exiting={FadeOut.duration(theme.duration.fast)}
      style={styles.toast}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s3,
    zIndex: 100,
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontFamily: theme.font.sans,
  },
});
