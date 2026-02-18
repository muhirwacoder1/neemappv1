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
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PressableScale } from './PressableScale';

interface LogHbA1cModalProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (value: number, whenTaken?: string, nextVisit?: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const WHEN_TAKEN_OPTIONS = ['Fasting', 'After meal', 'Random', 'Other'];

export function LogHbA1cModal({ visible, onClose, onSave }: LogHbA1cModalProps) {
    const [hba1cValue, setHba1cValue] = useState('');
    const [whenTaken, setWhenTaken] = useState('');
    const [nextVisit, setNextVisit] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Handle visibility with animations
    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setHba1cValue('');
            setWhenTaken('');
            setNextVisit('');

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
        const val = parseFloat(hba1cValue);
        if (val && onSave) {
            onSave(val, whenTaken || undefined, nextVisit || undefined);
        }
        onClose();
    };

    const handleValueChange = (text: string) => {
        // Allow numbers and one decimal point
        const filtered = text.replace(/[^0-9.]/g, '');
        // Prevent multiple decimal points
        const parts = filtered.split('.');
        if (parts.length > 2) return;
        setHba1cValue(filtered);
    };

    const isValid = hba1cValue.length > 0 && parseFloat(hba1cValue) > 0;

    // Determine status color based on value
    const getStatusInfo = () => {
        const val = parseFloat(hba1cValue);
        if (!val) return { label: 'Enter value', color: colors.textSecondary, bgColor: colors.surfaceAlt };
        if (val < 5.7) return { label: 'Normal', color: '#22C55E', bgColor: '#DCFCE7' };
        if (val < 6.5) return { label: 'Prediabetes', color: '#F59E0B', bgColor: '#FEF3C7' };
        return { label: 'Diabetes range', color: '#EF4444', bgColor: '#FEE2E2' };
    };

    const statusInfo = getStatusInfo();

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
            <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
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

                    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>HbA1c</Text>
                            <PressableScale onPress={onClose} style={styles.closeButton}>
                                <Feather name="x" size={24} color={colors.textPrimary} />
                            </PressableScale>
                        </View>

                        {/* Main Input */}
                        <Text style={styles.inputPrompt}>
                            Enter amount of HbA1c in{'\n'}percent (%)
                        </Text>

                        <View style={styles.inputSection}>
                            <TextInput
                                style={styles.hba1cInput}
                                value={hba1cValue}
                                onChangeText={handleValueChange}
                                placeholder="0"
                                placeholderTextColor={colors.border}
                                keyboardType="decimal-pad"
                                maxLength={4}
                                autoFocus
                            />
                            <View style={styles.inputLine} />
                        </View>

                        {/* Status Badge */}
                        {hba1cValue.length > 0 && (
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                    {statusInfo.label}
                                </Text>
                            </View>
                        )}

                        {/* When Taken (Optional) */}
                        <View style={styles.optionalSection}>
                            <Text style={styles.optionalLabel}>
                                When taken <Text style={styles.optionalTag}>(optional)</Text>
                            </Text>
                            <View style={styles.pillRow}>
                                {WHEN_TAKEN_OPTIONS.map((option) => (
                                    <PressableScale
                                        key={option}
                                        style={[
                                            styles.pill,
                                            whenTaken === option && styles.pillActive,
                                        ]}
                                        onPress={() => setWhenTaken(whenTaken === option ? '' : option)}
                                    >
                                        <Text
                                            style={[
                                                styles.pillText,
                                                whenTaken === option && styles.pillTextActive,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </PressableScale>
                                ))}
                            </View>
                        </View>

                        {/* Next Visit (Optional) */}
                        <View style={styles.optionalSection}>
                            <Text style={styles.optionalLabel}>
                                Next visit <Text style={styles.optionalTag}>(optional)</Text>
                            </Text>
                            <TextInput
                                style={styles.textField}
                                value={nextVisit}
                                onChangeText={setNextVisit}
                                placeholder="e.g. Aug 2026"
                                placeholderTextColor={colors.border}
                            />
                        </View>
                    </ScrollView>

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
                            <Text
                                style={[
                                    styles.continueButtonText,
                                    !isValid && styles.continueButtonTextDisabled,
                                ]}
                            >
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
        maxHeight: SCREEN_HEIGHT * 0.85,
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
    inputPrompt: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.primary,
        textAlign: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
        lineHeight: 30,
    },
    inputSection: {
        alignItems: 'center',
        paddingHorizontal: 48,
        marginBottom: 24,
    },
    hba1cInput: {
        fontFamily: typography.heading,
        fontSize: 56,
        color: colors.textPrimary,
        textAlign: 'center',
        width: '100%',
        paddingVertical: 8,
    },
    inputLine: {
        height: 1,
        backgroundColor: colors.border,
        width: '100%',
        marginTop: 4,
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
    optionalSection: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    optionalLabel: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 12,
    },
    optionalTag: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pillActive: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    pillText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    pillTextActive: {
        fontFamily: typography.subheading,
        color: colors.primary,
    },
    textField: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.surfaceAlt,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 12,
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
