import React from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/state/AppContext';
import { NetworkProvider } from './src/state/NetworkContext';
import { AppThemeProvider, useTheme } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Button, Card, Label } from './src/components/ui';
import { MOCK } from './src/data/mockData';
import { errorMessage } from './src/lib/helpers';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F8F6', padding: 24, justifyContent: 'center' }}><Text style={{ fontSize: 24, color: '#0B6B3A', fontWeight: '700' }}>{MOCK.appName} couldn’t open this screen.</Text><Text style={{ marginTop: 16 }}>Close and reopen the app. Your last saved demo history remains on this phone. This app cannot dispatch emergency help.</Text></SafeAreaView>;
    return this.props.children;
  }
}
function Bootstrap() {
  const { ready, loadError, reload, reset } = useApp(); const theme = useTheme();
  if (!ready) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 24 }}><View style={{ gap: 24 }}><Label size={32} weight="800" color={theme.primaryText}>{MOCK.appName}</Label>{loadError ? <Card><Label>{loadError}</Label><Button title="Retry loading" onPress={() => { void reload(); }} /><Button title="Reset local demo data" variant="secondary" onPress={() => Alert.alert('Reset saved demo?', 'This removes the demo session, requests, ratings and contacts from this phone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', onPress: () => { void reset().catch(error => Alert.alert('Reset failed', errorMessage(error))); } }])} /></Card> : <ActivityIndicator size="large" color={theme.primaryText} />}</View></SafeAreaView>;
  return <AppNavigator />;
}
function ThemedApp() {
  const { settings } = useApp();
  return <AppThemeProvider mode={settings.theme}><Bootstrap /></AppThemeProvider>;
}
export default function App() {
  return <ErrorBoundary><SafeAreaProvider><NetworkProvider><AppProvider><ThemedApp /></AppProvider></NetworkProvider></SafeAreaProvider></ErrorBoundary>;
}
