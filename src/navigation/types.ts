export type MetricType = 'weight' | 'glucose' | 'water' | 'activity' | 'hba1c' | 'bloodpressure';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  HealthOverview: undefined;
  HealthInsights: { metric: MetricType };
  AddMedication: undefined;
  DailyStretch: undefined;
  AddActivity: undefined;
  LearningHub: undefined;
  Podcasts: undefined;
  Blogs: undefined;
  BlogDetail: { postId: string };
  DoctorDetail: { doctorId: string };
  Notifications: undefined;
  AddReminder: { category: string; customName?: string };
  Profile: undefined;
  Language: undefined;
  About: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Appointments: undefined;
  AddAction: undefined;
  Shop: undefined;
  Videos: undefined;
};
