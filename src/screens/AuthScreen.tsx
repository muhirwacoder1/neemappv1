import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { PrimaryButton } from '../components/PrimaryButton';
import { PressableScale } from '../components/PressableScale';
import { shadows } from '../theme/shadows';

const inputPlaceholder = 'Phone number or email';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation }: Props) {
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your care team</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Contact</Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder={inputPlaceholder}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <Text style={styles.label}>OTP Code</Text>
        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter OTP"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          style={styles.input}
        />
        <PrimaryButton label="Continue" onPress={() => navigation.replace('Main')} />
      </View>

      <PressableScale style={styles.secondaryAction}>
        <Text style={styles.secondaryText}>Use Face ID next time</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  label: {
    fontFamily: typography.subheading,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: spacing.sm,
    fontFamily: typography.body,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  secondaryAction: {
    alignSelf: 'center',
  },
  secondaryText: {
    fontFamily: typography.subheading,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
});
