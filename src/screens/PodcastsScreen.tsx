import { useState, useRef, useEffect } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable, Image,
    Modal, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Podcast Data ────────────────────────────────────────────────────

interface PodcastEpisode {
    id: string;
    title: string;
    description: string;
    duration: string;
    durationSec: number;
    artwork: string;
}

const EPISODES: PodcastEpisode[] = [
    {
        id: '1',
        title: 'Understanding Blood Sugar Spikes',
        description: 'Learn what causes glucose spikes and how to manage them effectively.',
        duration: '25 min',
        durationSec: 1500,
        artwork: 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '2',
        title: 'Nutrition Tips for Type 2 Diabetes',
        description: 'A dietitian talks about the best foods for stable blood sugar.',
        duration: '32 min',
        durationSec: 1920,
        artwork: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '3',
        title: 'Exercise & Insulin Sensitivity',
        description: 'How physical activity improves your body\'s response to insulin.',
        duration: '18 min',
        durationSec: 1080,
        artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '4',
        title: 'Mental Health & Chronic Illness',
        description: 'Managing stress, anxiety, and emotional wellbeing with diabetes.',
        duration: '28 min',
        durationSec: 1680,
        artwork: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '5',
        title: 'Diabetes Medications Explained',
        description: 'A doctor breaks down common medications and how they work.',
        duration: '22 min',
        durationSec: 1320,
        artwork: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '6',
        title: 'Sleep & Blood Sugar Connection',
        description: 'Why poor sleep raises your glucose and what you can do about it.',
        duration: '20 min',
        durationSec: 1200,
        artwork: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '7',
        title: 'Cooking Diabetic-Friendly Meals',
        description: 'Quick, easy recipes that keep your blood sugar in check.',
        duration: '35 min',
        durationSec: 2100,
        artwork: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=200&q=80',
    },
];

// ── Spotify-Style Player ────────────────────────────────────────────

function PodcastPlayer({
    episode,
    visible,
    onClose,
}: {
    episode: PodcastEpisode | null;
    visible: boolean;
    onClose: () => void;
}) {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [isVisible, setIsVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Open / close animation
    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            setIsPlaying(true);
            setProgress(0);
            setCurrentTime(0);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 12,
            }).start();
        } else {
            setIsPlaying(false);
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 320,
                useNativeDriver: true,
            }).start(() => setIsVisible(false));
        }
    }, [visible]);

    // Simulate playback timer
    useEffect(() => {
        if (!isPlaying || !episode) return;
        timerRef.current = setInterval(() => {
            setCurrentTime(prev => {
                const next = prev + playbackSpeed;
                if (next >= episode.durationSec) {
                    setIsPlaying(false);
                    return episode.durationSec;
                }
                setProgress(next / episode.durationSec);
                return next;
            });
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, playbackSpeed, episode]);

    const togglePlay = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsPlaying(p => !p);
    };

    const skipForward = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!episode) return;
        setCurrentTime(prev => {
            const next = Math.min(prev + 15, episode.durationSec);
            setProgress(next / episode.durationSec);
            return next;
        });
    };

    const skipBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!episode) return;
        setCurrentTime(prev => {
            const next = Math.max(prev - 15, 0);
            setProgress(next / (episode.durationSec || 1));
            return next;
        });
    };

    const cycleSpeed = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPlaybackSpeed(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!isVisible || !episode) return null;

    return (
        <Modal visible={isVisible} transparent animationType="none" statusBarTranslucent>
            <Animated.View style={[playerStyles.root, { transform: [{ translateY: slideAnim }] }]}>
                {/* Top bar */}
                <View style={[playerStyles.topBar, { paddingTop: insets.top + 8 }]}>
                    <Pressable hitSlop={14} onPress={onClose} style={playerStyles.closeBtn}>
                        <Feather name="chevron-down" size={28} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={playerStyles.topLabel}>NOW PLAYING</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Cover Art */}
                <View style={playerStyles.artWrap}>
                    <Image source={{ uri: episode.artwork }} style={playerStyles.artwork} />
                </View>

                {/* Title & description */}
                <View style={playerStyles.infoWrap}>
                    <Text style={playerStyles.episodeTitle} numberOfLines={2}>
                        {episode.title}
                    </Text>
                    <Text style={playerStyles.episodeDesc} numberOfLines={1}>
                        {episode.description}
                    </Text>
                </View>

                {/* Progress bar */}
                <View style={playerStyles.progressWrap}>
                    <View style={playerStyles.progressTrack}>
                        <View
                            style={[playerStyles.progressFill, { width: `${progress * 100}%` }]}
                        />
                        <View
                            style={[playerStyles.progressDot, { left: `${progress * 100}%` }]}
                        />
                    </View>
                    <View style={playerStyles.timeRow}>
                        <Text style={playerStyles.timeText}>{formatTime(currentTime)}</Text>
                        <Text style={playerStyles.timeText}>
                            {formatTime(episode.durationSec)}
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={playerStyles.controls}>
                    {/* Speed */}
                    <Pressable style={playerStyles.speedBtn} onPress={cycleSpeed}>
                        <Text style={playerStyles.speedText}>{playbackSpeed}×</Text>
                    </Pressable>

                    {/* Skip back 15s */}
                    <Pressable style={playerStyles.controlBtn} onPress={skipBack}>
                        <Feather name="rotate-ccw" size={26} color={colors.textPrimary} />
                        <Text style={playerStyles.skipLabel}>15</Text>
                    </Pressable>

                    {/* Play / Pause */}
                    <Pressable
                        style={({ pressed }) => [
                            playerStyles.playBtn,
                            pressed && { transform: [{ scale: 0.93 }] },
                        ]}
                        onPress={togglePlay}
                    >
                        <Feather
                            name={isPlaying ? 'pause' : 'play'}
                            size={32}
                            color="#FFFFFF"
                            style={!isPlaying ? { marginLeft: 3 } : undefined}
                        />
                    </Pressable>

                    {/* Skip forward 15s */}
                    <Pressable style={playerStyles.controlBtn} onPress={skipForward}>
                        <Feather name="rotate-cw" size={26} color={colors.textPrimary} />
                        <Text style={playerStyles.skipLabel}>15</Text>
                    </Pressable>

                    {/* Bookmark */}
                    <Pressable
                        style={playerStyles.controlBtn}
                        onPress={() =>
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        }
                    >
                        <Feather name="bookmark" size={22} color={colors.textSecondary} />
                    </Pressable>
                </View>

                <View style={{ flex: 1 }} />
            </Animated.View>
        </Modal>
    );
}

const playerStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topLabel: {
        fontFamily: typography.subheading,
        fontSize: 11,
        letterSpacing: 1.2,
        color: colors.textMuted,
    },
    artWrap: {
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 16,
        paddingBottom: 28,
    },
    artwork: {
        width: SCREEN_WIDTH - 80,
        height: SCREEN_WIDTH - 80,
        borderRadius: 16,
        backgroundColor: colors.surfaceAlt,
    },
    infoWrap: {
        paddingHorizontal: 28,
        marginBottom: 20,
    },
    episodeTitle: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.textPrimary,
        lineHeight: 28,
        marginBottom: 6,
    },
    episodeDesc: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    progressWrap: {
        paddingHorizontal: 28,
        marginBottom: 20,
    },
    progressTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: colors.primary,
    },
    progressDot: {
        position: 'absolute',
        top: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
        marginLeft: -6,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    timeText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        paddingHorizontal: 28,
    },
    controlBtn: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    skipLabel: {
        position: 'absolute',
        fontFamily: typography.subheading,
        fontSize: 9,
        color: colors.textPrimary,
        top: 18,
    },
    playBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedBtn: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    speedText: {
        fontFamily: typography.heading,
        fontSize: 13,
        color: colors.textSecondary,
    },
});

// ── Main Screen ─────────────────────────────────────────────────────

export function PodcastsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
    const [playerVisible, setPlayerVisible] = useState(false);

    const openPlayer = (ep: PodcastEpisode) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedEpisode(ep);
        setPlayerVisible(true);
    };

    const closePlayer = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPlayerVisible(false);
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Pressable
                    hitSlop={12}
                    style={styles.headerBtn}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                >
                    <Feather name="chevron-left" size={26} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Podcasts</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ── Episode List ── */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 24 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {EPISODES.map((ep, idx) => (
                    <View key={ep.id}>
                        {idx > 0 && <View style={styles.separator} />}
                        <Pressable
                            style={({ pressed }) => [
                                styles.episodeRow,
                                pressed && styles.episodeRowPressed,
                            ]}
                            onPress={() => openPlayer(ep)}
                        >
                            {/* Artwork */}
                            <Image source={{ uri: ep.artwork }} style={styles.episodeArt} />

                            {/* Info */}
                            <View style={styles.episodeInfo}>
                                <Text style={styles.episodeTitle} numberOfLines={2}>
                                    {ep.title}
                                </Text>
                                <Text style={styles.episodeDesc} numberOfLines={1}>
                                    {ep.description}
                                </Text>
                                <Text style={styles.episodeDur}>{ep.duration}</Text>
                            </View>

                            {/* Listen button */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.listenBtn,
                                    pressed && { opacity: 0.85 },
                                ]}
                                onPress={() => openPlayer(ep)}
                            >
                                <Feather
                                    name="play"
                                    size={14}
                                    color="#FFFFFF"
                                    style={{ marginLeft: 2 }}
                                />
                            </Pressable>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>

            {/* ── Player ── */}
            <PodcastPlayer
                episode={selectedEpisode}
                visible={playerVisible}
                onClose={closePlayer}
            />
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    headerBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 17,
        color: colors.textPrimary,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },

    episodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 14,
    },
    episodeRowPressed: {
        opacity: 0.75,
    },
    episodeArt: {
        width: 72,
        height: 72,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
    },
    episodeInfo: {
        flex: 1,
        gap: 3,
    },
    episodeTitle: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
        lineHeight: 20,
    },
    episodeDesc: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 17,
    },
    episodeDur: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },

    listenBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
});
