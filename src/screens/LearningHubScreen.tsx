import { useRef, useCallback } from 'react';
import {
    StyleSheet, Text, View, Image, Pressable, Animated, Dimensions, Platform, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_MAX_HEIGHT = SCREEN_HEIGHT * 0.38;
const HERO_MIN_HEIGHT = 0;
const HEADER_HEIGHT = 56;
const SCROLL_DISTANCE = HERO_MAX_HEIGHT - HERO_MIN_HEIGHT;

// ── Lesson Data ─────────────────────────────────────────────────────

interface Lesson {
    id: string;
    title: string;
    image: string;
    completed: boolean;
}

const COURSE = {
    title: 'Comprehensive self-care',
    description:
        'This course covers everything from heart and kidney health to foot care and vision, equipping you with a holistic approach to your health.',
    heroImage:
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
    completionPercent: 0,
};

const LESSONS: Lesson[] = [
    {
        id: '1',
        title: 'Diabetes and your heart',
        image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=200&q=80',
        completed: false,
    },
    {
        id: '2',
        title: 'Diabetes and chronic kidney disease',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80',
        completed: false,
    },
    {
        id: '3',
        title: 'Diabetes and nerve damage',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=200&q=80',
        completed: false,
    },
    {
        id: '4',
        title: 'Diabetes and your feet',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=200&q=80',
        completed: false,
    },
    {
        id: '5',
        title: 'Diabetes and oral health',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=200&q=80',
        completed: false,
    },
    {
        id: '6',
        title: 'Diabetes and hearing loss',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=200&q=80',
        completed: false,
    },
    {
        id: '7',
        title: 'Diabetes and vision loss',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=200&q=80',
        completed: false,
    },
];

// ── Component ───────────────────────────────────────────────────────

export function LearningHubScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleBack = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
    }, [navigation]);

    // ── Animated interpolations ──────────────────────────────────────

    // Hero image height collapses as user scrolls
    const heroHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [HERO_MAX_HEIGHT, HERO_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    // Hero image opacity fades out
    const heroOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Hero image scale-down effect
    const heroScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.2, 1],
        extrapolateRight: 'clamp',
    });

    // Course info (title, description, progress) fades out as it scrolls behind the compact header
    const infoOpacity = scrollY.interpolate({
        inputRange: [SCROLL_DISTANCE * 0.3, SCROLL_DISTANCE * 0.8],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Compact header visibility
    const compactOpacity = scrollY.interpolate({
        inputRange: [SCROLL_DISTANCE * 0.5, SCROLL_DISTANCE * 0.9],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Compact header border line
    const compactBorderOpacity = scrollY.interpolate({
        inputRange: [SCROLL_DISTANCE * 0.8, SCROLL_DISTANCE],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Back button background
    const backBtnBg = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.8],
        outputRange: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)'],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />

            {/* ── Compact Header (shown on scroll) ── */}
            <Animated.View
                style={[
                    styles.compactHeader,
                    { paddingTop: insets.top, opacity: compactOpacity },
                ]}
            >
                <Animated.View
                    style={[
                        styles.compactBorder,
                        { opacity: compactBorderOpacity },
                    ]}
                />
                <View style={styles.compactContent}>
                    <Pressable hitSlop={14} style={styles.compactBack} onPress={handleBack}>
                        <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.compactTitle} numberOfLines={1}>
                        {COURSE.title}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            </Animated.View>

            {/* ── Back button floating over hero ── */}
            <Animated.View
                style={[
                    styles.floatingBack,
                    { top: insets.top + 8, opacity: Animated.subtract(1, compactOpacity) },
                ]}
            >
                <Pressable
                    hitSlop={12}
                    onPress={handleBack}
                >
                    <Animated.View style={[styles.floatingBackCircle, { backgroundColor: backBtnBg }]}>
                        <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                    </Animated.View>
                </Pressable>
            </Animated.View>

            {/* ── Scrollable content ── */}
            <Animated.ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                {/* ── Hero Image ── */}
                <Animated.View style={[styles.heroWrap, { height: heroHeight }]}>
                    <Animated.Image
                        source={{ uri: COURSE.heroImage }}
                        style={[
                            styles.heroImage,
                            {
                                opacity: heroOpacity,
                                transform: [{ scale: heroScale }],
                            },
                        ]}
                    />
                    {/* Bottom gradient for readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.6)', colors.background]}
                        locations={[0.3, 0.7, 1]}
                        style={styles.heroGradient}
                    />
                </Animated.View>

                {/* ── Course Info ── */}
                <Animated.View style={[styles.courseInfo, { opacity: infoOpacity }]}>
                    <Text style={styles.courseTitle}>{COURSE.title}</Text>
                    <Text style={styles.courseDesc}>{COURSE.description}</Text>

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Progress */}
                    <View style={styles.progressWrap}>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${Math.max(COURSE.completionPercent, 2)}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {COURSE.completionPercent}% complete
                        </Text>
                    </View>
                </Animated.View>

                {/* ── Lesson Cards ── */}
                <View style={styles.lessonsWrap}>
                    {LESSONS.map((lesson, idx) => (
                        <Pressable
                            key={lesson.id}
                            style={({ pressed }) => [
                                styles.lessonCard,
                                pressed && styles.lessonCardPressed,
                            ]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                        >
                            <Image
                                source={{ uri: lesson.image }}
                                style={styles.lessonThumb}
                            />
                            <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* ── Footer disclaimer ── */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This course is provided with assistance from the Centers for Disease Control and Prevention (CDC) and rehabilitation resources.
                    </Text>
                </View>
            </Animated.ScrollView>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Compact header (visible on scroll)
    compactHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backgroundColor: colors.surface,
    },
    compactContent: {
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    compactBorder: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    compactBack: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactTitle: {
        flex: 1,
        fontFamily: typography.heading,
        fontSize: 17,
        color: colors.textPrimary,
        textAlign: 'center',
    },

    // Floating back button over hero
    floatingBack: {
        position: 'absolute',
        left: 12,
        zIndex: 30,
    },
    floatingBackCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Hero image
    heroWrap: {
        width: SCREEN_WIDTH,
        overflow: 'hidden',
        backgroundColor: colors.surfaceAlt,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },

    // Course info
    courseInfo: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 8,
    },
    courseTitle: {
        fontFamily: typography.heading,
        fontSize: 28,
        color: colors.textPrimary,
        lineHeight: 36,
        marginBottom: 14,
    },
    courseDesc: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 23,
        marginBottom: 16,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginBottom: 14,
    },
    progressWrap: {
        marginBottom: 8,
    },
    progressTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    progressText: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },

    // Lesson cards
    lessonsWrap: {
        paddingHorizontal: 20,
        gap: 14,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 12,
        gap: 16,
        ...shadows.soft,
    },
    lessonCardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.985 }],
    },
    lessonThumb: {
        width: 72,
        height: 72,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
    },
    lessonTitle: {
        flex: 1,
        fontFamily: typography.subheading,
        fontSize: 16,
        color: colors.textPrimary,
        lineHeight: 22,
    },

    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    footerText: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 18,
    },
});
