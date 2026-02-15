import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { PrimaryButton } from '../components/PrimaryButton';
import { PressableScale } from '../components/PressableScale';

const { width } = Dimensions.get('window');

type Slide = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
};

const slides: Slide[] = [
  {
    id: '1',
    title: 'Track Your Glucose',
    description: 'Log readings quickly and spot trends in seconds.',
    icon: 'activity',
  },
  {
    id: '2',
    title: 'Personalized Insights',
    description: 'Get tailored recommendations powered by your data.',
    icon: 'bar-chart-2',
  },
  {
    id: '3',
    title: 'Care Beyond Clinics',
    description: 'Stay connected with your care team anywhere.',
    icon: 'heart',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      return;
    }

    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustration}>
              <Feather name={item.icon} size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <PressableScale onPress={() => navigation.replace('Auth')} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </PressableScale>

        <View style={styles.dots}>
          {slides.map((_, dotIndex) => (
            <View
              key={String(dotIndex)}
              style={[styles.dot, dotIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <PrimaryButton label={index === slides.length - 1 ? 'Get Started' : 'Next'} onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  illustration: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontFamily: typography.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  skipText: {
    fontFamily: typography.subheading,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 22,
  },
});
