import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList, MetricType } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'HealthInsights'>;

const screenWidth = Dimensions.get('window').width;

const TABS: { id: MetricType; label: string }[] = [
    { id: 'glucose', label: 'Glucose' },
    { id: 'water', label: 'Water' },
    { id: 'activity', label: 'Activity' },
    { id: 'hba1c', label: 'HbA1c' },
    { id: 'bloodpressure', label: 'Blood pressure' },
];

// Mock chart data
const weekDays = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];

// Mock data for each metric type
const mockInsightsData: Record<MetricType, any> = {
    weight: {
        chartData: [0, 0, 0, 0, 0, 250, 0],
        maxValue: 300,
        goal: '250 kg',
        goalLabel: 'Weight goal',
        insights: { average: 250, max: 250, min: 250 },
        unit: 'kg',
        summary: 'You maintained your weight goal',
        successDays: '7 out of 7 days',
        history: [{ date: 'Feb 8, 11:00 AM', value: '250 kg' }],
    },
    glucose: {
        chartData: [0, 0, 0, 0, 0, 0, 0],
        maxValue: 10,
        goal: '7.0 mmol/L',
        goalLabel: 'Target range',
        insights: { average: '-', max: '-', min: '-' },
        unit: 'mmol/l',
        summary: '0 readings today\nYou were in range 0% of the time',
        successDays: null,
        history: [],
    },
    water: {
        chartData: [0, 1500, 0, 800, 0, 2986, 0],
        maxValue: 3000,
        goal: '1500 ml',
        goalLabel: 'Water goal',
        insights: { average: 797, dailyGoal: 1500 },
        unit: 'ml',
        summary: 'You hit your water goal on',
        successDays: '2 out of 7 days',
        history: [
            { date: 'Yesterday, 11:45 PM', value: '2986.9 ml' },
            { date: 'Feb 6, 6:30 PM', value: '500 ml' },
        ],
    },
    activity: {
        chartData: [0, 0, 0, 0, 0, 30, 0],
        maxValue: 30,
        goal: '30 min',
        goalLabel: 'Activity goal',
        insights: { burnedCalories: 43, activeMinutes: 4 },
        unit: 'min',
        summary: 'You reached your active time goal on',
        successDays: '1 out of 7 days',
        history: [{ date: 'Yesterday, 11:15 PM', value: 'Animal care, household, animals' }],
    },
    hba1c: {
        chartData: [0, 0, 0, 0, 0, 0, 0],
        maxValue: 10,
        goal: '< 7%',
        goalLabel: 'HbA1c target',
        insights: { average: '-', max: '-', min: '-' },
        unit: '%',
        summary: 'No HbA1c data recorded yet',
        successDays: null,
        history: [],
    },
    bloodpressure: {
        chartData: [0, 0, 0, 0, 0, 110, 0],
        maxValue: 150,
        goal: '120/80 mmHg',
        goalLabel: 'Blood pressure goal',
        insights: { average: '110/80', max: '110/80', min: '110/80' },
        unit: 'mmHg',
        summary: 'Your blood pressure was in the healthy range',
        successDays: '0% of the time',
        history: [{ date: 'Yesterday, 11:45 PM', value: '110/80 mmHg · 81 bpm' }],
    },
};

// Filter Tab Button - Pill style
function FilterTab({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
    return (
        <Pressable
            style={[styles.filterTab, isActive && styles.filterTabActive]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
        >
            <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>{label}</Text>
        </Pressable>
    );
}

// Time Selector - Segmented Control
function TimeSelector({ options, selected, onSelect }: { options: string[]; selected: number; onSelect: (i: number) => void }) {
    return (
        <View style={styles.timeSelectorContainer}>
            {options.map((opt, i) => (
                <Pressable
                    key={opt}
                    style={[styles.timeSelectorOption, selected === i && styles.timeSelectorOptionActive]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onSelect(i);
                    }}
                >
                    <Text style={[styles.timeSelectorText, selected === i && styles.timeSelectorTextActive]}>{opt}</Text>
                </Pressable>
            ))}
        </View>
    );
}

// Bar Chart with gradient bars and goal line
function BarChart({ data, maxValue, color, goalValue }: { data: number[]; maxValue: number; color: string; goalValue?: number }) {
    const chartHeight = 180;
    const goalLineY = goalValue && maxValue > 0 ? (1 - goalValue / maxValue) * chartHeight : null;

    // Y-axis labels
    const yLabels = [maxValue, Math.round(maxValue * 0.67), Math.round(maxValue * 0.33), 0];

    return (
        <View style={styles.chartWrapper}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
                {yLabels.map((label, i) => (
                    <Text key={i} style={styles.yAxisLabel}>{label}</Text>
                ))}
            </View>

            {/* Chart area */}
            <View style={styles.chartArea}>
                {/* Grid lines */}
                <View style={styles.gridLines}>
                    {[0, 1, 2, 3].map(i => (
                        <View key={i} style={styles.gridLine} />
                    ))}
                </View>

                {/* Bars */}
                <View style={styles.barsContainer}>
                    {data.map((val, i) => {
                        const barHeight = maxValue > 0 ? (val / maxValue) * chartHeight : 0;
                        const isActive = val > 0;
                        return (
                            <View key={i} style={styles.barColumn}>
                                <View style={styles.barWrapper}>
                                    {isActive ? (
                                        <LinearGradient
                                            colors={[color, `${color}80`]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            style={[styles.bar, { height: barHeight }]}
                                        />
                                    ) : (
                                        <View style={[styles.bar, { height: 0 }]} />
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Goal line */}
                {goalLineY !== null && (
                    <View style={[styles.goalLine, { top: goalLineY }]}>
                        <View style={styles.goalLineDash} />
                    </View>
                )}
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
                {weekDays.map((day, i) => (
                    <Text key={i} style={styles.xAxisLabel}>{day}</Text>
                ))}
            </View>
        </View>
    );
}

export function HealthInsightsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();

    const [activeTab, setActiveTab] = useState<MetricType>(route.params?.metric || 'glucose');
    const [periodIndex, setPeriodIndex] = useState(0); // 0 = Week, 1 = Month

    const data = mockInsightsData[activeTab];

    const getChartColor = () => {
        switch (activeTab) {
            case 'water': return colors.success;
            case 'activity': return colors.success;
            case 'glucose': return colors.primary;
            case 'bloodpressure': return colors.warning;
            case 'weight': return colors.success;
            default: return colors.primary;
        }
    };

    const getGoalValue = () => {
        switch (activeTab) {
            case 'water': return 1500;
            case 'activity': return 30;
            default: return undefined;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header - Clean white background */}
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
                <Text style={styles.headerTitle}>Your insights</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Filter Tabs - Rounded pill buttons */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterTabsScroll}
                contentContainerStyle={styles.filterTabsContent}
            >
                {TABS.map(tab => (
                    <FilterTab
                        key={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onPress={() => setActiveTab(tab.id)}
                    />
                ))}
            </ScrollView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Time Selector - Segmented Control */}
                <TimeSelector
                    options={['Week', 'Month']}
                    selected={periodIndex}
                    onSelect={setPeriodIndex}
                />

                {/* Date Navigation */}
                <View style={styles.dateNavRow}>
                    <Pressable
                        style={styles.dateArrowBtn}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.dateRangeText}>Feb 3 – Feb 9</Text>
                    <Pressable
                        style={styles.dateArrowBtn}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <Feather name="chevron-right" size={24} color={colors.textPrimary} />
                    </Pressable>
                </View>

                {/* Chart Card - Rounded white with soft shadow */}
                <View style={styles.chartCard}>
                    <BarChart
                        data={data.chartData}
                        maxValue={data.maxValue}
                        color={getChartColor()}
                        goalValue={getGoalValue()}
                    />

                    {/* Goal Section */}
                    <View style={styles.goalRow}>
                        <Text style={styles.goalLabel}>— {data.goalLabel}</Text>
                        <Text style={styles.goalValue}>{data.goal}</Text>
                    </View>
                </View>

                {/* Summary Card - Two-column layout */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>
                        Your {activeTab} insights {data.unit ? `(${data.unit})` : ''}
                    </Text>

                    <View style={styles.summaryColumns}>
                        {activeTab === 'water' ? (
                            <>
                                <View style={styles.summaryColumn}>
                                    <Text style={styles.summaryValue}>{data.insights.average}</Text>
                                    <Text style={styles.summaryLabel}>Daily average</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryColumn}>
                                    <Text style={styles.summaryValue}>{data.insights.dailyGoal}</Text>
                                    <Text style={styles.summaryLabel}>Daily goal</Text>
                                </View>
                            </>
                        ) : activeTab === 'activity' ? (
                            <>
                                <View style={styles.summaryColumn}>
                                    <Text style={styles.summaryValue}>{data.insights.burnedCalories}</Text>
                                    <Text style={styles.summaryLabel}>Burned calories</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryColumn}>
                                    <Text style={styles.summaryValue}>{data.insights.activeMinutes}</Text>
                                    <Text style={styles.summaryLabel}>Active minutes</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.summaryColumn}>
                                    <Text style={styles.summaryValue}>{data.insights.average}</Text>
                                    <Text style={styles.summaryLabel}>Average</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryColumn}>
                                    <Text style={styles.summaryValue}>{data.insights.max}</Text>
                                    <Text style={styles.summaryLabel}>Max</Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryColumn}>
                                    <Text style={styles.summaryValue}>{data.insights.min}</Text>
                                    <Text style={styles.summaryLabel}>Min</Text>
                                </View>
                            </>
                        )}
                    </View>

                    <Text style={styles.summaryMessage}>
                        {data.summary}{' '}
                        {data.successDays && (
                            <Text style={styles.successText}>{data.successDays}</Text>
                        )}
                    </Text>
                </View>

                {/* History Section */}
                <Text style={styles.sectionTitle}>History</Text>

                {data.history.length === 0 ? (
                    <View style={styles.emptyHistoryCard}>
                        <Text style={styles.emptyHistoryText}>No history yet</Text>
                    </View>
                ) : (
                    <View style={styles.historyCard}>
                        {data.history.map((item: any, i: number) => (
                            <View key={i} style={[styles.historyItem, i > 0 && styles.historyItemBorder]}>
                                <View style={styles.historyIndicator} />
                                <View style={styles.historyContent}>
                                    <Text style={styles.historyDate}>{item.date}</Text>
                                    <Text style={styles.historyValue}>{item.value}</Text>
                                </View>
                                <Pressable style={styles.historyEditBtn}>
                                    <Feather name="edit-2" size={16} color={colors.textMuted} />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <Pressable
                style={[styles.fab, { bottom: insets.bottom + 90 }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
                <Feather name="plus" size={28} color={colors.surface} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header - Clean white
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: colors.surface,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
    },
    headerSpacer: {
        width: 44,
    },

    // Filter Tabs - Rounded pills
    filterTabsScroll: {
        backgroundColor: colors.surface,
        maxHeight: 56,
    },
    filterTabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.surfaceAlt,
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterTabText: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.textSecondary,
    },
    filterTabTextActive: {
        color: colors.surface,
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },

    // Time Selector - Segmented Control
    timeSelectorContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        padding: 4,
    },
    timeSelectorOption: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    timeSelectorOptionActive: {
        backgroundColor: colors.surface,
        ...shadows.soft,
    },
    timeSelectorText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    timeSelectorTextActive: {
        fontFamily: typography.subheading,
        color: colors.textPrimary,
    },

    // Date Navigation
    dateNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    dateArrowBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    dateRangeText: {
        fontFamily: typography.subheading,
        fontSize: 16,
        color: colors.textPrimary,
    },

    // Chart Card
    chartCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 20,
        ...shadows.card,
    },
    chartWrapper: {
        flexDirection: 'row',
        height: 220,
    },
    yAxisLabels: {
        width: 40,
        justifyContent: 'space-between',
        paddingBottom: 24,
    },
    yAxisLabel: {
        fontFamily: typography.body,
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'right',
    },
    chartArea: {
        flex: 1,
        position: 'relative',
        height: 180,
    },
    gridLines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 24,
        justifyContent: 'space-between',
    },
    gridLine: {
        height: 1,
        backgroundColor: colors.border,
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 180,
        paddingBottom: 24,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
    },
    barWrapper: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 28,
        borderRadius: 6,
        minHeight: 0,
    },
    goalLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
    },
    goalLineDash: {
        height: 2,
        backgroundColor: colors.textMuted,
        opacity: 0.5,
    },
    xAxisLabels: {
        position: 'absolute',
        bottom: 0,
        left: 40,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    xAxisLabel: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    goalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    goalLabel: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    goalValue: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.textPrimary,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 18,
        padding: 20,
    },
    summaryTitle: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 16,
    },
    summaryColumns: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    summaryColumn: {
        alignItems: 'center',
        flex: 1,
    },
    summaryValue: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.textPrimary,
    },
    summaryLabel: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 8,
    },
    summaryMessage: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    successText: {
        color: colors.success,
        fontFamily: typography.subheading,
    },

    // History Section
    sectionTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
    },
    historyCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        overflow: 'hidden',
        ...shadows.soft,
    },
    emptyHistoryCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        ...shadows.soft,
    },
    emptyHistoryText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textMuted,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    historyItemBorder: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    historyIndicator: {
        width: 4,
        height: 40,
        backgroundColor: colors.warning,
        borderRadius: 2,
    },
    historyContent: {
        flex: 1,
    },
    historyDate: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textPrimary,
    },
    historyValue: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    historyEditBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // FAB
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
    },
});
