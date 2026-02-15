import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 18,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1400);

    return () => clearTimeout(timeout);
  }, [navigation, opacity, scale]);

  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logo}>
          <Feather name="activity" size={32} color={colors.surface} />
        </View>
        <Text style={styles.title}>Neem Diabetes Care</Text>
        <Text style={styles.subtitle}>Smarter Diabetes Care</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: typography.sizes.xl,
    color: colors.surface,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.8)',
  },
});
