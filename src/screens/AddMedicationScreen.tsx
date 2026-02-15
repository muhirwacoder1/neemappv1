import { useState } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable, TextInput,
    Switch, Platform, KeyboardAvoidingView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList } from '../navigation/types';

import PillsIcon from '../../assets/icons/pills.svg';
import AddMedicationIcon from '../../assets/icons/add medication.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ── Data ────────────────────────────────────────────────────────────
const MEDICINE_FORMS: { id: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: 'pill', label: 'Pill', icon: 'disc' },
    { id: 'injection', label: 'Injection', icon: 'droplet' },
    { id: 'liquid', label: 'Liquid', icon: 'coffee' },
    { id: 'inhaler', label: 'Inhaler', icon: 'wind' },
];

const DOSAGE_UNITS = ['mg', 'IU', 'tablets', 'ml', 'mcg'];

const FREQUENCY_OPTIONS = [
    { id: 'once', label: 'Once daily' },
    { id: 'twice', label: 'Twice daily' },
    { id: 'three', label: '3× daily' },
    { id: 'custom', label: 'Custom' },
];

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const REMINDER_TIMINGS = ['At time', '5 min', '15 min', '30 min'];

// ── Main Component ──────────────────────────────────────────────────

export function AddMedicationScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    // ─ Form state
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [dosageUnit, setDosageUnit] = useState('mg');
    const [medicineForm, setMedicineForm] = useState('pill');
    const [frequency, setFrequency] = useState('once');
    const [selectedDays, setSelectedDays] = useState<string[]>([...DAYS_FULL]);
    const [time, setTime] = useState('08:00 AM');
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTiming, setReminderTiming] = useState('At time');
    const [startDate] = useState('Feb 10, 2026');
    const [endDate] = useState('');
    const [notes, setNotes] = useState('');

    const toggleDay = (day: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);
    };

    const canSave = name.trim().length > 0 && dosage.trim().length > 0;

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
    };

    // ─ Render
    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* ───── Header ───── */}
            <View style={styles.header}>
                <Pressable
                    hitSlop={12}
                    style={styles.headerBtn}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack(); }}
                >
                    <Feather name="chevron-left" size={26} color={colors.textPrimary} />
                </Pressable>

                <Text style={styles.headerTitle}>Add Medication</Text>

                <Pressable
                    style={[styles.headerSaveBtn, !canSave && styles.headerSaveBtnOff]}
                    disabled={!canSave}
                    onPress={handleSave}
                >
                    <Text style={[styles.headerSaveText, !canSave && styles.headerSaveTextOff]}>Save</Text>
                </Pressable>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ───── Hero Banner ───── */}
                    <LinearGradient
                        colors={[colors.primarySoft, '#E0ECFF', colors.background]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroBanner}
                    >
                        <View style={styles.heroIconWrap}>
                            <AddMedicationIcon width={40} height={40} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.heroTitle}>New Medication</Text>
                            <Text style={styles.heroSub}>Fill in the details to track your medicine</Text>
                        </View>
                    </LinearGradient>

                    {/* ═══════════ MEDICATION INFO ═══════════ */}
                    <Text style={styles.sectionHeader}>Medication Info</Text>

                    <View style={styles.card}>
                        {/* Name */}
                        <Text style={styles.label}>Medication name</Text>
                        <View style={styles.searchField}>
                            <Feather name="search" size={16} color={colors.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search medication..."
                                placeholderTextColor={colors.textMuted}
                                value={name}
                                onChangeText={setName}
                            />
                            {name.length > 0 && (
                                <Pressable onPress={() => setName('')} hitSlop={8}>
                                    <Feather name="x-circle" size={16} color={colors.textMuted} />
                                </Pressable>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {/* Dosage */}
                        <Text style={styles.label}>Dosage</Text>
                        <View style={styles.dosageContainer}>
                            <View style={styles.dosageField}>
                                <TextInput
                                    style={styles.dosageInput}
                                    placeholder="e.g. 500"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    value={dosage}
                                    onChangeText={setDosage}
                                />
                            </View>
                            <View style={styles.unitRow}>
                                {DOSAGE_UNITS.map(u => (
                                    <Pressable
                                        key={u}
                                        style={[styles.unitPill, dosageUnit === u && styles.unitPillOn]}
                                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDosageUnit(u); }}
                                    >
                                        <Text style={[styles.unitPillText, dosageUnit === u && styles.unitPillTextOn]}>{u}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Form */}
                        <Text style={styles.label}>Medicine form</Text>
                        <View style={styles.formRow}>
                            {MEDICINE_FORMS.map(f => {
                                const on = medicineForm === f.id;
                                return (
                                    <Pressable
                                        key={f.id}
                                        style={[styles.formCard, on && styles.formCardOn]}
                                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMedicineForm(f.id); }}
                                    >
                                        <View style={[styles.formCircle, on && styles.formCircleOn]}>
                                            <Feather name={f.icon} size={18} color={on ? '#fff' : colors.textSecondary} />
                                        </View>
                                        <Text style={[styles.formText, on && styles.formTextOn]}>{f.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* ═══════════ SCHEDULE ═══════════ */}
                    <Text style={styles.sectionHeader}>Schedule</Text>

                    <View style={styles.card}>
                        {/* Frequency */}
                        <Text style={styles.label}>Frequency</Text>
                        <View style={styles.freqRow}>
                            {FREQUENCY_OPTIONS.map(f => {
                                const on = frequency === f.id;
                                return (
                                    <Pressable
                                        key={f.id}
                                        style={[styles.freqPill, on && styles.freqPillOn]}
                                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFrequency(f.id); }}
                                    >
                                        <Text style={[styles.freqText, on && styles.freqTextOn]}>{f.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.divider} />

                        {/* Time */}
                        <Text style={styles.label}>Time</Text>
                        <Pressable style={styles.timeRow}>
                            <View style={styles.timeIconWrap}>
                                <Feather name="clock" size={16} color={colors.primary} />
                            </View>
                            <Text style={styles.timeValue}>{time}</Text>
                            <Feather name="chevron-down" size={18} color={colors.textMuted} />
                        </Pressable>

                        {frequency === 'twice' && (
                            <Pressable style={[styles.timeRow, { marginTop: 10 }]}>
                                <View style={styles.timeIconWrap}>
                                    <Feather name="clock" size={16} color={colors.primary} />
                                </View>
                                <Text style={styles.timeValue}>08:00 PM</Text>
                                <Feather name="chevron-down" size={18} color={colors.textMuted} />
                            </Pressable>
                        )}

                        <View style={styles.divider} />

                        {/* Days */}
                        <Text style={styles.label}>Repeat on</Text>
                        <View style={styles.daysRow}>
                            {DAYS_FULL.map((d, i) => {
                                const on = selectedDays.includes(d);
                                return (
                                    <Pressable
                                        key={d}
                                        style={[styles.dayCircle, on && styles.dayCircleOn]}
                                        onPress={() => toggleDay(d)}
                                    >
                                        <Text style={[styles.dayLetter, on && styles.dayLetterOn]}>{DAYS_SHORT[i]}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* ═══════════ REMINDERS ═══════════ */}
                    <Text style={styles.sectionHeader}>Reminders</Text>

                    <View style={styles.card}>
                        <View style={styles.switchRow}>
                            <View style={styles.switchInfo}>
                                <View style={styles.bellWrap}>
                                    <Feather name="bell" size={16} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.switchTitle}>Push notifications</Text>
                                    <Text style={styles.switchSub}>Get reminded to take your meds</Text>
                                </View>
                            </View>
                            <Switch
                                value={reminderEnabled}
                                onValueChange={v => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReminderEnabled(v); }}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.surface}
                                ios_backgroundColor={colors.border}
                            />
                        </View>

                        {reminderEnabled && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.label}>Notify me</Text>
                                <View style={styles.freqRow}>
                                    {REMINDER_TIMINGS.map(t => {
                                        const on = reminderTiming === t;
                                        return (
                                            <Pressable
                                                key={t}
                                                style={[styles.freqPill, on && styles.freqPillOn]}
                                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReminderTiming(t); }}
                                            >
                                                <Text style={[styles.freqText, on && styles.freqTextOn]}>{t}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </>
                        )}
                    </View>

                    {/* ═══════════ DURATION ═══════════ */}
                    <Text style={styles.sectionHeader}>Duration</Text>

                    <View style={styles.card}>
                        <View style={styles.dateGrid}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Start date</Text>
                                <Pressable style={styles.dateField}>
                                    <Feather name="calendar" size={15} color={colors.primary} />
                                    <Text style={styles.dateValue}>{startDate}</Text>
                                </Pressable>
                            </View>
                            <View style={styles.dateArrow}>
                                <Feather name="arrow-right" size={16} color={colors.textMuted} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>End date</Text>
                                <Pressable style={styles.dateField}>
                                    <Feather name="calendar" size={15} color={colors.primary} />
                                    <Text style={[styles.dateValue, !endDate && { color: colors.textMuted }]}>
                                        {endDate || 'Ongoing'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* ═══════════ NOTES ═══════════ */}
                    <Text style={styles.sectionHeader}>Notes</Text>

                    <View style={styles.card}>
                        <TextInput
                            style={styles.notesField}
                            placeholder="e.g. Take with food, avoid grapefruit…"
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ───── Sticky Bottom ───── */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                <Pressable
                    style={({ pressed }) => [styles.saveButton, !canSave && styles.saveButtonOff, pressed && canSave && { opacity: 0.92 }]}
                    disabled={!canSave}
                    onPress={handleSave}
                >
                    <LinearGradient
                        colors={canSave ? [colors.primary, colors.primaryDark] : [colors.textMuted, colors.textMuted]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.saveGradient}
                    >
                        <PillsIcon width={20} height={20} color="#fff" />
                        <Text style={styles.saveText}>Save Medication</Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },

    // ─ Header
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
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: typography.heading, fontSize: 17, color: colors.textPrimary },
    headerSaveBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.primary,
    },
    headerSaveBtnOff: { backgroundColor: colors.surfaceAlt },
    headerSaveText: { fontFamily: typography.subheading, fontSize: 14, color: '#fff' },
    headerSaveTextOff: { color: colors.textMuted },

    // ─ Scroll
    scrollContent: { padding: 16, gap: 8 },

    // ─ Hero
    heroBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        gap: 14,
        marginBottom: 4,
    },
    heroIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    heroTitle: { fontFamily: typography.heading, fontSize: 18, color: colors.textPrimary },
    heroSub: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },

    // ─ Section
    sectionHeader: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
        marginTop: 14,
        marginBottom: 6,
        marginLeft: 4,
    },

    // ─ Card
    card: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 18,
        ...shadows.soft,
    },

    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 16 },

    // ─ Labels
    label: { fontFamily: typography.subheading, fontSize: 12, color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },

    // ─ Search field
    searchField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        gap: 8,
    },
    searchInput: { flex: 1, fontFamily: typography.body, fontSize: 15, color: colors.textPrimary },

    // ─ Dosage
    dosageContainer: { gap: 12 },
    dosageField: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        justifyContent: 'center',
    },
    dosageInput: { fontFamily: typography.body, fontSize: 15, color: colors.textPrimary },
    unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    unitPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    unitPillOn: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    unitPillText: { fontFamily: typography.subheading, fontSize: 13, color: colors.textSecondary },
    unitPillTextOn: { color: colors.primary },

    // ─ Medicine form
    formRow: { flexDirection: 'row', gap: 10 },
    formCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: colors.surfaceAlt,
        gap: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    formCardOn: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    formCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    formCircleOn: { backgroundColor: colors.primary },
    formText: { fontFamily: typography.body, fontSize: 12, color: colors.textSecondary },
    formTextOn: { fontFamily: typography.subheading, color: colors.primary },

    // ─ Frequency pills
    freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    freqPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    freqPillOn: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    freqText: { fontFamily: typography.subheading, fontSize: 13, color: colors.textSecondary },
    freqTextOn: { color: colors.primary },

    // ─ Time row
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        gap: 10,
    },
    timeIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeValue: { flex: 1, fontFamily: typography.subheading, fontSize: 15, color: colors.textPrimary },

    // ─ Days
    daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dayCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    dayCircleOn: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    dayLetter: { fontFamily: typography.subheading, fontSize: 13, color: colors.textSecondary },
    dayLetterOn: { color: colors.primary },

    // ─ Switch row
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    switchInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
    bellWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    switchTitle: { fontFamily: typography.subheading, fontSize: 15, color: colors.textPrimary },
    switchSub: { fontFamily: typography.body, fontSize: 12, color: colors.textMuted, marginTop: 1 },

    // ─ Date grid
    dateGrid: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    dateField: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
    },
    dateValue: { fontFamily: typography.body, fontSize: 14, color: colors.textPrimary },
    dateArrow: { paddingBottom: 14 },

    // ─ Notes
    notesField: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        padding: 14,
        minHeight: 100,
    },

    // ─ Bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    saveButton: {
        borderRadius: 16,
        overflow: 'hidden',
        ...shadows.card,
    },
    saveButtonOff: { opacity: 0.45 },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: 16,
    },
    saveText: { fontFamily: typography.heading, fontSize: 16, color: '#fff' },
});
