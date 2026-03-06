import { useState, useEffect, useRef, useCallback } from 'react';
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
    FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PressableScale } from './PressableScale';

interface LogHbA1cModalProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (value: number, testDate: string, nextAppointment?: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Date Picker Helpers ────────────────────────────────────────────
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function generateYears(): number[] {
    const current = new Date().getFullYear();
    const years: number[] = [];
    for (let y = current - 5; y <= current + 5; y++) years.push(y);
    return years;
}

// ── Drum-Roll Picker Column ────────────────────────────────────────
function PickerColumn({ items, selectedIndex, onSelect, formatItem }: {
    items: any[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    formatItem: (item: any) => string;
}) {
    const flatListRef = useRef<FlatList>(null);
    const isScrolling = useRef(false);

    useEffect(() => {
        if (!isScrolling.current && flatListRef.current) {
            flatListRef.current.scrollToOffset({
                offset: selectedIndex * ITEM_HEIGHT,
                animated: false,
            });
        }
    }, [selectedIndex]);

    const handleMomentumEnd = useCallback((e: any) => {
        isScrolling.current = false;
        const offset = e.nativeEvent.contentOffset.y;
        const idx = Math.round(offset / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        onSelect(clamped);
    }, [items.length, onSelect]);

    const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
        const isSelected = index === selectedIndex;
        return (
            <TouchableOpacity
                style={[pickerStyles.item, { height: ITEM_HEIGHT }]}
                onPress={() => {
                    onSelect(index);
                    flatListRef.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: true });
                }}
                activeOpacity={0.7}
            >
                <Text style={[
                    pickerStyles.itemText,
                    isSelected && pickerStyles.itemTextSelected,
                    !isSelected && pickerStyles.itemTextFaded,
                ]}>
                    {formatItem(item)}
                </Text>
            </TouchableOpacity>
        );
    }, [selectedIndex, onSelect, formatItem]);

    return (
        <View style={[pickerStyles.column, { height: PICKER_HEIGHT }]}>
            {/* Selection highlight */}
            <View style={pickerStyles.selectionHighlight} pointerEvents="none" />
            <FlatList
                ref={flatListRef}
                data={items}
                renderItem={renderItem}
                keyExtractor={(_, i) => String(i)}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                    paddingBottom: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                onScrollBeginDrag={() => { isScrolling.current = true; }}
                onMomentumScrollEnd={handleMomentumEnd}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
            />
        </View>
    );
}

// ── Date Picker Component ──────────────────────────────────────────
function DrumDatePicker({ date, onDateChange }: {
    date: Date;
    onDateChange: (date: Date) => void;
}) {
    const years = generateYears();
    const selectedMonthIdx = date.getMonth();
    const selectedDay = date.getDate();
    const selectedYearIdx = years.indexOf(date.getFullYear());
    const daysInMonth = getDaysInMonth(selectedMonthIdx, years[selectedYearIdx] || date.getFullYear());
    const dayItems = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const update = (monthIdx: number, dayVal: number, yearIdx: number) => {
        const y = years[yearIdx] || date.getFullYear();
        const maxDay = getDaysInMonth(monthIdx, y);
        const d = Math.min(dayVal, maxDay);
        onDateChange(new Date(y, monthIdx, d));
    };

    return (
        <View style={pickerStyles.pickerRow}>
            <PickerColumn
                items={MONTHS}
                selectedIndex={selectedMonthIdx}
                onSelect={(i) => update(i, selectedDay, selectedYearIdx)}
                formatItem={(m: string) => m}
            />
            <PickerColumn
                items={dayItems}
                selectedIndex={selectedDay - 1}
                onSelect={(i) => update(selectedMonthIdx, i + 1, selectedYearIdx)}
                formatItem={(d: number) => String(d)}
            />
            <PickerColumn
                items={years}
                selectedIndex={Math.max(0, selectedYearIdx)}
                onSelect={(i) => update(selectedMonthIdx, selectedDay, i)}
                formatItem={(y: number) => String(y)}
            />
        </View>
    );
}

// ── Main Modal ─────────────────────────────────────────────────────
export function LogHbA1cModal({ visible, onClose, onSave }: LogHbA1cModalProps) {
    const [hba1cValue, setHba1cValue] = useState('');
    const [testDate, setTestDate] = useState(new Date());
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    const [nextAppointment, setNextAppointment] = useState(threeMonthsLater);
    const [isVisible, setIsVisible] = useState(false);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setHba1cValue('');
            setTestDate(new Date());
            const future = new Date();
            future.setMonth(future.getMonth() + 3);
            setNextAppointment(future);
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

    const handleConfirm = () => {
        const val = parseFloat(hba1cValue);
        if (val && onSave) {
            const testStr = `${MONTHS[testDate.getMonth()]} ${testDate.getDate()}, ${testDate.getFullYear()}`;
            const nextStr = `${MONTHS[nextAppointment.getMonth()]} ${nextAppointment.getDate()}, ${nextAppointment.getFullYear()}`;
            onSave(val, testStr, nextStr);
        }
        onClose();
    };

    const handleSkip = () => {
        const val = parseFloat(hba1cValue);
        if (val && onSave) {
            const testStr = `${MONTHS[testDate.getMonth()]} ${testDate.getDate()}, ${testDate.getFullYear()}`;
            onSave(val, testStr);
        }
        onClose();
    };

    const handleValueChange = (text: string) => {
        const filtered = text.replace(/[^0-9.]/g, '');
        const parts = filtered.split('.');
        if (parts.length > 2) return;
        setHba1cValue(filtered);
    };

    const isValid = hba1cValue.length > 0 && parseFloat(hba1cValue) > 0;

    const getStatusInfo = () => {
        const val = parseFloat(hba1cValue);
        if (!val) return { label: 'Enter value', color: colors.textSecondary, bgColor: colors.surfaceAlt };
        if (val < 5.7) return { label: 'Normal', color: '#22C55E', bgColor: '#DCFCE7' };
        if (val < 6.5) return { label: 'Elevated', color: '#F59E0B', bgColor: '#FEF3C7' };
        return { label: 'High', color: '#EF4444', bgColor: '#FEE2E2' };
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
            <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
                <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
            </Animated.View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <Animated.View
                    style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
                >
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

                        {/* Test Date Picker */}
                        <Text style={styles.sectionLabel}>Select when it was taken</Text>
                        <DrumDatePicker date={testDate} onDateChange={setTestDate} />

                        {/* Next Appointment Picker */}
                        <Text style={styles.sectionLabel}>
                            Already know when your next doctor visit{'\n'}for the HbA1c test is?
                        </Text>
                        <DrumDatePicker date={nextAppointment} onDateChange={setNextAppointment} />
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <PressableScale
                            style={[styles.confirmButton, !isValid && styles.confirmButtonDisabled]}
                            onPress={handleConfirm}
                            disabled={!isValid}
                        >
                            <Text style={[styles.confirmButtonText, !isValid && styles.confirmButtonTextDisabled]}>
                                Confirm
                            </Text>
                        </PressableScale>
                        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                            <Text style={styles.skipButtonText}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ── Picker Styles ──────────────────────────────────────────────────
const pickerStyles = StyleSheet.create({
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    column: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    selectionHighlight: {
        position: 'absolute',
        top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        left: 4,
        right: 4,
        height: ITEM_HEIGHT,
        backgroundColor: 'rgba(66, 133, 244, 0.06)',
        borderRadius: 10,
        zIndex: 1,
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textMuted,
    },
    itemTextSelected: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
    },
    itemTextFaded: {
        opacity: 0.35,
    },
});

// ── Modal Styles ───────────────────────────────────────────────────
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
        maxHeight: SCREEN_HEIGHT * 0.92,
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
    sectionLabel: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
        textAlign: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    confirmButton: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: colors.surfaceAlt,
    },
    confirmButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.surface,
    },
    confirmButtonTextDisabled: {
        color: colors.textSecondary,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    skipButtonText: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        textDecorationLine: 'underline',
    },
});
