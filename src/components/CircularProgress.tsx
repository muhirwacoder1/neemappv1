import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
    progress: number; // 0-100
    value: number;
    label: string;
}

export function CircularProgress({
    size = 120,
    strokeWidth = 10,
    progress,
    value,
    label,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Circle
                    stroke={colors.progressTrack}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <Circle
                    stroke={colors.progressFill}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={styles.textContainer}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    value: {
        fontFamily: typography.heading,
        fontSize: typography.sizes.xxl,
        color: colors.textPrimary,
    },
    label: {
        fontFamily: typography.body,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
});
