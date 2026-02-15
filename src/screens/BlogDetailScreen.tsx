import { StyleSheet, Text, View, ScrollView, Pressable, Image, Share, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { RootStackParamList } from '../navigation/types';
import { BLOG_POSTS, ContentBlock } from './BlogsScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'BlogDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Content Renderer ────────────────────────────────────────────────

function RenderBlock({ block, index }: { block: ContentBlock; index: number }) {
    switch (block.type) {
        case 'heading':
            return <Text style={contentStyles.heading}>{block.text}</Text>;
        case 'subheading':
            return <Text style={contentStyles.subheading}>{block.text}</Text>;
        case 'paragraph':
            return <Text style={contentStyles.paragraph}>{block.text}</Text>;
        case 'bullet':
            return (
                <View style={contentStyles.bulletList}>
                    {block.items.map((item, i) => (
                        <View key={i} style={contentStyles.bulletRow}>
                            <View style={contentStyles.bulletDot} />
                            <Text style={contentStyles.bulletText}>{item}</Text>
                        </View>
                    ))}
                </View>
            );
        case 'quote':
            return (
                <View style={contentStyles.quoteWrap}>
                    <View style={contentStyles.quoteBorder} />
                    <Text style={contentStyles.quoteText}>{block.text}</Text>
                </View>
            );
        case 'highlight':
            return (
                <View style={contentStyles.highlightBox}>
                    <Feather name="info" size={18} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                    <Text style={contentStyles.highlightText}>{block.text}</Text>
                </View>
            );
        default:
            return null;
    }
}

// ── Social Share Buttons ────────────────────────────────────────────

function ShareButton({ icon, label }: { icon: string; label: string }) {
    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            await Share.share({ message: `Check out this article on ${label}!` });
        } catch { }
    };
    return (
        <Pressable
            style={({ pressed }) => [shareStyles.btn, pressed && { opacity: 0.75 }]}
            onPress={handleShare}
        >
            <Text style={shareStyles.icon}>{icon}</Text>
        </Pressable>
    );
}

// ── Main Screen ─────────────────────────────────────────────────────

export function BlogDetailScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<DetailRoute>();
    const post = BLOG_POSTS.find(p => p.id === route.params.postId);

    if (!post) {
        return (
            <View style={[styles.root, { paddingTop: insets.top }]}>
                <Text style={{ padding: 24, fontSize: 16 }}>Article not found.</Text>
            </View>
        );
    }

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
                <Text style={styles.headerTitle}>Blog</Text>
                <Pressable
                    hitSlop={12}
                    style={styles.headerBtn}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.goBack();
                    }}
                >
                    <Feather name="x" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 40 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Breadcrumb */}
                <View style={styles.breadcrumb}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={styles.breadcrumbLink}>Blog</Text>
                    </Pressable>
                    <Feather name="chevron-right" size={14} color={colors.textMuted} style={{ marginHorizontal: 6 }} />
                    <Text style={styles.breadcrumbCategory}>{post.category}</Text>
                </View>

                {/* Article title */}
                <Text style={styles.articleTitle}>{post.title}</Text>

                {/* Meta */}
                <Text style={styles.articleMeta}>
                    {post.readTime}  •  {post.date}
                </Text>

                {/* Separator */}
                <View style={styles.separator} />

                {/* Author */}
                <View style={styles.authorRow}>
                    <View style={styles.authorAvatar}>
                        <Text style={styles.authorAvatarText}>My</Text>
                    </View>
                    <View style={styles.authorInfo}>
                        <Text style={styles.authorLabel}>Written by</Text>
                        <Text style={styles.authorName}>{post.author}</Text>
                        {post.factChecked && (
                            <View style={styles.factRow}>
                                <Feather name="check-circle" size={14} color={colors.success} />
                                <Text style={styles.factText}>Fact checked</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Share */}
                <View style={styles.shareSection}>
                    <Text style={styles.shareLabel}>SHARE ARTICLE</Text>
                    <View style={styles.shareRow}>
                        <ShareButton icon="f" label="Facebook" />
                        <ShareButton icon="𝕏" label="X" />
                        <ShareButton icon="p" label="Pinterest" />
                    </View>
                </View>

                {/* Hero image */}
                <Image source={{ uri: post.image }} style={styles.heroImage} />

                {/* Article content */}
                <View style={styles.contentWrap}>
                    {post.content.map((block, idx) => (
                        <RenderBlock key={idx} block={block} index={idx} />
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footerDivider} />
                <Text style={styles.footerDisclaimer}>
                    This article is for informational purposes only and does not constitute medical advice.
                    Always consult your healthcare provider before making changes to your treatment plan.
                </Text>
            </ScrollView>
        </View>
    );
}

// ── Content Styles ──────────────────────────────────────────────────

const contentStyles = StyleSheet.create({
    heading: {
        fontFamily: typography.heading,
        fontSize: 24,
        color: colors.textPrimary,
        lineHeight: 32,
        marginTop: 28,
        marginBottom: 14,
    },
    subheading: {
        fontFamily: typography.subheading,
        fontSize: 18,
        color: colors.textPrimary,
        lineHeight: 24,
        marginTop: 20,
        marginBottom: 10,
    },
    paragraph: {
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textPrimary,
        lineHeight: 26,
        marginBottom: 16,
    },
    bulletList: {
        marginBottom: 16,
        gap: 10,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 9,
        marginRight: 12,
    },
    bulletText: {
        flex: 1,
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    quoteWrap: {
        flexDirection: 'row',
        marginVertical: 16,
        paddingLeft: 4,
    },
    quoteBorder: {
        width: 3,
        borderRadius: 2,
        backgroundColor: colors.primary,
        marginRight: 14,
    },
    quoteText: {
        flex: 1,
        fontFamily: typography.body,
        fontSize: 15,
        fontStyle: 'italic',
        color: colors.textSecondary,
        lineHeight: 24,
    },
    highlightBox: {
        flexDirection: 'row',
        backgroundColor: colors.primarySoft,
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
    },
    highlightText: {
        flex: 1,
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.primary,
        lineHeight: 22,
    },
});

// ── Share Styles ────────────────────────────────────────────────────

const shareStyles = StyleSheet.create({
    btn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontFamily: typography.heading,
        fontSize: 17,
        color: colors.textPrimary,
    },
});

// ── Main Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.surface },

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
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: typography.heading, fontSize: 17, color: colors.textPrimary },

    scrollContent: {
        paddingHorizontal: 24,
    },

    // Breadcrumb
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        marginBottom: 16,
    },
    breadcrumbLink: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.primary,
    },
    breadcrumbCategory: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: colors.primary,
    },

    // Article header
    articleTitle: {
        fontFamily: typography.heading,
        fontSize: 28,
        color: colors.textPrimary,
        lineHeight: 36,
        marginBottom: 12,
    },
    articleMeta: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 16,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginBottom: 16,
    },

    // Author
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    authorAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    authorAvatarText: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: colors.primary,
    },
    authorInfo: {
        flex: 1,
    },
    authorLabel: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 2,
    },
    authorName: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 3,
    },
    factRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    factText: {
        fontFamily: typography.subheading,
        fontSize: 13,
        color: colors.success,
    },

    // Share
    shareSection: {
        marginBottom: 24,
    },
    shareLabel: {
        fontFamily: typography.subheading,
        fontSize: 11,
        letterSpacing: 1,
        color: colors.textMuted,
        marginBottom: 12,
    },
    shareRow: {
        flexDirection: 'row',
        gap: 12,
    },

    // Hero
    heroImage: {
        width: SCREEN_WIDTH - 48,
        height: 240,
        borderRadius: 16,
        backgroundColor: colors.surfaceAlt,
        marginBottom: 24,
    },

    // Content
    contentWrap: {
        marginBottom: 24,
    },

    // Footer
    footerDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginBottom: 16,
    },
    footerDisclaimer: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 19,
        fontStyle: 'italic',
    },
});
