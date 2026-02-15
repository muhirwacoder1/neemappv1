import { useState, useMemo } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable, Image,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList } from '../navigation/types';
import { DOCTORS } from './AppointmentsScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'DoctorDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Calendar helpers ────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function getWeekDays(baseDate: Date): { label: string; day: number; date: Date }[] {
    const start = new Date(baseDate);
    // Go to Sunday of that week
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push({ label: DAY_LABELS[i], day: d.getDate(), date: d });
    }
    return days;
}

// ── Time slots ──────────────────────────────────────────────────────

const ALL_TIME_SLOTS = [
    '8:00 AM', '9:00 AM', '9:30 AM', '10:00 AM',
    '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM',
];

const UNAVAILABLE = new Set(['10:30 AM', '2:00 PM']);

// ── Main Screen ─────────────────────────────────────────────────────

export function DoctorDetailScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<DetailRoute>();
    const doctor = DOCTORS.find(d => d.id === route.params.doctorId);

    const [isFavorite, setIsFavorite] = useState(false);
    const [showFullAbout, setShowFullAbout] = useState(false);

    // Calendar state
    const today = useMemo(() => new Date(), []);
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(today);

    const currentWeek = useMemo(() => {
        const base = new Date(today);
        base.setDate(base.getDate() + weekOffset * 7);
        return getWeekDays(base);
    }, [today, weekOffset]);

    const displayMonth = useMemo(() => {
        const mid = currentWeek[3];
        return `${MONTH_NAMES[mid.date.getMonth()]} ${mid.date.getFullYear()}`;
    }, [currentWeek]);

    // Time slot state
    const [selectedTime, setSelectedTime] = useState('9:30 AM');

    if (!doctor) {
        return (
            <View style={[styles.root, { paddingTop: insets.top }]}>
                <Text style={{ padding: 24, fontSize: 16 }}>Doctor not found.</Text>
            </View>
        );
    }

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Pressable
                    hitSlop={12}
                    style={styles.headerBtn}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                >
                    <Feather name="chevron-left" size={26} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Doctor Details</Text>
                <Pressable
                    hitSlop={12}
                    style={styles.headerBtn}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setIsFavorite(f => !f);
                    }}
                >
                    <Feather
                        name="heart"
                        size={22}
                        color={isFavorite ? '#E74C3C' : colors.textMuted}
                    />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Doctor Profile ── */}
                <View style={styles.profileSection}>
                    <View style={styles.profileLeft}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.doctorPrice}>
                            <Text style={styles.priceValue}>{doctor.price}</Text>
                            <Text style={styles.priceUnit}> /session</Text>
                        </Text>
                    </View>
                    <Image source={{ uri: doctor.image }} style={styles.profileImage} />
                </View>

                {/* ── Stats Row ── */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{doctor.patients}</Text>
                        <Text style={styles.statLabel}>Patients</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardMiddle]}>
                        <Text style={styles.statValue}>{doctor.experience}</Text>
                        <Text style={styles.statLabel}>Experience</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{doctor.rating}</Text>
                        <Text style={styles.statLabel}>Ratings</Text>
                    </View>
                </View>

                {/* ── Divider ── */}
                <View style={styles.divider} />

                {/* ── About Doctor ── */}
                <View style={styles.aboutSection}>
                    <Text style={styles.aboutTitle}>About Doctor</Text>
                    <Text style={styles.aboutText} numberOfLines={showFullAbout ? undefined : 3}>
                        {doctor.about}
                    </Text>
                    <Pressable
                        onPress={() => {
                            setShowFullAbout(v => !v);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                    >
                        <Text style={styles.readMore}>
                            {showFullAbout ? 'Show less' : 'Read more...'}
                        </Text>
                    </Pressable>
                </View>

                {/* ── Select Date ── */}
                <View style={styles.dateSection}>
                    <View style={styles.dateSectionHeader}>
                        <Text style={styles.dateSectionTitle}>Select Date</Text>
                        <View style={styles.monthNav}>
                            <Pressable
                                onPress={() => {
                                    setWeekOffset(w => w - 1);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={styles.monthNavBtn}
                            >
                                <Feather name="chevron-left" size={18} color={colors.textSecondary} />
                            </Pressable>
                            <Text style={styles.monthLabel}>{displayMonth}</Text>
                            <Pressable
                                onPress={() => {
                                    setWeekOffset(w => w + 1);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={styles.monthNavBtn}
                            >
                                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.calendarRow}>
                        {currentWeek.map(item => {
                            const isSelected = isSameDay(item.date, selectedDate);
                            const isToday = isSameDay(item.date, today);
                            return (
                                <Pressable
                                    key={item.date.toISOString()}
                                    style={[
                                        styles.calendarDay,
                                        isSelected && styles.calendarDaySelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedDate(item.date);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.calendarDayLabel,
                                            isSelected && styles.calendarDayLabelSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.calendarDayNum,
                                            isSelected && styles.calendarDayNumSelected,
                                        ]}
                                    >
                                        {item.day}
                                    </Text>
                                    {isToday && !isSelected && <View style={styles.todayDot} />}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* ── Select Time ── */}
                <View style={styles.timeSection}>
                    <View style={styles.dateSectionHeader}>
                        <Text style={styles.dateSectionTitle}>Select Time</Text>
                        <Text style={styles.slotsCount}>
                            {ALL_TIME_SLOTS.length - UNAVAILABLE.size} Slots
                        </Text>
                    </View>

                    <View style={styles.timeGrid}>
                        {ALL_TIME_SLOTS.map(slot => {
                            const isUnavailable = UNAVAILABLE.has(slot);
                            const isActive = selectedTime === slot && !isUnavailable;
                            return (
                                <Pressable
                                    key={slot}
                                    style={[
                                        styles.timeSlot,
                                        isActive && styles.timeSlotActive,
                                        isUnavailable && styles.timeSlotDisabled,
                                    ]}
                                    onPress={() => {
                                        if (isUnavailable) return;
                                        setSelectedTime(slot);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    disabled={isUnavailable}
                                >
                                    <Text
                                        style={[
                                            styles.timeSlotText,
                                            isActive && styles.timeSlotTextActive,
                                            isUnavailable && styles.timeSlotTextDisabled,
                                        ]}
                                    >
                                        {slot}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* spacer for bottom button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── Bottom CTA ── */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
                <Pressable
                    style={styles.chatBtn}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                    <Feather name="message-circle" size={22} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.bookBtn,
                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
                >
                    <Text style={styles.bookBtnText}>Book an Appointment</Text>
                </Pressable>
            </View>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.surface },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.surface,
    },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: typography.heading, fontSize: 17, color: colors.textPrimary },

    scrollContent: {
        paddingHorizontal: 24,
    },

    // Profile
    profileSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingTop: 8,
    },
    profileLeft: {
        flex: 1,
        paddingRight: 16,
    },
    doctorName: {
        fontFamily: typography.heading,
        fontSize: 26,
        color: colors.textPrimary,
        lineHeight: 32,
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        marginBottom: 14,
    },
    doctorPrice: {
        marginTop: 4,
    },
    priceValue: {
        fontFamily: typography.heading,
        fontSize: 24,
        color: colors.primary,
    },
    priceUnit: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textMuted,
    },
    profileImage: {
        width: 120,
        height: 140,
        borderRadius: 20,
        backgroundColor: colors.surfaceAlt,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statCardMiddle: {
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    statValue: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginBottom: 20,
    },

    // About
    aboutSection: {
        marginBottom: 28,
    },
    aboutTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
        marginBottom: 10,
    },
    aboutText: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 23,
    },
    readMore: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.primary,
        marginTop: 6,
    },

    // Date
    dateSection: {
        marginBottom: 28,
    },
    dateSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateSectionTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    monthNavBtn: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthLabel: {
        fontFamily: typography.subheading,
        fontSize: 13,
        color: colors.textSecondary,
    },
    slotsCount: {
        fontFamily: typography.subheading,
        fontSize: 13,
        color: colors.textMuted,
    },

    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    calendarDay: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 16,
        minWidth: (SCREEN_WIDTH - 48 - 36) / 7,
    },
    calendarDaySelected: {
        backgroundColor: colors.primary,
    },
    calendarDayLabel: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 6,
    },
    calendarDayLabelSelected: {
        color: 'rgba(255,255,255,0.8)',
    },
    calendarDayNum: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
    },
    calendarDayNumSelected: {
        color: '#FFFFFF',
    },
    todayDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 4,
    },

    // Time
    timeSection: {
        marginBottom: 12,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    timeSlot: {
        width: (SCREEN_WIDTH - 48 - 24) / 3,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
    },
    timeSlotActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    timeSlotDisabled: {
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        opacity: 0.5,
    },
    timeSlotText: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.textPrimary,
    },
    timeSlotTextActive: {
        color: colors.primary,
    },
    timeSlotTextDisabled: {
        color: colors.textMuted,
    },

    // Bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 14,
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        gap: 14,
    },
    chatBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtnText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#FFFFFF',
    },
});
