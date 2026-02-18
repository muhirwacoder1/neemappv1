import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../navigation/types';
import { typography } from '../theme/typography';
import { PressableScale } from '../components/PressableScale';

// ── Colors ─────────────────────────────────────────────────────
const C = {
    bg: '#F7F8FC',
    white: '#FFFFFF',
    black: '#1B1B1B',
    gray: '#6B7280',
    blue: '#1E6AE1',
    border: '#E5E7EB',
    inputBg: '#F9FAFB',
    placeholder: '#9CA3AF',
    google: '#4285F4',
    apple: '#000000',
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        // TODO: integrate real auth
        navigation.replace('Main');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Close button */}
            <View style={styles.topBar}>
                <View style={{ width: 40 }} />
                <View style={{ flex: 1 }} />
                <PressableScale style={styles.closeBtn} onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color={C.black} />
                </PressableScale>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <Text style={styles.title}>Welcome back!</Text>
                    <Text style={styles.subtitle}>
                        Please log in using the method you registered with.
                    </Text>

                    {/* Email Field */}
                    <Text style={styles.label}>Your email</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter email"
                            placeholderTextColor={C.placeholder}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                        />
                    </View>

                    {/* Password Field */}
                    <Text style={styles.label}>Your password</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter password"
                            placeholderTextColor={C.placeholder}
                            secureTextEntry={!showPassword}
                            style={[styles.input, { flex: 1 }]}
                        />
                        <PressableScale onPress={() => setShowPassword(!showPassword)}>
                            <Text style={styles.showToggle}>{showPassword ? 'Hide' : 'Show'}</Text>
                        </PressableScale>
                    </View>

                    {/* Forgot password */}
                    <PressableScale style={styles.forgotRow}>
                        <Text style={styles.forgotText}>Forgot your password?</Text>
                    </PressableScale>

                    {/* Login Button */}
                    <PressableScale style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Log in</Text>
                    </PressableScale>

                    {/* OR separator */}
                    <View style={styles.orRow}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.orLine} />
                    </View>

                    {/* Social Buttons */}
                    <PressableScale style={styles.socialButton}>
                        <View style={styles.socialIconWrap}>
                            <Text style={{ fontSize: 20 }}>G</Text>
                        </View>
                        <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </PressableScale>

                    <PressableScale style={styles.socialButton}>
                        <View style={styles.socialIconWrap}>
                            <MaterialCommunityIcons name="apple" size={22} color={C.black} />
                        </View>
                        <Text style={styles.socialButtonText}>Continue with Apple</Text>
                    </PressableScale>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 26,
        color: C.black,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: typography.body,
        fontSize: 15,
        color: C.gray,
        lineHeight: 22,
        marginBottom: 28,
    },
    label: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: C.black,
        marginBottom: 8,
        marginTop: 4,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 16,
        paddingVertical: 2,
        marginBottom: 16,
    },
    input: {
        fontFamily: typography.body,
        fontSize: 15,
        color: C.black,
        paddingVertical: 14,
        flex: 1,
    },
    showToggle: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: C.black,
    },
    forgotRow: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        fontFamily: typography.subheading,
        fontSize: 14,
        color: C.blue,
    },
    loginButton: {
        backgroundColor: C.black,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 17,
        marginBottom: 24,
    },
    loginButtonText: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: '#FFFFFF',
    },
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.border,
    },
    orText: {
        fontFamily: typography.subheading,
        fontSize: 13,
        color: C.gray,
        marginHorizontal: 16,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.white,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: C.border,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    socialIconWrap: {
        width: 28,
        alignItems: 'center',
    },
    socialButtonText: {
        fontFamily: typography.subheading,
        fontSize: 15,
        color: C.black,
        flex: 1,
        textAlign: 'center',
    },
});
