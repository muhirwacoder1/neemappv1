import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Modal } from 'react-native';
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
import { AddBloodPressureModal } from '../components/AddBloodPressureModal';
import { LogHbA1cModal } from '../components/LogHbA1cModal';
import { LogWaterModal } from '../components/LogWaterModal';
import { LogGlucoseModal } from '../components/LogGlucoseModal';
import { AddWeightModal } from '../components/AddWeightModal';
import { WeightResultModal } from '../components/WeightResultModal';
import { useAuth } from '../context/AuthContext';
import { getReadings, addBloodPressure, addGlucoseReading, addWeightReading, addWaterIntake, getUserGoalWeight, getAllReadings, getUserWaterSettings, updateUserWaterSettings, WaterSettings } from '../services/healthData';
import { Timestamp } from 'firebase/firestore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'HealthInsights'>;

const screenWidth = Dimensions.get('window').width;

const TABS: { id: MetricType; label: string }[] = [
    { id: 'weight', label: 'Weight' },
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
        // Line chart points (y values over ~30 days)
        linePoints: [90, 89.5, 89, 88.7, 88.5, 88, 87.5, 87, 86.8, 86.5, 86, 85.5, 85],
        maxValue: 94,
        minValue: 82,
        targetWeight: 87,
        startingWeight: 90,
        currentWeight: 85,
        progressKg: -5,
        goal: '87 kg',
        goalLabel: 'Target weight',
        dateRange: 'Jan 16, 2026',
        dateRangeEnd: 'Feb 15, 2026',
        unit: 'kg',
        history: [
            { date: 'Today, 4:31 PM', value: '85 kg', change: '(-5 kg)' },
            { date: 'Feb 10, 9:15 AM', value: '86 kg', change: '(-4 kg)' },
            { date: 'Jan 28, 8:00 AM', value: '88 kg', change: '(-2 kg)' },
        ],
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
        // Year-long data points (monthly)
        linePoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
        maxValue: 7,
        minValue: 0,
        targetLine: 5.7,  // normal < 5.7
        unit: '%',
        dateRange: 'Feb 15, 2025',
        dateRangeEnd: 'Feb 15, 2026',
        history: [
            { date: '2026 Feb 15', value: '6%', whenTaken: 'Fasting', nextVisit: 'Aug 2026' },
        ],
        ranges: [
            { label: 'Normal', range: 'Below 5.7%', color: '#22C55E' },
            { label: 'Prediabetes', range: '5.7% – 6.4%', color: '#F59E0B' },
            { label: 'Diabetes', range: '6.5% or above', color: '#EF4444' },
        ],
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

// Simple Line Chart for Weight
function LineChart({ points, maxVal, minVal, targetLine }: { points: number[]; maxVal: number; minVal: number; targetLine?: number }) {
    const chartHeight = 180;
    const chartWidth = screenWidth - 100; // account for padding + y-axis
    const range = maxVal - minVal || 1;
    const yLabels = [maxVal, Math.round(maxVal - range * 0.17), Math.round(maxVal - range * 0.33), Math.round(maxVal - range * 0.5), Math.round(maxVal - range * 0.67), Math.round(maxVal - range * 0.83), minVal];

    const getY = (val: number) => ((maxVal - val) / range) * chartHeight;
    const getX = (i: number) => (i / (points.length - 1)) * chartWidth;

    const targetLineY = targetLine ? getY(targetLine) : null;

    return (
        <View style={styles.chartWrapper}>
            {/* Y-axis labels */}
            <View style={[styles.yAxisLabels, { justifyContent: 'space-between', height: chartHeight }]}>
                {yLabels.map((label, i) => (
                    <Text key={i} style={styles.yAxisLabel}>{label}</Text>
                ))}
            </View>

            {/* Chart area */}
            <View style={[styles.chartArea, { height: chartHeight }]}>
                {/* Grid lines */}
                <View style={[styles.gridLines, { bottom: 0 }]}>
                    {yLabels.map((_, i) => (
                        <View key={i} style={styles.gridLine} />
                    ))}
                </View>

                {/* Target line */}
                {targetLineY !== null && (
                    <View style={[styles.goalLine, { top: targetLineY }]}>
                        <View style={styles.goalLineDash} />
                    </View>
                )}

                {/* Line + dots */}
                {points.map((val, i) => {
                    if (i === 0) return null;
                    const x1 = getX(i - 1);
                    const y1 = getY(points[i - 1]);
                    const x2 = getX(i);
                    const y2 = getY(val);
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    return (
                        <View
                            key={`line-${i}`}
                            style={{
                                position: 'absolute',
                                left: x1,
                                top: y1,
                                width: len,
                                height: 2,
                                backgroundColor: '#333',
                                transform: [{ rotate: `${angle}deg` }],
                                transformOrigin: 'left center',
                            }}
                        />
                    );
                })}

                {/* Dots */}
                {[0, points.length - 1].map((i) => (
                    <View
                        key={`dot-${i}`}
                        style={{
                            position: 'absolute',
                            left: getX(i) - 5,
                            top: getY(points[i]) - 5,
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#555',
                        }}
                    />
                ))}
            </View>
        </View>
    );
}

// Weight-specific content
function WeightInsightContent({ data, periodIndex, setPeriodIndex }: { data: any; periodIndex: number; setPeriodIndex: (i: number) => void }) {
    return (
        <>
            {/* Time Selector - Month / Year */}
            <TimeSelector
                options={['Month', 'Year']}
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
                <Text style={styles.dateRangeText}>Jan 16 – Feb 15</Text>
                <Pressable
                    style={styles.dateArrowBtn}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                    <Feather name="chevron-right" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            {/* Line Chart */}
            <View style={styles.chartCard}>
                <LineChart
                    points={data.linePoints}
                    maxVal={data.maxValue}
                    minVal={data.minValue}
                    targetLine={data.targetWeight}
                />

                {/* Date range labels */}
                <View style={styles.weightDateRow}>
                    <Text style={styles.weightDateLabel}>{data.dateRange}</Text>
                    <Text style={styles.weightDateLabel}>{data.dateRangeEnd}</Text>
                </View>

                {/* Target weight */}
                <View style={styles.goalRow}>
                    <Text style={styles.goalLabel}>— {data.goalLabel}</Text>
                    <Text style={styles.goalValue}>{data.goal}</Text>
                </View>
            </View>

            {/* Weight Goal Section */}
            <View style={styles.weightGoalCard}>
                <Text style={styles.weightGoalTitle}>Your weight goal  (kg)</Text>
                <View style={styles.weightGoalRow}>
                    <View style={styles.weightGoalItem}>
                        <Text style={styles.weightGoalNumber}>{data.startingWeight}</Text>
                        <Text style={styles.weightGoalLabel}>Starting</Text>
                    </View>
                    <View style={styles.weightGoalDivider} />
                    <View style={styles.weightGoalItem}>
                        <Text style={styles.weightGoalNumber}>{data.currentWeight}</Text>
                        <Text style={styles.weightGoalLabel}>Current</Text>
                    </View>
                    <View style={styles.weightGoalDivider} />
                    <View style={styles.weightGoalItem}>
                        <Text style={styles.weightGoalNumber}>{data.targetWeight}</Text>
                        <Text style={styles.weightGoalLabel}>Target</Text>
                    </View>
                </View>
                <Text style={styles.weightProgressText}>
                    Progress toward the goal: <Text style={{ color: parseFloat(data.progressKg) <= 0 ? colors.success : colors.error, fontFamily: typography.subheading }}>{data.progressKg} kg</Text>
                </Text>
            </View>

            {/* History */}
            <Text style={styles.sectionTitle}>History</Text>
            <View style={styles.historyCard}>
                {data.history.map((item: any, i: number) => (
                    <View key={i} style={[styles.historyItem, i > 0 && styles.historyItemBorder]}>
                        <View style={styles.historyContent}>
                            <Text style={styles.historyDate}>{item.date}</Text>
                            <Text style={styles.historyValue}>
                                {item.value} • <Text style={{ color: item.change?.includes('+') ? colors.error : colors.success }}>{item.change}</Text>
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </>
    );
}
// HbA1c-specific content
function HbA1cInsightContent({ data }: { data: any }) {
    const [rangesExpanded, setRangesExpanded] = useState(false);

    return (
        <>
            {/* Year chart */}
            <View style={styles.chartCard}>
                <LineChart
                    points={data.linePoints}
                    maxVal={data.maxValue}
                    minVal={data.minValue}
                    targetLine={data.targetLine}
                />

                {/* Date range labels */}
                <View style={styles.weightDateRow}>
                    <Text style={styles.weightDateLabel}>{data.dateRange}</Text>
                    <Text style={styles.weightDateLabel}>{data.dateRangeEnd}</Text>
                </View>
            </View>

            {/* History */}
            <Text style={styles.sectionTitle}>History</Text>
            <View style={styles.historyCard}>
                {data.history.map((item: any, i: number) => (
                    <View key={i} style={[styles.historyItem, i > 0 && styles.historyItemBorder]}>
                        <View style={styles.hba1cIndicator} />
                        <View style={[styles.historyContent, { flex: 1 }]}>
                            <Text style={styles.historyDate}>{item.date}</Text>
                            {item.whenTaken && (
                                <Text style={styles.hba1cMeta}>When taken: {item.whenTaken}</Text>
                            )}
                            {item.nextVisit && (
                                <Text style={styles.hba1cMeta}>Next visit: {item.nextVisit}</Text>
                            )}
                        </View>
                        <Text style={styles.hba1cValue}>{item.value}</Text>
                        <Pressable style={styles.historyEditBtn}>
                            <Feather name="edit-2" size={16} color={colors.textMuted} />
                        </Pressable>
                    </View>
                ))}
            </View>

            {/* HbA1c Ranges Accordion */}
            <Pressable
                style={styles.rangesAccordion}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRangesExpanded(!rangesExpanded);
                }}
            >
                <Text style={styles.rangesTitle}>HbA1c ranges</Text>
                <Feather name={rangesExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={colors.textSecondary} />
            </Pressable>

            {rangesExpanded && (
                <View style={styles.rangesContent}>
                    {data.ranges.map((r: any, i: number) => (
                        <View key={i} style={styles.rangeRow}>
                            <View style={[styles.rangeDot, { backgroundColor: r.color }]} />
                            <Text style={styles.rangeLabel}>{r.label}</Text>
                            <Text style={styles.rangeValue}>{r.range}</Text>
                        </View>
                    ))}
                </View>
            )}
        </>
    );
}
// ── Glucose Zone Helpers ──────────────────────────────────────────
const GLUCOSE_ZONES = {
    LOW: { min: 0, max: 3.9, color: '#4A90D9', bgColor: 'rgba(74, 144, 217, 0.08)', label: 'Low' },
    NORMAL: { min: 3.9, max: 10, color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.12)', label: 'Normal' },
    HIGH: { min: 10, max: 20, color: '#FF3B30', bgColor: 'rgba(255, 59, 48, 0.10)', label: 'High' },
};

function getGlucoseZoneColor(value: number): string {
    if (value < 3.9) return GLUCOSE_ZONES.LOW.color;
    if (value <= 10) return GLUCOSE_ZONES.NORMAL.color;
    return GLUCOSE_ZONES.HIGH.color;
}

// ── Glucose Day Chart ─────────────────────────────────────────────
function GlucoseDayChart({ readings }: { readings: any[] }) {
    const CHART_WIDTH = Math.max(screenWidth * 1.3, 480);
    const CHART_HEIGHT = 180;
    const Y_MIN = 2;
    const Y_MAX = 14;
    const Y_RANGE = Y_MAX - Y_MIN;

    const getY = (val: number) => CHART_HEIGHT - ((Math.min(Math.max(val, Y_MIN), Y_MAX) - Y_MIN) / Y_RANGE) * CHART_HEIGHT;
    // Clean 3-hour intervals starting at midnight
    const timeLabels = [
        { label: '12 PM', hour: 12 },
        { label: '3 PM', hour: 15 },
        { label: '6 PM', hour: 18 },
        { label: '9 PM', hour: 21 },
    ];
    const getX = (date: Date) => {
        const hours = date.getHours() + date.getMinutes() / 60;
        return (hours / 24) * CHART_WIDTH;
    };
    const yLabels = [12, 10, 8, 6];

    return (
        <View style={gStyles.chartCard}>
            <View style={gStyles.chartRow}>
                <View style={[gStyles.yAxis, { height: CHART_HEIGHT }]}>
                    {yLabels.map((label, i) => (
                        <Text key={i} style={gStyles.yLabel}>{label}</Text>
                    ))}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={gStyles.chartScroll}>
                    <View style={[gStyles.chartArea, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
                        {/* Zone bands */}
                        <View style={[gStyles.zoneBand, { top: getY(Y_MAX), height: getY(10) - getY(Y_MAX), backgroundColor: GLUCOSE_ZONES.HIGH.bgColor }]} />
                        <View style={[gStyles.zoneBand, { top: getY(10), height: getY(3.9) - getY(10), backgroundColor: GLUCOSE_ZONES.NORMAL.bgColor }]} />
                        <View style={[gStyles.zoneBand, { top: getY(3.9), height: getY(Y_MIN) - getY(3.9), backgroundColor: GLUCOSE_ZONES.LOW.bgColor }]} />
                        {/* Grid lines */}
                        {yLabels.map((label, i) => (
                            <View key={i} style={[gStyles.gridLineThin, { top: getY(label) }]} />
                        ))}
                        {/* Zone boundary lines */}
                        <View style={[gStyles.zoneLine, { top: getY(10) }]} />
                        <View style={[gStyles.zoneLine, { top: getY(3.9) }]} />
                        {/* Glucose dots */}
                        {readings.map((r: any, i: number) => {
                            if (!r.timestamp?.toDate) return null;
                            const date = r.timestamp.toDate();
                            const x = getX(date);
                            const y = getY(r.value);
                            return (
                                <View key={i} style={[gStyles.dot, { left: x - 6, top: y - 6, backgroundColor: getGlucoseZoneColor(r.value) }]} />
                            );
                        })}
                        {/* X-axis labels at 3-hour intervals */}
                        <View style={gStyles.xAxisRow}>
                            {timeLabels.map((t, i) => (
                                <Text key={i} style={[gStyles.xLabel, { left: (t.hour / 24) * CHART_WIDTH - 16 }]}>{t.label}</Text>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

// ── Glucose Insight Content ───────────────────────────────────────
function GlucoseInsightContent({ data, periodIndex, setPeriodIndex }: { data: any; periodIndex: number; setPeriodIndex: (i: number) => void }) {
    const [zonesExpanded, setZonesExpanded] = useState(false);
    return (
        <>
            <TimeSelector options={['Day', 'Week', 'Month']} selected={periodIndex} onSelect={setPeriodIndex} />
            <View style={styles.dateNavRow}>
                <Pressable style={styles.dateArrowBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.dateRangeText}>Today</Text>
                <Pressable style={styles.dateArrowBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Feather name="chevron-right" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <GlucoseDayChart readings={data.todayReadings || []} />

            {/* Insights Card */}
            <View style={gStyles.insightsCard}>
                <Text style={gStyles.insightsTitle}>
                    Your blood glucose insights <Text style={gStyles.insightsUnit}>(mmol/l)</Text>
                </Text>
                <View style={styles.summaryColumns}>
                    <View style={styles.summaryColumn}>
                        <Text style={styles.summaryValue}>{data.insights?.average ?? '-'}</Text>
                        <Text style={styles.summaryLabel}>Average</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryColumn}>
                        <Text style={styles.summaryValue}>{data.insights?.max ?? '-'}</Text>
                        <Text style={styles.summaryLabel}>Max</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryColumn}>
                        <Text style={styles.summaryValue}>{data.insights?.min ?? '-'}</Text>
                        <Text style={styles.summaryLabel}>Min</Text>
                    </View>
                </View>
                <Text style={gStyles.readingsCount}>{data.readingsToday ?? 0} readings today</Text>
                <Text style={gStyles.inRangeText}>
                    You were in range <Text style={{ color: colors.success, fontFamily: typography.subheading }}>{data.inRangePercent ?? 0}%</Text> of the time
                </Text>
            </View>

            {/* History */}
            <Text style={styles.sectionTitle}>History</Text>
            {(!data.history || data.history.length === 0) ? (
                <View style={styles.emptyHistoryCard}>
                    <Text style={styles.emptyHistoryText}>No glucose readings yet</Text>
                </View>
            ) : (
                <View style={styles.historyCard}>
                    {data.history.map((item: any, i: number) => (
                        <View key={i} style={[styles.historyItem, i > 0 && styles.historyItemBorder]}>
                            <View style={[gStyles.zoneIndicator, { backgroundColor: item.zoneColor }]} />
                            <View style={[styles.historyContent, { marginLeft: 12 }]}>
                                <Text style={styles.historyDate}>{item.date}</Text>
                                <Text style={styles.historyValue}>{item.value}</Text>
                            </View>
                            {item.mealTiming ? (
                                <View style={gStyles.mealBadge}>
                                    <Text style={gStyles.mealBadgeText}>{item.mealTiming}</Text>
                                </View>
                            ) : null}
                        </View>
                    ))}
                </View>
            )}

            {/* Blood Glucose Zones */}
            <Pressable
                style={gStyles.zonesCard}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setZonesExpanded(p => !p); }}
            >
                <View style={gStyles.zonesHeader}>
                    <Text style={gStyles.zonesTitle}>Blood glucose zones</Text>
                    <Feather name={zonesExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textPrimary} />
                </View>
                {zonesExpanded && (
                    <View style={gStyles.zonesBody}>
                        <View style={gStyles.zonesTableHeader}>
                            <Text style={gStyles.zonesHeaderLabel}>Level</Text>
                            <Text style={gStyles.zonesHeaderValue}>Glucose (mmol/L)</Text>
                        </View>
                        <View style={gStyles.zonesDivider} />
                        {[
                            { ...GLUCOSE_ZONES.LOW, range: '< 3.9' },
                            { ...GLUCOSE_ZONES.NORMAL, range: '3.9 – 10' },
                            { ...GLUCOSE_ZONES.HIGH, range: '> 10' },
                        ].map((zone, i) => (
                            <View key={i} style={gStyles.zoneRow}>
                                <View style={[gStyles.zoneIndicator, { backgroundColor: zone.color }]} />
                                <Text style={gStyles.zoneLabel}>{zone.label}</Text>
                                <Text style={gStyles.zoneRange}>{zone.range}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Pressable>
        </>
    );
}

// Default content for non-weight tabs
function DefaultInsightContent({ data, activeTab, periodIndex, setPeriodIndex, getChartColor, getGoalValue }: any) {
    return (
        <>
            <TimeSelector options={['Week', 'Month']} selected={periodIndex} onSelect={setPeriodIndex} />

            <View style={styles.dateNavRow}>
                <Pressable style={styles.dateArrowBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.dateRangeText}>Feb 3 – Feb 9</Text>
                <Pressable style={styles.dateArrowBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Feather name="chevron-right" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <View style={styles.chartCard}>
                <BarChart data={data.chartData} maxValue={data.maxValue} color={getChartColor()} goalValue={getGoalValue()} />
                <View style={styles.goalRow}>
                    <Text style={styles.goalLabel}>— {data.goalLabel}</Text>
                    <Text style={styles.goalValue}>{data.goal}</Text>
                </View>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Your {activeTab} insights {data.unit ? `(${data.unit})` : ''}</Text>
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
                    {data.successDays && <Text style={styles.successText}>{data.successDays}</Text>}
                </Text>
            </View>

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
        </>
    );
}

export function HealthInsightsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();

    const [activeTab, setActiveTab] = useState<MetricType>(route.params?.metric || 'weight');
    const [periodIndex, setPeriodIndex] = useState(0);
    const [showBPModal, setShowBPModal] = useState(false);
    const [showHbA1cModal, setShowHbA1cModal] = useState(false);
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [waterSettings, setWaterSettings] = useState<WaterSettings>({ dailyGoalL: 1.5, containerType: 'glass', containerVolumeL: 0.25 });
    const [showGlucoseModal, setShowGlucoseModal] = useState(false);
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [showWeightResult, setShowWeightResult] = useState(false);
    const [weightResultData, setWeightResultData] = useState<{
        currentWeight: number; previousWeight: number | null;
        startingWeight: number | null; goalWeight: number | null;
        history: { date: string; value: string; change: string }[];
    } | null>(null);
    const { user } = useAuth();
    const [liveData, setLiveData] = useState<Record<string, any>>({});
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch real data from Firestore
    useEffect(() => {
        if (!user) return;
        // Load water settings
        getUserWaterSettings(user.uid).then(setWaterSettings).catch(console.error);
        (async () => {
            try {
                const [glucoseRaw, weightRaw, bpRaw, waterRaw] = await Promise.all([
                    getReadings(user.uid, 'glucose', 7),
                    getReadings(user.uid, 'weight', 30),
                    getReadings(user.uid, 'bloodPressure', 7),
                    getReadings(user.uid, 'water', 7),
                ]);

                const toWeekBuckets = (items: any[], valueFn: (item: any) => number) => {
                    const buckets = [0, 0, 0, 0, 0, 0, 0];
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    items.forEach((item) => {
                        const ts = item.timestamp as Timestamp;
                        if (!ts?.toDate) return;
                        const day = ts.toDate().getDay();
                        buckets[day] = Math.max(buckets[day], valueFn(item));
                    });
                    return buckets;
                };

                const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

                // Glucose
                const glucoseValues = glucoseRaw.map((r: any) => r.value).filter(Boolean);
                const glucoseChart = toWeekBuckets(glucoseRaw, (r) => r.value);
                const glucoseMax = Math.max(...glucoseValues, 10);

                // Weight
                const weightValues = weightRaw.map((r: any) => r.kg + (r.grams || 0) / 1000);
                const weightPoints = weightValues.length > 0 ? weightValues.reverse() : mockInsightsData.weight.linePoints;
                const currentWeight = weightValues.length > 0 ? weightValues[0] : mockInsightsData.weight.currentWeight;

                // Blood Pressure
                const bpValues = bpRaw.map((r: any) => r.systolic).filter(Boolean);
                const bpChart = toWeekBuckets(bpRaw, (r) => r.systolic);
                const bpMax = Math.max(...bpValues, 150);

                // Water
                const waterValues = waterRaw.map((r: any) => r.amount).filter(Boolean);
                const waterChart = toWeekBuckets(waterRaw, (r) => r.amount);
                const waterMax = Math.max(...waterValues, 3000);

                const formatDate = (ts: Timestamp) => {
                    if (!ts?.toDate) return '';
                    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                };

                // Weight - extended processing
                const startingWeight = weightValues.length > 0 ? weightValues[weightValues.length - 1] : null;
                const curWeight = weightValues.length > 0 ? weightValues[0] : null;
                const progressKg = startingWeight !== null && curWeight !== null
                    ? (curWeight - startingWeight).toFixed(1)
                    : '0';
                const goalWeight = await getUserGoalWeight(user.uid);
                const allWeightRaw = await getAllReadings(user.uid, 'weight');
                const historyEntries = allWeightRaw.map((r: any, idx: number, arr: any[]) => {
                    const wKg = r.kg + (r.grams || 0) / 1000;
                    const first = arr[arr.length - 1];
                    const firstKg = first.kg + (first.grams || 0) / 1000;
                    const diff = wKg - firstKg;
                    const sign = diff > 0 ? '+' : '';
                    return {
                        date: formatDate(r.timestamp),
                        value: `${r.kg}.${r.grams || 0} kg`,
                        change: idx < arr.length - 1 ? `(${sign}${diff.toFixed(1)} kg)` : '(starting)',
                    };
                });

                // Glucose - extended processing
                const allGlucoseRaw = await getAllReadings(user.uid, 'glucose');
                const allGlucoseValues = allGlucoseRaw.map((r: any) => r.value).filter(Boolean);
                const inRangeCount = allGlucoseValues.filter((v: number) => v >= 3.9 && v <= 10).length;
                const inRangePercent = allGlucoseValues.length > 0
                    ? Math.round((inRangeCount / allGlucoseValues.length) * 100)
                    : 0;

                // Today's readings for day chart
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayReadings = allGlucoseRaw.filter((r: any) => {
                    if (!r.timestamp?.toDate) return false;
                    return r.timestamp.toDate() >= today;
                });

                setLiveData({
                    glucose: {
                        rawReadings: allGlucoseRaw,
                        todayReadings,
                        chartData: glucoseChart,
                        maxValue: glucoseMax,
                        goal: '3.9 – 10 mmol/L',
                        goalLabel: 'Target range',
                        insights: {
                            average: allGlucoseValues.length ? (allGlucoseValues.reduce((a: number, b: number) => a + b, 0) / allGlucoseValues.length).toFixed(1) : '-',
                            max: allGlucoseValues.length ? Math.max(...allGlucoseValues) : '-',
                            min: allGlucoseValues.length ? Math.min(...allGlucoseValues) : '-',
                        },
                        readingsToday: todayReadings.length,
                        inRangePercent,
                        unit: 'mmol/l',
                        summary: `${todayReadings.length} readings today`,
                        successDays: null,
                        history: allGlucoseRaw.map((r: any) => {
                            const val = r.value;
                            let zoneColor = colors.success; // normal
                            if (val < 3.9) zoneColor = colors.primary; // low - blue
                            else if (val > 10) zoneColor = colors.error; // high - red
                            return {
                                date: formatDate(r.timestamp),
                                value: `${val} mmol/L`,
                                mealTiming: r.mealTiming || '',
                                zoneColor,
                                rawValue: val,
                            };
                        }),
                    },
                    weight: {
                        linePoints: weightPoints.length >= 2 ? weightPoints : mockInsightsData.weight.linePoints,
                        maxValue: weightPoints.length ? Math.max(...weightPoints) + 4 : mockInsightsData.weight.maxValue,
                        minValue: weightPoints.length ? Math.min(...weightPoints) - 4 : mockInsightsData.weight.minValue,
                        targetWeight: goalWeight ?? 87,
                        startingWeight: startingWeight ? startingWeight.toFixed(1) : mockInsightsData.weight.startingWeight,
                        currentWeight: curWeight ? curWeight.toFixed(1) : mockInsightsData.weight.currentWeight,
                        progressKg,
                        goal: goalWeight ? `${goalWeight} kg` : mockInsightsData.weight.goal,
                        goalLabel: 'Target weight',
                        dateRange: allWeightRaw.length > 0 ? formatDate((allWeightRaw[allWeightRaw.length - 1] as any).timestamp) : 'No data',
                        dateRangeEnd: allWeightRaw.length > 0 ? formatDate((allWeightRaw[0] as any).timestamp) : '',
                        unit: 'kg',
                        history: historyEntries,
                    },
                    bloodpressure: {
                        chartData: bpChart,
                        maxValue: bpMax,
                        goal: '120/80 mmHg',
                        goalLabel: 'Blood pressure goal',
                        insights: {
                            average: bpValues.length ? `${avg(bpValues)}/${avg(bpRaw.map((r: any) => r.diastolic))}` : '-',
                            max: bpValues.length ? Math.max(...bpValues) : '-',
                            min: bpValues.length ? Math.min(...bpValues) : '-',
                        },
                        unit: 'mmHg',
                        summary: `${bpValues.length} readings this week`,
                        successDays: null,
                        history: bpRaw.slice(0, 5).map((r: any) => ({
                            date: formatDate(r.timestamp),
                            value: `${r.systolic}/${r.diastolic} mmHg`,
                        })),
                    },
                    water: {
                        chartData: waterChart.map((v: number) => v / 1000),
                        maxValue: waterMax / 1000,
                        goal: `${waterSettings.dailyGoalL} L`,
                        goalLabel: 'Water goal',
                        insights: {
                            average: waterValues.length ? (avg(waterValues) / 1000).toFixed(2) : '0',
                            dailyGoal: waterSettings.dailyGoalL,
                        },
                        unit: 'L',
                        summary: waterValues.length ? 'You hit your water goal on' : 'No water data yet',
                        successDays: waterValues.length ? `${waterValues.filter(v => v / 1000 >= waterSettings.dailyGoalL).length} out of 7 days` : null,
                        history: waterRaw.slice(0, 10).map((r: any) => ({
                            date: formatDate(r.timestamp),
                            value: `${(r.amount / 1000).toFixed(2)} L`,
                        })),
                    },
                });
            } catch (e) {
                console.error('Failed to load insights data:', e);
            }
        })();
    }, [user, activeTab, refreshKey]);

    // Use live data when available, fall back to mock
    const data = liveData[activeTab] || mockInsightsData[activeTab];

    const getChartColor = () => {
        switch (activeTab) {
            case 'water': return colors.success;
            case 'activity': return colors.success;
            case 'glucose': return colors.primary;
            case 'weight': return '#333';
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
            {/* Header */}
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

            {/* Filter Tabs */}
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
                {activeTab === 'weight' ? (
                    <WeightInsightContent data={data} periodIndex={periodIndex} setPeriodIndex={setPeriodIndex} />
                ) : activeTab === 'glucose' ? (
                    <GlucoseInsightContent data={data} periodIndex={periodIndex} setPeriodIndex={setPeriodIndex} />
                ) : activeTab === 'hba1c' ? (
                    <HbA1cInsightContent data={data} />
                ) : (
                    <DefaultInsightContent
                        data={data}
                        activeTab={activeTab}
                        periodIndex={periodIndex}
                        setPeriodIndex={setPeriodIndex}
                        getChartColor={getChartColor}
                        getGoalValue={getGoalValue}
                    />
                )}
            </ScrollView>

            {/* FAB */}
            <Pressable
                style={[styles.fab, { bottom: insets.bottom + 90 }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (activeTab === 'water') {
                        setShowWaterModal(true);
                    } else if (activeTab === 'glucose') {
                        setShowGlucoseModal(true);
                    } else if (activeTab === 'weight') {
                        setShowWeightModal(true);
                    } else if (activeTab === 'bloodpressure') {
                        setShowBPModal(true);
                    } else if (activeTab === 'hba1c') {
                        setShowHbA1cModal(true);
                    }
                }}
            >
                <Feather name="plus" size={28} color={colors.surface} />
            </Pressable>

            {/* Blood Pressure Modal */}
            <AddBloodPressureModal
                visible={showBPModal}
                onClose={() => setShowBPModal(false)}
                onSave={async (systolic, diastolic) => {
                    if (!user) return;
                    try {
                        await addBloodPressure(user.uid, systolic, diastolic);
                        setShowBPModal(false);
                        // Refresh data
                        setLiveData({});
                    } catch (e: any) {
                        console.error(e);
                    }
                }}
            />

            {/* HbA1c Modal */}
            <LogHbA1cModal
                visible={showHbA1cModal}
                onClose={() => setShowHbA1cModal(false)}
            />

            {/* Log Water Modal */}
            <LogWaterModal
                visible={showWaterModal}
                onClose={() => setShowWaterModal(false)}
                dailyGoalL={waterSettings.dailyGoalL}
                containerType={waterSettings.containerType}
                containerVolumeL={waterSettings.containerVolumeL}
                onUpdateGoal={async (goalL) => {
                    if (!user) return;
                    await updateUserWaterSettings(user.uid, { dailyGoalL: goalL });
                    setWaterSettings(prev => ({ ...prev, dailyGoalL: goalL }));
                }}
                onUpdateContainer={async (type, volumeL) => {
                    if (!user) return;
                    await updateUserWaterSettings(user.uid, { containerType: type, containerVolumeL: volumeL });
                    setWaterSettings(prev => ({ ...prev, containerType: type, containerVolumeL: volumeL }));
                }}
                onSave={async (amountL) => {
                    if (!user) return;
                    try {
                        await addWaterIntake(user.uid, amountL * 1000);
                        setShowWaterModal(false);
                        setRefreshKey(k => k + 1);
                    } catch (e: any) {
                        console.error(e);
                    }
                }}
            />

            {/* Log Glucose Modal */}
            <LogGlucoseModal
                visible={showGlucoseModal}
                onClose={() => setShowGlucoseModal(false)}
                onSave={async (value, mealTiming) => {
                    if (!user) return;
                    try {
                        await addGlucoseReading(user.uid, value, 'mmol/L', mealTiming);
                        setShowGlucoseModal(false);
                        setRefreshKey(k => k + 1);
                    } catch (e: any) {
                        console.error(e);
                    }
                }}
            />

            {/* Add Weight Modal */}
            <AddWeightModal
                visible={showWeightModal}
                onClose={() => setShowWeightModal(false)}
                initialKg={70}
                onSave={async (kg, grams) => {
                    if (!user) return;
                    try {
                        // Get previous weight before saving
                        const prevData = liveData.weight;
                        const prevWeight = prevData?.currentWeight ? parseFloat(prevData.currentWeight) : null;

                        await addWeightReading(user.uid, kg, grams);
                        setShowWeightModal(false);

                        // Fetch data for result screen
                        const [goal, allReadings] = await Promise.all([
                            getUserGoalWeight(user.uid),
                            getAllReadings(user.uid, 'weight'),
                        ]);

                        const formatDateLocal = (ts: any) => {
                            if (!ts?.toDate) return '';
                            return ts.toDate().toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                            });
                        };

                        const historyEntries = allReadings.map((r: any, idx: number, arr: any[]) => {
                            const wKg = r.kg + (r.grams || 0) / 1000;
                            const first = arr[arr.length - 1];
                            const firstKg = first.kg + (first.grams || 0) / 1000;
                            const diff = wKg - firstKg;
                            const sign = diff > 0 ? '+' : '';
                            return {
                                date: formatDateLocal(r.timestamp),
                                value: `${r.kg}.${r.grams || 0} kg`,
                                change: idx < arr.length - 1 ? `(${sign}${diff.toFixed(1)} kg)` : '(starting)',
                            };
                        });

                        const startingW = allReadings.length > 0
                            ? (allReadings[allReadings.length - 1] as any).kg + ((allReadings[allReadings.length - 1] as any).grams || 0) / 1000
                            : null;

                        setWeightResultData({
                            currentWeight: kg + grams / 1000,
                            previousWeight: prevWeight,
                            startingWeight: startingW,
                            goalWeight: goal,
                            history: historyEntries,
                        });
                        setShowWeightResult(true);
                        setLiveData({});
                    } catch (e: any) {
                        console.error(e);
                    }
                }}
            />

            {/* Weight Result Modal */}
            {weightResultData && (
                <WeightResultModal
                    visible={showWeightResult}
                    onClose={() => setShowWeightResult(false)}
                    currentWeight={weightResultData.currentWeight}
                    previousWeight={weightResultData.previousWeight}
                    startingWeight={weightResultData.startingWeight}
                    goalWeight={weightResultData.goalWeight}
                    history={weightResultData.history}
                />
            )}
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
        backgroundColor: colors.success,
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

    // Weight-specific styles
    weightDateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    weightDateLabel: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    weightGoalCard: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 18,
        padding: 20,
    },
    weightGoalTitle: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 16,
    },
    weightGoalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    weightGoalItem: {
        alignItems: 'center',
        flex: 1,
    },
    weightGoalNumber: {
        fontFamily: typography.heading,
        fontSize: 24,
        color: colors.textPrimary,
    },
    weightGoalLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    weightGoalDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    weightProgressText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // HbA1c-specific styles
    hba1cIndicator: {
        width: 4,
        height: 36,
        borderRadius: 2,
        backgroundColor: '#F59E0B',
        marginRight: 12,
    },
    hba1cMeta: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    hba1cValue: {
        fontFamily: typography.subheading,
        fontSize: 16,
        color: colors.textPrimary,
        marginRight: 8,
    },
    rangesAccordion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        marginTop: 12,
        ...shadows.card,
    },
    rangesTitle: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    rangesContent: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        marginTop: 4,
        gap: 14,
        ...shadows.card,
    },
    rangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rangeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    rangeLabel: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.textPrimary,
        flex: 1,
    },
    rangeValue: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
});

// ── Glucose-specific styles ───────────────────────────────────────
const gStyles = StyleSheet.create({
    chartCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 12,
        ...shadows.card,
    },
    chartRow: {
        flexDirection: 'row',
    },
    yAxis: {
        width: 28,
        justifyContent: 'space-between',
        paddingRight: 4,
    },
    yLabel: {
        fontFamily: typography.body,
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'right',
    },
    chartScroll: {
        flex: 1,
    },
    chartArea: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
    },
    zoneBand: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
    gridLineThin: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    zoneLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.08)',
    },
    dot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
    },
    xAxisRow: {
        position: 'absolute',
        bottom: -20,
        left: 0,
        right: 0,
        height: 20,
    },
    xLabel: {
        position: 'absolute',
        fontFamily: typography.body,
        fontSize: 10,
        color: colors.textMuted,
    },
    filterIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    insightsCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 20,
        ...shadows.card,
    },
    insightsTitle: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 16,
    },
    insightsUnit: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    readingsCount: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textPrimary,
        textAlign: 'center',
        marginTop: 12,
    },
    inRangeText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    zoneIndicator: {
        width: 4,
        height: 28,
        borderRadius: 2,
    },
    mealBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
    },
    mealBadgeText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textSecondary,
    },
    zonesCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 20,
        ...shadows.card,
    },
    zonesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    zonesTitle: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    zonesBody: {
        marginTop: 16,
    },
    zonesTableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 8,
    },
    zonesHeaderLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    zonesHeaderValue: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    zonesDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 12,
    },
    zoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    zoneLabel: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textPrimary,
        flex: 1,
    },
    zoneRange: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
});
