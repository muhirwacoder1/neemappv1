import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { typography } from '../theme/typography';
import { PressableScale } from '../components/PressableScale';

const TOTAL_STEPS = 15;

// ── Colors (matching screenshots pixel-perfect) ────────────────
const C = {
  bg: '#F7F8FA',
  white: '#FFFFFF',
  black: '#1B1B1B',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  selectedBg: '#EBEDF0',
  selectedBorder: '#1B1B1B',
  blue: '#2E86F0',
  checkBg: '#1B1B1B',
  toggleInactiveBg: '#F0F1F3',
  toggleInactiveText: '#5A5E66',
};

// ══════════════════════════════════════════════════════════════════
// STEP DEFINITIONS
// ══════════════════════════════════════════════════════════════════

interface StepOption {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  mciIcon?: string;
}

interface ToggleOption {
  id: string;
  label: string;
}

interface StepConfig {
  headerTitle: string;
  subtitle: string;
  question: string;
  type: 'single' | 'multi' | 'picker';
  options: StepOption[];
  showNext: boolean;
  skipOptionId?: string;
  disclaimer?: string;
  // Picker config
  pickerRange?: [number, number];
  pickerDefault?: number;
  // Toggle config (for unit switching)
  toggle?: ToggleOption[];
  toggleDefault?: string;
  // Alternate picker range when second/first toggle is active
  pickerRangeAlt?: [number, number];
  pickerDefaultAlt?: number;
}

const STEPS: StepConfig[] = [
  // ── Step 0: Goals (Register screen) ─────────────────────────
  {
    headerTitle: 'Register',
    subtitle: '',
    question: 'What are your main goals with MyDiabetes?',
    type: 'multi',
    showNext: true,
    options: [
      { id: 'glucose', label: 'Manage glucose levels', mciIcon: 'arrow-down-bold-circle-outline' },
      { id: 'weight', label: 'Lose weight', icon: 'monitor' },
      { id: 'eating', label: 'Healthy eating', mciIcon: 'food-apple-outline' },
      { id: 'active', label: 'Be more active', mciIcon: 'run' },
      { id: 'tips', label: 'Get insightful tips', mciIcon: 'chart-bar' },
      { id: 'other', label: 'Other' },
    ],
  },
  // ── Step 1: Diabetes type ───────────────────────────────────
  {
    headerTitle: 'Step 1 of 15',
    subtitle: 'This will help us tailor your plan to your condition',
    question: 'What kind of diabetes do you have?',
    type: 'single',
    showNext: false,
    options: [
      { id: 'type2', label: 'Type 2' },
      { id: 'prediabetes', label: 'Prediabetes' },
      { id: 'type1', label: 'Type 1' },
      { id: 'unknown', label: "I don't know" },
    ],
  },
  // ── Step 2: Other medical conditions (yes/no) ───────────────
  {
    headerTitle: 'Step 6 of 15',
    subtitle: 'Share any additional medical information that may have an impact on your nutritional needs',
    question: 'Any other medical conditions?',
    type: 'single',
    showNext: false,
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
  },
  // ── Step 3: Select medical conditions ───────────────────────
  {
    headerTitle: 'Step 7 of 15',
    subtitle: 'This helps us plan better',
    question: 'Select your medical conditions',
    type: 'multi',
    showNext: true,
    skipOptionId: 'none',
    disclaimer: 'Disclaimer: The MyDiabetes meal plan is not always suitable for individuals with medical conditions. Please consult your doctor before starting the meal plan or making any other dietary and lifestyle changes.',
    options: [
      { id: 'none', label: 'None' },
      { id: 'hbp', label: 'High blood pressure' },
      { id: 'heart', label: 'Heart diseases' },
      { id: 'cholesterol', label: 'High cholesterol' },
      { id: 'gastritis', label: 'Gastritis' },
      { id: 'ibs', label: 'Irritable bowel syndrome' },
      { id: 'ckd', label: 'Chronic kidney disease', subLabel: 'Third-stage kidney disease patients should not follow the meal plan.' },
      { id: 'gerd', label: 'Gastroesophegeal reflux disease' },
      { id: 'anemia', label: 'Anemia' },
      { id: 'hypothyroidism', label: 'Hypothyroidism' },
      { id: 'hyperthyroidism', label: 'Hyperthyroidism' },
    ],
  },
  // ── Step 4: Physical activity level ─────────────────────────
  {
    headerTitle: 'Step 10 of 15',
    subtitle: 'Your plan will be adjusted based on your physical activity level',
    question: 'How physically active are you?',
    type: 'single',
    showNext: false,
    options: [
      { id: 'not_active', label: 'Not active' },
      { id: 'moderate', label: 'Moderately active', subLabel: '1-2 times per week' },
      { id: 'very_active', label: 'Very active', subLabel: '3-4 times per week' },
    ],
  },
  // ── Step 5: Age picker (Step 11 of 15) ──────────────────────
  {
    headerTitle: 'Step 11 of 15',
    subtitle: 'Age helps us in metabolic calculations and optimal activity suggestions',
    question: 'Your age',
    type: 'picker',
    showNext: true,
    options: [],
    pickerRange: [13, 120],
    pickerDefault: 60,
  },
  // ── Step 6: Height picker (Step 12 of 15) ───────────────────
  {
    headerTitle: 'Step 12 of 15',
    subtitle: 'Knowing your height helps us calculate your BMI',
    question: 'Your height',
    type: 'picker',
    showNext: true,
    options: [],
    toggle: [
      { id: 'feet', label: 'Feet' },
      { id: 'cm', label: 'Centimeters' },
    ],
    toggleDefault: 'cm',
    pickerRange: [120, 220],   // cm
    pickerDefault: 165,
    pickerRangeAlt: [48, 87],  // inches (4'0" to 7'3")
    pickerDefaultAlt: 65,      // ~5'5"
  },
  // ── Step 7: Current weight (Step 13 of 15) ──────────────────
  {
    headerTitle: 'Step 13 of 15',
    subtitle: 'Knowing your weight helps us calculate your BMI',
    question: 'Your current weight',
    type: 'picker',
    showNext: true,
    options: [],
    toggle: [
      { id: 'lbs', label: 'Pounds' },
      { id: 'kg', label: 'Kilograms' },
    ],
    toggleDefault: 'kg',
    pickerRange: [30, 300],     // kg
    pickerDefault: 90,
    pickerRangeAlt: [66, 661],  // lbs
    pickerDefaultAlt: 198,
  },
  // ── Step 8: Target weight (Step 14 of 15) ───────────────────
  {
    headerTitle: 'Step 14 of 15',
    subtitle: 'We will personalize your nutrition plan to guide you towards your goals!',
    question: 'Your target weight',
    type: 'picker',
    showNext: true,
    options: [],
    toggle: [
      { id: 'lbs', label: 'Pounds' },
      { id: 'kg', label: 'Kilograms' },
    ],
    toggleDefault: 'kg',
    pickerRange: [30, 300],
    pickerDefault: 87,
    pickerRangeAlt: [66, 661],
    pickerDefaultAlt: 192,
  },
];

// ── Picker constants ──────────────────────────────────────────
const PICKER_ITEM_HEIGHT = 44;
const PICKER_VISIBLE_ITEMS = 7;
const PICKER_HEIGHT = PICKER_ITEM_HEIGHT * PICKER_VISIBLE_ITEMS;

// ── Helpers ───────────────────────────────────────────────────
function inchesToFeetStr(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

// ══════════════════════════════════════════════════════════════════
// ONBOARDING SCREEN
// ══════════════════════════════════════════════════════════════════
type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [pickerValue, setPickerValue] = useState<Record<number, number>>({});
  const [toggleState, setToggleState] = useState<Record<number, string>>({});

  const step = STEPS[currentStep];
  const selectedIds = answers[currentStep] || [];

  // Toggle state for current step
  const currentToggle = toggleState[currentStep] ?? step.toggleDefault ?? '';
  const isAltUnit = step.toggle ? currentToggle === step.toggle[0].id : false;

  // Picker range based on toggle
  const activeRange = isAltUnit && step.pickerRangeAlt ? step.pickerRangeAlt : step.pickerRange;
  const activeDefault = isAltUnit && step.pickerDefaultAlt != null ? step.pickerDefaultAlt : (step.pickerDefault ?? 0);
  const currentPickerValue = pickerValue[currentStep] ?? activeDefault;

  // Progress fraction
  const progressFraction = (() => {
    if (currentStep === 0) return 1;
    const match = step.headerTitle.match(/Step (\d+)/);
    const stepNum = match ? parseInt(match[1]) : currentStep;
    return stepNum / TOTAL_STEPS;
  })();

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace('Auth');
    }
  }, [currentStep, navigation]);

  const handleSelect = useCallback((optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step.skipOptionId === optionId) {
      setAnswers(prev => ({ ...prev, [currentStep]: [optionId] }));
      setTimeout(() => goNext(), 300);
      return;
    }

    if (step.type === 'multi') {
      setAnswers(prev => {
        const current = (prev[currentStep] || []).filter(id => id !== step.skipOptionId);
        const newSelection = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [currentStep]: newSelection };
      });
    } else {
      setAnswers(prev => ({ ...prev, [currentStep]: [optionId] }));
      setTimeout(() => goNext(), 300);
    }
  }, [currentStep, step, goNext]);

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleToggle = (toggleId: string) => {
    if (toggleId === currentToggle) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Convert current picker value to other unit
    const oldVal = currentPickerValue;
    let newVal = oldVal;

    if (step.toggle) {
      const isHeight = step.question.toLowerCase().includes('height');

      if (isHeight) {
        // cm ↔ inches
        if (toggleId === step.toggle[0].id) {
          // switching to feet (inches)
          newVal = Math.round(oldVal / 2.54);
        } else {
          // switching to cm
          newVal = Math.round(oldVal * 2.54);
        }
      } else {
        // kg ↔ lbs
        if (toggleId === step.toggle[0].id) {
          // switching to lbs
          newVal = Math.round(oldVal * 2.205);
        } else {
          // switching to kg
          newVal = Math.round(oldVal / 2.205);
        }
      }
    }

    const newRange = toggleId === step.toggle![0].id && step.pickerRangeAlt
      ? step.pickerRangeAlt
      : step.pickerRange!;

    newVal = Math.max(newRange[0], Math.min(newRange[1], newVal));

    setToggleState(prev => ({ ...prev, [currentStep]: toggleId }));
    setPickerValue(prev => ({ ...prev, [currentStep]: newVal }));
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  // Format picker label
  const formatPickerLabel = (val: number): string => {
    if (step.toggle && isAltUnit && step.question.toLowerCase().includes('height')) {
      return inchesToFeetStr(val);
    }
    return String(val);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ─── Header Row ────────────────────────── */}
      <View style={styles.headerRow}>
        <PressableScale style={styles.backBtn} onPress={goBack}>
          <Feather name="chevron-left" size={26} color={C.black} />
        </PressableScale>
        <Text style={styles.headerTitle}>{step.headerTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ─── Progress Bar ──────────────────────── */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressFraction * 100}%` }]} />
      </View>

      {/* ─── Content ───────────────────────────── */}
      {step.type === 'picker' ? (
        <View style={styles.pickerScreenContainer}>
          {/* Subtitle + Question + Toggle */}
          <View style={styles.pickerTopSection}>
            {step.subtitle ? (
              <Text style={styles.subtitle}>{step.subtitle}</Text>
            ) : null}
            <Text style={styles.question}>{step.question}</Text>

            {/* Unit Toggle */}
            {step.toggle && (
              <View style={styles.toggleRow}>
                {step.toggle.map((t) => {
                  const isActive = currentToggle === t.id;
                  return (
                    <PressableScale
                      key={t.id}
                      style={[
                        styles.toggleBtn,
                        isActive && styles.toggleBtnActive,
                      ]}
                      onPress={() => handleToggle(t.id)}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          isActive && styles.toggleBtnTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            )}
          </View>

          {/* Picker Wheel */}
          <View style={styles.pickerWheelArea}>
            <ScrollPickerWheel
              key={`${currentStep}-${currentToggle}`}
              min={activeRange![0]}
              max={activeRange![1]}
              value={currentPickerValue}
              formatLabel={formatPickerLabel}
              onChange={(val) => {
                setPickerValue(prev => ({ ...prev, [currentStep]: val }));
              }}
            />
          </View>
        </View>
      ) : (
        /* ─── List Type ──────────────── */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {step.subtitle ? (
            <Text style={styles.subtitle}>{step.subtitle}</Text>
          ) : null}

          <Text style={styles.question}>{step.question}</Text>

          <View style={styles.optionsContainer}>
            {step.options.map((option) => {
              const selected = isSelected(option.id);
              const isSkipOption = step.skipOptionId === option.id;

              if (isSkipOption) {
                return (
                  <PressableScale
                    key={option.id}
                    style={[styles.optionCard, selected && styles.optionCardSelected]}
                    onPress={() => handleSelect(option.id)}
                  >
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Feather name="chevron-right" size={22} color={C.gray} />
                  </PressableScale>
                );
              }

              if (step.type === 'multi') {
                return (
                  <PressableScale
                    key={option.id}
                    style={[styles.optionCard, selected && styles.optionCardSelected]}
                    onPress={() => handleSelect(option.id)}
                  >
                    {(option.icon || option.mciIcon) && (
                      <View style={styles.optionIconWrap}>
                        {option.icon ? (
                          <Feather name={option.icon as any} size={22} color={C.black} />
                        ) : (
                          <MaterialCommunityIcons name={option.mciIcon as any} size={22} color={C.black} />
                        )}
                      </View>
                    )}
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.subLabel && (
                        <Text style={styles.optionSubLabel}>{option.subLabel}</Text>
                      )}
                    </View>
                    <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                      {selected && <Feather name="check" size={14} color={C.white} />}
                    </View>
                  </PressableScale>
                );
              } else {
                return (
                  <PressableScale
                    key={option.id}
                    style={[styles.optionCard, selected && styles.optionCardSelected]}
                    onPress={() => handleSelect(option.id)}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.subLabel && (
                        <Text style={styles.optionSubLabel}>{option.subLabel}</Text>
                      )}
                    </View>
                    <Feather name="chevron-right" size={22} color={C.gray} />
                  </PressableScale>
                );
              }
            })}
          </View>

          {step.disclaimer && (
            <Text style={styles.disclaimer}>{step.disclaimer}</Text>
          )}
        </ScrollView>
      )}

      {/* ─── Next Button ─────────────────────── */}
      {step.showNext && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <PressableScale
            style={[
              styles.nextButton,
              step.type !== 'picker' && selectedIds.length === 0 && styles.nextButtonDisabled,
            ]}
            onPress={goNext}
            disabled={step.type !== 'picker' && selectedIds.length === 0}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </PressableScale>
        </View>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// SCROLL PICKER WHEEL (FlatList-based for performance)
// ══════════════════════════════════════════════════════════════════
function ScrollPickerWheel({
  min,
  max,
  value,
  onChange,
  formatLabel,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  formatLabel?: (val: number) => string;
}) {
  const listRef = useRef<FlatList<number>>(null);
  const totalItems = max - min + 1;
  const paddingItems = Math.floor(PICKER_VISIBLE_ITEMS / 2);
  const lastValue = useRef(value);
  const [centerIndex, setCenterIndex] = useState(value - min);
  const [containerHeight, setContainerHeight] = useState(PICKER_HEIGHT);

  // Items array — only create once
  const items = useRef(Array.from({ length: totalItems }, (_, i) => min + i)).current;

  // Scroll to initial value on mount
  useEffect(() => {
    const idx = value - min;
    const timer = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: idx * PICKER_ITEM_HEIGHT,
        animated: false,
      });
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position live for real-time highlight
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / PICKER_ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, totalItems - 1));
    setCenterIndex(clamped);
  }, [totalItems]);

  // Snap to value and report change
  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / PICKER_ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, totalItems - 1));
    const newVal = items[clamped];

    // Snap precisely
    listRef.current?.scrollToOffset({
      offset: clamped * PICKER_ITEM_HEIGHT,
      animated: true,
    });

    if (newVal !== lastValue.current) {
      Haptics.selectionAsync();
      lastValue.current = newVal;
      onChange(newVal);
    }
  }, [totalItems, items, onChange]);

  const label = formatLabel || String;

  // Highlight bar Y position (centered in container)
  const highlightTop = (containerHeight - PICKER_ITEM_HEIGHT) / 2;

  const renderItem = useCallback(({ item, index }: { item: number; index: number }) => {
    const distance = Math.abs(index - centerIndex);
    const isCenter = distance === 0;
    const opacity = isCenter ? 1 : distance === 1 ? 0.55 : distance === 2 ? 0.35 : 0.2;

    return (
      <View style={pStyles.item}>
        <Text
          style={[
            pStyles.itemText,
            isCenter && pStyles.itemTextSelected,
            { opacity },
          ]}
        >
          {label(item)}
        </Text>
      </View>
    );
  }, [centerIndex, label]);

  const keyExtractor = useCallback((item: number) => String(item), []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: PICKER_ITEM_HEIGHT,
    offset: PICKER_ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <View
      style={pStyles.container}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      {/* Highlight bar behind center item */}
      <View style={[pStyles.highlightBar, { top: highlightTop }]} />

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={PICKER_ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{
          paddingTop: paddingItems * PICKER_ITEM_HEIGHT,
          paddingBottom: paddingItems * PICKER_ITEM_HEIGHT,
        }}
        style={{ height: containerHeight }}
        initialScrollIndex={Math.max(0, value - min)}
        windowSize={5}
        maxToRenderPerBatch={15}
        removeClippedSubviews
      />
    </View>
  );
}

const pStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  highlightBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: PICKER_ITEM_HEIGHT,
    backgroundColor: '#EBEDF0',
    borderRadius: 12,
    zIndex: 0,
  },
  item: {
    height: PICKER_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: typography.body,
    fontSize: 20,
    color: C.gray,
  },
  itemTextSelected: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: C.black,
  },
});

// ══════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: C.black,
  },

  // ── Progress ──────────────────────────────
  progressTrack: {
    height: 3,
    backgroundColor: C.border,
  },
  progressFill: {
    height: 3,
    backgroundColor: C.blue,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },

  // ── Content ───────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 15,
    color: C.gray,
    lineHeight: 22,
    marginBottom: 12,
  },
  question: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: C.black,
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },

  // ── Option Card ───────────────────────────
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  optionCardSelected: {
    backgroundColor: C.selectedBg,
    borderColor: C.selectedBorder,
  },
  optionIconWrap: {
    width: 32,
    marginRight: 12,
    alignItems: 'center',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: typography.subheading,
    fontSize: 16,
    color: C.black,
  },
  optionSubLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: C.gray,
    marginTop: 4,
    lineHeight: 18,
  },

  // ── Checkbox ──────────────────────────────
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  checkboxChecked: {
    backgroundColor: C.checkBg,
    borderColor: C.checkBg,
  },

  // ── Disclaimer ────────────────────────────
  disclaimer: {
    fontFamily: typography.body,
    fontSize: 13,
    color: C.gray,
    lineHeight: 20,
    marginTop: 24,
  },

  // ── Picker Screen ─────────────────────────
  pickerScreenContainer: {
    flex: 1,
  },
  pickerTopSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pickerWheelArea: {
    flex: 1,
  },

  // ── Toggle ────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -8,
    marginBottom: 8,
  },
  toggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.toggleInactiveBg,
  },
  toggleBtnActive: {
    backgroundColor: C.blue,
  },
  toggleBtnText: {
    fontFamily: typography.subheading,
    fontSize: 14,
    color: C.toggleInactiveText,
  },
  toggleBtnTextActive: {
    color: C.white,
  },

  // ── Bottom Next button ────────────────────
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  nextButton: {
    backgroundColor: C.black,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  nextButtonDisabled: {
    opacity: 0.35,
  },
  nextButtonText: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: C.white,
  },
});
