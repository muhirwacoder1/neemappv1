import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PrimaryButton } from '../components/PrimaryButton';
import { spacing } from '../theme/spacing';

export function MonitoringScreen() {
  return (
    <LinearGradient colors={[colors.surface, colors.primarySoft]} style={styles.container}>
      <View style={styles.lockCircle}>
        <Feather name="lock" size={24} color={colors.primary} />
      </View>
      <Text style={styles.title}>Real-time Monitoring</Text>
      <Text style={styles.subtitle}>Monitoring is coming soon. Unlock the future of care with predictive insights.</Text>
      <PrimaryButton label="Join Waitlist" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 22,
  },
});
