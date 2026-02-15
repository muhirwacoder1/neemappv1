import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { SegmentedTabs } from './SegmentedTabs';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { blogPosts, contentVideos, podcasts } from '../data/mock';
import { shadows } from '../theme/shadows';

interface ContentModalProps {
  visible: boolean;
  onClose: () => void;
}

const tabs = ['Videos', 'Blogs', 'Podcasts'];

export function ContentModal({ visible, onClose }: ContentModalProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const content = useMemo(() => {
    if (activeTab === 'Videos') {
      return contentVideos.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.category} • ${item.duration}`,
      }));
    }

    if (activeTab === 'Podcasts') {
      return podcasts.map((item) => ({
        id: item.id,
        title: item.title,
        meta: item.meta,
      }));
    }

    return blogPosts.map((item) => ({
      id: item.id,
      title: item.title,
      meta: item.meta,
    }));
  }, [activeTab]);

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <BlurView intensity={60} tint="light" style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Content</Text>
            <PressableScale onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </PressableScale>
          </View>

          <SegmentedTabs options={tabs} value={activeTab} onChange={setActiveTab} />

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {content.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.iconBubble}>
                  <Feather name="play" size={16} color={colors.primary} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>{item.meta}</Text>
                </View>
                <PressableScale style={styles.addButton}>
                  <Feather name="plus" size={18} color={colors.surface} />
                </PressableScale>
              </View>
            ))}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    gap: spacing.sm,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: typography.subheading,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  cardMeta: {
    fontFamily: typography.caption,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
