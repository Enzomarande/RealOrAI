import {useCallback} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {VoteOption} from '../types/game';
import {useHaptics} from '../hooks/useHaptics';
import {theme} from '../theme';

type VoteButtonsProps = {
  disabled: boolean;
  onVote: (vote: VoteOption) => void;
};

export function VoteButtons({disabled, onVote}: VoteButtonsProps) {
  const haptics = useHaptics();

  const handleReal = useCallback(() => {
    if (disabled) {
      return;
    }
    haptics.light();
    onVote('real');
  }, [disabled, haptics, onVote]);

  const handleAi = useCallback(() => {
    if (disabled) {
      return;
    }
    haptics.light();
    onVote('ai');
  }, [disabled, haptics, onVote]);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleAi}
        disabled={disabled}
        style={({pressed}) => [
          styles.button,
          styles.aiButton,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.label, styles.aiLabel]}>IA</Text>
      </Pressable>
      <Pressable
        onPress={handleReal}
        disabled={disabled}
        style={({pressed}) => [
          styles.button,
          styles.realButton,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.label, styles.realLabel]}>REEL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s5,
    paddingBottom: theme.spacing.s3,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButton: {
    borderColor: theme.colors.redBorder,
    backgroundColor: theme.colors.redGlow,
  },
  realButton: {
    borderColor: theme.colors.greenBorder,
    backgroundColor: theme.colors.greenGlow,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: theme.font.sans,
  },
  aiLabel: {
    color: theme.colors.red,
  },
  realLabel: {
    color: theme.colors.green,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{scale: 0.98}],
  },
});
