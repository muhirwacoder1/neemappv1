import { useState, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet, Text, View, Pressable, Animated, Dimensions, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Exercise type ───────────────────────────────────────────────────

interface WorkoutExercise {
    id: string;
    name: string;
    duration: number; // seconds
    section: string;
    emoji: string;
    color: string;
}

interface ActiveWorkoutScreenProps {
    exercises: WorkoutExercise[];
    onClose: () => void;
    onComplete: () => void;
}

// ── Component ───────────────────────────────────────────────────────

export function ActiveWorkoutScreen({ exercises, onClose, onComplete }: ActiveWorkoutScreenProps) {
    const insets = useSafeAreaInsets();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<'ready' | 'active'>('ready');
    const [timeLeft, setTimeLeft] = useState(3); // 3-second "Get ready"
    const [isPaused, setIsPaused] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const current = exercises[currentIndex];
    const total = exercises.length;

    // Count exercises in the current section
    const sectionExercises = exercises.filter(e => e.section === current?.section);
    const sectionIndex = sectionExercises.findIndex(e => e.id === current?.id) + 1;
    const sectionTotal = sectionExercises.length;
    const sectionLabel = current?.section?.toUpperCase() || 'EXERCISE';

    // ── Timer logic ─────────────────────────────────────────────────
    useEffect(() => {
        if (isPaused) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up for this phase
                    if (phase === 'ready') {
                        // Switch to active exercise
                        setPhase('active');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        return current?.duration || 20;
                    } else {
                        // Move to next exercise
                        moveToNext();
                        return 3; // Next "Get ready"
                    }
                }
                // Tick haptic on last 3 seconds
                if (prev <= 4) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase, currentIndex, isPaused]);

    // Pulse animation on timer text
    useEffect(() => {
        if (phase === 'ready' && timeLeft <= 3) {
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    }, [timeLeft, phase]);

    const moveToNext = useCallback(() => {
        if (currentIndex < total - 1) {
            setCurrentIndex(prev => prev + 1);
            setPhase('ready');
            setTimeLeft(3);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            // Workout complete
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
        }
    }, [currentIndex, total, onComplete]);

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (timerRef.current) clearInterval(timerRef.current);
        moveToNext();
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (timerRef.current) clearInterval(timerRef.current);
        onClose();
    };

    const handlePauseResume = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsPaused(p => !p);
    };

    // Format time as MM:SS
    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (!current) return null;

    return (
        <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
            {/* ── Close button ── */}
            <View style={styles.topRow}>
                <View style={{ width: 40 }} />
                <Pressable hitSlop={14} style={styles.closeBtn} onPress={handleClose}>
                    <Feather name="x" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            {/* ── Progress bars ── */}
            <View style={styles.progressRow}>
                {exercises.map((_, i) => (
                    <View key={i} style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: i < currentIndex ? '100%'
                                        : i === currentIndex ? '100%'
                                            : '0%',
                                    backgroundColor: i <= currentIndex ? colors.primary : colors.border,
                                },
                            ]}
                        />
                    </View>
                ))}
            </View>

            {/* ── Section / Round labels ── */}
            <View style={styles.labelRow}>
                <Text style={styles.sectionLabel}>{sectionLabel} {sectionIndex}/{sectionTotal}</Text>
                <Text style={styles.roundLabel}>ROUND 1/1</Text>
            </View>

            {/* ── Center content ── */}
            <View style={styles.centerArea}>
                {/* Phase label */}
                <Text style={styles.phaseText}>
                    {phase === 'ready' ? 'Get ready' : current.name}
                </Text>

                {/* Timer */}
                <Animated.Text style={[styles.timerText, { transform: [{ scale: pulseAnim }] }]}>
                    {formatTime(timeLeft)}
                </Animated.Text>

                {/* Pause/resume touch area */}
                <Pressable style={styles.pauseArea} onPress={handlePauseResume}>
                    {isPaused && (
                        <View style={styles.pausedBadge}>
                            <Feather name="play" size={18} color={colors.primary} />
                            <Text style={styles.pausedText}>Tap to resume</Text>
                        </View>
                    )}
                </Pressable>
            </View>

            {/* ── Exercise illustration ── */}
            <View style={[styles.illustrationArea, { backgroundColor: current.color }]}>
                <Text style={styles.illustrationEmoji}>{current.emoji}</Text>
            </View>

            {/* ── Exercise name bar ── */}
            <View style={styles.exerciseNameBar}>
                <View style={styles.infoCircle}>
                    <Feather name="info" size={16} color={colors.textMuted} />
                </View>
                <Text style={styles.exerciseNameText}>{current.name}</Text>
                <Text style={styles.exerciseDurText}>{current.duration} sec</Text>
            </View>

            {/* ── Spacer ── */}
            <View style={{ flex: 1 }} />

            {/* ── Skip button ── */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                <Pressable
                    style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.85 }]}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipBtnText}>Skip</Text>
                </Pressable>
            </View>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.surface,
    },

    // Top row
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Progress
    progressRow: {
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    progressTrack: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Labels
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionLabel: {
        fontFamily: typography.subheading,
        fontSize: 12,
        color: colors.textSecondary,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    roundLabel: {
        fontFamily: typography.subheading,
        fontSize: 12,
        color: colors.textSecondary,
        letterSpacing: 0.6,
    },

    // Center
    centerArea: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    phaseText: {
        fontFamily: typography.body,
        fontSize: 18,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    timerText: {
        fontFamily: typography.heading,
        fontSize: 72,
        color: colors.textPrimary,
        letterSpacing: -2,
        lineHeight: 84,
    },
    pauseArea: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pausedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pausedText: {
        fontFamily: typography.subheading,
        fontSize: 13,
        color: colors.primary,
    },

    // Illustration
    illustrationArea: {
        marginHorizontal: 20,
        height: 220,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    illustrationEmoji: {
        fontSize: 80,
    },

    // Exercise name bar
    exerciseNameBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 10,
    },
    infoCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseNameText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
        flex: 1,
    },
    exerciseDurText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },

    // Bottom
    bottomBar: {
        paddingHorizontal: 20,
    },
    skipBtn: {
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipBtnText: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
    },
});
