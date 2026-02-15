import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList, MetricType } from '../navigation/types';

// Import icons
import ScaleIcon from '../../assets/icons/scale.svg';
import BloodPressureIcon from '../../assets/icons/bloodpressure.svg';
import WaterIcon from '../../assets/icons/water.svg';
import ActivityIcon from '../../assets/icons/activity.svg';
import BloodIcon from '../../assets/icons/blood.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data - in a real app, this would come from state/context
const healthData = {
    weight: { value: 250, unit: 'kg', date: 'Feb 8th', goal: 250, progress: 100 },
    glucose: { value: 14, unit: 'mmol/L', date: 'Feb 8th', status: 'High' as const },
    water: { value: 2.986, unit: 'liters', date: 'Feb 9th', goalPercent: 199 },
    activity: { minutes: 30, calories: 302, date: 'Feb 8th' },
    hba1c: { value: null, unit: '%', date: null },
    bloodPressure: { sys: 110, dia: 80, date: 'Feb 8th', status: 'High' as const },
};

interface HealthMetricCardProps {
    icon: React.ReactNode;
    title: string;
    date: string | null;
    children: React.ReactNode;
    onPress: () => void;
    progressBar?: { value: number; color: string };
}

function HealthMetricCard({ icon, title, date, children, onPress, progressBar }: HealthMetricCardProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={handlePress}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                    <View style={styles.iconContainer}>{icon}</View>
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <View style={styles.dateRow}>
                    <Text style={styles.dateText}>{date || 'No data'}</Text>
                    <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </View>
            </View>
            <View style={styles.cardContent}>{children}</View>
            {progressBar && (
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${Math.min(progressBar.value, 100)}%`, backgroundColor: progressBar.color }
                        ]}
                    />
                </View>
            )}
        </Pressable>
    );
}

function StatusChip({ status }: { status: 'High' | 'Normal' | 'Low' }) {
    const statusColors = {
        High: colors.error,
        Normal: colors.success,
        Low: colors.warning,
    };
    return <Text style={[styles.statusChip, { color: statusColors[status] }]}>· {status}</Text>;
}

export function HealthOverviewScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    const navigateToInsights = (metric: MetricType) => {
        navigation.navigate('HealthInsights', { metric });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                >
                    <Feather name="chevron-left" size={28} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Health Overview</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Weight Card */}
                <HealthMetricCard
                    icon={<ScaleIcon width={22} height={22} color={colors.textSecondary} />}
                    title="Weight"
                    date={healthData.weight.date}
                    onPress={() => navigateToInsights('weight')}
                    progressBar={{ value: healthData.weight.progress, color: colors.success }}
                >
                    <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>{healthData.weight.value}</Text>
                        <Text style={styles.unitText}>{healthData.weight.unit}</Text>
                        <Text style={styles.goalText}>· {healthData.weight.progress}% of goal</Text>
                    </View>
                </HealthMetricCard>

                {/* Glucose Card */}
                <HealthMetricCard
                    icon={<BloodPressureIcon width={22} height={22} color={colors.textSecondary} />}
                    title="Glucose"
                    date={healthData.glucose.date}
                    onPress={() => navigateToInsights('glucose')}
                >
                    <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>{healthData.glucose.value}</Text>
                        <Text style={styles.unitText}>{healthData.glucose.unit}</Text>
                        <StatusChip status={healthData.glucose.status} />
                    </View>
                </HealthMetricCard>

                {/* Water Card */}
                <HealthMetricCard
                    icon={<WaterIcon width={22} height={22} color={colors.textSecondary} />}
                    title="Water"
                    date={healthData.water.date}
                    onPress={() => navigateToInsights('water')}
                    progressBar={{ value: Math.min(healthData.water.goalPercent, 100), color: colors.success }}
                >
                    <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>{healthData.water.value}</Text>
                        <Text style={styles.unitText}>{healthData.water.unit}</Text>
                        <Text style={styles.goalText}>· {healthData.water.goalPercent}% of goal</Text>
                    </View>
                </HealthMetricCard>

                {/* Activity Card */}
                <HealthMetricCard
                    icon={<ActivityIcon width={22} height={22} color={colors.textSecondary} />}
                    title="Activity"
                    date={healthData.activity.date}
                    onPress={() => navigateToInsights('activity')}
                >
                    <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>{healthData.activity.minutes}</Text>
                        <Text style={styles.unitText}>min</Text>
                        <Text style={styles.goalText}>· {healthData.activity.calories} kcal</Text>
                    </View>
                </HealthMetricCard>

                {/* HbA1c Card */}
                <HealthMetricCard
                    icon={<BloodIcon width={22} height={22} color={colors.textSecondary} />}
                    title="HbA1c"
                    date={healthData.hba1c.date}
                    onPress={() => navigateToInsights('hba1c')}
                >
                    <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>
                            {healthData.hba1c.value !== null ? healthData.hba1c.value : '—'}
                        </Text>
                        <Text style={styles.unitText}>{healthData.hba1c.unit}</Text>
                        {healthData.hba1c.value === null && (
                            <Text style={styles.noDataText}>No data</Text>
                        )}
                    </View>
                </HealthMetricCard>

                {/* Blood Pressure Card */}
                <HealthMetricCard
                    icon={<BloodIcon width={22} height={22} color={colors.textSecondary} />}
                    title="Blood pressure"
                    date={healthData.bloodPressure.date}
                    onPress={() => navigateToInsights('bloodpressure')}
                >
                    <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>{healthData.bloodPressure.sys}</Text>
                        <Text style={styles.bpLabel}>SYS</Text>
                        <Text style={styles.mainValue}>{healthData.bloodPressure.dia}</Text>
                        <Text style={styles.bpLabel}>DIA</Text>
                        <StatusChip status={healthData.bloodPressure.status} />
                    </View>
                </HealthMetricCard>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.textPrimary,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        ...shadows.soft,
    },
    cardPressed: {
        opacity: 0.95,
        transform: [{ scale: 0.99 }],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    cardContent: {
        marginBottom: 4,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 4,
    },
    mainValue: {
        fontFamily: typography.heading,
        fontSize: 28,
        color: colors.textPrimary,
    },
    unitText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        marginRight: 4,
    },
    goalText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textMuted,
    },
    noDataText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textMuted,
        marginLeft: 8,
    },
    bpLabel: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginRight: 12,
    },
    statusChip: {
        fontFamily: typography.subheading,
        fontSize: 14,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: colors.progressTrack,
        borderRadius: 3,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});
