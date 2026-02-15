import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import StreakIcon from '../../assets/icons/streak.svg';

interface StreakBadgeProps {
    days: number;
}

export function StreakBadge({ days }: StreakBadgeProps) {
    return (
        <View style={styles.container}>
            <StreakIcon width={16} height={16} />
            <Text style={styles.text}>{days}-day streak</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.streakSoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.streak,
    },
    text: {
        fontFamily: typography.subheading,
        fontSize: typography.sizes.xs,
        color: colors.streak,
    },
});
