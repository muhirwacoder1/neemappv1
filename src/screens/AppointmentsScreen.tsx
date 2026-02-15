import { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Image,
  TextInput, Dimensions, FlatList,
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
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Doctor Data ─────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviews: number;
  patients: string;
  experience: string;
  price: string;
  about: string;
  available: boolean;
}

const SPECIALTIES = ['All', 'Cardiology', 'Dermatology', 'Endocrinology', 'Psychiatry', 'Nutrition'];

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Ali Khan',
    specialty: 'Cardiology',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    rating: 4.9,
    reviews: 190,
    patients: '1200+',
    experience: '10 Years',
    price: '$100',
    about:
      'Dr. Ali Khan is an experienced cardiologist specializing in heart health, cardiovascular disease prevention, and treatment. He helps patients achieve optimal heart function through evidence-based approaches.',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Sarah Lin',
    specialty: 'Endocrinology',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    rating: 4.8,
    reviews: 215,
    patients: '1500+',
    experience: '12 Years',
    price: '$120',
    about:
      'Dr. Sarah Lin is a board-certified endocrinologist with expertise in diabetes management, thyroid disorders, and hormonal imbalances. She takes a personalized approach to each patient.',
    available: true,
  },
  {
    id: '3',
    name: 'Dr. Tareq Mahmud',
    specialty: 'Psychiatry',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80',
    rating: 4.9,
    reviews: 178,
    patients: '900+',
    experience: '8 Years',
    price: '$110',
    about:
      'Dr. Tareq Mahmud is an experienced psychiatrist specializing in mental health, stress management, and therapy. He helps patients achieve emotional well-being through compassionate care.',
    available: true,
  },
  {
    id: '4',
    name: 'Dr. Emily Chen',
    specialty: 'Dermatology',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964d8ba?auto=format&fit=crop&w=300&q=80',
    rating: 4.7,
    reviews: 142,
    patients: '800+',
    experience: '7 Years',
    price: '$90',
    about:
      'Dr. Emily Chen specializes in dermatological conditions affecting diabetic patients, including skin infections, wound care, and preventive skin health. She uses the latest treatment protocols.',
    available: false,
  },
  {
    id: '5',
    name: 'Dr. Michael Ross',
    specialty: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    rating: 4.8,
    reviews: 205,
    patients: '1100+',
    experience: '9 Years',
    price: '$85',
    about:
      'Dr. Michael Ross is a nutrition specialist focused on dietary management for chronic conditions. He designs personalized meal plans for diabetic patients.',
    available: true,
  },
  {
    id: '6',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiology',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=300&q=80',
    rating: 4.6,
    reviews: 167,
    patients: '700+',
    experience: '6 Years',
    price: '$95',
    about:
      'Dr. Priya Sharma is a cardiologist dedicated to preventive heart care. She works with diabetic patients to manage cardiovascular risk factors.',
    available: true,
  },
];

// ── Upcoming Appointment Data ───────────────────────────────────────

const UPCOMING = {
  doctor: DOCTORS[0],
  date: '18 Nov, Monday',
  time: '6pm - 8:30 pm',
};

// ── Main Screen ─────────────────────────────────────────────────────

export function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');

  const filteredDoctors = DOCTORS.filter(d => {
    const matchSearch =
      searchQuery.trim() === '' ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpec = activeSpecialty === 'All' || d.specialty === activeSpecialty;
    return matchSearch && matchSpec;
  });

  const handleDoctorPress = (doctor: Doctor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('DoctorDetail', { doctorId: doctor.id });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Search Bar ── */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a doctor, medicine, etc..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <Pressable
            style={styles.micBtn}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="mic" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* ── Upcoming Appointment Card ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        <LinearGradient
          colors={['#4A90D9', '#1E6AE1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.upcomingCard}
        >
          <View style={styles.upcomingTop}>
            <View style={styles.upcomingDoctorInfo}>
              <Image
                source={{ uri: UPCOMING.doctor.image }}
                style={styles.upcomingAvatar}
              />
              <View>
                <Text style={styles.upcomingName}>{UPCOMING.doctor.name}</Text>
                <Text style={styles.upcomingSpecialty}>{UPCOMING.doctor.specialty}</Text>
              </View>
            </View>
            <Pressable style={styles.videocamBtn}>
              <Feather name="video" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.upcomingMeta}>
            <View style={styles.upcomingMetaItem}>
              <Feather name="calendar" size={14} color="rgba(255,255,255,0.7)" />
              <View>
                <Text style={styles.upcomingMetaLabel}>Date</Text>
                <Text style={styles.upcomingMetaValue}>{UPCOMING.date}</Text>
              </View>
            </View>
            <View style={styles.upcomingMetaItem}>
              <Feather name="clock" size={14} color="rgba(255,255,255,0.7)" />
              <View>
                <Text style={styles.upcomingMetaLabel}>Time</Text>
                <Text style={styles.upcomingMetaValue}>{UPCOMING.time}</Text>
              </View>
            </View>
          </View>

          <View style={styles.upcomingActions}>
            <Pressable
              style={({ pressed }) => [
                styles.rescheduleBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.rescheduleBtnText}>Re-Schedule</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.viewProfileBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => handleDoctorPress(UPCOMING.doctor)}
            >
              <Text style={styles.viewProfileBtnText}>View Profile</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* ── Popular Doctors ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Doctors</Text>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {/* Specialty Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtyRow}
          style={{ marginBottom: 16 }}
        >
          {SPECIALTIES.map(spec => (
            <Pressable
              key={spec}
              style={[
                styles.specChip,
                activeSpecialty === spec && styles.specChipActive,
              ]}
              onPress={() => {
                setActiveSpecialty(spec);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.specChipText,
                  activeSpecialty === spec && styles.specChipTextActive,
                ]}
              >
                {spec}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Doctor Cards */}
        {filteredDoctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="user-x" size={44} color={colors.border} />
            <Text style={styles.emptyText}>No doctors found</Text>
          </View>
        ) : (
          filteredDoctors.map(doctor => (
            <Pressable
              key={doctor.id}
              style={({ pressed }) => [
                styles.doctorCard,
                pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
              ]}
              onPress={() => handleDoctorPress(doctor)}
            >
              <Image source={{ uri: doctor.image }} style={styles.doctorAvatar} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={styles.doctorRating}>
                  <Feather name="star" size={13} color="#F5A623" />
                  <Text style={styles.ratingText}>{doctor.rating}</Text>
                  <Text style={styles.reviewsText}>{doctor.reviews} Reviews</Text>
                </View>
              </View>
              <Pressable
                style={styles.favBtn}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Feather name="heart" size={18} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 22,
    ...shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  viewAll: {
    fontFamily: typography.subheading,
    fontSize: 13,
    color: colors.primary,
  },

  // Upcoming card
  upcomingCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 26,
  },
  upcomingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  upcomingDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: colors.surfaceAlt,
  },
  upcomingName: {
    fontFamily: typography.heading,
    fontSize: 17,
    color: '#FFFFFF',
  },
  upcomingSpecialty: {
    fontFamily: typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  videocamBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  upcomingMeta: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 18,
  },
  upcomingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upcomingMetaLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  upcomingMetaValue: {
    fontFamily: typography.subheading,
    fontSize: 13,
    color: '#FFFFFF',
  },

  upcomingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rescheduleBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  rescheduleBtnText: {
    fontFamily: typography.subheading,
    fontSize: 13,
    color: '#FFFFFF',
  },
  viewProfileBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  viewProfileBtnText: {
    fontFamily: typography.subheading,
    fontSize: 13,
    color: colors.primary,
  },

  // Specialty tabs
  specialtyRow: {
    gap: 8,
    paddingRight: 4,
  },
  specChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specChipText: {
    fontFamily: typography.subheading,
    fontSize: 13,
    color: colors.textSecondary,
  },
  specChipTextActive: {
    color: '#FFFFFF',
  },

  // Doctor cards
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 14,
    ...shadows.soft,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  doctorInfo: {
    flex: 1,
    gap: 3,
  },
  doctorName: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  doctorSpecialty: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontFamily: typography.subheading,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewsText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  favBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 10,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textMuted,
  },
});
