import { useState, useEffect, useRef } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    TextInput,
    Animated,
    Dimensions,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PressableScale } from './PressableScale';

interface AddBloodPressureModalProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (systolic: number, diastolic: number) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Blood pressure status thresholds
type BPStatus = 'low' | 'normal' | 'elevated' | 'high' | 'crisis' | 'unknown';

interface BPStatusConfig {
    label: string;
    color: string;
    bgColor: string;
}

const statusConfig: Record<BPStatus, BPStatusConfig> = {
    low: {
        label: 'Low',
        color: '#2196F3',
        bgColor: '#E3F2FD',
    },
    normal: {
        label: 'Normal',
        color: '#4CAF50',
        bgColor: '#E8F5E9',
    },
    elevated: {
        label: 'Elevated',
        color: '#FF9800',
        bgColor: '#FFF3E0',
    },
    high: {
        label: 'High',
        color: '#F44336',
        bgColor: '#FFEBEE',
    },
    crisis: {
        label: 'Hypertensive Crisis',
        color: '#B71C1C',
        bgColor: '#FFCDD2',
    },
    unknown: {
        label: 'Enter values',
        color: colors.textSecondary,
        bgColor: colors.surfaceAlt,
    },
};

function getBPStatus(systolic: number, diastolic: number): BPStatus {
    if (!systolic || !diastolic) return 'unknown';

    // Blood pressure classification
    if (systolic < 90 || diastolic < 60) return 'low';
    if (systolic >= 180 || diastolic >= 120) return 'crisis';
    if (systolic >= 140 || diastolic >= 90) return 'high';
    if (systolic >= 120 || diastolic >= 80) return 'elevated';
    return 'normal';
}

export function AddBloodPressureModal({ visible, onClose, onSave }: AddBloodPressureModalProps) {
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const diastolicRef = useRef<TextInput>(null);

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Get current BP status
    const bpStatus = getBPStatus(parseInt(systolic) || 0, parseInt(diastolic) || 0);
    const statusInfo = statusConfig[bpStatus];

    // Handle visibility with animations
    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setSystolic('');
            setDiastolic('');

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
    }, [visible, slideAnim, backdropAnim, scaleAnim]);

    const handleContinue = () => {
        const sys = parseInt(systolic);
        const dia = parseInt(diastolic);

        if (sys && dia && onSave) {
            onSave(sys, dia);
        }
        onClose();
    };

    const handleSystolicChange = (text: string) => {
        // Only allow numbers
        const numericText = text.replace(/[^0-9]/g, '');
        setSystolic(numericText);

        // Auto-focus diastolic after 3 digits
        if (numericText.length >= 3) {
            diastolicRef.current?.focus();
        }
    };

    const handleDiastolicChange = (text: string) => {
        // Only allow numbers
        const numericText = text.replace(/[^0-9]/g, '');
        setDiastolic(numericText);
    };

    const isValid = systolic.length > 0 && diastolic.length > 0;

    if (!isVisible && !visible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
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
                    onPress={onClose}
                />
            </Animated.View>

            {/* Modal Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
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
                        <Text style={styles.headerTitle}>Add Blood Pressure</Text>
                        <PressableScale onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color={colors.textPrimary} />
                        </PressableScale>
                    </View>

                    {/* BP Status Indicator */}
                    <Animated.View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusInfo.bgColor }
                        ]}
                    >
                        <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </Animated.View>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputRow}>
                            {/* Systolic Input */}
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.bpInput}
                                    value={systolic}
                                    onChangeText={handleSystolicChange}
                                    placeholder="120"
                                    placeholderTextColor={colors.border}
                                    keyboardType="number-pad"
                                    maxLength={3}
                                    autoFocus
                                />
                                <Text style={styles.inputLabel}>Systolic</Text>
                            </View>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <Text style={styles.divider}>/</Text>
                            </View>

                            {/* Diastolic Input */}
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    ref={diastolicRef}
                                    style={styles.bpInput}
                                    value={diastolic}
                                    onChangeText={handleDiastolicChange}
                                    placeholder="80"
                                    placeholderTextColor={colors.border}
                                    keyboardType="number-pad"
                                    maxLength={3}
                                />
                                <Text style={styles.inputLabel}>Diastolic</Text>
                            </View>
                        </View>

                        {/* Unit Label */}
                        <Text style={styles.unitLabel}>mmHg</Text>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIndicator, { backgroundColor: statusConfig.normal.bgColor }]}>
                                <View style={[styles.smallDot, { backgroundColor: statusConfig.normal.color }]} />
                            </View>
                            <Text style={styles.infoText}>Normal: Less than 120/80</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIndicator, { backgroundColor: statusConfig.elevated.bgColor }]}>
                                <View style={[styles.smallDot, { backgroundColor: statusConfig.elevated.color }]} />
                            </View>
                            <Text style={styles.infoText}>Elevated: 120-139/80-89</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={[styles.infoIndicator, { backgroundColor: statusConfig.high.bgColor }]}>
                                <View style={[styles.smallDot, { backgroundColor: statusConfig.high.color }]} />
                            </View>
                            <Text style={styles.infoText}>High: 140+/90+</Text>
                        </View>
                    </View>

                    {/* Continue Button */}
                    <View style={styles.footer}>
                        <PressableScale
                            style={[
                                styles.continueButton,
                                !isValid && styles.continueButtonDisabled,
                            ]}
                            onPress={handleContinue}
                            disabled={!isValid}
                        >
                            <Text style={[
                                styles.continueButtonText,
                                !isValid && styles.continueButtonTextDisabled,
                            ]}>
                                Continue
                            </Text>
                        </PressableScale>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
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
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 20,
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
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.textPrimary,
        flex: 1,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        marginBottom: 24,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusText: {
        fontFamily: typography.subheading,
        fontSize: 14,
    },
    inputSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    inputWrapper: {
        alignItems: 'center',
    },
    bpInput: {
        fontFamily: typography.heading,
        fontSize: 56,
        color: colors.textPrimary,
        textAlign: 'center',
        width: 120,
        paddingVertical: 8,
    },
    inputLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    dividerContainer: {
        paddingBottom: 24,
    },
    divider: {
        fontFamily: typography.body,
        fontSize: 48,
        color: colors.textSecondary,
    },
    unitLabel: {
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 8,
    },
    infoSection: {
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 32,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    infoText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    footer: {
        paddingHorizontal: 24,
    },
    continueButton: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: colors.surfaceAlt,
    },
    continueButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.surface,
    },
    continueButtonTextDisabled: {
        color: colors.textSecondary,
    },
});
