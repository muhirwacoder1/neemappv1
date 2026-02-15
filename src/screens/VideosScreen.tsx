import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../components/PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 52) / 2; // 2-column grid

// ── Types ──────────────────────────────────────────────────────
type VideoItem = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  thumbnail: string;
  accent: string;
};

type StackParamList = {
  VideoList: undefined;
  VideoPlayer: { videoId: string };
};

type ListProps = NativeStackScreenProps<StackParamList, 'VideoList'>;
type PlayerProps = NativeStackScreenProps<StackParamList, 'VideoPlayer'>;

// ── Data ───────────────────────────────────────────────────────
const categories = ['All', 'General', 'Nutrition', 'Sports', 'Wellness'];

const VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: 'Managing Blood Sugar During Cardio',
    subtitle: 'Science-backed strategies',
    category: 'General',
    duration: '12 min',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    accent: '#1E6AE1',
  },
  {
    id: '2',
    title: 'Meal Prep Masterclass',
    subtitle: 'Healthy weekly plans',
    category: 'Nutrition',
    duration: '18 min',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    accent: '#10B981',
  },
  {
    id: '3',
    title: 'Low-Impact Exercises',
    subtitle: 'No equipment needed',
    category: 'Sports',
    duration: '15 min',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
    accent: '#8B5CF6',
  },
  {
    id: '4',
    title: 'Understanding Glycemic Index',
    subtitle: 'What every patient needs',
    category: 'General',
    duration: '10 min',
    thumbnail: 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?auto=format&fit=crop&w=600&q=80',
    accent: '#F59E0B',
  },
  {
    id: '5',
    title: 'Morning Yoga Routine',
    subtitle: 'Start your day calm',
    category: 'Wellness',
    duration: '7 min',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    accent: '#EC4899',
  },
  {
    id: '6',
    title: 'Clean Eating Guide',
    subtitle: 'Transform your diet',
    category: 'Nutrition',
    duration: '22 min',
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    accent: '#10B981',
  },
  {
    id: '7',
    title: 'Strength Training Basics',
    subtitle: 'Build muscle safely',
    category: 'Sports',
    duration: '20 min',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    accent: '#EF4444',
  },
  {
    id: '8',
    title: 'Carb Counting 101',
    subtitle: 'Essential basics',
    category: 'Nutrition',
    duration: '8 min',
    thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    accent: '#10B981',
  },
  {
    id: '9',
    title: 'How Insulin Works',
    subtitle: 'Your body explained',
    category: 'General',
    duration: '9 min',
    thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    accent: '#1E6AE1',
  },
];

const Stack = createNativeStackNavigator<StackParamList>();

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════
export function VideosScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="VideoList" component={VideoListScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
    </Stack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. VIDEO LIST SCREEN
// ═══════════════════════════════════════════════════════════════
function VideoListScreen({ navigation }: ListProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? VIDEOS : VIDEOS.filter((v) => v.category === activeTab);

  return (
    <View style={ls.root}>
      <ScrollView
        contentContainerStyle={[ls.content, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={ls.title}>Videos</Text>
        <Text style={ls.subtitle}>Explore health & wellness content</Text>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ls.tabsRow}
        >
          {categories.map((cat) => {
            const isActive = cat === activeTab;
            return (
              <PressableScale
                key={cat}
                style={[ls.tab, isActive && ls.tabActive]}
                onPress={() => setActiveTab(cat)}
              >
                <Text style={[ls.tabLabel, isActive && ls.tabLabelActive]}>{cat}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Featured (first video) */}
        {filtered.length > 0 && (
          <PressableScale
            style={ls.featuredCard}
            onPress={() => navigation.navigate('VideoPlayer', { videoId: filtered[0].id })}
          >
            <Image source={{ uri: filtered[0].thumbnail }} style={ls.featuredImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={ls.featuredGradient}
            />
            {/* Play */}
            <View style={ls.featuredPlayWrap}>
              <BlurView intensity={30} tint="light" style={ls.featuredPlayBtn}>
                <Feather name="play" size={26} color="#FFF" style={{ marginLeft: 2 }} />
              </BlurView>
            </View>
            {/* Badge */}
            <View style={[ls.featuredBadge, { backgroundColor: filtered[0].accent }]}>
              <Text style={ls.featuredBadgeText}>{filtered[0].category}</Text>
            </View>
            {/* Info */}
            <View style={ls.featuredInfo}>
              <Text style={ls.featuredTitle}>{filtered[0].title}</Text>
              <View style={ls.featuredMeta}>
                <Feather name="clock" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={ls.featuredDuration}>{filtered[0].duration}</Text>
              </View>
            </View>
          </PressableScale>
        )}

        {/* Grid */}
        <View style={ls.grid}>
          {filtered.slice(1).map((video) => (
            <PressableScale
              key={video.id}
              style={ls.card}
              onPress={() => navigation.navigate('VideoPlayer', { videoId: video.id })}
            >
              <View style={ls.cardThumbWrap}>
                <Image source={{ uri: video.thumbnail }} style={ls.cardThumb} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.45)']}
                  style={ls.cardGradient}
                />
                {/* Play */}
                <View style={ls.cardPlayBtn}>
                  <Feather name="play" size={18} color="#FFF" style={{ marginLeft: 1 }} />
                </View>
                {/* Duration */}
                <View style={ls.cardDuration}>
                  <Text style={ls.cardDurationText}>{video.duration}</Text>
                </View>
                {/* Category dot */}
                <View style={[ls.cardCategoryDot, { backgroundColor: video.accent }]} />
              </View>
              <View style={ls.cardBody}>
                <Text style={ls.cardTitle} numberOfLines={2}>{video.title}</Text>
                <Text style={ls.cardSub} numberOfLines={1}>{video.subtitle}</Text>
              </View>
            </PressableScale>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. VIDEO PLAYER SCREEN (tap into from card)
// ═══════════════════════════════════════════════════════════════
function VideoPlayerScreen({ route, navigation }: PlayerProps) {
  const video = VIDEOS.find((v) => v.id === route.params.videoId) ?? VIDEOS[0];
  const insets = useSafeAreaInsets();

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Animations
  const playOpacity = useRef(new Animated.Value(1)).current;
  const playScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const saveScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressRef = useRef<Animated.CompositeAnimation | null>(null);
  const lastTap = useRef(0);

  const handlePlay = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!playing) {
      setPlaying(true);
      Animated.parallel([
        Animated.timing(playOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.spring(playScale, { toValue: 0.6, useNativeDriver: true }),
      ]).start(() => playScale.setValue(1));
      progressAnim.setValue(0);
      progressRef.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: false,
      });
      progressRef.current.start();
    } else {
      setPlaying(false);
      Animated.timing(playOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      if (progressRef.current) progressRef.current.stop();
    }
  };

  const handleScreenTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      triggerLike();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current !== 0 && playing) handlePlay();
      }, 320);
    }
  };

  const triggerLike = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLiked(true);
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.2, useNativeDriver: true, speed: 20, bounciness: 12 }),
      Animated.timing(heartOpacity, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start(() => heartScale.setValue(0));
  };

  const handleLike = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((prev) => !prev);
    if (!liked) triggerLike();
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved((prev) => !prev);
    Animated.sequence([
      Animated.spring(saveScale, { toValue: 1.3, useNativeDriver: true, speed: 30 }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={ps.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* ── Video Area ──────────────────────── */}
        <PressableScale onPress={handleScreenTap} style={ps.videoArea}>
          <Image source={{ uri: video.thumbnail }} style={ps.videoImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent', 'rgba(0,0,0,0.5)']}
            locations={[0, 0.2, 0.6, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Back Button */}
          <PressableScale
            onPress={() => navigation.goBack()}
            style={[ps.backBtn, { top: insets.top + 8 }]}
          >
            <BlurView intensity={25} tint="dark" style={ps.backBtnInner}>
              <Feather name="arrow-left" size={20} color="#FFF" />
            </BlurView>
          </PressableScale>

          {/* Category Badge */}
          <View style={[ps.badge, { top: insets.top + 8, backgroundColor: video.accent }]}>
            <Text style={ps.badgeText}>{video.category}</Text>
          </View>

          {/* Center Play */}
          <Animated.View
            style={[ps.playCenter, { opacity: playOpacity, transform: [{ scale: playScale }] }]}
            pointerEvents={playing ? 'none' : 'auto'}
          >
            <PressableScale onPress={handlePlay} style={ps.playGlassOuter}>
              <BlurView intensity={35} tint="light" style={ps.playGlassInner}>
                <Feather name="play" size={32} color="#FFF" style={{ marginLeft: 3 }} />
              </BlurView>
              <View style={ps.playGlow} />
            </PressableScale>
          </Animated.View>

          {/* Heart Burst */}
          <Animated.View
            style={[ps.heartBurst, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}
            pointerEvents="none"
          >
            <Text style={ps.heartBurstText}>♥</Text>
          </Animated.View>

          {/* Progress Bar */}
          {playing && (
            <View style={ps.progressBar}>
              <Animated.View style={[ps.progressFill, { width: progressWidth, backgroundColor: video.accent }]} />
            </View>
          )}

          {/* Duration */}
          <View style={ps.durationBadge}>
            <Text style={ps.durationText}>{video.duration}</Text>
          </View>
        </PressableScale>

        {/* ── Info Section ────────────────────── */}
        <View style={ps.infoSection}>
          <Text style={ps.videoTitle}>{video.title}</Text>
          <Text style={ps.videoSubtitle}>{video.subtitle}</Text>

          {/* Action Row */}
          <View style={ps.actionRow}>
            <PressableScale style={ps.actionBtn} onPress={handleLike}>
              {liked ? (
                <Text style={{ fontSize: 20, color: '#FF4D6A' }}>♥</Text>
              ) : (
                <Feather name="heart" size={20} color={colors.textSecondary} />
              )}
              <Text style={[ps.actionLabel, liked && { color: '#FF4D6A' }]}>Like</Text>
            </PressableScale>

            <PressableScale style={ps.actionBtn}>
              <Feather name="message-circle" size={20} color={colors.textSecondary} />
              <Text style={ps.actionLabel}>Comment</Text>
            </PressableScale>

            <PressableScale style={ps.actionBtn}>
              <Feather name="share-2" size={20} color={colors.textSecondary} />
              <Text style={ps.actionLabel}>Share</Text>
            </PressableScale>

            <Animated.View style={{ transform: [{ scale: saveScale }] }}>
              <PressableScale style={ps.actionBtn} onPress={handleSave}>
                <Feather
                  name="bookmark"
                  size={20}
                  color={saved ? '#FDB913' : colors.textSecondary}
                />
                <Text style={[ps.actionLabel, saved && { color: '#FDB913' }]}>Save</Text>
              </PressableScale>
            </Animated.View>
          </View>
        </View>

        {/* ── Description ─────────────────────── */}
        <View style={ps.descSection}>
          <Text style={ps.descTitle}>About this video</Text>
          <Text style={ps.descText}>
            This video covers essential strategies and techniques for managing your health.
            Follow along with expert guidance and practical tips you can apply in your daily routine.
          </Text>
        </View>

        {/* ── Related Videos ──────────────────── */}
        <View style={ps.relatedSection}>
          <Text style={ps.relatedTitle}>Related Videos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ps.relatedRow}>
            {VIDEOS.filter((v) => v.id !== video.id && v.category === video.category)
              .slice(0, 4)
              .map((v) => (
                <PressableScale
                  key={v.id}
                  style={ps.relatedCard}
                  onPress={() => navigation.push('VideoPlayer', { videoId: v.id })}
                >
                  <View style={ps.relatedThumbWrap}>
                    <Image source={{ uri: v.thumbnail }} style={ps.relatedThumb} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.4)']}
                      style={ps.relatedGradient}
                    />
                    <View style={ps.relatedPlay}>
                      <Feather name="play" size={14} color="#FFF" style={{ marginLeft: 1 }} />
                    </View>
                  </View>
                  <Text style={ps.relatedCardTitle} numberOfLines={2}>{v.title}</Text>
                  <Text style={ps.relatedCardMeta}>{v.duration}</Text>
                </PressableScale>
              ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES – LIST SCREEN
// ═══════════════════════════════════════════════════════════════
const ls = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 28,
    color: colors.textPrimary,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 18,
  },

  // Tabs
  tabsRow: { paddingHorizontal: 20, gap: 8, marginBottom: 22 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabLabel: { fontFamily: typography.subheading, fontSize: 14, color: colors.textSecondary },
  tabLabelActive: { color: '#FFF' },

  // Featured Card
  featuredCard: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 22,
    ...shadows.card,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredPlayWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontFamily: typography.subheading,
    fontSize: 11,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  featuredTitle: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredDuration: {
    fontFamily: typography.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },

  // Grid Cards
  grid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: CARD_W,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.soft,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardThumbWrap: {
    width: '100%',
    height: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  cardThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardPlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDuration: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  cardDurationText: {
    fontFamily: typography.subheading,
    fontSize: 10,
    color: '#FFF',
  },
  cardCategoryDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardBody: {
    padding: 12,
    gap: 3,
  },
  cardTitle: {
    fontFamily: typography.heading,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  cardSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
});

// ═══════════════════════════════════════════════════════════════
// STYLES – PLAYER SCREEN
// ═══════════════════════════════════════════════════════════════
const ps = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Video Area
  videoArea: {
    width: SCREEN_W,
    height: SCREEN_W * 0.65,
    position: 'relative',
    backgroundColor: '#111',
  },
  videoImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badge: {
    position: 'absolute',
    right: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    fontFamily: typography.subheading,
    fontSize: 11,
    color: '#FFF',
    letterSpacing: 0.5,
  },

  // Play
  playCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  playGlassOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  playGlassInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 42,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Heart burst
  heartBurst: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  heartBurstText: {
    fontSize: 80,
    color: '#FF4D6A',
    textShadowColor: 'rgba(255,77,106,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },

  // Progress
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  progressFill: { height: '100%' },

  // Duration
  durationBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 10,
  },
  durationText: {
    fontFamily: typography.subheading,
    fontSize: 11,
    color: '#FFF',
  },

  // Info
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  videoTitle: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: 4,
  },
  videoSubtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Description
  descSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  descTitle: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Related
  relatedSection: {
    paddingTop: 24,
  },
  relatedTitle: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  relatedRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  relatedCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    ...shadows.soft,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  relatedThumbWrap: {
    width: '100%',
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  relatedThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  relatedGradient: { ...StyleSheet.absoluteFillObject },
  relatedPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -14,
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedCardTitle: {
    fontFamily: typography.heading,
    fontSize: 12,
    color: colors.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 8,
    lineHeight: 16,
  },
  relatedCardMeta: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.textSecondary,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
  },
});
