import { Dimensions, Modal, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import AddMedicationIcon from '../../assets/icons/add medication.svg';
import MonitoringIcon from '../../assets/icons/monitoring.svg';
import AccountIcon from '../../assets/icons/account.svg';

interface QuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const actions = [
  {
    id: 'medicine',
    label: 'Add Medicine',
    emoji: '💊',
    Icon: AddMedicationIcon,
    gradient: ['#EEF4FF', '#DBEAFE'],
    iconColor: '#1E6AE1',
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    emoji: '🩺',
    Icon: MonitoringIcon,
    gradient: ['#ECFDF5', '#D1FAE5'],
    iconColor: '#059669',
  },
  {
    id: 'profile',
    label: 'Profile',
    emoji: '👤',
    Icon: AccountIcon,
    gradient: ['#F5F3FF', '#EDE9FE'],
    iconColor: '#7C3AED',
  },
];

export function QuickActionsModal({ visible, onClose }: QuickActionsModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.container}>
        {/* Blur backdrop — tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <BlurView intensity={50} tint="dark" style={styles.blurOverlay} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <View style={styles.sheetWrap}>
          {/* Glass background for the sheet */}
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Quick Actions</Text>
                <Text style={styles.subtitle}>Fast access to your health tools</Text>
              </View>
              <PressableScale onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </PressableScale>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* 3-Column Grid */}
            <View style={styles.grid}>
              {actions.map(({ id, label, Icon, iconColor, gradient }) => (
                <PressableScale key={id} style={styles.card}>
                  {/* Glass card background */}
                  <View style={[styles.cardInner, { backgroundColor: gradient[0] }]}>
                    <View style={[styles.iconCircle, { backgroundColor: gradient[1] }]}>
                      <Icon width={28} height={28} color={iconColor} />
                    </View>
                    <Text style={styles.cardLabel}>{label}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Sheet positioning
  sheetWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 140,
  },
  sheet: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    // Glass border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    gap: 12,
  },

  // Card
  card: {
    flex: 1,
  },
  cardInner: {
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 12,
    // Glass effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // Inner shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontFamily: typography.subheading,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
