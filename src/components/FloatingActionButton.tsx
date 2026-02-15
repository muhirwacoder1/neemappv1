import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { Feather } from '@expo/vector-icons';

interface FloatingActionButtonProps {
  onPress: () => void;
  isActive?: boolean;
}

export function FloatingActionButton({ onPress, isActive }: FloatingActionButtonProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rotation, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [isActive, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      <PressableScale onPress={onPress} style={styles.button}>
        <Animated.View style={[styles.iconWrap, { transform: [{ rotate }] }]}>
          <Feather name="plus" size={28} color="#FFFFFF" />
        </Animated.View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 45,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
