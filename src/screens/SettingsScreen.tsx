import React, { useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Divider, ErrorCard, Field, Heading, Icon, IconButton, Label, Pill, Row, Screen, TopBar } from '../components/ui';
import { MOCK } from '../data/mockData';
import { errorMessage, normalizePhone } from '../lib/helpers';
import { useApp } from '../state/AppContext';
import { useNetwork } from '../state/NetworkContext';
import { useTheme } from '../theme';
import type { RootStackParamList, ThemeMode } from '../types';

export function SettingsScreen() {
  const theme = useTheme(); const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { settings, updateSettings, phone, logout, reset, storageError, retrySave } = useApp();
  const { simulateOffline, setSimulateOffline, failNext, setFailNext } = useNetwork();
  const [name, setName] = useState(''); const [number, setNumber] = useState(''); const [testNumber, setTestNumber] = useState(settings.providerContactPhone); const [error, setError] = useState('');
  const addContact = () => {
    const normalized = normalizePhone(number);
    if (!name.trim() || !normalized) { setError('Add a contact name and a valid Nigerian mobile number.'); return; }
    if (settings.emergencyContacts.some(contact => contact.phone === normalized)) { setError('This emergency contact is already saved.'); return; }
    updateSettings({ emergencyContacts: [...settings.emergencyContacts, { id: `contact-${Date.now()}`, name: name.trim(), phone: normalized }] });
    setName(''); setNumber(''); setError('');
  };
  const saveTestNumber = () => {
    const normalized = testNumber.trim() ? normalizePhone(testNumber) : '';
    if (normalized === null) { setError('Use a valid +234 or local Nigerian mobile number for the test contact.'); return; }
    updateSettings({ providerContactPhone: normalized }); setTestNumber(normalized); setError('');
    Alert.alert('Test contact saved', normalized ? 'Call and WhatsApp actions will use this number after confirmation. Only use a number whose owner agreed to be contacted.' : 'Call and WhatsApp are now in safe demo mode with no number configured.');
  };
  return <Screen><TopBar title="Settings" /><Heading subtitle="Make your roadside companion feel like you.">Your app, your way.</Heading>
    <Card><Row><View style={{ backgroundColor: theme.tint, padding: 16, borderRadius: 19 }}><Icon name="user" size={27} color={theme.primaryText} /></View><View style={{ flex: 1 }}><Label weight="700">Demo account</Label><Label size={13} color={theme.secondary}>{phone}</Label></View><Pill text="LOCAL" /></Row><Label size={11} color={theme.secondary}>Not secure authentication. Requests and contacts belong to this phone’s demo, not a server account. A different demo number on this device sees the same saved data.</Label></Card>
    <Card><Row><Icon name={theme.dark ? 'moon' : 'sun'} color={theme.primaryText} /><Label size={18} weight="700">Appearance</Label></Row><Row>{(['system', 'light', 'dark'] as ThemeMode[]).map(mode => <Pressable key={mode} accessibilityRole="radio" accessibilityState={{ checked: settings.theme === mode }} onPress={() => updateSettings({ theme: mode })} style={{ flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: settings.theme === mode ? theme.primary : theme.background }}><Label size={13} weight="600" color={settings.theme === mode ? '#FFFFFF' : theme.secondary} style={{ textAlign: 'center', textTransform: 'capitalize' }}>{mode}</Label></Pressable>)}</Row></Card>
    <Card><Row><View style={{ flex: 1, gap: 5 }}><Label size={18} weight="700">Provider mode</Label><Label size={12} color={theme.secondary}>Show the provider tab with sample jobs.</Label></View><Switch accessibilityLabel="Provider demo mode" value={settings.providerMode} onValueChange={value => updateSettings({ providerMode: value })} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFFFFF" /></Row><Label size={11} color={theme.secondary}>Demo role switch only. This is not provider verification or an access-control system.</Label></Card>
    <Card><Row><Icon name="users" color={theme.primaryText} /><Label size={18} weight="700">Emergency contacts</Label></Row><Label size={12} color={theme.secondary}>These contacts stay on this phone. SOS opens the native share sheet or an SMS composer; it never sends silently. Use consenting contacts.</Label>
      {!settings.emergencyContacts.length && <Label size={13} color={theme.secondary}>No contacts saved yet.</Label>}
      {settings.emergencyContacts.map(contact => <View key={contact.id} style={{ gap: 12 }}><Row><View style={{ flex: 1 }}><Label weight="600">{contact.name}</Label><Label size={12} color={theme.secondary}>{contact.phone}</Label></View><IconButton icon="x" label={`Remove ${contact.name}`} onPress={() => Alert.alert('Remove emergency contact?', contact.name, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', onPress: () => updateSettings({ emergencyContacts: settings.emergencyContacts.filter(item => item.id !== contact.id) }) }])} /></Row><Divider /></View>)}
      <Field label="Contact name" value={name} onChangeText={setName} placeholder="Someone you trust" maxLength={60} /><Field label="Contact phone (+234)" value={number} onChangeText={setNumber} placeholder="080… or +23480…" keyboardType="phone-pad" maxLength={18} /><Button title="Add emergency contact" icon="plus" variant="secondary" onPress={addContact} /><Button title="SOS · share my location" icon="alert-triangle" variant="danger" onPress={() => navigation.navigate('SOS')} />
    </Card>
    {!!error && <ErrorCard message={error} />}
    <Card><Label size={18} weight="700">Test Call & WhatsApp</Label><Label size={12} color={theme.secondary}>The demo provider has no real number. Add a consenting test number to enable phone and WhatsApp handoff. Actual calls or messages may incur charges.</Label><Field label="Optional provider test number" value={testNumber} onChangeText={setTestNumber} keyboardType="phone-pad" placeholder="Leave blank for safe demo mode" maxLength={18} /><Button title="Save test contact" icon="check" variant="secondary" onPress={saveTestNumber} /></Card>
    <Card><Pill text="DEVELOPER DEMO CONTROLS" tone="amber" /><Row><View style={{ flex: 1, gap: 5 }}><Label weight="600">Simulate offline</Label><Label size={12} color={theme.secondary}>Show offline banner, pause tracking, block mock network operations.</Label></View><Switch accessibilityLabel="Simulate offline network" value={simulateOffline} onValueChange={setSimulateOffline} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFFFFF" /></Row><Divider /><Row><View style={{ flex: 1, gap: 5 }}><Label weight="600">Fail next mock request</Label><Label size={12} color={theme.secondary}>Test a timeout and retry on your next booking, payment or provider action.</Label></View><Switch accessibilityLabel="Fail next mock request" value={failNext} onValueChange={setFailNext} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFFFFF" /></Row><Label size={11} color={theme.secondary}>Simulation controls do not affect real GPS, phone calls, SMS, WhatsApp or native sharing. They reset when the app restarts.</Label></Card>
    {!!storageError && <ErrorCard message={storageError} onRetry={() => { void retrySave(); }} />}
    <Card><Label weight="700">About {MOCK.appName}</Label><Label size={12} color={theme.secondary}>Mobile prototype · version 1.0.0. All dispatch, pricing, OTP, payment and provider data are simulated. GPS, native sharing and configured contact actions are real.</Label><Label size={12} color={theme.secondary}>Demo data is stored locally with AsyncStorage, without app-level encryption. Do not enter sensitive information. Signing out does not delete local history or contacts; reset below to remove them.</Label></Card>
    <Button title="Sign out of demo" icon="log-out" variant="secondary" onPress={() => Alert.alert('Sign out?', 'Local history and contacts remain. Active tracking will pause until you sign in again.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', onPress: logout }])} />
    <Button title="Reset all local demo data" icon="refresh-cw" variant="ghost" onPress={() => Alert.alert('Reset this phone’s demo?', 'Removes your demo session, requests, ratings, settings and emergency contacts, then restores sample history. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset demo', onPress: () => { void reset().then(() => { setSimulateOffline(false); setFailNext(false); }).catch(err => Alert.alert('Reset failed', errorMessage(err))); } }])} />
  </Screen>;
}
