import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme';
import { useApp } from '../state/AppContext';
import { Icon } from '../components/ui';
import type { RootStackParamList, MainTabParamList } from '../types';
import { WelcomeScreen, PhoneScreen, OTPScreen } from '../screens/AuthScreens';
import { HomeScreen, HistoryScreen } from '../screens/HomeScreens';
import { RequestScreen, EstimateScreen } from '../screens/RequestScreens';
import { TrackingScreen } from '../screens/TrackingScreen';
import { PaymentScreen, ReceiptScreen } from '../screens/PaymentScreens';
import { SOSScreen } from '../screens/SOSScreen';
import { ProviderScreen } from '../screens/ProviderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();
function MainTabs() {
  const theme = useTheme(); const { settings } = useApp();
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: theme.primaryText,
    tabBarInactiveTintColor: theme.secondary,
    tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, paddingTop: 10 },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 3 },
    tabBarIcon: ({ color, size }) => <Icon name={route.name === 'Home' ? 'grid' : route.name === 'History' ? 'clock' : route.name === 'Provider' ? 'briefcase' : 'settings'} color={color} size={size - 2} />,
  })}>
    <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Get help' }} />
    <Tabs.Screen name="History" component={HistoryScreen} />
    {settings.providerMode && <Tabs.Screen name="Provider" component={ProviderScreen} options={{ title: 'Provider' }} />}
    <Tabs.Screen name="Settings" component={SettingsScreen} />
  </Tabs.Navigator>;
}
export function AppNavigator() {
  const theme = useTheme(); const { phone } = useApp();
  return <NavigationContainer theme={{ ...(theme.dark ? DarkTheme : DefaultTheme), colors: { ...(theme.dark ? DarkTheme : DefaultTheme).colors, primary: theme.primaryText, background: theme.background, card: theme.card, text: theme.text, border: theme.border, notification: theme.accent } }}>
    <StatusBar style={theme.dark ? 'light' : 'dark'} />
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background }, animation: 'slide_from_right' }}>
      {phone ? <Stack.Group navigationKey="customer">
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Request" component={RequestScreen} />
        <Stack.Screen name="Estimate" component={EstimateScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
      </Stack.Group> : <Stack.Group navigationKey="guest">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
      </Stack.Group>}
      <Stack.Screen name="SOS" component={SOSScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
