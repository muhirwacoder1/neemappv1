import { useState, useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PressableScale } from './PressableScale';
import { PrimaryButton } from './PrimaryButton';

interface LogGlucoseModalProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (value: number, mealTiming: string) => void;
}

const mealTimings = ['Fasting', 'Before meal', 'After meal', 'Unspecified'];
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LogGlucoseModal({ visible, onClose, onSave }: LogGlucoseModalProps) {
    const [glucoseValue, setGlucoseValue] = useState('');
    const [selectedTiming, setSelectedTiming] = useState('Unspecified');
    const [isVisible, setIsVisible] = useState(false);

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    // Handle visibility with animations
    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            // Animate in
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setIsVisible(false);
            });
        }
    }, [visible, slideAnim, scaleAnim, backdropAnim]);

    // Get current date/time formatted
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const dateString = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    const handleSave = () => {
        if (glucoseValue && onSave) {
            onSave(parseFloat(glucoseValue), selectedTiming);
        }
        setGlucoseValue('');
        setSelectedTiming('Unspecified');
        onClose();
    };

    const handleClose = () => {
        setGlucoseValue('');
        setSelectedTiming('Unspecified');
        onClose();
    };

    if (!isVisible && !visible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            {/* Backdrop */}
            <Animated.View
                style={[
                    styles.backdrop,
                    { opacity: backdropAnim }
                ]}
            >
                <TouchableOpacity
                    style={styles.backdropTouchable}
                    activeOpacity={1}
                    onPress={handleClose}
                />
            </Animated.View>

            {/* Modal Content */}
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
            >
                {/* Drag Handle */}
                <View style={styles.dragHandle} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerSpacer} />
                    <Text style={styles.headerTitle}>Log glucose</Text>
                    <PressableScale onPress={handleClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={colors.textPrimary} />
                    </PressableScale>
                </View>

                <View style={styles.divider} />

                {/* Glucose Input */}
                <View style={styles.inputSection}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.glucoseInput}
                            value={glucoseValue}
                            onChangeText={setGlucoseValue}
                            placeholder="0"
                            placeholderTextColor={colors.border}
                            keyboardType="decimal-pad"
                            maxLength={5}
                        />
                        <Text style={styles.unitText}>mmol/L</Text>
                    </View>
                    <View style={styles.inputLine} />
                </View>

                {/* Meal Timing Options */}
                <View style={styles.timingSection}>
                    <View style={styles.timingRow}>
                        {mealTimings.slice(0, 2).map((timing) => (
                            <TouchableOpacity
                                key={timing}
                                style={[
                                    styles.timingButton,
                                    selectedTiming === timing && styles.timingButtonActive,
                                ]}
                                onPress={() => setSelectedTiming(timing)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.timingText,
                                        selectedTiming === timing && styles.timingTextActive,
                                    ]}
                                >
                                    {timing}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.timingRow}>
                        {mealTimings.slice(2, 4).map((timing) => (
                            <TouchableOpacity
                                key={timing}
                                style={[
                                    styles.timingButton,
                                    selectedTiming === timing && styles.timingButtonActive,
                                ]}
                                onPress={() => setSelectedTiming(timing)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.timingText,
                                        selectedTiming === timing && styles.timingTextActive,
                                    ]}
                                >
                                    {timing}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Time Row */}
                <View style={styles.listSection}>
                    <PressableScale style={styles.listRow}>
                        <Text style={styles.listLabel}>Time</Text>
                        <View style={styles.listValue}>
                            <Text style={styles.listValueText}>{timeString}, {dateString}</Text>
                            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                        </View>
                    </PressableScale>
                    <View style={styles.listDivider} />

                    {/* Metformin Row */}
                    <PressableScale style={styles.listRow}>
                        <Text style={styles.listLabel}>Metformin</Text>
                        <View style={styles.listValue}>
                            <Text style={styles.addText}>Add</Text>
                            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                        </View>
                    </PressableScale>
                    <View style={styles.listDivider} />

                    {/* Other Medications Row */}
                    <PressableScale style={styles.listRow}>
                        <Text style={styles.listLabel}>Other medications</Text>
                        <View style={styles.listValue}>
                            <Text style={styles.addText}>Add</Text>
                            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                        </View>
                    </PressableScale>
                </View>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Save Button */}
                <View style={styles.footer}>
                    <View style={!glucoseValue ? styles.saveButtonDisabled : undefined}>
                        <PrimaryButton
                            label="Save"
                            onPress={handleSave}
                        />
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    backdropTouchable: {
        flex: 1,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.9,
        paddingBottom: 20,
    },
    dragHandle: {
        width: 36,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerSpacer: {
        width: 40,
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    inputSection: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 8,
    },
    glucoseInput: {
        fontFamily: typography.body,
        fontSize: 48,
        color: colors.textPrimary,
        textAlign: 'center',
        minWidth: 80,
    },
    unitText: {
        fontFamily: typography.body,
        fontSize: 18,
        color: colors.textSecondary,
    },
    inputLine: {
        height: 1,
        backgroundColor: colors.border,
        marginTop: 16,
        marginHorizontal: 40,
    },
    timingSection: {
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 24,
    },
    timingRow: {
        flexDirection: 'row',
        gap: 12,
    },
    timingButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    timingButtonActive: {
        backgroundColor: colors.textPrimary,
        borderColor: colors.textPrimary,
    },
    timingText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textPrimary,
    },
    timingTextActive: {
        color: colors.surface,
    },
    listSection: {
        paddingHorizontal: 24,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    listLabel: {
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textPrimary,
    },
    listValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    listValueText: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
    },
    addText: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
    },
    listDivider: {
        height: 1,
        backgroundColor: colors.border,
    },
    spacer: {
        flex: 1,
        minHeight: 40,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: 16,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
});
