import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { MainTabs } from './MainTabs';
import { HealthOverviewScreen } from '../screens/HealthOverviewScreen';
import { HealthInsightsScreen } from '../screens/HealthInsightsScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { DailyStretchScreen } from '../screens/DailyStretchScreen';
import { AddActivityScreen } from '../screens/AddActivityScreen';
import { LearningHubScreen } from '../screens/LearningHubScreen';
import { PodcastsScreen } from '../screens/PodcastsScreen';
import { BlogsScreen } from '../screens/BlogsScreen';
import { BlogDetailScreen } from '../screens/BlogDetailScreen';
import { DoctorDetailScreen } from '../screens/DoctorDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="HealthOverview"
        component={HealthOverviewScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="HealthInsights"
        component={HealthInsightsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="DailyStretch"
        component={DailyStretchScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="LearningHub"
        component={LearningHubScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Podcasts"
        component={PodcastsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Blogs"
        component={BlogsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BlogDetail"
        component={BlogDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="DoctorDetail"
        component={DoctorDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
