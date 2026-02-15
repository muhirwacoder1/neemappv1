import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { PressableScale } from '../components/PressableScale';
import { shadows } from '../theme/shadows';

const settings = [
  { id: '1', label: 'Personal Info', icon: 'user' },
  { id: '2', label: 'Reminders', icon: 'bell' },
  { id: '3', label: 'Health Preferences', icon: 'heart' },
  { id: '4', label: 'Security & Login', icon: 'shield' },
];

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Feather name="user" size={26} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.name}>Alex Morgan</Text>
          <Text style={styles.email}>alex@neemcare.com</Text>
        </View>
      </View>

      <View style={styles.card}>
        {settings.map((item) => (
          <PressableScale key={item.id} style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Feather name={item.icon as keyof typeof Feather.glyphMap} size={18} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </PressableScale>
        ))}
      </View>

      <PressableScale style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: typography.heading,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: typography.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    fontFamily: typography.subheading,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  logoutText: {
    fontFamily: typography.subheading,
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
});
