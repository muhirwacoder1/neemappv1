import { useState, useEffect, useRef } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    Animated,
    Dimensions,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, ClipPath, G } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PressableScale } from './PressableScale';

interface LogWaterModalProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (amount: number) => void;
    dailyGoal?: number;
    currentIntake?: number;
}

interface CustomIntakeSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (amount: number) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = 200;

// Water colors matching reference
const WATER_COLORS = {
    circleBg: '#D4EBF2',
    waveLight: '#7CC8D0',
    waveMid: '#5BB8C0',
    waveDark: '#3AA8B0',
    text: '#4FBDBA',
    cardBg: '#E8F6F6',
    buttonBg: '#E0F4F4',
    buttonBorder: '#4FBDBA',
};

// Motivational messages
function getMotivationalMessage(percentage: number): string {
    if (percentage >= 100) return "Amazing! Goal reached! 🎉";
    if (percentage >= 75) return "Almost there, keep it up!";
    if (percentage >= 50) return "Halfway there, great job!";
    if (percentage >= 25) return "You've got this, keep going!";
    return "Start hydrating your day!";
}

// Custom Intake Bottom Sheet
function CustomIntakeSheet({ visible, onClose, onSave }: CustomIntakeSheetProps) {
    const [amount, setAmount] = useState('100');
    const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
    const [isVisible, setIsVisible] = useState(false);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setAmount('100');
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
                Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
                Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start(() => setIsVisible(false));
        }
    }, [visible, slideAnim, backdropAnim]);

    const handleSave = () => {
        const numAmount = parseFloat(amount) || 0;
        const mlAmount = unit === 'oz' ? numAmount * 29.5735 : numAmount;
        onSave(mlAmount);
        onClose();
    };

    if (!isVisible && !visible) return null;

    return (
        <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
            <Animated.View style={[styles.sheetBackdrop, { opacity: backdropAnim }]}>
                <TouchableOpacity style={styles.backdropFill} onPress={onClose} activeOpacity={1} />
            </Animated.View>

            <Animated.View style={[styles.customSheet, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Add your water intake</Text>
                    <PressableScale onPress={onClose} style={styles.sheetClose}>
                        <Feather name="x" size={22} color={colors.textPrimary} />
                    </PressableScale>
                </View>

                <View style={styles.sheetInputRow}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="100"
                            placeholderTextColor="#ccc"
                            keyboardType="number-pad"
                            maxLength={4}
                        />
                        <Text style={styles.inputUnit}>{unit}</Text>
                    </View>

                    <View style={styles.unitToggle}>
                        <TouchableOpacity
                            style={[styles.unitBtn, unit === 'ml' && styles.unitBtnActive]}
                            onPress={() => setUnit('ml')}
                        >
                            <Text style={[styles.unitBtnText, unit === 'ml' && styles.unitBtnTextActive]}>ml</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.unitBtn, unit === 'oz' && styles.unitBtnActive]}
                            onPress={() => setUnit('oz')}
                        >
                            <Text style={[styles.unitBtnText, unit === 'oz' && styles.unitBtnTextActive]}>oz</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.sheetSaveBtn} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.sheetSaveBtnText}>Save</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
}

// Animated Wave Circle with real liquid animation
function WaterCircleWithWave({ percentage }: { percentage: number }) {
    const wavePhase = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous wave animation loop
        const animation = Animated.loop(
            Animated.timing(wavePhase, {
                toValue: 2 * Math.PI,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        );
        animation.start();
        return () => animation.stop();
    }, [wavePhase]);

    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const listener = wavePhase.addListener(({ value }) => {
            setPhase(value);
        });
        return () => wavePhase.removeListener(listener);
    }, [wavePhase]);

    const radius = CIRCLE_SIZE / 2;
    const innerRadius = radius - 10;

    // Calculate water level (from bottom)
    const waterLevel = (Math.min(percentage, 100) / 100) * (CIRCLE_SIZE - 40);
    const waterY = CIRCLE_SIZE - 20 - waterLevel;

    // Generate wave path with animation
    const generateWavePath = (yBase: number, amplitude: number, phaseOffset: number) => {
        let path = '';
        const width = CIRCLE_SIZE;

        for (let x = 0; x <= width; x += 4) {
            const y = yBase + Math.sin((x / width) * 3 * Math.PI + phase + phaseOffset) * amplitude;
            path += x === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }

        path += ` L ${width} ${CIRCLE_SIZE + 10} L 0 ${CIRCLE_SIZE + 10} Z`;
        return path;
    };

    return (
        <View style={styles.circleContainer}>
            <View style={styles.circleOuter}>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                    <Defs>
                        <ClipPath id="innerCircle">
                            <Circle cx={radius} cy={radius} r={innerRadius} />
                        </ClipPath>
                    </Defs>

                    {/* Light blue circle background */}
                    <Circle
                        cx={radius}
                        cy={radius}
                        r={innerRadius}
                        fill={WATER_COLORS.circleBg}
                    />

                    {/* Outer ring */}
                    <Circle
                        cx={radius}
                        cy={radius}
                        r={radius - 4}
                        stroke="#E0F0F0"
                        strokeWidth={4}
                        fill="none"
                    />

                    {/* Wave layers - clipped to circle */}
                    <G clipPath="url(#innerCircle)">
                        {/* Back wave - darkest */}
                        <Path
                            d={generateWavePath(waterY + 12, 8, Math.PI)}
                            fill={WATER_COLORS.waveDark}
                            opacity={0.9}
                        />
                        {/* Middle wave */}
                        <Path
                            d={generateWavePath(waterY + 6, 10, Math.PI / 2)}
                            fill={WATER_COLORS.waveMid}
                            opacity={0.8}
                        />
                        {/* Front wave - lightest */}
                        <Path
                            d={generateWavePath(waterY, 7, 0)}
                            fill={WATER_COLORS.waveLight}
                            opacity={0.9}
                        />
                    </G>
                </Svg>

                {/* Percentage text overlay */}
                <View style={styles.percentageOverlay}>
                    <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
                </View>
            </View>
        </View>
    );
}

// Glass icon buttons matching reference
function GlassButton({ isMinus, onPress }: { isMinus: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            style={[styles.glassBtn, !isMinus && styles.glassBtnFilled]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Svg width={28} height={28} viewBox="0 0 24 24">
                <Path
                    d="M6 3h12l-1.5 16h-9L6 3z"
                    fill={isMinus ? 'none' : WATER_COLORS.buttonBorder}
                    stroke={WATER_COLORS.buttonBorder}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {!isMinus && (
                    <Path
                        d="M7 8h10l-1 10H8l-1-10z"
                        fill={WATER_COLORS.waveLight}
                        opacity={0.5}
                    />
                )}
            </Svg>
            <View style={[styles.iconBadge, isMinus ? styles.minusBadge : styles.plusBadge]}>
                <Feather name={isMinus ? "minus" : "plus"} size={11} color={isMinus ? WATER_COLORS.buttonBorder : "#fff"} />
            </View>
        </TouchableOpacity>
    );
}

export function LogWaterModal({
    visible,
    onClose,
    onSave,
    dailyGoal = 1500,
    currentIntake = 0,
}: LogWaterModalProps) {
    const [intake, setIntake] = useState(currentIntake);
    const [showCustomSheet, setShowCustomSheet] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    const percentage = Math.min((intake / dailyGoal) * 100, 100);
    const servingSize = 298.693;

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setIntake(currentIntake);
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
                Animated.timing(backdropAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true }),
                Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start(() => setIsVisible(false));
        }
    }, [visible, slideAnim, backdropAnim, currentIntake]);

    const addWater = () => setIntake(prev => prev + servingSize);
    const removeWater = () => setIntake(prev => Math.max(0, prev - servingSize));

    const handleSave = () => {
        onSave?.(intake);
        onClose();
    };

    // Format values
    const intakeDisplay = (intake / 1000).toFixed(3);
    const goalDisplay = (dailyGoal / 1000).toFixed(1);
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (!isVisible && !visible) return null;

    return (
        <Modal visible={isVisible} animationType="none" transparent onRequestClose={onClose} statusBarTranslucent>
            <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
                <TouchableOpacity style={styles.backdropFill} onPress={onClose} activeOpacity={1} />
            </Animated.View>

            <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerSpacer} />
                    <Text style={styles.headerTitle}>Log water</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Feather name="x" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Water Circle with Wave Animation */}
                    <View style={styles.progressArea}>
                        <WaterCircleWithWave percentage={percentage} />
                        <Text style={styles.motivationText}>{getMotivationalMessage(percentage)}</Text>
                    </View>

                    {/* Intake Card */}
                    <View style={styles.intakeCard}>
                        <View style={styles.intakeLeft}>
                            <Text style={styles.intakeLabel}>Your intake</Text>
                            <View style={styles.intakeRow}>
                                <Text style={styles.intakeValue}>{intakeDisplay}</Text>
                                <Text style={styles.intakeGoal}>/ {goalDisplay} L</Text>
                            </View>
                        </View>

                        <View style={styles.intakeRight}>
                            <GlassButton isMinus onPress={removeWater} />
                            <GlassButton isMinus={false} onPress={addWater} />
                        </View>
                    </View>

                    {/* Settings */}
                    <View style={styles.settingsArea}>
                        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                            <Text style={styles.settingLabel}>Serving size</Text>
                            <View style={styles.settingRight}>
                                <Text style={styles.settingValue}>Glass {servingSize.toFixed(3)} ml</Text>
                                <Feather name="chevron-right" size={18} color="#999" />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.settingDivider} />
                        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                            <Text style={styles.settingLabel}>Water intake time</Text>
                            <View style={styles.settingRight}>
                                <Text style={styles.settingValue}>Today, {timeString}</Text>
                                <Feather name="chevron-right" size={18} color="#999" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Footer - FULL WIDTH DARK SAVE BUTTON */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowCustomSheet(true)} style={styles.customBtn}>
                        <Text style={styles.customBtnText}>Add custom intake</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <CustomIntakeSheet
                visible={showCustomSheet}
                onClose={() => setShowCustomSheet(false)}
                onSave={(amt) => { setIntake(prev => prev + amt); }}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    backdropFill: {
        flex: 1,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.9,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerSpacer: { width: 44 },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 17,
        color: colors.textPrimary,
    },
    closeBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    scrollContent: {
        paddingBottom: 16,
    },
    progressArea: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#f5f9fa',
    },
    circleContainer: {
        marginBottom: 16,
    },
    circleOuter: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        position: 'relative',
    },
    percentageOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentageText: {
        fontFamily: typography.heading,
        fontSize: 40,
        color: WATER_COLORS.text,
    },
    motivationText: {
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textPrimary,
    },
    intakeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WATER_COLORS.cardBg,
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    intakeLeft: {},
    intakeLabel: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    intakeRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    intakeValue: {
        fontFamily: typography.heading,
        fontSize: 30,
        color: colors.textPrimary,
    },
    intakeGoal: {
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    intakeRight: {
        flexDirection: 'row',
        gap: 12,
    },
    glassBtn: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    glassBtnFilled: {
        backgroundColor: WATER_COLORS.buttonBg,
        borderColor: WATER_COLORS.buttonBorder,
    },
    iconBadge: {
        position: 'absolute',
        bottom: -3,
        right: -3,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    minusBadge: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    plusBadge: {
        backgroundColor: WATER_COLORS.buttonBorder,
    },
    settingsArea: {
        marginHorizontal: 20,
        marginTop: 24,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    settingLabel: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textPrimary,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    settingValue: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    settingDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#2D2D2D',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#fff',
    },
    customBtn: {
        paddingVertical: 12,
    },
    customBtnText: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    // Custom Sheet Styles
    sheetBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    customSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    sheetTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
    },
    sheetClose: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetInputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    input: {
        flex: 1,
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textPrimary,
        padding: 0,
    },
    inputUnit: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        marginLeft: 8,
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    unitBtn: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 10,
    },
    unitBtnActive: {
        backgroundColor: '#2D2D2D',
    },
    unitBtnText: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.textSecondary,
    },
    unitBtnTextActive: {
        color: '#fff',
    },
    sheetSaveBtn: {
        backgroundColor: WATER_COLORS.buttonBorder,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    sheetSaveBtnText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#fff',
    },
});
