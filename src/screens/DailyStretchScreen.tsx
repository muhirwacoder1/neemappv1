import { useState, useRef, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable, FlatList,
    Modal, Animated, Dimensions, TouchableOpacity, Platform,
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
import { ActiveWorkoutScreen } from './ActiveWorkoutScreen';

import ActivityIcon from '../../assets/icons/activity.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Exercise Data ───────────────────────────────────────────────────

interface Exercise {
    id: string;
    name: string;
    duration: string;
    section: string;
    instructions: string;
    muscleGroups: string;
    emoji: string;         // fallback visual indicator
    color: string;         // accent color for the card icon
}

const EXERCISES: Exercise[] = [
    {
        id: '1',
        name: 'Shoulder Rolls (Forward)',
        duration: '20 sec',
        section: 'Warm-up',
        instructions: '1. Stand straight with your arms by your sides and your feet shoulder-width apart.\n2. Start to slowly rotate your shoulders forward, making big circles.\n3. Repeat the movement until the set is complete.',
        muscleGroups: 'Shoulders, Chest, Upper back',
        emoji: '🙆‍♀️',
        color: '#E8F0FD',
    },
    {
        id: '2',
        name: 'Shoulder Rolls (Backward)',
        duration: '20 sec',
        section: 'Warm-up',
        instructions: '1. Stand straight with your arms by your sides and with your feet shoulder-width apart.\n2. Start to slowly rotate your shoulders backward, making big circles.\n3. Repeat the movement until the set is complete.',
        muscleGroups: 'Shoulders, Chest, Upper back',
        emoji: '🙆‍♀️',
        color: '#E8F0FD',
    },
    {
        id: '3',
        name: 'Hip Circles (Right Side)',
        duration: '20 sec',
        section: 'Warm-up',
        instructions: '1. Stand with your feet slightly wider than hip-width apart.\n2. Place your hands on your hips.\n3. Make circular motions with your hips to the right.\n4. Repeat until the set is complete.',
        muscleGroups: 'Hips, Core, Glutes',
        emoji: '💃',
        color: '#E9F7EF',
    },
    {
        id: '4',
        name: 'Hip Circles (Left Side)',
        duration: '20 sec',
        section: 'Warm-up',
        instructions: '1. Stand with your feet slightly wider than hip-width apart.\n2. Place your hands on your hips.\n3. Make circular motions with your hips to the left.\n4. Repeat until the set is complete.',
        muscleGroups: 'Hips, Core, Glutes',
        emoji: '💃',
        color: '#E9F7EF',
    },
    {
        id: '5',
        name: 'High Knees',
        duration: '30 sec',
        section: 'Warm-up',
        instructions: '1. Stand in place with your feet hip-width apart.\n2. Drive one knee toward your chest then quickly switch to the other.\n3. Continue alternating at a fast pace while pumping your arms.\n4. Repeat until the set is complete.',
        muscleGroups: 'Quads, Core, Calves',
        emoji: '🏃‍♀️',
        color: '#FCE9F3',
    },
    {
        id: '6',
        name: 'Modified Jumping Jacks',
        duration: '30 sec',
        section: 'Warm-up',
        instructions: '1. Stand with your arms at your sides.\n2. Step one foot out to the side while raising your arms overhead.\n3. Return to the starting position and repeat on the other side.\n4. Continue alternating sides.',
        muscleGroups: 'Full body, Cardio',
        emoji: '⭐',
        color: '#FEF5E7',
    },
    {
        id: '7',
        name: 'Standing Quad Stretch',
        duration: '20 sec each side',
        section: 'Cool-down',
        instructions: '1. Stand on one leg, grab your opposite ankle behind you.\n2. Pull your heel toward your glute while keeping your knees together.\n3. Hold for the specified time then switch sides.',
        muscleGroups: 'Quads, Hip flexors',
        emoji: '🧘‍♀️',
        color: '#E8F0FD',
    },
    {
        id: '8',
        name: 'Standing Hamstring Stretch',
        duration: '20 sec each side',
        section: 'Cool-down',
        instructions: '1. Stand and extend one leg forward with the heel on the ground.\n2. Hinge at the hips and lean forward slightly.\n3. Hold until you feel a stretch in the back of your thigh.\n4. Switch sides.',
        muscleGroups: 'Hamstrings, Lower back',
        emoji: '🦵',
        color: '#E9F7EF',
    },
];

// Group exercises by section
const groupedSections = EXERCISES.reduce((acc, ex) => {
    if (!acc.find(s => s.title === ex.section)) {
        acc.push({ title: ex.section, data: [] });
    }
    acc.find(s => s.title === ex.section)!.data.push(ex);
    return acc;
}, [] as { title: string; data: Exercise[] }[]);

// ── Exercise Detail Bottom Sheet ────────────────────────────────────

function ExerciseDetailSheet({
    exercise,
    visible,
    onClose,
}: {
    exercise: Exercise | null;
    visible: boolean;
    onClose: () => void;
}) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(false);

    // Animation
    useState(() => {
        // Will be handled in useEffect
    });

    // We need useEffect for open/close
    const prevVisible = useRef(visible);
    if (visible !== prevVisible.current) {
        prevVisible.current = visible;
        if (visible) {
            setIsVisible(true);
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
    if (!exercise) return null;

    return (
        <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
            <Animated.View style={[detailStyles.backdrop, { opacity: backdropAnim }]}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
            </Animated.View>

            <Animated.View style={[detailStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                {/* Close button */}
                <Pressable style={detailStyles.closeBtn} onPress={onClose} hitSlop={12}>
                    <Feather name="x" size={22} color={colors.textPrimary} />
                </Pressable>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Exercise illustration area */}
                    <View style={[detailStyles.illustrationArea, { backgroundColor: exercise.color }]}>
                        <Text style={detailStyles.illustrationEmoji}>{exercise.emoji}</Text>
                    </View>

                    {/* Content */}
                    <View style={detailStyles.content}>
                        <Text style={detailStyles.exerciseName}>{exercise.name}</Text>

                        <Text style={detailStyles.sectionTitle}>Instructions</Text>
                        <Text style={detailStyles.instructions}>{exercise.instructions}</Text>

                        <Text style={detailStyles.sectionTitle}>Muscle groups</Text>
                        <Text style={detailStyles.muscleGroups}>{exercise.muscleGroups}</Text>
                    </View>
                </ScrollView>
            </Animated.View>
        </Modal>
    );
}

const detailStyles = StyleSheet.create({
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
        maxHeight: SCREEN_HEIGHT * 0.75,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    illustrationArea: {
        height: 200,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationEmoji: {
        fontSize: 80,
    },
    content: {
        padding: 24,
    },
    exerciseName: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.textPrimary,
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 10,
        marginTop: 16,
    },
    instructions: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    muscleGroups: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },
});

// ── Main Screen ─────────────────────────────────────────────────────

// Parse duration string like '20 sec' or '30 sec' to number
const parseDuration = (dur: string): number => {
    const match = dur.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 20;
};

export function DailyStretchScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [workoutActive, setWorkoutActive] = useState(false);

    const openDetail = (exercise: Exercise) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedExercise(exercise);
        setDetailVisible(true);
    };

    const closeDetail = () => {
        setDetailVisible(false);
    };

    const handleStartWorkout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setWorkoutActive(true);
    };

    const handleWorkoutClose = () => {
        setWorkoutActive(false);
    };

    const handleWorkoutComplete = () => {
        setWorkoutActive(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Could show a completion modal here
    };

    // Prepare exercises for ActiveWorkoutScreen
    const workoutExercises = EXERCISES.map(ex => ({
        id: ex.id,
        name: ex.name,
        duration: parseDuration(ex.duration),
        section: ex.section,
        emoji: ex.emoji,
        color: ex.color,
    }));

    // Show ActiveWorkoutScreen full-screen when active
    if (workoutActive) {
        return (
            <ActiveWorkoutScreen
                exercises={workoutExercises}
                onClose={handleWorkoutClose}
                onComplete={handleWorkoutComplete}
            />
        );
    }

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
                <Text style={styles.headerTitle}>Daily Stretch</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ── Content ── */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Daily Stretch</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <View style={styles.metaIcon}>
                                <Feather name="clock" size={14} color={colors.primary} />
                            </View>
                            <Text style={styles.metaText}>10 min</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <View style={styles.metaIcon}>
                                <ActivityIcon width={14} height={14} />
                            </View>
                            <Text style={styles.metaText}>All</Text>
                        </View>
                    </View>
                </View>

                {/* Exercise sections */}
                {groupedSections.map(section => (
                    <View key={section.title} style={styles.sectionWrap}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.exerciseList}>
                            {section.data.map((exercise, idx) => (
                                <Pressable
                                    key={exercise.id}
                                    style={({ pressed }) => [styles.exerciseCard, pressed && styles.exerciseCardPressed]}
                                    onPress={() => openDetail(exercise)}
                                >
                                    {/* Thumbnail */}
                                    <View style={[styles.exerciseThumb, { backgroundColor: exercise.color }]}>
                                        <Text style={styles.thumbEmoji}>{exercise.emoji}</Text>
                                    </View>

                                    {/* Info */}
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                                        <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                                    </View>

                                    {/* Info button */}
                                    <View style={styles.infoBtn}>
                                        <Feather name="info" size={18} color={colors.textMuted} />
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* ── Bottom Button ── */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                <Pressable
                    style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.92 }]}
                    onPress={handleStartWorkout}
                >
                    <Text style={styles.startBtnText}>Start workout</Text>
                </Pressable>
            </View>

            {/* ── Detail Sheet ── */}
            <ExerciseDetailSheet
                exercise={selectedExercise}
                visible={detailVisible}
                onClose={closeDetail}
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

    // Scroll
    scrollContent: { paddingHorizontal: 20 },

    // Hero
    heroSection: {
        paddingTop: 20,
        paddingBottom: 8,
    },
    heroTitle: {
        fontFamily: typography.heading,
        fontSize: 26,
        color: colors.textPrimary,
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },

    // Section
    sectionWrap: { marginTop: 20 },
    sectionTitle: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 12,
    },

    // Exercise list
    exerciseList: { gap: 10 },

    // Exercise card
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 12,
        gap: 14,
        ...shadows.soft,
    },
    exerciseCardPressed: {
        opacity: 0.88,
        transform: [{ scale: 0.985 }],
    },

    // Thumbnail
    exerciseThumb: {
        width: 64,
        height: 64,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbEmoji: {
        fontSize: 32,
    },

    // Exercise info
    exerciseInfo: {
        flex: 1,
        gap: 3,
    },
    exerciseName: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    exerciseDuration: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },

    // Info button
    infoBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 12,
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },

    startBtn: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startBtnText: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.surface,
    },
});
