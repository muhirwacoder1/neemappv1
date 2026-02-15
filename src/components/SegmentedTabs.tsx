import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface SegmentedTabsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedTabs({ options, value, onChange }: SegmentedTabsProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option === value;
        return (
          <PressableScale
            key={option}
            onPress={() => onChange(option)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>{option}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.surface,
  },
  label: {
    fontFamily: typography.subheading,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  activeLabel: {
    color: colors.textPrimary,
  },
});
