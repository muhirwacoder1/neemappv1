import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PrimaryButton({ label, onPress, style, textStyle }: PrimaryButtonProps) {
  return (
    <PressableScale onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.surface,
    fontFamily: typography.subheading,
    fontSize: typography.sizes.md,
  },
});
