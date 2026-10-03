import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Share, View } from 'react-native';
import * as Linking from 'expo-linking';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorCard, Field, Heading, Icon, Label, Pill, Row, Screen, TopBar } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import { getDeviceLocation } from '../services/location';
import { errorMessage, mapLink, validCoordinate } from '../lib/helpers';
import type { Coordinate, RootStackParamList } from '../types';
import { MOCK } from '../data/mockData';

export function SOSScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'SOS'>) {
  const theme = useTheme(); const { settings } = useApp();
  const [location, setLocation] = useState<Coordinate | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [lat, setLat] = useState(''); const [lng, setLng] = useState(''); const [manual, setManual] = useState(false);
  const started = useRef(false); const mounted = useRef(true); const locked = useRef(false);
  const message = (point: Coordinate | null, manuallyEntered = false) => `SOS — I need assistance. Please contact me and check on my safety.\n${point ? `${manuallyEntered ? 'Manually entered' : 'Phone'} location: ${mapLink(point)}\nCoordinates: ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}` : 'My location is unavailable. Please call me to confirm where I am.'}\nPrepared: ${new Date().toLocaleString()}\nShared using ${MOCK.appName} demo. No emergency service has been contacted.`;
  const openShare = async (point: Coordinate | null, manuallyEntered = false) => {
    if (!mounted.current) return;
    const result = await Share.share({ title: 'SOS · my location', message: message(point, manuallyEntered) });
    if (mounted.current) setNotice(result.action === Share.dismissedAction ? 'This share attempt was cancelled. No delivery is confirmed.' : 'Share sheet opened. Delivery is not confirmed; check your chosen messaging app.');
  };
  const shareCurrent = async () => {
    if (locked.current) return; locked.current = true;
    setBusy(true); setError(''); setNotice('Getting a fresh location…');
    try {
      const point = await getDeviceLocation();
      if (!mounted.current) return;
      setLocation(point); setManual(false); setNotice('Choose an emergency contact in the share sheet.');
      await openShare(point);
    } catch (err) { if (mounted.current) { setError(errorMessage(err)); setNotice('Location was not shared. Retry or use an option below.'); } }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  useEffect(() => {
    mounted.current = true;
    // One tap on an SOS entry prepares a fresh location and opens the native share sheet.
    // Permissions and recipient confirmation still belong to the operating system.
    const timer = setTimeout(() => { if (!started.current) { started.current = true; void shareCurrent(); } }, 500);
    return () => { mounted.current = false; clearTimeout(timer); };
  }, []);
  const manualShare = async () => {
    if (locked.current) return;
    const point = validCoordinate(lat, lng);
    if (!point) { setError('Enter valid latitude and longitude before sharing.'); return; }
    locked.current = true; setBusy(true); setError(''); setLocation(point); setManual(true);
    try { await openShare(point, true); } catch (err) { if (mounted.current) setError(errorMessage(err)); } finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  const sms = async (phone: string) => {
    if (locked.current) return; locked.current = true;
    setBusy(true); setError('');
    try {
      const point = await getDeviceLocation();
      if (!mounted.current) return;
      setLocation(point); setManual(false);
      await Linking.openURL(`sms:${phone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message(point))}`);
      if (mounted.current) setNotice('SMS composer opened. You must tap Send. Message delivery is not confirmed.');
    } catch (err) { if (mounted.current) setError(errorMessage(err)); } finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  return <Screen><TopBar title="Safety & SOS" onBack={() => navigation.goBack()} /><View style={{ alignSelf: 'flex-start', padding: 19, borderRadius: 23, backgroundColor: theme.dangerTint }}><Icon name="alert-triangle" size={38} color={theme.danger} /></View><Heading subtitle="Your SOS tap prepares your location and opens the phone’s share sheet. Choose a trusted contact and send.">Let someone know.</Heading><Pill text="REAL LOCATION SHARING · NO EMERGENCY DISPATCH" tone="amber" />
    <Card><Label weight="700">If you are in immediate danger</Label><Label size={13} color={theme.secondary}>Contact local emergency services directly. This prototype cannot dispatch an ambulance, police or roadside help. Move to a safe place if you can.</Label></Card>
    <Button title={busy ? 'Preparing location…' : 'Share my current location'} variant="danger" icon="share-2" loading={busy} onPress={() => { void shareCurrent(); }} />
    {!!notice && <Label size={13} color={theme.secondary}>{notice}</Label>}{!!error && <ErrorCard message={error} onRetry={() => { void shareCurrent(); }} />}
    {location && <Card><Row><Icon name="map-pin" color={theme.primaryText} /><Label weight="700">{manual ? 'Manually entered location' : 'Last prepared phone location'}</Label></Row><Label size={13}>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</Label><Label size={12} color={theme.secondary}>Fresh location is requested each time you share or compose an SOS text.</Label></Card>}
    <Label size={20} weight="700">Emergency contacts</Label>
    {settings.emergencyContacts.length ? settings.emergencyContacts.map(contact => <Card key={contact.id}><Row><View style={{ flex: 1 }}><Label weight="700">{contact.name}</Label><Label size={12} color={theme.secondary}>{contact.phone}</Label></View><Button title="Text SOS" variant="secondary" icon="message-square" disabled={busy} onPress={() => { void sms(contact.phone); }} /></Row></Card>) : <Card><Label size={13} color={theme.secondary}>No contacts saved. You can still choose any trusted recipient in the share sheet. Add emergency contacts in Settings after demo login.</Label></Card>}
    <Card><Label weight="700">Can’t get your GPS position?</Label><Label size={12} color={theme.secondary}>You can enter known coordinates or send a message without location. Demo coordinates are never used for SOS.</Label><Field label="Known latitude" value={lat} onChangeText={setLat} placeholder="−90 to 90" keyboardType="numbers-and-punctuation" /><Field label="Known longitude" value={lng} onChangeText={setLng} placeholder="−180 to 180" keyboardType="numbers-and-punctuation" /><Button title="Share entered coordinates" variant="secondary" disabled={busy} onPress={() => { void manualShare(); }} /><Button title="Share SOS text without location" variant="ghost" disabled={busy} onPress={() => { void openShare(null).catch(err => Alert.alert('Could not share', errorMessage(err))); }} /><Button title="Open phone settings" variant="ghost" onPress={() => { void Linking.openSettings().catch(() => Alert.alert('Open settings manually', 'Enable location permission for Expo Go in your phone settings.')); }} /></Card>
    <Label size={11} color={theme.secondary}>Sharing is real and user-controlled. SMS needs cellular service; WhatsApp needs data. We do not verify delivery, track you in the background, or silently message contacts.</Label>
  </Screen>;
}
