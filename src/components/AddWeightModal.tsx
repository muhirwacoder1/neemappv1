import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    Animated,
    Dimensions,
    TouchableOpacity,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PressableScale } from './PressableScale';

interface AddWeightModalProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (kg: number, grams: number) => void;
    initialKg?: number;
    initialGrams?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Generate weight values
const kgValues = Array.from({ length: 300 }, (_, i) => i + 1); // 1‒300 kg
const gramValues = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export function AddWeightModal({
    visible,
    onClose,
    onSave,
    initialKg = 90,
    initialGrams = 0,
}: AddWeightModalProps) {
    const [selectedKg, setSelectedKg] = useState(initialKg);
    const [selectedGrams, setSelectedGrams] = useState(initialGrams);
    const [isVisible, setIsVisible] = useState(false);

    const kgListRef = useRef<FlatList>(null);
    const gramsListRef = useRef<FlatList>(null);

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const scaleAnim = useRef(new Animated.Value(0.97)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    // ── Open / Close animation ──────────────────────────────────────
    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setSelectedKg(initialKg);
            setSelectedGrams(initialGrams);

            // Scroll to initial positions
            setTimeout(() => {
                const kgIdx = kgValues.indexOf(initialKg);
                const gIdx = gramValues.indexOf(initialGrams);
                if (kgIdx !== -1) kgListRef.current?.scrollToOffset({ offset: kgIdx * ITEM_HEIGHT, animated: false });
                if (gIdx !== -1) gramsListRef.current?.scrollToOffset({ offset: gIdx * ITEM_HEIGHT, animated: false });
            }, 80);

            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 62, friction: 12 }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 62, friction: 12 }),
                Animated.timing(backdropAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 0.97, duration: 220, useNativeDriver: true }),
                Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            ]).start(() => setIsVisible(false));
        }
    }, [visible, slideAnim, scaleAnim, backdropAnim, initialKg, initialGrams]);

    // ── Scroll handlers ─────────────────────────────────────────────
    const snapAndSetKg = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const idx = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), kgValues.length - 1));
        setSelectedKg(kgValues[idx]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        kgListRef.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: true });
    }, []);

    const snapAndSetGrams = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const idx = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), gramValues.length - 1));
        setSelectedGrams(gramValues[idx]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        gramsListRef.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: true });
    }, []);

    const onKgScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, kgValues.length - 1));
        if (kgValues[clamped] !== selectedKg) setSelectedKg(kgValues[clamped]);
    }, [selectedKg]);

    const onGramsScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, gramValues.length - 1));
        if (gramValues[clamped] !== selectedGrams) setSelectedGrams(gramValues[clamped]);
    }, [selectedGrams]);

    // ── Save ────────────────────────────────────────────────────────
    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave?.(selectedKg, selectedGrams);
        onClose();
    };

    // ── Render item ─────────────────────────────────────────────────
    const renderKg = useCallback(({ item }: { item: number }) => {
        const selected = item === selectedKg;
        return (
            <View style={styles.pickerItem}>
                <Text style={[styles.pickerText, selected && styles.pickerTextSelected, !selected && styles.pickerTextFaded]}>
                    {item} kg
                </Text>
            </View>
        );
    }, [selectedKg]);

    const renderGrams = useCallback(({ item }: { item: number }) => {
        const selected = item === selectedGrams;
        return (
            <View style={styles.pickerItem}>
                <Text style={[styles.pickerText, selected && styles.pickerTextSelected, !selected && styles.pickerTextFaded]}>
                    {item} g
                </Text>
            </View>
        );
    }, [selectedGrams]);

    if (!isVisible && !visible) return null;

    return (
        <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
            {/* ── Backdrop ── */}
            <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
                <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
            </Animated.View>

            {/* ── Sheet ── */}
            <Animated.View
                style={[
                    styles.sheet,
                    { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
                ]}
            >
                {/* Drag handle */}
                <View style={styles.dragHandle} />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Select your current weight</Text>
                    <PressableScale onPress={onClose} style={styles.closeBtn}>
                        <Feather name="x" size={22} color={colors.textPrimary} />
                    </PressableScale>
                </View>

                {/* ── Picker ── */}
                <View style={styles.pickerContainer}>
                    {/* Selection highlight row */}
                    <View style={styles.selectionRow} />

                    {/* Top & bottom fade overlays */}
                    <View pointerEvents="none" style={styles.fadeTop} />
                    <View pointerEvents="none" style={styles.fadeBottom} />

                    {/* Kg wheel */}
                    <View style={styles.wheelWrap}>
                        <FlatList
                            ref={kgListRef}
                            data={kgValues}
                            renderItem={renderKg}
                            keyExtractor={item => `kg-${item}`}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            onScroll={onKgScroll}
                            onMomentumScrollEnd={snapAndSetKg}
                            onScrollEndDrag={snapAndSetKg}
                            scrollEventThrottle={16}
                            contentContainerStyle={styles.wheelContent}
                            getItemLayout={(_, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i })}
                        />
                    </View>

                    {/* Grams wheel */}
                    <View style={styles.wheelWrap}>
                        <FlatList
                            ref={gramsListRef}
                            data={gramValues}
                            renderItem={renderGrams}
                            keyExtractor={item => `g-${item}`}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            onScroll={onGramsScroll}
                            onMomentumScrollEnd={snapAndSetGrams}
                            onScrollEndDrag={snapAndSetGrams}
                            scrollEventThrottle={16}
                            contentContainerStyle={styles.wheelContent}
                            getItemLayout={(_, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i })}
                        />
                    </View>
                </View>

                {/* ── Divider + Save ── */}
                <View style={styles.footer}>
                    <View style={styles.footerDivider} />
                    <PressableScale style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Save</Text>
                    </PressableScale>
                </View>
            </Animated.View>
        </Modal>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Backdrop
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    backdropTouch: { flex: 1 },

    // Sheet
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 24,
    },

    // Drag handle
    dragHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginTop: 12,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 8,
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.textPrimary,
        flex: 1,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Picker container
    pickerContainer: {
        flexDirection: 'row',
        height: PICKER_HEIGHT,
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 8,
        position: 'relative',
        overflow: 'hidden',
    },

    // Center highlight row
    selectionRow: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: ITEM_HEIGHT * 2,
        height: ITEM_HEIGHT,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 14,
        zIndex: -1,
    },

    // Fade overlays for depth effect
    fadeTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * 1.5,
        zIndex: 2,
        // Gradient approximation using solid with opacity
        backgroundColor: 'transparent',
    },
    fadeBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * 1.5,
        zIndex: 2,
        backgroundColor: 'transparent',
    },

    // Wheel
    wheelWrap: {
        flex: 1,
        height: PICKER_HEIGHT,
        overflow: 'hidden',
    },
    wheelContent: {
        paddingVertical: ITEM_HEIGHT * 2,
    },

    // Items
    pickerItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerText: {
        fontFamily: typography.body,
        fontSize: 17,
        color: colors.textMuted,
    },
    pickerTextSelected: {
        fontFamily: typography.heading,
        fontSize: 19,
        color: colors.textPrimary,
    },
    pickerTextFaded: {
        opacity: 0.45,
    },

    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    footerDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginBottom: 20,
    },
    saveBtn: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.surface,
        letterSpacing: 0.3,
    },
});
