import { useState, useRef, useEffect } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    Animated,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PressableScale } from './PressableScale';

interface TimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (hour: number, minute: number, period: 'AM' | 'PM') => void;
    initialHour?: number;
    initialMinute?: number;
    initialPeriod?: 'AM' | 'PM';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

export function TimePickerModal({
    visible,
    onClose,
    onSave,
    initialHour = 7,
    initialMinute = 30,
    initialPeriod = 'AM',
}: TimePickerModalProps) {
    const [selectedHour, setSelectedHour] = useState(initialHour);
    const [selectedMinute, setSelectedMinute] = useState(initialMinute);
    const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initialPeriod);
    const [isVisible, setIsVisible] = useState(false);

    // Animation values
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    const hourListRef = useRef<FlatList>(null);
    const minuteListRef = useRef<FlatList>(null);
    const periodListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setSelectedHour(initialHour);
            setSelectedMinute(initialMinute);
            setSelectedPeriod(initialPeriod);

            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Scroll to initial values after modal is visible
                const hourIndex = hours.indexOf(initialHour);
                const minuteIndex = minutes.indexOf(initialMinute);
                const periodIndex = periods.indexOf(initialPeriod);

                setTimeout(() => {
                    hourListRef.current?.scrollToOffset({ offset: hourIndex * ITEM_HEIGHT, animated: false });
                    minuteListRef.current?.scrollToOffset({ offset: minuteIndex * ITEM_HEIGHT, animated: false });
                    periodListRef.current?.scrollToOffset({ offset: periodIndex * ITEM_HEIGHT, animated: false });
                }, 100);
            });
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
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
    }, [visible, slideAnim, backdropAnim, initialHour, initialMinute, initialPeriod]);

    const handleSave = () => {
        onSave(selectedHour, selectedMinute, selectedPeriod);
        onClose();
    };

    const onHourScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < hours.length) {
            setSelectedHour(hours[index]);
        }
    };

    const onMinuteScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < minutes.length) {
            setSelectedMinute(minutes[index]);
        }
    };

    const onPeriodScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < periods.length) {
            setSelectedPeriod(periods[index]);
        }
    };

    const renderItem = (item: string | number, isSelected: boolean) => (
        <View style={styles.pickerItem}>
            <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                {typeof item === 'number' && item < 10 ? `0${item}` : `${item}`}
            </Text>
        </View>
    );

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
                <TouchableOpacity
                    style={styles.backdropTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.container,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* Drag Handle */}
                <View style={styles.dragHandle} />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Edit time</Text>
                    <PressableScale onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={colors.textPrimary} />
                    </PressableScale>
                </View>

                {/* Picker Area */}
                <View style={styles.pickerContainer}>
                    {/* Selection Highlight */}
                    <View style={styles.selectionHighlight} />

                    {/* Hour */}
                    <FlatList
                        ref={hourListRef}
                        data={hours}
                        keyExtractor={(item) => `h-${item}`}
                        renderItem={({ item }) => renderItem(item, item === selectedHour)}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={onHourScroll}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        style={styles.pickerColumn}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                    />

                    {/* Minute */}
                    <FlatList
                        ref={minuteListRef}
                        data={minutes}
                        keyExtractor={(item) => `m-${item}`}
                        renderItem={({ item }) => renderItem(item, item === selectedMinute)}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={onMinuteScroll}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        style={styles.pickerColumn}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                    />

                    {/* AM/PM */}
                    <FlatList
                        ref={periodListRef}
                        data={periods}
                        keyExtractor={(item) => `p-${item}`}
                        renderItem={({ item }) => renderItem(item, item === selectedPeriod)}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={onPeriodScroll}
                        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                        style={styles.pickerColumn}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                    />
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Save Button */}
                <View style={styles.footer}>
                    <PressableScale style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </PressableScale>
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
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerContainer: {
        flexDirection: 'row',
        height: PICKER_HEIGHT,
        paddingHorizontal: 24,
        marginVertical: 16,
    },
    selectionHighlight: {
        position: 'absolute',
        left: 24,
        right: 24,
        top: ITEM_HEIGHT * 2,
        height: ITEM_HEIGHT,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 12,
    },
    pickerColumn: {
        flex: 1,
    },
    pickerItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerItemText: {
        fontFamily: typography.body,
        fontSize: 18,
        color: colors.textMuted,
    },
    pickerItemTextSelected: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 24,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    saveButton: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.surface,
    },
});
