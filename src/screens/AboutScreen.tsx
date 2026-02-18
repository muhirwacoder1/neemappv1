import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Linking,
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
import { PressableScale } from '../components/PressableScale';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AboutScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    const legalItems = [
        {
            id: 'terms',
            label: 'Terms & Conditions',
            icon: 'file-text' as const,
            color: colors.primary,
            bgColor: '#E8F0FD',
        },
        {
            id: 'privacy',
            label: 'Privacy Policy',
            icon: 'shield' as const,
            color: colors.success,
            bgColor: '#E9F7EF',
        },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient
                colors={['#1E6AE1', '#1756B8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <PressableScale
                        style={styles.backButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.goBack();
                        }}
                    >
                        <Feather name="arrow-left" size={22} color="#FFFFFF" />
                    </PressableScale>
                    <Text style={styles.headerTitle}>About MyDiabetes</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* App Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.appIconBox}>
                        <LinearGradient
                            colors={['#1E6AE1', '#1756B8']}
                            style={styles.appIcon}
                        >
                            <Feather name="heart" size={28} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.appName}>MyDiabetes</Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
                    <Text style={styles.appTagline}>
                        Your personal diabetes care companion
                    </Text>
                </View>

                {/* Legal Section */}
                <Text style={styles.sectionLabel}>LEGAL</Text>
                <View style={styles.card}>
                    {legalItems.map((item, index) => (
                        <View key={item.id}>
                            {index > 0 && <View style={styles.divider} />}
                            <PressableScale style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.rowIcon, { backgroundColor: item.bgColor }]}>
                                        <Feather name={item.icon} size={16} color={item.color} />
                                    </View>
                                    <Text style={styles.rowLabel}>{item.label}</Text>
                                </View>
                                <Feather name="chevron-right" size={18} color={colors.textMuted} />
                            </PressableScale>
                        </View>
                    ))}
                </View>

                {/* Credits */}
                <View style={styles.creditsCard}>
                    <Feather name="code" size={18} color={colors.textMuted} style={{ marginBottom: 8 }} />
                    <Text style={styles.creditsText}>
                        Made with care for people living with diabetes
                    </Text>
                    <Text style={styles.copyrightText}>
                        © 2026 NeemCare. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerGradient: {
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    // ─── App Info ──────────────────────────
    infoCard: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 20,
        marginBottom: 24,
        ...shadows.soft,
    },
    appIconBox: {
        marginBottom: 14,
    },
    appIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    appVersion: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 10,
    },
    appTagline: {
        fontFamily: typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // ─── Legal ─────────────────────────────
    sectionLabel: {
        fontFamily: typography.heading,
        fontSize: 11,
        color: colors.textMuted,
        letterSpacing: 1,
        marginBottom: 10,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        marginBottom: 24,
        ...shadows.soft,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    // ─── Credits ───────────────────────────
    creditsCard: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    creditsText: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 6,
    },
    copyrightText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },
});
