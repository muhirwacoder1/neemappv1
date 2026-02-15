import { useState, useRef, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable, TextInput,
    Modal, Animated, Dimensions, TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Activity Data ───────────────────────────────────────────────────

interface Activity {
    id: string;
    name: string;
    kcal: number;
    duration: number; // minutes
}

const ACTIVITIES: Activity[] = [
    { id: '1', name: 'Aerobics', kcal: 236, duration: 30 },
    { id: '2', name: 'Animal care, household animals', kcal: 109, duration: 30 },
    { id: '3', name: 'Cleaning', kcal: 118, duration: 30 },
    { id: '4', name: 'Cooking', kcal: 165, duration: 30 },
    { id: '5', name: 'Cycling', kcal: 354, duration: 30 },
    { id: '6', name: 'Dog walk', kcal: 142, duration: 30 },
    { id: '7', name: 'Gardening', kcal: 180, duration: 30 },
    { id: '8', name: 'Golf', kcal: 165, duration: 30 },
    { id: '9', name: 'Swimming', kcal: 274, duration: 30 },
    { id: '10', name: 'Tennis', kcal: 345, duration: 30 },
    { id: '11', name: 'Walking, fast 3.7 mph (6.5 km/h)', kcal: 227, duration: 30 },
    { id: '12', name: 'Walking, medium 3 mph (5 km/h)', kcal: 213, duration: 30 },
    { id: '13', name: 'Walking, slow 2.5 mph (4.5 km/h)', kcal: 180, duration: 30 },
    { id: '14', name: 'Yoga', kcal: 150, duration: 30 },
    { id: '15', name: 'Running, 5 mph (8 km/h)', kcal: 295, duration: 30 },
    { id: '16', name: 'Hiking', kcal: 266, duration: 30 },
    { id: '17', name: 'Dancing', kcal: 205, duration: 30 },
    { id: '18', name: 'Jump rope', kcal: 372, duration: 30 },
    { id: '19', name: 'Basketball', kcal: 290, duration: 30 },
    { id: '20', name: 'Soccer', kcal: 310, duration: 30 },
];

// ── Activity Detail Bottom Sheet ────────────────────────────────────

function ActivityDetailSheet({
    activity,
    visible,
    onClose,
    onAdd,
}: {
    activity: Activity | null;
    visible: boolean;
    onClose: () => void;
    onAdd: (a: Activity, mins: number) => void;
}) {
    const [minutes, setMinutes] = useState('30');
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(false);

    const prevVisible = useRef(visible);
    if (visible !== prevVisible.current) {
        prevVisible.current = visible;
        if (visible) {
            setIsVisible(true);
            setMinutes('30');
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }),
                Animated.timing(backdropAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true }),
                Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            ]).start(() => setIsVisible(false));
        }
    }

    if (!isVisible && !visible) return null;
    if (!activity) return null;

    const mins = parseInt(minutes) || 30;
    const adjustedKcal = Math.round((activity.kcal / 30) * mins);

    const handleAdd = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onAdd(activity, mins);
        onClose();
    };

    return (
        <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
            <Animated.View style={[sheetStyles.backdrop, { opacity: backdropAnim }]}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
            </Animated.View>

            <Animated.View style={[sheetStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                {/* Close */}
                <Pressable style={sheetStyles.closeBtn} onPress={onClose} hitSlop={12}>
                    <Feather name="x" size={22} color={colors.textPrimary} />
                </Pressable>

                {/* Activity name */}
                <Text style={sheetStyles.activityName}>{activity.name}</Text>

                {/* Minutes input + calories */}
                <View style={sheetStyles.inputRow}>
                    <View style={sheetStyles.minutesBox}>
                        <TextInput
                            style={sheetStyles.minutesInput}
                            value={minutes}
                            onChangeText={setMinutes}
                            keyboardType="numeric"
                            selectTextOnFocus
                        />
                        <Text style={sheetStyles.minutesLabel}>Minutes</Text>
                    </View>

                    <View style={sheetStyles.kcalBox}>
                        <Feather name="zap" size={16} color={colors.textSecondary} />
                        <Text style={sheetStyles.kcalText}>{adjustedKcal} kcal</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={sheetStyles.divider} />

                {/* Add button */}
                <Pressable
                    style={({ pressed }) => [sheetStyles.addBtn, pressed && { opacity: 0.92 }]}
                    onPress={handleAdd}
                >
                    <Text style={sheetStyles.addBtnText}>Add activity</Text>
                </Pressable>
            </Animated.View>
        </Modal>
    );
}

const sheetStyles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 38 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 24,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    activityName: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.textPrimary,
        marginBottom: 24,
        paddingRight: 40,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    minutesBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: 'hidden',
    },
    minutesInput: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
        width: 56,
        textAlign: 'center',
        paddingVertical: 12,
    },
    minutesLabel: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        paddingRight: 16,
        paddingLeft: 4,
    },
    kcalBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    kcalText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginBottom: 16,
    },
    addBtn: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.surface,
        letterSpacing: 0.3,
    },
});

// ── Main Screen ─────────────────────────────────────────────────────

export function AddActivityScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [search, setSearch] = useState('');
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);

    // Filter activities
    const filtered = search.trim().length > 0
        ? ACTIVITIES.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
        : ACTIVITIES;

    const openSheet = (activity: Activity) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedActivity(activity);
        setSheetVisible(true);
    };

    const handleAdd = (a: Activity, mins: number) => {
        // Would save to state/backend
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

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
                <Text style={styles.headerTitle}>Add activity</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ── Search bar ── */}
            <View style={styles.searchWrap}>
                <View style={styles.searchField}>
                    <Feather name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for activity"
                        placeholderTextColor={colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')} hitSlop={8}>
                            <Feather name="x-circle" size={16} color={colors.textMuted} />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* ── List ── */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Section label */}
                {search.trim().length === 0 && (
                    <Text style={styles.sectionLabel}>Most popular</Text>
                )}

                {filtered.map((activity, idx) => (
                    <View key={activity.id}>
                        {idx > 0 && <View style={styles.separator} />}
                        <Pressable
                            style={({ pressed }) => [styles.activityRow, pressed && styles.activityRowPressed]}
                            onPress={() => openSheet(activity)}
                        >
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityName}>{activity.name}</Text>
                                <View style={styles.activityMeta}>
                                    <Feather name="zap" size={13} color={colors.textMuted} />
                                    <Text style={styles.activityKcal}>{activity.kcal} kcal</Text>
                                    <Text style={styles.activityDot}>·</Text>
                                    <Text style={styles.activityDur}>{activity.duration} min</Text>
                                </View>
                            </View>
                            <View style={styles.addCircle}>
                                <Feather name="plus" size={18} color={colors.textPrimary} />
                            </View>
                        </Pressable>
                    </View>
                ))}

                {filtered.length === 0 && (
                    <View style={styles.emptyState}>
                        <Feather name="search" size={40} color={colors.border} />
                        <Text style={styles.emptyText}>No activities found</Text>
                        <Text style={styles.emptySubtext}>Try a different search term</Text>
                    </View>
                )}
            </ScrollView>

            {/* ── Detail Sheet ── */}
            <ActivityDetailSheet
                activity={selectedActivity}
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onAdd={handleAdd}
            />
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
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: typography.heading, fontSize: 17, color: colors.textPrimary },

    // Search
    searchWrap: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: colors.surface,
    },
    searchField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textPrimary,
    },

    // List
    listContent: {
        paddingHorizontal: 20,
    },

    // Section label
    sectionLabel: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: colors.primary,
        marginTop: 16,
        marginBottom: 8,
    },

    // Activity row
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 4,
    },
    activityRowPressed: {
        opacity: 0.7,
    },
    activityInfo: {
        flex: 1,
        gap: 4,
    },
    activityName: {
        fontFamily: typography.subheading,
        fontSize: 16,
        color: colors.textPrimary,
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    activityKcal: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    activityDot: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    activityDur: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },

    // Add circle
    addCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Separator
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 10,
    },
    emptyText: {
        fontFamily: typography.heading,
        fontSize: 17,
        color: colors.textPrimary,
    },
    emptySubtext: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textMuted,
    },
});
