import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { PressableScale } from '../components/PressableScale';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// In-memory user profile (no backend yet)
let userProfile = {
  name: 'Alex Morgan',
  email: 'alex@neemcare.com',
  gender: 'Male',
  age: 60,
  height: 165,
  startingWeight: 90,
  targetWeight: 87,
  language: 'English',
};

export function getUserProfile() { return userProfile; }
export function setUserProfile(p: typeof userProfile) { userProfile = p; }

interface EditField {
  key: keyof typeof userProfile;
  label: string;
  type: 'text' | 'number' | 'select';
  unit?: string;
  options?: string[];
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState({ ...userProfile });
  const [editModal, setEditModal] = useState<EditField | null>(null);
  const [editValue, setEditValue] = useState('');
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const backdropAnim = useState(new Animated.Value(0))[0];

  const openEditModal = (field: EditField) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditModal(field);
    setEditValue(String(profile[field.key]));
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeEditModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setEditModal(null);
      setEditValue('');
    });
  };

  const saveEdit = () => {
    if (editModal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newProfile = { ...profile };
      if (editModal.type === 'number') {
        (newProfile as any)[editModal.key] = parseInt(editValue) || 0;
      } else {
        (newProfile as any)[editModal.key] = editValue;
      }
      setProfile(newProfile);
      setUserProfile(newProfile);
      closeEditModal();
    }
  };

  const selectOption = (option: string) => {
    if (editModal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newProfile = { ...profile };
      (newProfile as any)[editModal.key] = option;
      setProfile(newProfile);
      setUserProfile(newProfile);
      closeEditModal();
    }
  };

  const personalFields: EditField[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'height', label: 'Height', type: 'number', unit: 'cm' },
    { key: 'startingWeight', label: 'Starting weight', type: 'number', unit: 'kg' },
    { key: 'targetWeight', label: 'Target weight', type: 'number', unit: 'kg' },
  ];

  const formatValue = (field: EditField) => {
    const val = profile[field.key];
    if (field.unit) return `${val} ${field.unit}`;
    return String(val);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#1E6AE1', '#1756B8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <PressableScale
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </PressableScale>
          <Text style={styles.headerTitle}>Profile & Account</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={styles.avatarName}>{profile.name}</Text>
          <Text style={styles.avatarEmail}>{profile.email}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Personal Details ───────────────── */}
        <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>
        <View style={styles.card}>
          {personalFields.map((field, index) => (
            <View key={field.key}>
              {index > 0 && <View style={styles.divider} />}
              <PressableScale
                style={styles.row}
                onPress={() => openEditModal(field)}
              >
                <Text style={styles.rowLabel}>{field.label}</Text>
                <View style={styles.rowRight}>
                  <Text style={styles.rowValue}>{formatValue(field)}</Text>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </View>
              </PressableScale>
            </View>
          ))}
        </View>

        {/* ─── Account ────────────────────────── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <PressableScale style={styles.row}>
            <View style={styles.rowIconLeft}>
              <View style={[styles.rowIconBox, { backgroundColor: '#E8F0FD' }]}>
                <Feather name="mail" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.rowLabel}>Change email</Text>
                <Text style={styles.rowSubLabel}>{profile.email}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale style={styles.row}>
            <View style={styles.rowIconLeft}>
              <View style={[styles.rowIconBox, { backgroundColor: '#FEF6E8' }]}>
                <Feather name="lock" size={16} color={colors.warning} />
              </View>
              <Text style={styles.rowLabel}>Change password</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale style={styles.row}>
            <View style={styles.rowIconLeft}>
              <View style={[styles.rowIconBox, { backgroundColor: '#E9F7EF' }]}>
                <Feather name="shield" size={16} color={colors.success} />
              </View>
              <Text style={styles.rowLabel}>Account privacy</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </PressableScale>
        </View>

        {/* ─── Language ───────────────────────── */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <PressableScale
            style={styles.row}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Language');
            }}
          >
            <View style={styles.rowIconLeft}>
              <View style={[styles.rowIconBox, { backgroundColor: '#F5F3FF' }]}>
                <MaterialCommunityIcons name="translate" size={16} color="#8B5CF6" />
              </View>
              <Text style={styles.rowLabel}>Language</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{profile.language}</Text>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </View>
          </PressableScale>
        </View>

        {/* ─── About ─────────────────────────── */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <PressableScale
            style={styles.row}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('About');
            }}
          >
            <View style={styles.rowIconLeft}>
              <View style={[styles.rowIconBox, { backgroundColor: colors.surfaceAlt }]}>
                <Feather name="file-text" size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.rowLabel}>About MyDiabetes</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </PressableScale>
        </View>

        {/* ─── Logout ────────────────────────── */}
        <PressableScale style={styles.logoutButton}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </PressableScale>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* ─── Edit Modal ────────────────────── */}
      {editModal && (
        <Modal
          visible={!!editModal}
          transparent
          animationType="none"
          onRequestClose={closeEditModal}
          statusBarTranslucent
        >
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={closeEditModal} />
          </Animated.View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
            pointerEvents="box-none"
          >
            <Animated.View
              style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.dragHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit {editModal.label.toLowerCase()}</Text>
                <PressableScale onPress={closeEditModal} style={styles.modalCloseBtn}>
                  <View style={styles.modalCloseBg}>
                    <Feather name="x" size={18} color={colors.textSecondary} />
                  </View>
                </PressableScale>
              </View>

              {editModal.type === 'select' ? (
                <View style={styles.selectContainer}>
                  {editModal.options?.map((option) => (
                    <PressableScale
                      key={option}
                      style={[
                        styles.selectOption,
                        option === String(profile[editModal.key]) && styles.selectOptionActive,
                      ]}
                      onPress={() => selectOption(option)}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        option === String(profile[editModal.key]) && styles.selectOptionTextActive,
                      ]}>
                        {option}
                      </Text>
                      {option === String(profile[editModal.key]) && (
                        <Feather name="check" size={20} color={colors.primary} />
                      )}
                    </PressableScale>
                  ))}
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.editInput}
                      value={editValue}
                      onChangeText={setEditValue}
                      keyboardType={editModal.type === 'number' ? 'numeric' : 'default'}
                      autoFocus
                      placeholderTextColor={colors.textMuted}
                      placeholder={`Enter ${editModal.label.toLowerCase()}`}
                    />
                    {editModal.unit && (
                      <Text style={styles.inputUnit}>{editModal.unit}</Text>
                    )}
                  </View>
                  <PressableScale style={styles.saveButton} onPress={saveEdit}>
                    <LinearGradient
                      colors={['#1E6AE1', '#1756B8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.saveButtonGradient}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </LinearGradient>
                  </PressableScale>
                </View>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // ─── Header ────────────────────────────
  headerGradient: {
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: '#FFFFFF',
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 4,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInitials: {
    fontFamily: typography.heading,
    fontSize: 26,
    color: '#FFFFFF',
  },
  avatarName: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  avatarEmail: {
    fontFamily: typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  // ─── Scrollable Content ────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontFamily: typography.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 20,
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLabel: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowSubLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontFamily: typography.subheading,
    fontSize: 15,
    color: colors.textSecondary,
  },
  rowIconLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  // ─── Logout ────────────────────────────
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.errorSoft,
    marginTop: 8,
  },
  logoutText: {
    fontFamily: typography.subheading,
    fontSize: 15,
    color: colors.error,
  },
  versionText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  // ─── Modal ─────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 27, 51, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    shadowColor: '#0E1B33',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  modalTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: colors.textPrimary,
  },
  modalCloseBtn: {},
  modalCloseBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  selectOptionText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectOptionTextActive: {
    fontFamily: typography.subheading,
    color: colors.primary,
  },
  inputContainer: {
    paddingHorizontal: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  editInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 16,
  },
  inputUnit: {
    fontFamily: typography.subheading,
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 8,
  },
  saveButton: {
    borderRadius: 30,
    overflow: 'hidden',
    ...shadows.card,
  },
  saveButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  saveButtonText: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
