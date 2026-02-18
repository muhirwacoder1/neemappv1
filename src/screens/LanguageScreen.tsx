import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
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
import { getUserProfile, setUserProfile } from './ProfileScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LanguageOption {
    code: string;
    label: string;
    flag: string;
}

const LANGUAGES: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'it', label: 'Italian', flag: '🇮🇹' },
];

export function LanguageScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const profile = getUserProfile();
    const [selected, setSelected] = useState(profile.language);

    const handleSelect = (lang: LanguageOption) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelected(lang.label);
        const updated = { ...profile, language: lang.label };
        setUserProfile(updated);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
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
                    <Text style={styles.headerTitle}>Language</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSubtitle}>Choose your preferred language</Text>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {LANGUAGES.map((lang) => {
                    const isSelected = selected === lang.label;
                    return (
                        <PressableScale
                            key={lang.code}
                            style={[
                                styles.langCard,
                                isSelected && styles.langCardSelected,
                            ]}
                            onPress={() => handleSelect(lang)}
                        >
                            <Text style={styles.flag}>{lang.flag}</Text>
                            <Text style={[
                                styles.langLabel,
                                isSelected && styles.langLabelSelected,
                            ]}>
                                {lang.label}
                            </Text>

                            {/* Radio */}
                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                {isSelected && <View style={styles.radioDot} />}
                            </View>
                        </PressableScale>
                    );
                })}
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
        paddingBottom: 20,
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
    headerSubtitle: {
        fontFamily: typography.body,
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    langCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 18,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: 'transparent',
        ...shadows.soft,
    },
    langCardSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F5F3FF',
    },
    flag: {
        fontSize: 26,
        marginRight: 14,
    },
    langLabel: {
        flex: 1,
        fontFamily: typography.subheading,
        fontSize: 16,
        color: colors.textPrimary,
    },
    langLabelSelected: {
        fontFamily: typography.heading,
        color: '#7C3AED',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: '#8B5CF6',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#8B5CF6',
    },
});
