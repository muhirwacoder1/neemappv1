import { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Switch,
    Modal,
    Animated,
    Dimensions,
    TouchableOpacity,
    TextInput,
    Alert,
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
import { PressableScale } from '../components/PressableScale';
import { RootStackParamList } from '../navigation/types';
import type { Reminder, ReminderCategory } from './AddReminderScreen';
import { getReminders, setReminders } from './AddReminderScreen';

// Icons
import BloodIcon from '../../assets/icons/blood.svg';
import WaterIcon from '../../assets/icons/water.svg';
import MealsIcon from '../../assets/icons/meals.svg';
import ActivityIcon from '../../assets/icons/activity.svg';
import ScaleIcon from '../../assets/icons/scale.svg';
import BloodPressureIcon from '../../assets/icons/blood-pressure.svg';
import PillsIcon from '../../assets/icons/pills.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface CategoryItem {
    id: ReminderCategory;
    label: string;
    icon: any;
    color: string;
    bgColor: string;
}

const REMINDER_CATEGORIES: CategoryItem[] = [
    { id: 'meals', label: 'Meals', icon: MealsIcon, color: '#F97316', bgColor: '#FFF7ED' },
    { id: 'glucose', label: 'Glucose', icon: BloodIcon, color: '#1E6AE1', bgColor: '#E8F0FD' },
    { id: 'water', label: 'Water', icon: WaterIcon, color: '#3B82F6', bgColor: '#EFF6FF' },
    { id: 'activity', label: 'Activity', icon: ActivityIcon, color: '#22C55E', bgColor: '#F0FDF4' },
    { id: 'weight', label: 'Weight', icon: ScaleIcon, color: '#8B5CF6', bgColor: '#F5F3FF' },
    { id: 'bloodpressure', label: 'Blood pressure', icon: BloodPressureIcon, color: '#EF4444', bgColor: '#FEF2F2' },
    { id: 'medication', label: 'Medication', icon: PillsIcon, color: '#06B6D4', bgColor: '#ECFEFF' },
];

export function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    const [marketingNotifications, setMarketingNotifications] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customName, setCustomName] = useState('');
    const [savedReminders, setSavedReminders] = useState<Reminder[]>([]);

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const bellBounce = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadReminders();
        // Bell idle animation
        const bellLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(bellBounce, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(bellBounce, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        );
        bellLoop.start();
        return () => bellLoop.stop();
    }, [bellBounce]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadReminders();
        });
        return unsubscribe;
    }, [navigation]);

    const loadReminders = () => {
        setSavedReminders([...getReminders()]);
    };

    const openModal = () => {
        setShowAddModal(true);
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }),
            Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(backdropAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowAddModal(false);
            setShowCustomInput(false);
            setCustomName('');
        });
    };

    const handleSelectCategory = (category: ReminderCategory) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        closeModal();
        setTimeout(() => {
            navigation.navigate('AddReminder', { category });
        }, 300);
    };

    const handleCustomReminder = () => {
        if (showCustomInput) {
            if (customName.trim()) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                closeModal();
                setTimeout(() => {
                    navigation.navigate('AddReminder', {
                        category: 'custom' as ReminderCategory,
                        customName: customName.trim(),
                    });
                }, 300);
            }
        } else {
            setShowCustomInput(true);
        }
    };

    const handleDeleteReminder = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    const updated = savedReminders.filter(r => r.id !== id);
                    setReminders(updated);
                    setSavedReminders(updated);
                },
            },
        ]);
    };

    const getCategoryConfig = (category: string) => {
        return REMINDER_CATEGORIES.find(c => c.id === category);
    };

    const formatReminderDays = (r: Reminder) => {
        if (r.everyDay) return 'Every day';
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return r.selectedDays
            .map((selected, i) => selected ? dayLabels[i] : null)
            .filter(Boolean)
            .join(', ');
    };

    const formatReminderTimes = (r: Reminder) => {
        return r.times.map(t => {
            const m = t.minute < 10 ? `0${t.minute}` : `${t.minute}`;
            return `${t.hour}:${m} ${t.period}`;
        }).join(', ');
    };

    const bellScale = bellBounce.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.06, 1],
    });

    const bellRotate = bellBounce.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '6deg', '0deg', '-6deg', '0deg'],
    });

    const hasReminders = savedReminders.length > 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Branded Header */}
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
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Bell illustration in header */}
                <View style={styles.headerIllustration}>
                    <Animated.View
                        style={[
                            styles.bellOuter,
                            { transform: [{ scale: bellScale }, { rotate: bellRotate }] },
                        ]}
                    >
                        <View style={styles.bellInner}>
                            <Feather name="bell" size={32} color="#FFFFFF" />
                        </View>
                    </Animated.View>
                    <Text style={styles.headerSubtitle}>
                        {hasReminders
                            ? `You have ${savedReminders.length} active reminder${savedReminders.length > 1 ? 's' : ''}`
                            : 'Set up reminders to stay on track'}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Marketing Notifications Toggle */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionLabel}>PREFERENCES</Text>
                    <View style={styles.toggleCard}>
                        <View style={styles.toggleLeft}>
                            <View style={styles.toggleIconBox}>
                                <Feather name="mail" size={18} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.toggleLabel}>Marketing notifications</Text>
                                <Text style={styles.toggleDesc}>Tips, news & product updates</Text>
                            </View>
                        </View>
                        <Switch
                            value={marketingNotifications}
                            onValueChange={(val) => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setMarketingNotifications(val);
                            }}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.surface}
                        />
                    </View>
                </View>

                {/* Saved Reminders */}
                <View style={styles.remindersSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>YOUR REMINDERS</Text>
                        {hasReminders && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{savedReminders.length}</Text>
                            </View>
                        )}
                    </View>

                    {hasReminders ? (
                        savedReminders.map((reminder, index) => {
                            const config = getCategoryConfig(reminder.category);
                            const IconComp = config?.icon || null;
                            return (
                                <PressableScale
                                    key={reminder.id}
                                    style={[
                                        styles.reminderCard,
                                        index === savedReminders.length - 1 && { marginBottom: 0 },
                                    ]}
                                    onLongPress={() => handleDeleteReminder(reminder.id)}
                                >
                                    <View style={[
                                        styles.reminderIcon,
                                        { backgroundColor: config?.bgColor || colors.surfaceAlt },
                                    ]}>
                                        {IconComp && <IconComp width={20} height={20} />}
                                    </View>
                                    <View style={styles.reminderInfo}>
                                        <Text style={styles.reminderName}>
                                            {config?.label || reminder.customName || 'Custom'}
                                        </Text>
                                        <Text style={styles.reminderMeta}>
                                            {formatReminderDays(reminder)} · {formatReminderTimes(reminder)}
                                        </Text>
                                    </View>
                                    <View style={styles.reminderArrow}>
                                        <Feather name="chevron-right" size={18} color={colors.textMuted} />
                                    </View>
                                </PressableScale>
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBox}>
                                <Feather name="clock" size={28} color={colors.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>No reminders yet</Text>
                            <Text style={styles.emptyDesc}>
                                Add reminders to log meals, glucose, water & more
                            </Text>
                        </View>
                    )}
                </View>

                {/* Add Reminder CTA */}
                <PressableScale style={styles.addButton} onPress={openModal}>
                    <LinearGradient
                        colors={['#1E6AE1', '#1756B8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addButtonGradient}
                    >
                        <Feather name="plus" size={20} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Add a reminder</Text>
                    </LinearGradient>
                </PressableScale>
            </ScrollView>

            {/* Add Reminder Modal */}
            {showAddModal && (
                <Modal
                    visible={showAddModal}
                    transparent
                    animationType="none"
                    onRequestClose={closeModal}
                    statusBarTranslucent
                >
                    <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
                        <TouchableOpacity
                            style={styles.backdropTouchable}
                            activeOpacity={1}
                            onPress={closeModal}
                        />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.modalContainer,
                            { transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        <View style={styles.dragHandle} />

                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Add a reminder</Text>
                                <Text style={styles.modalSubtitle}>
                                    Get gentle nudges to log and stay on track
                                </Text>
                            </View>
                            <PressableScale onPress={closeModal} style={styles.modalCloseButton}>
                                <View style={styles.modalCloseBg}>
                                    <Feather name="x" size={18} color={colors.textSecondary} />
                                </View>
                            </PressableScale>
                        </View>

                        <ScrollView
                            style={styles.modalScroll}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {REMINDER_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <PressableScale
                                        key={cat.id}
                                        style={styles.categoryRow}
                                        onPress={() => handleSelectCategory(cat.id)}
                                    >
                                        <View style={[styles.categoryIcon, { backgroundColor: cat.bgColor }]}>
                                            <Icon width={22} height={22} />
                                        </View>
                                        <Text style={styles.categoryName}>{cat.label}</Text>
                                        <View style={[styles.categoryAddBtn, { borderColor: `${cat.color}40` }]}>
                                            <Feather name="plus" size={16} color={cat.color} />
                                        </View>
                                    </PressableScale>
                                );
                            })}

                            {/* Custom */}
                            <PressableScale style={styles.categoryRow} onPress={handleCustomReminder}>
                                <View style={[styles.categoryIcon, { backgroundColor: colors.surfaceAlt }]}>
                                    <Feather name="edit-3" size={18} color={colors.textSecondary} />
                                </View>
                                {showCustomInput ? (
                                    <TextInput
                                        style={styles.customInput}
                                        value={customName}
                                        onChangeText={setCustomName}
                                        placeholder="Enter reminder name..."
                                        placeholderTextColor={colors.textMuted}
                                        autoFocus
                                        onSubmitEditing={handleCustomReminder}
                                    />
                                ) : (
                                    <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
                                        Add custom reminder
                                    </Text>
                                )}
                                <View style={[styles.categoryAddBtn, { borderColor: colors.border }]}>
                                    <Feather name="plus" size={16} color={colors.textSecondary} />
                                </View>
                            </PressableScale>
                        </ScrollView>
                    </Animated.View>
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
    headerIllustration: {
        alignItems: 'center',
        paddingTop: 8,
    },
    bellOuter: {
        marginBottom: 12,
    },
    bellInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSubtitle: {
        fontFamily: typography.body,
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
    },
    // ─── Body ──────────────────────────────
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    settingsSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontFamily: typography.heading,
        fontSize: 11,
        color: colors.textMuted,
        letterSpacing: 1,
        marginBottom: 10,
    },
    toggleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        ...shadows.soft,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    toggleIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleLabel: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    toggleDesc: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    // ─── Reminders Section ─────────────────
    remindersSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    countBadge: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countBadgeText: {
        fontFamily: typography.heading,
        fontSize: 11,
        color: '#FFFFFF',
    },
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        ...shadows.soft,
    },
    reminderIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reminderInfo: {
        flex: 1,
        marginLeft: 12,
    },
    reminderName: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    reminderMeta: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 3,
    },
    reminderArrow: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ─── Empty State ───────────────────────
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: colors.surface,
        borderRadius: 20,
        ...shadows.soft,
    },
    emptyIconBox: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    emptyTitle: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 6,
    },
    emptyDesc: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    // ─── Add Button ────────────────────────
    addButton: {
        borderRadius: 30,
        overflow: 'hidden',
        ...shadows.card,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    addButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#FFFFFF',
    },
    // ─── Modal ─────────────────────────────
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(14, 27, 51, 0.5)',
    },
    backdropTouchable: {
        flex: 1,
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: SCREEN_HEIGHT * 0.75,
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
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
    },
    modalTitle: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
    },
    modalCloseButton: {
        marginTop: 4,
    },
    modalCloseBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalScroll: {
        paddingHorizontal: 24,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
    },
    categoryIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryName: {
        flex: 1,
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
        marginLeft: 14,
    },
    categoryAddBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    customInput: {
        flex: 1,
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textPrimary,
        marginLeft: 14,
        paddingVertical: 0,
    },
});
