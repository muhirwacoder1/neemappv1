import { useEffect, useRef } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    Animated,
    Dimensions,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface WeightResultModalProps {
    visible: boolean;
    onClose: () => void;
    currentWeight: number;
    previousWeight: number | null;
    startingWeight: number | null;
    goalWeight: number | null;
    history: { date: string; value: string; change: string }[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function getMotivationalMessage(current: number, goal: number | null, previous: number | null): string {
    if (!goal) return "Great job tracking your weight!";
    const diff = current - goal;
    if (Math.abs(diff) < 0.5) return "🎉 Amazing! You've reached your goal weight!";
    if (previous !== null) {
        const wasCloser = Math.abs(previous - goal) > Math.abs(current - goal);
        if (wasCloser) {
            return diff > 0
                ? "You're getting closer to your goal! Keep it up! 💪"
                : "You're below your goal — excellent progress! 🎯";
        }
    }
    if (diff > 0) {
        return "Losing weight might be difficult sometimes, but don't give up – you're getting there!";
    }
    return "You're below your goal weight. Great discipline! 💚";
}

// Semi-circular gauge for goal progress
function GoalGauge({
    current,
    goal,
    startingWeight,
}: {
    current: number;
    goal: number;
    startingWeight: number;
}) {
    const size = 220;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    // Arc from 180° to 0° (semicircle, left-to-right)
    const startAngle = Math.PI;
    const endAngle = 0;
    const totalAngle = Math.PI;

    // Range for the gauge (startingWeight on left, goal on right)
    const range = Math.abs(startingWeight - goal) || 1;
    const progress = Math.min(Math.max(Math.abs(current - startingWeight) / range, 0), 1);
    const sweepAngle = progress * totalAngle;
    const currentAngle = startAngle - sweepAngle;

    const arcX = center + radius * Math.cos(currentAngle);
    const arcY = center - radius * Math.sin(currentAngle);

    // Background arc path
    const bgPath = `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`;

    // Progress arc path
    const largeArc = sweepAngle > Math.PI ? 1 : 0;
    const progressPath = `M ${center - radius} ${center} A ${radius} ${radius} 0 ${largeArc} 1 ${arcX} ${arcY}`;

    const diff = current - (startingWeight || current);
    const gained = diff >= 0;

    return (
        <View style={gaugeStyles.container}>
            <Svg width={size} height={size / 2 + 30}>
                {/* Background arc */}
                <Path
                    d={bgPath}
                    stroke="#E8ECEF"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <Path
                    d={progressPath}
                    stroke={gained ? colors.error : colors.success}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Current position dot */}
                <Circle
                    cx={arcX}
                    cy={arcY}
                    r={6}
                    fill={gained ? colors.error : colors.success}
                />
            </Svg>

            {/* Center text */}
            <View style={gaugeStyles.centerText}>
                <Text style={gaugeStyles.nowLabel}>Now</Text>
                <Text style={gaugeStyles.currentWeight}>{current} kg</Text>
                <Text style={[gaugeStyles.diffText, { color: gained ? colors.error : colors.success }]}>
                    {gained ? 'Gained' : 'Lost'} {gained ? '+' : ''}{diff.toFixed(1)} kg
                </Text>
            </View>

            {/* Left label (starting) */}
            <View style={gaugeStyles.leftLabel}>
                <Text style={gaugeStyles.labelValue}>{startingWeight}</Text>
            </View>

            {/* Right label (goal) */}
            <View style={gaugeStyles.rightLabel}>
                <Text style={gaugeStyles.labelValue}>{goal}</Text>
            </View>
        </View>
    );
}

export function WeightResultModal({
    visible,
    onClose,
    currentWeight,
    previousWeight,
    startingWeight,
    goalWeight,
    history,
}: WeightResultModalProps) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
                Animated.timing(backdropAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true }),
                Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible, slideAnim, backdropAnim]);

    if (!visible) return null;

    const effectiveGoal = goalWeight ?? currentWeight;
    const effectiveStarting = startingWeight ?? currentWeight;
    const message = getMotivationalMessage(currentWeight, goalWeight, previousWeight);

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
            <Animated.View style={[s.backdrop, { opacity: backdropAnim }]}>
                <TouchableOpacity style={s.backdropFill} onPress={onClose} activeOpacity={1} />
            </Animated.View>

            <Animated.View style={[s.container, { transform: [{ translateY: slideAnim }] }]}>
                {/* Header */}
                <View style={s.header}>
                    <Text style={s.headerTitle}>Current weight</Text>
                    <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                        <Feather name="x" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={s.divider} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                    {/* Goal Progress Card */}
                    <View style={s.goalCard}>
                        <View style={s.goalCardHeader}>
                            <Text style={s.goalCardTitle}>Goal progress</Text>
                            {goalWeight && (
                                <TouchableOpacity style={s.editGoalBtn}>
                                    <Text style={s.editGoalText}>Edit goal</Text>
                                    <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <GoalGauge
                            current={currentWeight}
                            goal={effectiveGoal}
                            startingWeight={effectiveStarting}
                        />

                        <Text style={s.motivationText}>{message}</Text>
                    </View>

                    {/* History */}
                    {history.length > 0 && (
                        <>
                            <Text style={s.historyTitle}>History</Text>
                            <View style={s.historyCard}>
                                {history.slice(0, 10).map((item, i) => (
                                    <View key={i} style={[s.historyItem, i > 0 && s.historyItemBorder]}>
                                        <View style={s.historyContent}>
                                            <Text style={s.historyDate}>{item.date}</Text>
                                            <Text style={s.historyValue}>
                                                {item.value} • <Text style={{
                                                    color: item.change.includes('+') ? colors.error : colors.success,
                                                }}>{item.change}</Text>
                                            </Text>
                                        </View>
                                        <Feather name="edit-2" size={16} color={colors.textMuted} />
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </ScrollView>
            </Animated.View>
        </Modal>
    );
}

const gaugeStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 16,
        position: 'relative',
    },
    centerText: {
        position: 'absolute',
        top: 50,
        alignItems: 'center',
    },
    nowLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 4,
    },
    currentWeight: {
        fontFamily: typography.heading,
        fontSize: 32,
        color: colors.textPrimary,
    },
    diffText: {
        fontFamily: typography.subheading,
        fontSize: 14,
        marginTop: 2,
    },
    leftLabel: {
        position: 'absolute',
        bottom: 8,
        left: 24,
    },
    rightLabel: {
        position: 'absolute',
        bottom: 8,
        right: 24,
    },
    labelValue: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.textSecondary,
    },
});

const s = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    backdropFill: { flex: 1 },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F5F8FA',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.92,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 17,
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'center',
    },
    closeBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#E8ECEF',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    goalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    goalCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    goalCardTitle: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
    },
    editGoalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editGoalText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    motivationText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 8,
    },
    historyTitle: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 12,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    historyItemBorder: {
        borderTopWidth: 1,
        borderTopColor: '#F0F2F5',
    },
    historyContent: {
        flex: 1,
    },
    historyDate: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    historyValue: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
});
