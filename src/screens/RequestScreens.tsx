import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Divider, ErrorCard, Field, Heading, Icon, Label, Pill, Row, Screen, TopBar } from '../components/ui';
import { TrackingMap } from '../components/TrackingMap';
import { MOCK } from '../data/mockData';
import { errorMessage, money, quoteFor, serviceFor, validCoordinate } from '../lib/helpers';
import { getDeviceLocation } from '../services/location';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import type { RootStackParamList, RequestDraft, Coordinate } from '../types';

export function RequestScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Request'>) {
  const theme = useTheme(); const service = serviceFor(route.params.serviceId);
  const [location, setLocation] = useState<Coordinate>(MOCK.location);
  const [source, setSource] = useState<RequestDraft['locationSource']>('demo'); const [label, setLabel] = useState(MOCK.locationLabel);
  const [vehicle, setVehicle] = useState(''); const [notes, setNotes] = useState(''); const [error, setError] = useState(''); const [locating, setLocating] = useState(false);
  const [manual, setManual] = useState(false); const [lat, setLat] = useState(''); const [lng, setLng] = useState('');
  const locate = async () => {
    setLocating(true); setError('');
    try { const point = await getDeviceLocation(); setLocation(point); setSource('device'); setLabel(`My location · ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`); setManual(false); }
    catch (err) { setError(errorMessage(err)); } finally { setLocating(false); }
  };
  const applyManual = () => {
    const point = validCoordinate(lat, lng);
    if (!point) { setError('Enter valid latitude (−90 to 90) and longitude (−180 to 180).'); return; }
    setLocation(point); setSource('manual'); setError(''); setLabel(`Pickup · ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`); setManual(false);
  };
  const next = () => {
    if (!vehicle.trim() || !label.trim()) { setError('Add your pickup description and vehicle details so the demo provider knows what to look for.'); return; }
    if (manual) { setError('Apply or close your manual coordinate entry before continuing.'); return; }
    navigation.navigate('Estimate', { draft: { serviceId: service.id, location, locationLabel: label.trim(), locationSource: source, vehicle: vehicle.trim(), notes: notes.trim() } });
  };
  return <Screen><TopBar title="Request details" onBack={() => navigation.goBack()} /><Pill text="STEP 1 OF 3 · YOUR PICKUP" /><Heading subtitle={service.description}>{service.name}, sorted.</Heading>
    <TrackingMap destination={location} height={205} showProvider={false} /><Pill text={source === 'demo' ? 'DEMO PICKUP · NOT YOUR ACTUAL LOCATION' : source === 'device' ? 'DEVICE LOCATION · CHECK PICKUP POINT' : 'MANUALLY SET PICKUP'} tone={source === 'demo' ? 'amber' : 'green'} />
    <Card><Field label="Pickup address / landmark" value={label} onChangeText={setLabel} maxLength={180} /><Label size={11} color={theme.secondary}>Editing the description does not move the pin. Use device location or enter coordinates to change the pickup point.</Label><Button title="Use my current location" icon="crosshair" variant="secondary" loading={locating} onPress={() => { void locate(); }} /><Button title={manual ? 'Close manual entry' : 'Enter coordinates manually'} variant="ghost" icon="edit-3" onPress={() => setManual(!manual)} />
      {manual && <View style={{ gap: 12 }}><Field label="Latitude" value={lat} onChangeText={setLat} placeholder="6.4281" keyboardType="numbers-and-punctuation" /><Field label="Longitude" value={lng} onChangeText={setLng} placeholder="3.4219" keyboardType="numbers-and-punctuation" /><Button title="Apply pickup coordinates" variant="secondary" onPress={applyManual} /></View>}
    </Card>
    <Field label="Vehicle details" value={vehicle} onChangeText={setVehicle} placeholder={MOCK.vehicleHint} maxLength={160} /><Field label="Anything else? (optional)" value={notes} onChangeText={setNotes} placeholder="Tell us what happened or how to find you…" multiline numberOfLines={3} maxLength={500} style={{ minHeight: 100 }} />
    {!!error && <ErrorCard message={error} />}<Button title="See price estimate" icon="arrow-right" disabled={locating} onPress={next} />
  </Screen>;
}
export function EstimateScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Estimate'>) {
  const theme = useTheme(); const { createRequest } = useApp(); const { draft } = route.params; const quote = quoteFor(draft.serviceId); const service = serviceFor(draft.serviceId);
  const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const book = async () => {
    if (busy || !confirmed) return; setBusy(true); setError('');
    try { const request = await createRequest(draft); navigation.replace('Tracking', { requestId: request.id }); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return <Screen><TopBar title="Your estimate" onBack={() => navigation.goBack()} /><Pill text="STEP 2 OF 3 · NO SURPRISES" /><Heading subtitle="Here’s the breakdown before you request help.">A clearer road ahead.</Heading>
    <Card style={{ alignItems: 'center', paddingVertical: 28 }}><View style={{ backgroundColor: theme.tint, borderRadius: 22, padding: 20 }}><Icon name={service.icon} size={35} color={theme.primaryText} /></View><Label size={19} weight="700">{service.name}</Label><Label size={43} weight="800" color={theme.primaryText} style={{ letterSpacing: -1.7 }}>{money(quote.total)}</Label><Pill text="SIMULATED PRICE ESTIMATE" tone="amber" /><Label size={12} color={theme.secondary}>Arrival in {service.eta} · example only</Label></Card>
    <Card><Row style={{ justifyContent: 'space-between' }}><Label color={theme.secondary}>Service fee</Label><Label weight="600">{money(quote.base)}</Label></Row><Row style={{ justifyContent: 'space-between' }}><Label color={theme.secondary}>Dispatch fee</Label><Label weight="600">{money(quote.dispatch)}</Label></Row><Divider /><Row style={{ justifyContent: 'space-between' }}><Label weight="700">Estimated total</Label><Label size={22} weight="800">{money(quote.total)}</Label></Row><Label size={11} color={theme.secondary}>Illustrative pricing only. Parts, fuel quantity, towing distance and additional labour require a real quote. No payment is taken now.</Label></Card>
    <Card><Row><Icon name="map-pin" color={theme.primaryText} /><Label style={{ flex: 1 }} size={13}>{draft.locationLabel}</Label></Row><Divider /><Row><Icon name="truck" color={theme.primaryText} /><Label style={{ flex: 1 }} size={13}>{draft.vehicle}</Label></Row>{draft.locationSource === 'demo' && <Pill text="USING DEMO LOCATION" tone="amber" />}</Card>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: confirmed }} onPress={() => setConfirmed(!confirmed)} disabled={busy} style={{ paddingVertical: 10 }}><Row><View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: theme.primaryText, backgroundColor: confirmed ? theme.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{confirmed && <Icon name="check" size={17} color="#FFFFFF" />}</View><Label size={13} style={{ flex: 1 }}>I understand this is a simulation. No real provider will be sent.</Label></Row></Pressable>
    {!!error && <ErrorCard message={error} onRetry={() => { void book(); }} />}<Button title={busy ? 'Finding a demo provider…' : 'Confirm simulated request'} loading={busy} disabled={!confirmed} icon="navigation" onPress={() => { void book(); }} />
  </Screen>;
}
