import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, Modal, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addGlucoseReading, addWeightReading, addBloodPressure, addWaterIntake, getLatestReading, GlucoseReading, WeightReading, BloodPressureReading } from '../services/healthData';
import { Timestamp } from 'firebase/firestore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { PressableScale } from '../components/PressableScale';
import { PrimaryButton } from '../components/PrimaryButton';
import { DailyGoalItem } from '../components/DailyGoalItem';
import { ResourceCard } from '../components/ResourceCard';
import { CircularProgress } from '../components/CircularProgress';
import { LogGlucoseModal } from '../components/LogGlucoseModal';
import { AddWeightModal } from '../components/AddWeightModal';
import { AddBloodPressureModal } from '../components/AddBloodPressureModal';
import { LogWaterModal } from '../components/LogWaterModal';

// Import custom icons
import BloodIcon from '../../assets/icons/blood.svg';
import BloodPressureIcon from '../../assets/icons/blood-pressure.svg';
import BloodPressureIconAlt from '../../assets/icons/bloodpressure.svg';
import GreenWeightIcon from '../../assets/icons/green-weight.svg';
import MealsIcon from '../../assets/icons/meals.svg';
import ReportIcon from '../../assets/icons/report.svg';
import WaterIcon from '../../assets/icons/water.svg';
import AddMedicationIcon from '../../assets/icons/add medication.svg';
import PillsIcon from '../../assets/icons/pills.svg';
// Daily Goals icons
import BooksIcon from '../../assets/icons/books.svg';
import ScaleIcon from '../../assets/icons/scale.svg';
import ActivityIcon from '../../assets/icons/activity.svg';

const screenWidth = Dimensions.get('window').width;

// Design system constants
const CARD_RADIUS = 20;
const CARD_PADDING = 16;
const SECTION_GAP = 16;
const ICON_BUTTON_SIZE = 44;
const ADD_BUTTON_SIZE = 36;

// Hero carousel data
const heroCards = [
    {
        id: '1',
        title: 'Diabetes\nEssentials',
        subtitle: 'Glucose meters, strips\n& care products',
        image: 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?auto=format&fit=crop&w=400&q=80',
        gradient: ['#3C4D68', '#27384E'],
    },
    {
        id: '2',
        title: 'Healthy\nRecipes',
        subtitle: 'Diabetic-friendly meals\n& nutrition tips',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80',
        gradient: ['#2D6A4F', '#1B4332'],
    },
];

// Resources data
const resources = {
    learningHub: {
        title: 'Learning Hub',
        image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
        isNew: true,
    },
    podcasts: {
        title: 'Podcasts',
        image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80',
    },
    blog: {
        title: 'Blogs',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    },
    shop: {
        title: 'Health Shop',
        image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80',
    },
};

// Reusable Add Button Component
function AddButton({ onPress }: { onPress?: () => void }) {
    return (
        <PressableScale style={styles.addButton} onPress={onPress}>
            <Feather name="plus" size={18} color={colors.textPrimary} />
        </PressableScale>
    );
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [activeHeroIndex, setActiveHeroIndex] = useState(0);
    const [showCalorieModal, setShowCalorieModal] = useState(false);
    const [showGlucoseModal, setShowGlucoseModal] = useState(false);
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [showBloodPressureModal, setShowBloodPressureModal] = useState(false);
    const [showWaterModal, setShowWaterModal] = useState(false);
    const heroScrollRef = useRef<ScrollView>(null);
    const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const flamePulse = useRef(new Animated.Value(1)).current;

    // Health data from Firestore
    const [latestGlucose, setLatestGlucose] = useState<GlucoseReading | null>(null);
    const [latestWeight, setLatestWeight] = useState<WeightReading | null>(null);
    const [latestBP, setLatestBP] = useState<BloodPressureReading | null>(null);

    const streakDays = 0;
    const caloriesLeft = 2275;
    const caloriesEaten = 0;
    const caloriesBurned = 0;

    // Format Firestore Timestamp to readable date
    const formatDate = (ts: Timestamp | undefined) => {
        if (!ts) return '';
        const d = ts.toDate();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}`;
    };

    // Fetch latest readings from Firestore
    const fetchLatestReadings = useCallback(async () => {
        if (!user) return;
        try {
            const [glucose, weight, bp] = await Promise.all([
                getLatestReading(user.uid, 'glucose'),
                getLatestReading(user.uid, 'weight'),
                getLatestReading(user.uid, 'bloodPressure'),
            ]);
            setLatestGlucose(glucose as GlucoseReading | null);
            setLatestWeight(weight as WeightReading | null);
            setLatestBP(bp as BloodPressureReading | null);
        } catch (err) {
            console.warn('Failed to fetch latest readings:', err);
        }
    }, [user]);

    // Fetch on mount and when user changes
    useEffect(() => {
        fetchLatestReadings();
    }, [fetchLatestReadings]);

    // Auto-scroll hero carousel every 3 seconds
    useEffect(() => {
        heroTimerRef.current = setInterval(() => {
            setActiveHeroIndex(prev => {
                const next = (prev + 1) % heroCards.length;
                heroScrollRef.current?.scrollTo({
                    x: next * (screenWidth - 32 + SECTION_GAP),
                    animated: true,
                });
                return next;
            });
        }, 3000);
        return () => {
            if (heroTimerRef.current) clearInterval(heroTimerRef.current);
        };
    }, []);

    // Flame pulse animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(flamePulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                Animated.timing(flamePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
            ]),
        ).start();
    }, []);

    const handleHeroScroll = useCallback((event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 32 + SECTION_GAP));
        setActiveHeroIndex(index);
        // Reset timer on manual scroll
        if (heroTimerRef.current) clearInterval(heroTimerRef.current);
        heroTimerRef.current = setInterval(() => {
            setActiveHeroIndex(prev => {
                const next = (prev + 1) % heroCards.length;
                heroScrollRef.current?.scrollTo({
                    x: next * (screenWidth - 32 + SECTION_GAP),
                    animated: true,
                });
                return next;
            });
        }, 3000);
    }, []);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>Howdy, Alex</Text>
                        <Text style={styles.subGreeting}>Have a nutritious day!</Text>
                        {/* Streak Badge */}
                        <View style={styles.streakBadge}>
                            <LinearGradient
                                colors={['#FF6B35', '#FF4500']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.streakGradient}
                            >
                                <Animated.Text style={[styles.streakFlame, { transform: [{ scale: flamePulse }] }]}>🔥</Animated.Text>
                                <Text style={styles.streakText}>{streakDays} day streak</Text>
                            </LinearGradient>
                        </View>
                    </View>
                    <View style={styles.headerIcons}>
                        <PressableScale
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <Feather name="user" size={20} color="#FFFFFF" />
                        </PressableScale>
                        <PressableScale
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Feather name="settings" size={20} color="#FFFFFF" />
                        </PressableScale>
                    </View>
                </View>
            </View>

            {/* Hero Carousel */}
            <ScrollView
                ref={heroScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleHeroScroll}
                scrollEventThrottle={16}
                style={styles.heroCarousel}
                contentContainerStyle={styles.heroContent}
            >
                {heroCards.map((card) => (
                    <LinearGradient
                        key={card.id}
                        colors={card.gradient as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroTextContent}>
                            <Text style={styles.heroTitle}>{card.title}</Text>
                            <Text style={styles.heroSubtitle}>{card.subtitle}</Text>
                            <PrimaryButton label="Shop now" style={styles.heroButton} />
                        </View>
                        <View style={styles.heroImageWrap}>
                            <Image source={{ uri: card.image }} style={styles.heroImage} />
                        </View>
                    </LinearGradient>
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {heroCards.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, index === activeHeroIndex && styles.dotActive]}
                    />
                ))}
            </View>

            {/* Glucose & Weight Cards */}
            <View style={styles.cardRow}>
                <View style={styles.metricCard}>
                    <Pressable onPress={() => navigation.navigate('HealthInsights', { metric: 'glucose' })} style={StyleSheet.absoluteFill} />
                    {/* Icon LEFT corner - bloodpressure.svg for Glucose */}
                    <View style={styles.cardIconLeft}>
                        <BloodPressureIconAlt width={48} height={48} />
                    </View>
                    {/* Plus RIGHT corner */}
                    <AddButton onPress={() => setShowGlucoseModal(true)} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Glucose</Text>
                        {latestGlucose ? (
                            <>
                                <View style={styles.valueRow}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.valueText}>{latestGlucose.value}</Text>
                                    <Text style={styles.unitText}>{latestGlucose.unit || 'mg/dL'}</Text>
                                </View>
                                <Text style={styles.dateText}>{formatDate(latestGlucose.timestamp)}</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.valueTextMuted}>—</Text>
                                <Text style={styles.dateText}>No data</Text>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.metricCard}>
                    <Pressable onPress={() => navigation.navigate('HealthInsights', { metric: 'weight' })} style={StyleSheet.absoluteFill} />
                    {/* Icon LEFT corner - green-weight.svg for Weight */}
                    <View style={styles.cardIconLeft}>
                        <GreenWeightIcon width={48} height={48} />
                    </View>
                    {/* Plus RIGHT corner */}
                    <AddButton onPress={() => setShowWeightModal(true)} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Weight</Text>
                        {latestWeight ? (
                            <>
                                <View style={styles.valueRow}>
                                    <Text style={styles.valueText}>{latestWeight.kg}</Text>
                                    <Text style={styles.unitText}>kg</Text>
                                </View>
                                <Text style={styles.dateText}>{formatDate(latestWeight.timestamp)}</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.valueTextMuted}>—</Text>
                                <Text style={styles.dateText}>No data</Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            {/* Blood Pressure & Medication Cards */}
            <View style={styles.cardRow}>
                <View style={styles.metricCard}>
                    <Pressable onPress={() => navigation.navigate('HealthInsights', { metric: 'bloodpressure' })} style={StyleSheet.absoluteFill} />
                    {/* Icon LEFT corner - blood.svg for Blood Pressure */}
                    <View style={styles.cardIconLeft}>
                        <BloodIcon width={48} height={48} />
                    </View>
                    {/* Plus RIGHT corner */}
                    <AddButton onPress={() => setShowBloodPressureModal(true)} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Blood pressure</Text>
                        {latestBP ? (
                            <>
                                <View style={styles.valueRow}>
                                    <Text style={styles.valueText}>{latestBP.systolic}/{latestBP.diastolic}</Text>
                                    <Text style={styles.unitText}>mmHg</Text>
                                </View>
                                <Text style={styles.dateText}>{formatDate(latestBP.timestamp)}</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.valueTextMuted}>—</Text>
                                <Text style={styles.dateText}>No data</Text>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.metricCard}>
                    <Pressable onPress={() => navigation.navigate('MedicationList')} style={StyleSheet.absoluteFill} />
                    {/* Icon LEFT corner - add medication.svg for Medication */}
                    <View style={styles.cardIconLeft}>
                        <AddMedicationIcon width={48} height={48} />
                    </View>
                    {/* Plus RIGHT corner */}
                    <AddButton onPress={() => navigation.navigate('AddMedication')} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Medication</Text>
                        <View style={styles.medicationInfo}>
                            <PillsIcon width={20} height={20} />
                            <Text style={styles.medicationText}>Tap to view</Text>
                        </View>
                        <PressableScale style={styles.linkBtn} onPress={() => navigation.navigate('MedicationList')}>
                            <Text style={styles.linkBtnText}>View medications</Text>
                        </PressableScale>
                    </View>
                </View>
            </View>

            {/* Health Overview Link */}
            <PressableScale style={styles.linkCard} onPress={() => navigation.navigate('HealthOverview')}>
                <View style={[styles.goalIcon, { backgroundColor: colors.primarySoft }]}>
                    <ReportIcon width={24} height={24} />
                </View>
                <Text style={styles.linkCardText}>See health overview</Text>
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </PressableScale>

            {/* Log Water Card */}
            <PressableScale style={styles.goalCard} onPress={() => navigation.navigate('HealthInsights', { metric: 'water' })}>
                <View style={[styles.goalIcon, { backgroundColor: colors.goalBlueSoft }]}>
                    <WaterIcon width={24} height={24} />
                </View>
                <View style={styles.goalTexts}>
                    <Text style={styles.goalLabel}>Log water</Text>
                    <Text style={styles.goalValue}>Stay hydrated throughout the day</Text>
                </View>
            </PressableScale>

            {/* Daily Goals Section */}
            <Text style={styles.sectionTitle}>Daily goals</Text>
            <View style={styles.goalsList}>
                {/* Learn - books.svg */}
                <PressableScale style={styles.goalCard} onPress={() => navigation.navigate('AddActivity')}>
                    <View style={[styles.goalIcon, { backgroundColor: colors.goalBlueSoft }]}>
                        <BooksIcon width={24} height={24} />
                    </View>
                    <View style={styles.goalTexts}>
                        <Text style={styles.goalLabel}>Learn</Text>
                        <Text style={styles.goalValue}>Track your activity</Text>
                    </View>
                </PressableScale>

                {/* Log your food - meals.svg */}
                <PressableScale style={styles.goalCard} onPress={() => setShowCalorieModal(true)}>
                    <View style={[styles.goalIcon, { backgroundColor: colors.goalOrangeSoft }]}>
                        <MealsIcon width={24} height={24} />
                    </View>
                    <View style={styles.goalTexts}>
                        <Text style={styles.goalLabel}>Log your food</Text>
                        <Text style={styles.goalValue}>Kickstart your meal plan</Text>
                    </View>
                </PressableScale>

                {/* Measure your weight - scale.svg */}
                <PressableScale style={styles.goalCard} onPress={() => setShowWeightModal(true)}>
                    <View style={[styles.goalIcon, { backgroundColor: colors.goalGreenSoft }]}>
                        <ScaleIcon width={24} height={24} />
                    </View>
                    <View style={styles.goalTexts}>
                        <Text style={styles.goalLabel}>Measure your weight</Text>
                        <Text style={styles.goalValue}>Share your today's weight</Text>
                    </View>
                </PressableScale>

                {/* Be active - activity.svg */}
                <PressableScale style={styles.goalCard} onPress={() => navigation.navigate('DailyStretch')}>
                    <View style={[styles.goalIcon, { backgroundColor: colors.goalPinkSoft }]}>
                        <ActivityIcon width={24} height={24} />
                    </View>
                    <View style={styles.goalTexts}>
                        <Text style={styles.goalLabel}>Be active</Text>
                        <Text style={styles.goalValue}>Move and stay fit</Text>
                    </View>
                </PressableScale>
            </View>

            {/* Resources Section */}
            <Text style={styles.sectionTitle}>Resources</Text>
            <View style={styles.resourcesGrid}>
                <ResourceCard {...resources.learningHub} onPress={() => navigation.navigate('LearningHub')} />
                <View style={styles.resourceRow}>
                    <ResourceCard {...resources.podcasts} isHalf onPress={() => navigation.navigate('Podcasts')} />
                    <ResourceCard {...resources.blog} isHalf onPress={() => navigation.navigate('Blogs')} />
                </View>
                <ResourceCard {...resources.shop} />
            </View>

            {/* Contact Section */}
            <View style={styles.contactSection}>
                <Text style={styles.contactText}>Need help with something?</Text>
                <PressableScale>
                    <Text style={styles.contactLink}>Contact us</Text>
                </PressableScale>
            </View>

            {/* Extra bottom padding for FAB */}
            <View style={styles.fabSpacer} />

            {/* Calorie Tracker Modal */}
            <Modal
                visible={showCalorieModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCalorieModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Today's calories</Text>
                            <PressableScale onPress={() => setShowCalorieModal(false)}>
                                <Feather name="x" size={24} color={colors.textPrimary} />
                            </PressableScale>
                        </View>

                        <View style={styles.calorieTracker}>
                            <View style={styles.calorieItem}>
                                <Feather name="coffee" size={20} color={colors.textSecondary} />
                                <Text style={styles.calorieValue}>{caloriesEaten}</Text>
                                <Text style={styles.calorieLabel}>Eaten</Text>
                            </View>
                            <CircularProgress
                                size={140}
                                strokeWidth={12}
                                progress={((2275 - caloriesLeft) / 2275) * 100}
                                value={caloriesLeft}
                                label="Left"
                            />
                            <View style={styles.calorieItem}>
                                <Feather name="zap" size={20} color={colors.textSecondary} />
                                <Text style={styles.calorieValue}>{caloriesBurned}</Text>
                                <Text style={styles.calorieLabel}>Burned</Text>
                            </View>
                        </View>

                        <View style={styles.macrosRow}>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Carbs</Text>
                                <Text style={styles.macroValue}>0 / 275 g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Protein</Text>
                                <Text style={styles.macroValue}>0 / 165 g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Fat</Text>
                                <Text style={styles.macroValue}>0 / 85 g</Text>
                            </View>
                        </View>

                        <PrimaryButton label="Log food" style={styles.logFoodButton} />
                    </View>
                </View>
            </Modal>

            {/* Log Glucose Modal */}
            <LogGlucoseModal
                visible={showGlucoseModal}
                onClose={() => setShowGlucoseModal(false)}
                onSave={async (value, mealTiming) => {
                    if (!user) return;
                    try {
                        await addGlucoseReading(user.uid, value, 'mg/dL', mealTiming);
                        setShowGlucoseModal(false);
                        fetchLatestReadings();
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                }}
            />

            {/* Add Weight Modal */}
            <AddWeightModal
                visible={showWeightModal}
                onClose={() => setShowWeightModal(false)}
                initialKg={70}
                onSave={async (kg, grams) => {
                    if (!user) return;
                    try {
                        await addWeightReading(user.uid, kg, grams);
                        setShowWeightModal(false);
                        fetchLatestReadings();
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                }}
            />

            {/* Add Blood Pressure Modal */}
            <AddBloodPressureModal
                visible={showBloodPressureModal}
                onClose={() => setShowBloodPressureModal(false)}
                onSave={async (systolic, diastolic) => {
                    if (!user) return;
                    try {
                        await addBloodPressure(user.uid, systolic, diastolic);
                        setShowBloodPressureModal(false);
                        fetchLatestReadings();
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                }}
            />

            {/* Log Water Modal */}
            <LogWaterModal
                visible={showWaterModal}
                onClose={() => setShowWaterModal(false)}
                dailyGoalL={1.5}
                onSave={async (amountL) => {
                    if (!user) return;
                    try {
                        await addWaterIntake(user.uid, amountL * 1000);
                        setShowWaterModal(false);
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: SECTION_GAP,
        paddingTop: 0,
        gap: SECTION_GAP,
    },

    // Header - redesigned for premium feel
    header: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
        paddingRight: 16,
        gap: 4,
    },
    greeting: {
        fontFamily: typography.heading,
        fontSize: 26,
        color: colors.textPrimary,
        lineHeight: 32,
    },
    subGreeting: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    streakBadge: {
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    streakGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
    },
    streakFlame: {
        fontSize: 15,
    },
    streakText: {
        fontFamily: typography.subheading,
        fontSize: 13,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 2,
    },
    iconButton: {
        width: ICON_BUTTON_SIZE,
        height: ICON_BUTTON_SIZE,
        borderRadius: ICON_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(60, 60, 67, 0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Hero Carousel
    heroCarousel: {
        marginHorizontal: -SECTION_GAP,
    },
    heroContent: {
        paddingHorizontal: SECTION_GAP,
    },
    heroCard: {
        width: screenWidth - 32,
        borderRadius: CARD_RADIUS,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SECTION_GAP,
    },
    heroTextContent: {
        flex: 1,
        gap: 8,
    },
    heroTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.surface,
        lineHeight: 26,
    },
    heroSubtitle: {
        fontFamily: typography.body,
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 18,
    },
    heroButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        height: 36,
        marginTop: 8,
    },
    heroImageWrap: {
        width: 110,
        height: 95,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },

    // Pagination - centered and subtle
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
    },
    dotActive: {
        width: 20,
        backgroundColor: colors.primary,
    },

    // Card Row
    cardRow: {
        flexDirection: 'row',
        gap: SECTION_GAP,
    },

    // Metric Card - standardized structure
    metricCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: CARD_RADIUS,
        padding: CARD_PADDING,
        minHeight: 130,
        ...shadows.soft,
    },

    // Add Button - top-right, consistent size/shape
    addButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: ADD_BUTTON_SIZE,
        height: ADD_BUTTON_SIZE,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },

    // Card Icon - LEFT corner, X-LARGE
    cardIconLeft: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1,
    },

    // Card Content - positioned below the icon
    cardContent: {
        marginTop: 56,
    },

    // Card content styles
    cardTitle: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
        marginRight: 4,
        alignSelf: 'center',
    },
    valueText: {
        fontFamily: typography.heading,
        fontSize: 26,
        color: colors.textPrimary,
    },
    valueTextMuted: {
        fontFamily: typography.heading,
        fontSize: 26,
        color: colors.textPrimary,
    },
    unitText: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 3,
    },
    dateText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 6,
    },

    // Medication card specific
    medicationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    pillIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    medicationText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textSecondary,
    },
    linkBtn: {
        backgroundColor: colors.primarySoft,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    linkBtnText: {
        fontFamily: typography.subheading,
        fontSize: 11,
        color: colors.primary,
    },

    // Link Card (Health Overview)
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: CARD_RADIUS,
        padding: CARD_PADDING,
        gap: 12,
        ...shadows.soft,
    },
    linkCardIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkCardText: {
        flex: 1,
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },

    // Water Card
    waterCard: {
        backgroundColor: colors.surface,
        borderRadius: CARD_RADIUS,
        padding: CARD_PADDING,
        gap: SECTION_GAP,
        ...shadows.soft,
    },
    waterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    waterIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.goalBlueSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    waterTexts: {
        flex: 1,
    },
    waterTitle: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    waterSubtitle: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    waterGlasses: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    waterGlass: {
        width: 34,
        height: 38,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Section Title
    sectionTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.textPrimary,
    },

    // Goals List
    goalsList: {
        gap: 10,
    },
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: CARD_RADIUS,
        padding: CARD_PADDING,
        gap: 12,
    },
    goalIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,  // Perfect circle (50% of size)
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalTexts: {
        flex: 1,
        gap: 2,
    },
    goalLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
    },
    goalValue: {
        fontFamily: typography.heading,
        fontSize: 15,
        color: colors.textPrimary,
    },

    // Resources Grid
    resourcesGrid: {
        gap: SECTION_GAP,
    },
    resourceRow: {
        flexDirection: 'row',
        gap: 12,
    },

    // Contact Section
    contactSection: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 6,
    },
    contactText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    contactLink: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: colors.textPrimary,
        textDecorationLine: 'underline',
    },

    // FAB Spacer - prevents content overlap
    fabSpacer: {
        height: 100,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.textPrimary,
    },
    calorieTracker: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
    },
    calorieItem: {
        alignItems: 'center',
        gap: 6,
    },
    calorieValue: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.textPrimary,
    },
    calorieLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    macroItem: {
        alignItems: 'center',
        gap: 4,
    },
    macroLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
    },
    macroValue: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: colors.textPrimary,
    },
    logFoodButton: {
        marginTop: 16,
    },
});
