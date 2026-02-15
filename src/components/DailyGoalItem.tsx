import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { PressableScale } from './PressableScale';

type GoalColor = 'blue' | 'orange' | 'green' | 'pink';

interface DailyGoalItemProps {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle: string;
    color: GoalColor;
    onPress?: () => void;
}

const colorMap: Record<GoalColor, { bg: string; icon: string }> = {
    blue: { bg: colors.goalBlueSoft, icon: colors.goalBlue },
    orange: { bg: colors.goalOrangeSoft, icon: colors.goalOrange },
    green: { bg: colors.goalGreenSoft, icon: colors.goalGreen },
    pink: { bg: colors.goalPinkSoft, icon: colors.goalPink },
};

export function DailyGoalItem({ icon, title, subtitle, color, onPress }: DailyGoalItemProps) {
    const colorScheme = colorMap[color];

    return (
        <PressableScale style={styles.container} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: colorScheme.bg }]}>
                <Feather name={icon} size={20} color={colorScheme.icon} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </PressableScale>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
    },
    subtitle: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
    },
});
