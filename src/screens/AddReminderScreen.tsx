import { useState, useCallback, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Switch,
    Alert,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { PressableScale } from '../components/PressableScale';
import { TimePickerModal } from '../components/TimePickerModal';
import { RootStackParamList } from '../navigation/types';

// Icons
import BloodIcon from '../../assets/icons/blood.svg';
import WaterIcon from '../../assets/icons/water.svg';
import MealsIcon from '../../assets/icons/meals.svg';
import ActivityIcon from '../../assets/icons/activity.svg';
import ScaleIcon from '../../assets/icons/scale.svg';
import BloodPressureIcon from '../../assets/icons/blood-pressure.svg';
import PillsIcon from '../../assets/icons/pills.svg';

// In-memory reminder storage (no backend yet)
export type ReminderCategory = 'meals' | 'glucose' | 'water' | 'activity' | 'weight' | 'bloodpressure' | 'medication' | 'custom';

export interface ReminderTime {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
}

export interface Reminder {
    id: string;
    category: ReminderCategory;
    customName?: string;
    everyDay: boolean;
    selectedDays: boolean[];
    times: ReminderTime[];
}

let inMemoryReminders: Reminder[] = [];
export function getReminders() { return inMemoryReminders; }
export function setReminders(r: Reminder[]) { inMemoryReminders = r; }

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'AddReminder'>;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
    meals: { label: 'Meals', icon: MealsIcon, color: '#F97316', bgColor: '#FFF7ED' },
    glucose: { label: 'Glucose', icon: BloodIcon, color: '#1E6AE1', bgColor: '#E8F0FD' },
    water: { label: 'Water', icon: WaterIcon, color: '#3B82F6', bgColor: '#EFF6FF' },
    activity: { label: 'Activity', icon: ActivityIcon, color: '#22C55E', bgColor: '#F0FDF4' },
    weight: { label: 'Weight', icon: ScaleIcon, color: '#8B5CF6', bgColor: '#F5F3FF' },
    bloodpressure: { label: 'Blood pressure', icon: BloodPressureIcon, color: '#EF4444', bgColor: '#FEF2F2' },
    medication: { label: 'Medication', icon: PillsIcon, color: '#06B6D4', bgColor: '#ECFEFF' },
};

function formatTime(t: ReminderTime): string {
    const m = t.minute < 10 ? `0${t.minute}` : `${t.minute}`;
    return `${t.hour}:${m} ${t.period}`;
}

export function AddReminderScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const category = route.params?.category || 'glucose';
    const customName = route.params?.customName;

    const config = CATEGORY_CONFIG[category] || {
        label: customName || 'Custom',
        icon: null,
        color: colors.primary,
        bgColor: colors.primarySoft,
    };
    const IconComponent = config.icon;
    const accentColor = config.color;

    const [everyDay, setEveryDay] = useState(true);
    const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]);
    const [times, setTimes] = useState<ReminderTime[]>([{ hour: 7, minute: 30, period: 'AM' }]);
    const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Animation
    const cardAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(cardAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    }, [cardAnim]);

    const toggleDay = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newDays = [...selectedDays];
        newDays[index] = !newDays[index];
        setSelectedDays(newDays);
        if (newDays.every(d => d)) {
            setEveryDay(true);
        } else {
            setEveryDay(false);
        }
    };

    const toggleEveryDay = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEveryDay(value);
        if (value) {
            setSelectedDays([true, true, true, true, true, true, true]);
        }
    };

    const handleEditTime = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEditingTimeIndex(index);
        setShowTimePicker(true);
    };

    const handleAddTime = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newTime: ReminderTime = { hour: 12, minute: 0, period: 'PM' };
        setTimes([...times, newTime]);
        setEditingTimeIndex(times.length);
        setShowTimePicker(true);
    };

    const handleTimeSave = (hour: number, minute: number, period: 'AM' | 'PM') => {
        if (editingTimeIndex !== null) {
            const newTimes = [...times];
            newTimes[editingTimeIndex] = { hour, minute, period };
            setTimes(newTimes);
            setEditingTimeIndex(null);
        }
    };

    const handleDeleteTime = (index: number) => {
        if (times.length <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimes(times.filter((_, i) => i !== index));
    };

    const handleSave = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const reminder: Reminder = {
            id: `${category}_${Date.now()}`,
            category: category as ReminderCategory,
            customName,
            everyDay,
            selectedDays,
            times,
        };

        const reminders = getReminders();
        reminders.push(reminder);
        setReminders(reminders);

        Alert.alert('Saved!', `${config.label} reminder has been set.`, [
            { text: 'OK', onPress: () => navigation.goBack() },
        ]);
    }, [category, customName, everyDay, selectedDays, times, config.label, navigation]);

    const selectedDaysSummary = everyDay
        ? 'Every day'
        : selectedDays
            .map((s, i) => (s ? DAY_FULL[i] : null))
            .filter(Boolean)
            .join(', ') || 'No days selected';

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Branded Header */}
            <LinearGradient
                colors={[accentColor, `${accentColor}DD`]}
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
                    <Text style={styles.headerTitle}>Add reminder</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Category display */}
                <Animated.View
                    style={[
                        styles.categoryDisplay,
                        {
                            opacity: cardAnim,
                            transform: [
                                { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                                { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                            ],
                        },
                    ]}
                >
                    {IconComponent && (
                        <View style={styles.categoryIconBig}>
                            <IconComponent width={28} height={28} />
                        </View>
                    )}
                    <Text style={styles.categoryLabel}>{config.label}</Text>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Schedule Section */}
                <Text style={styles.sectionLabel}>SCHEDULE</Text>

                {/* Every Day Card */}
                <View style={styles.settingCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: `${accentColor}15` }]}>
                                <Feather name="calendar" size={16} color={accentColor} />
                            </View>
                            <View>
                                <Text style={styles.settingLabel}>Every day</Text>
                                <Text style={styles.settingDesc}>{selectedDaysSummary}</Text>
                            </View>
                        </View>
                        <Switch
                            value={everyDay}
                            onValueChange={toggleEveryDay}
                            trackColor={{ false: colors.border, true: accentColor }}
                            thumbColor={colors.surface}
                        />
                    </View>

                    {/* Day Selector */}
                    <View style={styles.divider} />
                    <View style={styles.daysRow}>
                        {DAY_LABELS.map((label, index) => (
                            <PressableScale
                                key={index}
                                style={[
                                    styles.dayButton,
                                    selectedDays[index] && [styles.dayButtonActive, { backgroundColor: accentColor, borderColor: accentColor }],
                                ]}
                                onPress={() => toggleDay(index)}
                            >
                                <Text
                                    style={[
                                        styles.dayButtonText,
                                        selectedDays[index] && styles.dayButtonTextActive,
                                    ]}
                                >
                                    {label}
                                </Text>
                            </PressableScale>
                        ))}
                    </View>
                </View>

                {/* Times Section */}
                <Text style={styles.sectionLabel}>REMINDER TIMES</Text>
                <View style={styles.settingCard}>
                    {times.map((time, index) => (
                        <View key={index}>
                            {index > 0 && <View style={styles.divider} />}
                            <PressableScale
                                style={styles.timeRow}
                                onPress={() => handleEditTime(index)}
                                onLongPress={() => handleDeleteTime(index)}
                            >
                                <View style={styles.timeLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: `${accentColor}15` }]}>
                                        <Feather name="bell" size={16} color={accentColor} />
                                    </View>
                                    <Text style={styles.timeLabel}>
                                        {times.length > 1 ? `Time ${index + 1}` : 'Time'}
                                    </Text>
                                </View>
                                <View style={styles.timeRight}>
                                    <View style={[styles.timeBadge, { backgroundColor: `${accentColor}12` }]}>
                                        <Text style={[styles.timeValue, { color: accentColor }]}>
                                            {formatTime(time)}
                                        </Text>
                                    </View>
                                    <Feather name="chevron-right" size={18} color={colors.textMuted} />
                                </View>
                            </PressableScale>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    {/* Add Time */}
                    <PressableScale style={styles.addTimeRow} onPress={handleAddTime}>
                        <View style={styles.timeLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: colors.surfaceAlt }]}>
                                <Feather name="plus" size={16} color={colors.textSecondary} />
                            </View>
                            <Text style={styles.addTimeText}>Add another time</Text>
                        </View>
                        <View style={styles.addTimeBtn}>
                            <Feather name="plus" size={14} color={accentColor} />
                        </View>
                    </PressableScale>
                </View>

                {/* Hint */}
                <View style={styles.hintRow}>
                    <Feather name="info" size={14} color={colors.textMuted} />
                    <Text style={styles.hintText}>Long press a time to remove it</Text>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <PressableScale style={styles.saveButton} onPress={handleSave}>
                    <LinearGradient
                        colors={[accentColor, `${accentColor}DD`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButtonGradient}
                    >
                        <Feather name="check" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Save Reminder</Text>
                    </LinearGradient>
                </PressableScale>
            </View>

            {/* Time Picker Modal */}
            <TimePickerModal
                visible={showTimePicker}
                onClose={() => {
                    setShowTimePicker(false);
                    setEditingTimeIndex(null);
                }}
                onSave={handleTimeSave}
                initialHour={editingTimeIndex !== null ? times[editingTimeIndex]?.hour : 7}
                initialMinute={editingTimeIndex !== null ? times[editingTimeIndex]?.minute : 30}
                initialPeriod={editingTimeIndex !== null ? times[editingTimeIndex]?.period : 'AM'}
            />
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
    categoryDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    categoryIconBig: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryLabel: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: '#FFFFFF',
    },
    // ─── Body ──────────────────────────────
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
    settingCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 4,
        marginBottom: 20,
        ...shadows.soft,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    settingDesc: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 14,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 6,
    },
    dayButton: {
        flex: 1,
        aspectRatio: 1,
        maxWidth: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    dayButtonActive: {
        borderColor: 'transparent',
    },
    dayButtonText: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.textPrimary,
    },
    dayButtonTextActive: {
        color: '#FFFFFF',
        fontFamily: typography.heading,
    },
    // ─── Times ─────────────────────────────
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    timeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeLabel: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    timeRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeBadge: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    timeValue: {
        fontFamily: typography.heading,
        fontSize: 14,
    },
    addTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    addTimeText: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
    },
    addTimeBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ─── Hint ──────────────────────────────
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: -8,
    },
    hintText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    // ─── Footer ────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        backgroundColor: colors.background,
    },
    saveButton: {
        borderRadius: 30,
        overflow: 'hidden',
        ...shadows.card,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    saveButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#FFFFFF',
    },
});
