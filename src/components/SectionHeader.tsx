import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
  },
});
