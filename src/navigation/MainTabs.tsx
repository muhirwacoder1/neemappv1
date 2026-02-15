import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { VideosScreen } from '../screens/VideosScreen';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { QuickActionsModal } from '../components/QuickActionsModal';
import HomeIcon from '../../assets/icons/home.svg';
import AppointmentIcon from '../../assets/icons/appointment.svg';
import ShopIcon from '../../assets/icons/shop.svg';
import VideosIcon from '../../assets/icons/videos.svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab labels matching the design
const tabLabels: Record<keyof MainTabParamList, string> = {
  Home: 'Home',
  Appointments: 'Track',
  AddAction: '',
  Shop: 'Meals',
  Videos: 'Activity',
};

export function MainTabs() {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarLabel: tabLabels[route.name] || '',
          tabBarIcon: ({ color }) => {
            if (route.name === 'AddAction') {
              // Empty space for FAB
              return <View style={styles.fabPlaceholder} />;
            }

            const iconSize = 24;
            const iconMap: Record<keyof MainTabParamList, (props: { color: string }) => React.ReactNode> = {
              Home: (props) => <HomeIcon width={iconSize} height={iconSize} color={props.color} />,
              Appointments: (props) => <AppointmentIcon width={iconSize} height={iconSize} color={props.color} />,
              AddAction: () => <View style={styles.fabPlaceholder} />,
              Shop: (props) => <ShopIcon width={iconSize} height={iconSize} color={props.color} />,
              Videos: (props) => <VideosIcon width={iconSize} height={iconSize} color={props.color} />,
            };

            const RenderIcon = iconMap[route.name];
            return <RenderIcon color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Appointments" component={AppointmentsScreen} />
        <Tab.Screen
          name="AddAction"
          component={HomeScreen}
          options={{
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              setModalVisible(true);
            },
          }}
        />
        <Tab.Screen name="Shop" component={MarketplaceScreen} />
        <Tab.Screen name="Videos" component={VideosScreen} />
      </Tab.Navigator>

      <FloatingActionButton
        onPress={() => setModalVisible((prev) => !prev)}
        isActive={isModalVisible}
      />
      <QuickActionsModal visible={isModalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 80,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 0,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    marginTop: 4,
  },
  fabPlaceholder: {
    width: 60,
    height: 24,
  },
});
