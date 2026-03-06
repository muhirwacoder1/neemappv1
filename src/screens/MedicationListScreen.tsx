import { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable,
    ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import {
    getMedications,
    getTodaysDoses,
    logDose,
    deactivateMedication,
    Medication,
    MedicationDoseLog,
} from '../services/medication';

import PillsIcon from '../../assets/icons/pills.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ── Form icons ─────────────────────────────────────────────────────
const FORM_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
    pill: 'disc',
    injection: 'droplet',
    liquid: 'coffee',
    inhaler: 'wind',
};

// ── Main Component ─────────────────────────────────────────────────
export function MedicationListScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();

    const [medications, setMedications] = useState<Medication[]>([]);
    const [todayDoses, setTodayDoses] = useState<MedicationDoseLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Reload on focus
    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            let active = true;
            (async () => {
                try {
                    const [meds, doses] = await Promise.all([
                        getMedications(user.uid),
                        getTodaysDoses(user.uid),
                    ]);
                    if (active) {
                        setMedications(meds);
                        setTodayDoses(doses);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    if (active) setLoading(false);
                }
            })();
            return () => { active = false; };
        }, [user]),
    );

    const isTakenToday = (medId: string) =>
        todayDoses.some((d) => d.medicationId === medId && d.status === 'taken');

    const handleTakeDose = async (med: Medication) => {
        if (!user || !med.id) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            await logDose(user.uid, med.id, med.name, 'taken');
            setTodayDoses((prev) => [
                { medicationId: med.id!, medicationName: med.name, status: 'taken' } as MedicationDoseLog,
                ...prev,
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const handleSkipDose = async (med: Medication) => {
        if (!user || !med.id) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await logDose(user.uid, med.id, med.name, 'skipped');
            setTodayDoses((prev) => [
                { medicationId: med.id!, medicationName: med.name, status: 'skipped' } as MedicationDoseLog,
                ...prev,
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const handleDeactivate = (med: Medication) => {
        if (!user || !med.id) return;
        Alert.alert(
            'Remove Medication',
            `Stop tracking "${med.name}"? You can add it again later.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deactivateMedication(user.uid, med.id!);
                            setMedications((prev) => prev.filter((m) => m.id !== med.id));
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    },
                },
            ],
        );
    };

    const takenCount = medications.filter((m) => isTakenToday(m.id!)).length;

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Pressable
                    hitSlop={12}
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="chevron-left" size={26} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Medications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Summary Card ── */}
                <LinearGradient
                    colors={['#EBF4FF', '#F0F4FF']}
                    style={styles.summaryCard}
                >
                    <View style={styles.summaryIconWrap}>
                        <PillsIcon width={28} height={28} />
                    </View>
                    <View style={styles.summaryTexts}>
                        <Text style={styles.summaryTitle}>
                            {takenCount} of {medications.length} taken today
                        </Text>
                        <Text style={styles.summarySub}>
                            {medications.length === 0
                                ? 'Add your first medication below'
                                : takenCount === medications.length
                                    ? 'All done for today! 🎉'
                                    : 'Tap the check to mark as taken'}
                        </Text>
                    </View>
                </LinearGradient>

                {/* ── Loading ── */}
                {loading && (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                )}

                {/* ── Empty State ── */}
                {!loading && medications.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Feather name="plus-circle" size={40} color={colors.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>No medications yet</Text>
                        <Text style={styles.emptySub}>
                            Add your medications to track them daily and set reminders.
                        </Text>
                    </View>
                )}

                {/* ── Medication Cards ── */}
                {medications.map((med) => {
                    const taken = isTakenToday(med.id!);
                    const formIcon = FORM_ICONS[med.form] || 'disc';

                    return (
                        <View
                            key={med.id}
                            style={[styles.medCard, taken && styles.medCardTaken]}
                        >
                            <View style={styles.medCardHeader}>
                                {/* Icon */}
                                <View style={[styles.medIconWrap, taken && styles.medIconWrapTaken]}>
                                    <Feather
                                        name={formIcon}
                                        size={18}
                                        color={taken ? '#fff' : colors.primary}
                                    />
                                </View>

                                {/* Info */}
                                <View style={styles.medInfo}>
                                    <Text style={styles.medName}>{med.name}</Text>
                                    <Text style={styles.medDosage}>
                                        {med.dosage} {med.unit} · {med.form}
                                    </Text>
                                </View>

                                {/* More menu */}
                                <Pressable
                                    hitSlop={12}
                                    onPress={() => handleDeactivate(med)}
                                >
                                    <Feather name="more-horizontal" size={20} color={colors.textMuted} />
                                </Pressable>
                            </View>

                            {/* Schedule info */}
                            <View style={styles.medSchedule}>
                                <View style={styles.scheduleChip}>
                                    <Feather name="clock" size={12} color={colors.textSecondary} />
                                    <Text style={styles.scheduleText}>
                                        {med.times?.join(', ') || '08:00 AM'}
                                    </Text>
                                </View>
                                <View style={styles.scheduleChip}>
                                    <Feather name="repeat" size={12} color={colors.textSecondary} />
                                    <Text style={styles.scheduleText}>{med.frequency}</Text>
                                </View>
                            </View>

                            {/* Actions */}
                            <View style={styles.medActions}>
                                {taken ? (
                                    <View style={styles.takenBadge}>
                                        <Feather name="check-circle" size={16} color="#4CAF50" />
                                        <Text style={styles.takenText}>Taken today</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Pressable
                                            style={styles.takeBtn}
                                            onPress={() => handleTakeDose(med)}
                                        >
                                            <Feather name="check" size={16} color="#fff" />
                                            <Text style={styles.takeBtnText}>Take</Text>
                                        </Pressable>
                                        <Pressable
                                            style={styles.skipBtn}
                                            onPress={() => handleSkipDose(med)}
                                        >
                                            <Text style={styles.skipBtnText}>Skip</Text>
                                        </Pressable>
                                    </>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* ── FAB ── */}
            <Pressable
                style={[styles.fab, { bottom: insets.bottom + 24 }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    navigation.navigate('AddMedication');
                }}
            >
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fabGradient}
                >
                    <Feather name="plus" size={22} color="#fff" />
                    <Text style={styles.fabText}>Add Medication</Text>
                </LinearGradient>
            </Pressable>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: typography.heading, fontSize: 17, color: colors.textPrimary },

    scrollContent: { padding: 16, gap: 12 },

    // Summary
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        gap: 14,
    },
    summaryIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    summaryTexts: { flex: 1 },
    summaryTitle: { fontFamily: typography.heading, fontSize: 16, color: colors.textPrimary },
    summarySub: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },

    // Loading
    loadingWrap: { paddingVertical: 40, alignItems: 'center' },

    // Empty
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: { fontFamily: typography.heading, fontSize: 18, color: colors.textPrimary, marginBottom: 8 },
    emptySub: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Medication card
    medCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 18,
        gap: 14,
        ...shadows.soft,
    },
    medCardTaken: {
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
        backgroundColor: 'rgba(76, 175, 80, 0.03)',
    },
    medCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    medIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    medIconWrapTaken: {
        backgroundColor: '#4CAF50',
    },
    medInfo: { flex: 1 },
    medName: { fontFamily: typography.heading, fontSize: 16, color: colors.textPrimary },
    medDosage: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },

    // Schedule
    medSchedule: {
        flexDirection: 'row',
        gap: 10,
    },
    scheduleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
    },
    scheduleText: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary },

    // Actions
    medActions: {
        flexDirection: 'row',
        gap: 10,
    },
    takeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    takeBtnText: { fontFamily: typography.subheading, fontSize: 14, color: '#fff' },
    skipBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
    },
    skipBtnText: { fontFamily: typography.subheading, fontSize: 14, color: colors.textSecondary },
    takenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    takenText: { fontFamily: typography.subheading, fontSize: 14, color: '#4CAF50' },

    // FAB
    fab: {
        position: 'absolute',
        left: 16,
        right: 16,
        borderRadius: 16,
        overflow: 'hidden',
        ...shadows.card,
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: 16,
    },
    fabText: { fontFamily: typography.heading, fontSize: 16, color: '#fff' },
});
