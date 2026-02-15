import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { PressableScale } from './PressableScale';

interface ResourceCardProps {
    title: string;
    image: string;
    isNew?: boolean;
    isHalf?: boolean;
    onPress?: () => void;
}

const screenWidth = Dimensions.get('window').width;
const CONTAINER_PADDING = 16; // Must match HomeScreen SECTION_GAP
const cardPadding = CONTAINER_PADDING * 2; // total left + right
const cardGap = 12;

export function ResourceCard({ title, image, isNew, isHalf, onPress }: ResourceCardProps) {
    const cardWidth = isHalf
        ? (screenWidth - cardPadding - cardGap) / 2
        : screenWidth - cardPadding;

    return (
        <PressableScale
            style={[styles.container, { width: cardWidth }, isHalf && styles.halfHeight]}
            onPress={onPress}
        >
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.overlay}>
                {isNew && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>NEW</Text>
                    </View>
                )}
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>{title}</Text>
                </View>
            </View>
        </PressableScale>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        ...shadows.soft,
    },
    halfHeight: {
        height: 140,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        padding: spacing.md,
        justifyContent: 'space-between',
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.success,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontFamily: typography.subheading,
        fontSize: typography.sizes.xs,
        color: colors.surface,
    },
    labelContainer: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    label: {
        fontFamily: typography.subheading,
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
    },
});
