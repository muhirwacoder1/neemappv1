import { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../navigation/types';
import { typography } from '../theme/typography';
import { PressableScale } from '../components/PressableScale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Slide data ─────────────────────────────────────────────────
interface Slide {
    id: string;
    image: any;
    title: string;
    description: string;
}

const SLIDES: Slide[] = [
    {
        id: '1',
        image: { uri: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800&h=1000&fit=crop&crop=faces' },
        title: 'Stay on top of your condition',
        description:
            'From setting up reminders to spotting trends – all in one place.',
    },
    {
        id: '2',
        image: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=1000&fit=crop' },
        title: 'Build healthier eating habits',
        description:
            'Personalized meal plans, food tracking, and nutrition insights at your fingertips.',
    },
    {
        id: '3',
        image: { uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop&crop=faces' },
        title: 'Track your progress daily',
        description:
            'Monitor glucose, weight, and activity to stay motivated on your health journey.',
    },
];

// ── Colors ─────────────────────────────────────────────────────
const C = {
    bg: '#FFFFFF',
    black: '#1B1B1B',
    gray: '#6B7280',
    blue: '#1E6AE1',
    dotInactive: '#D1D5DB',
    border: '#E5E7EB',
};

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index != null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
    ).current;

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const renderSlide = useCallback(
        ({ item }: { item: Slide }) => (
            <View style={styles.slide}>
                {/* Hero image area */}
                <View style={styles.imageContainer}>
                    {/* My Diabetes Logo */}
                    <View style={styles.logoRow}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoMy}>My</Text>
                        </View>
                        <Text style={styles.logoDiabetes}>Diabetes</Text>
                    </View>

                    <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
                </View>

                {/* Text content */}
                <View style={styles.textContent}>
                    <Text style={styles.slideTitle}>{item.title}</Text>
                    <Text style={styles.slideDesc}>{item.description}</Text>
                </View>
            </View>
        ),
        [],
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Carousel */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                style={styles.carousel}
            />

            {/* Pagination Dots */}
            <View style={styles.dotsRow}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, activeIndex === i && styles.dotActive]}
                    />
                ))}
            </View>

            {/* Buttons */}
            <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 16 }]}>
                <PressableScale
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginButtonText}>Log in</Text>
                </PressableScale>

                <PressableScale
                    style={styles.createButton}
                    onPress={() => navigation.navigate('SignUp')}
                >
                    <Text style={styles.createButtonText}>Create account</Text>
                </PressableScale>
            </View>
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    carousel: {
        flex: 1,
    },
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    logoRow: {
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    logoBox: {
        backgroundColor: C.blue,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    logoMy: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#FFFFFF',
    },
    logoDiabetes: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: C.blue,
    },
    textContent: {
        paddingHorizontal: 28,
        paddingTop: 28,
        alignItems: 'center',
    },
    slideTitle: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: C.black,
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: 10,
    },
    slideDesc: {
        fontFamily: typography.body,
        fontSize: 15,
        color: C.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.dotInactive,
    },
    dotActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: C.blue,
    },
    buttonsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    loginButton: {
        backgroundColor: C.black,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 17,
    },
    loginButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#FFFFFF',
    },
    createButton: {
        backgroundColor: C.bg,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 17,
    },
    createButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: C.black,
    },
});
