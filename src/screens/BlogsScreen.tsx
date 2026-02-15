import { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable, Image,
    TextInput, Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Blog Data ───────────────────────────────────────────────────────

export interface BlogPost {
    id: string;
    title: string;
    category: string;
    readTime: string;
    date: string;
    preview: string;
    image: string;
    author: string;
    authorAvatar?: string;
    factChecked: boolean;
    content: ContentBlock[];
}

export type ContentBlock =
    | { type: 'paragraph'; text: string }
    | { type: 'heading'; text: string }
    | { type: 'subheading'; text: string }
    | { type: 'bullet'; items: string[] }
    | { type: 'quote'; text: string }
    | { type: 'highlight'; text: string };

const CATEGORIES = ['All Categories', 'Diabetes 101', 'Nutrition', 'Lifestyle', 'Mental Health'];

export const BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        title: 'Beyond Semaglutide: Your Guide to a Balanced Diabetes Lifestyle',
        category: 'Diabetes 101',
        readTime: '3 min read',
        date: '2024 Mar 25',
        preview:
            "You've likely heard about semaglutide, a notable advancement in diabetes care. It's akin to discovering a powerful new tool for your health toolkit. Yet, effective...",
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
        author: 'MyDiabetes Team',
        factChecked: true,
        content: [
            {
                type: 'paragraph',
                text: "You've likely heard about semaglutide, a notable advancement in diabetes care. It's akin to discovering a powerful new tool for your health toolkit. Yet, effective diabetes management goes beyond a single treatment with key lifestyle adjustments. Let's explore how semaglutide complements these broader diabetes management strategies.",
            },
            {
                type: 'heading',
                text: 'Semaglutide: Transforming Diabetes Care',
            },
            {
                type: 'paragraph',
                text: "When it comes to managing diabetes, semaglutide is a game-changer for many. This medication acts by mimicking a hormone naturally produced after eating, known as GLP-1, which plays a crucial role in blood sugar regulation. This medication aids in controlling blood sugar levels by prompting the pancreas to release insulin when needed, particularly beneficial after meals. Additionally, it slows gastric emptying, helping you feel satiated longer and supports weight management goals. By also suppressing glucagon production, semaglutide contributes to more stable blood sugar levels throughout the day.",
            },
            {
                type: 'heading',
                text: 'Understanding the Side Effects',
            },
            {
                type: 'paragraph',
                text: "While semaglutide offers significant benefits, it's important to be mindful of potential side effects. Some individuals may experience nausea, diarrhea, or stomach discomfort, especially when starting the medication. These side effects often lessen over time as your body adjusts.",
            },
            {
                type: 'bullet',
                items: [
                    'Start with a lower dose and gradually increase',
                    'Take with food to reduce stomach discomfort',
                    'Stay hydrated throughout the day',
                    'Report persistent side effects to your doctor',
                ],
            },
            {
                type: 'heading',
                text: 'A Holistic Approach to Management',
            },
            {
                type: 'paragraph',
                text: 'Medication alone is rarely the complete answer. A holistic approach that includes balanced nutrition, regular physical activity, stress management, and consistent monitoring creates the strongest foundation for diabetes management.',
            },
            {
                type: 'quote',
                text: 'The best diabetes management plan is one that fits your lifestyle and evolves with your needs.',
            },
        ],
    },
    {
        id: '2',
        title: '10 Low-Glycemic Snacks You Can Enjoy Without the Guilt',
        category: 'Nutrition',
        readTime: '4 min read',
        date: '2024 Apr 10',
        preview:
            'Finding satisfying snacks that keep your blood sugar stable can feel challenging. These dietitian-approved options are as delicious as they are smart...',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
        author: 'MyDiabetes Team',
        factChecked: true,
        content: [
            {
                type: 'paragraph',
                text: 'Finding satisfying snacks that keep your blood sugar stable can feel challenging. The key is choosing foods with a low glycemic index (GI) that release glucose slowly into your bloodstream.',
            },
            {
                type: 'heading',
                text: 'What Makes a Snack Low-Glycemic?',
            },
            {
                type: 'paragraph',
                text: 'Low-glycemic snacks typically contain fiber, protein, or healthy fats that slow digestion and prevent blood sugar spikes. Aim for snacks with a GI score below 55.',
            },
            {
                type: 'heading',
                text: 'Top 10 Snack Ideas',
            },
            {
                type: 'bullet',
                items: [
                    'Greek yogurt with berries and walnuts',
                    'Apple slices with almond butter',
                    'Hummus with vegetable sticks',
                    'Cottage cheese with cherry tomatoes',
                    'Trail mix with nuts and dark chocolate',
                    'Hard-boiled eggs with avocado',
                    'Edamame with sea salt',
                    'Cheese with whole-grain crackers',
                    'Roasted chickpeas',
                    'Chia seed pudding',
                ],
            },
            {
                type: 'highlight',
                text: 'Pro tip: Pair a carbohydrate source with protein or fat to further reduce the glycemic impact of your snack.',
            },
        ],
    },
    {
        id: '3',
        title: 'How Walking 30 Minutes a Day Can Transform Your Blood Sugar',
        category: 'Lifestyle',
        readTime: '5 min read',
        date: '2024 May 02',
        preview:
            "You don't need an expensive gym membership to improve your diabetes management. Simple daily walks can make a profound difference in your blood sugar control...",
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
        author: 'MyDiabetes Team',
        factChecked: true,
        content: [
            {
                type: 'paragraph',
                text: "You don't need an expensive gym membership to improve your diabetes management. Research consistently shows that simple daily walks can make a profound difference in your blood sugar control and overall health.",
            },
            {
                type: 'heading',
                text: 'The Science Behind Walking and Blood Sugar',
            },
            {
                type: 'paragraph',
                text: 'Walking engages large muscle groups that draw glucose from your bloodstream for energy. A 30-minute walk after a meal can lower post-meal blood sugar spikes by up to 30%. Regular walking also improves insulin sensitivity, meaning your body uses insulin more effectively.',
            },
            {
                type: 'heading',
                text: 'Getting Started Safely',
            },
            {
                type: 'bullet',
                items: [
                    'Start with 10 minutes and gradually increase',
                    'Walk after meals for maximum blood sugar benefit',
                    'Wear comfortable, supportive shoes',
                    'Carry your glucose meter and a snack',
                    'Stay hydrated before, during, and after',
                ],
            },
            {
                type: 'quote',
                text: 'A post-meal walk is one of the simplest and most effective strategies for managing blood sugar. — American Diabetes Association',
            },
        ],
    },
    {
        id: '4',
        title: 'Managing Diabetes Burnout: When You Feel Overwhelmed',
        category: 'Mental Health',
        readTime: '6 min read',
        date: '2024 May 18',
        preview:
            "Diabetes burnout is real, and you're not alone. The constant monitoring, carb counting, and medication schedules can feel exhausting over time...",
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        author: 'MyDiabetes Team',
        factChecked: true,
        content: [
            {
                type: 'paragraph',
                text: "Diabetes burnout is real, and you're not alone. The constant monitoring, carb counting, and medication schedules can feel exhausting over time. Recognizing burnout is the first step toward addressing it.",
            },
            {
                type: 'heading',
                text: 'Signs of Diabetes Burnout',
            },
            {
                type: 'bullet',
                items: [
                    'Feeling frustrated or overwhelmed by daily management',
                    'Skipping blood sugar checks or medications',
                    'Not caring about food choices anymore',
                    'Feeling alone in your diabetes journey',
                    'Avoiding healthcare appointments',
                ],
            },
            {
                type: 'heading',
                text: 'Strategies That Help',
            },
            {
                type: 'paragraph',
                text: "It's important to give yourself permission to feel tired. Diabetes management is a marathon, not a sprint. Focus on small, manageable steps rather than perfection.",
            },
            {
                type: 'highlight',
                text: 'Remember: Taking care of your mental health IS taking care of your diabetes. They are deeply connected.',
            },
        ],
    },
    {
        id: '5',
        title: 'Meal Prep Sundays: A Week of Diabetic-Friendly Lunches',
        category: 'Nutrition',
        readTime: '7 min read',
        date: '2024 Jun 05',
        preview:
            'Spend two hours on Sunday preparing five delicious, portion-controlled lunches designed to keep your blood sugar stable throughout the week...',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        author: 'MyDiabetes Team',
        factChecked: true,
        content: [
            {
                type: 'paragraph',
                text: 'Meal prepping is one of the best strategies for maintaining consistent, balanced meals throughout the week. Spending two hours on Sunday can save you from unhealthy grab-and-go choices during busy weekdays.',
            },
            {
                type: 'heading',
                text: 'The Diabetic-Friendly Plate Method',
            },
            {
                type: 'paragraph',
                text: 'Fill half your plate with non-starchy vegetables, one quarter with lean protein, and one quarter with complex carbohydrates. This simple formula works for almost any cuisine.',
            },
            {
                type: 'heading',
                text: 'This Week\'s Menu',
            },
            {
                type: 'bullet',
                items: [
                    'Monday: Grilled chicken salad with quinoa',
                    'Tuesday: Turkey and vegetable stir-fry',
                    'Wednesday: Lentil soup with whole grain bread',
                    'Thursday: Salmon bowl with brown rice',
                    'Friday: Mediterranean wrap with hummus',
                ],
            },
            {
                type: 'quote',
                text: 'Failing to plan is planning to fail. Meal prep removes decision fatigue from your week.',
            },
        ],
    },
];

// ── BlogsScreen Component ───────────────────────────────────────────

export function BlogsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [showCategories, setShowCategories] = useState(false);

    const filteredPosts = BLOG_POSTS.filter(post => {
        const matchSearch =
            searchQuery.trim() === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.preview.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory =
            selectedCategory === 'All Categories' || post.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    const handlePostPress = useCallback(
        (post: BlogPost) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('BlogDetail', { postId: post.id });
        },
        [navigation],
    );

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
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Page title */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Blogs</Text>
                    <Text style={styles.pageSubtitle}>
                        Articles and insights about all things diabetes
                    </Text>
                </View>

                {/* Category dropdown */}
                <Pressable
                    style={styles.categoryDropdown}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowCategories(v => !v);
                    }}
                >
                    <Text style={styles.categoryLabel}>{selectedCategory}</Text>
                    <Feather
                        name={showCategories ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textPrimary}
                    />
                </Pressable>

                {showCategories && (
                    <View style={styles.categoryList}>
                        {CATEGORIES.map(cat => (
                            <Pressable
                                key={cat}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === cat && styles.categoryItemActive,
                                ]}
                                onPress={() => {
                                    setSelectedCategory(cat);
                                    setShowCategories(false);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.categoryItemText,
                                        selectedCategory === cat && styles.categoryItemTextActive,
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Search bar */}
                <View style={styles.searchWrap}>
                    <Feather name="search" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for articles"
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Feather name="x" size={16} color={colors.textMuted} />
                        </Pressable>
                    )}
                </View>

                {/* Blog cards */}
                {filteredPosts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="file-text" size={48} color={colors.border} />
                        <Text style={styles.emptyText}>No articles found</Text>
                    </View>
                ) : (
                    filteredPosts.map((post, idx) => (
                        <View key={post.id}>
                            {/* Category header - shown once per category group */}
                            {(idx === 0 || filteredPosts[idx - 1].category !== post.category) && (
                                <Text style={styles.categoryGroupTitle}>{post.category}</Text>
                            )}

                            <Pressable
                                style={({ pressed }) => [
                                    styles.blogCard,
                                    pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
                                ]}
                                onPress={() => handlePostPress(post)}
                            >
                                <Image source={{ uri: post.image }} style={styles.blogImage} />
                                <View style={styles.blogCardBody}>
                                    <Text style={styles.blogTitle}>{post.title}</Text>
                                    <Text style={styles.blogMeta}>
                                        {post.readTime}  •  {post.date}
                                    </Text>
                                    <Text style={styles.blogPreview} numberOfLines={3}>
                                        {post.preview}
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },

    // Header
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
        paddingHorizontal: 20,
    },

    // Page header
    pageHeader: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 20,
    },
    pageTitle: {
        fontFamily: typography.heading,
        fontSize: 28,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    pageSubtitle: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
    },

    // Category dropdown
    categoryDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        marginBottom: 4,
    },
    categoryLabel: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    categoryList: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 12,
        ...shadows.soft,
    },
    categoryItem: {
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    categoryItemActive: {
        backgroundColor: colors.primarySoft,
    },
    categoryItemText: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textPrimary,
    },
    categoryItemTextActive: {
        fontFamily: typography.subheading,
        color: colors.primary,
    },

    // Search
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 12,
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textPrimary,
        padding: 0,
    },

    // Category group title
    categoryGroupTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.textPrimary,
        marginBottom: 14,
        marginTop: 8,
    },

    // Blog card
    blogCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        ...shadows.soft,
    },
    blogImage: {
        width: '100%',
        height: 200,
        backgroundColor: colors.surfaceAlt,
    },
    blogCardBody: {
        padding: 16,
    },
    blogTitle: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.textPrimary,
        lineHeight: 26,
        marginBottom: 6,
    },
    blogMeta: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 10,
    },
    blogPreview: {
        fontFamily: typography.body,
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontFamily: typography.body,
        fontSize: 16,
        color: colors.textMuted,
    },
});
