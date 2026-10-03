import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Divider, EmptyState, ErrorCard, Heading, Icon, IconButton, Label, Pill, Row, Screen, Skeleton, TopBar } from '../components/ui';
import { MOCK, SERVICES } from '../data/mockData';
import { dateLabel, errorMessage, money, serviceFor } from '../lib/helpers';
import { mockApi } from '../services/mockApi';
import { useApp } from '../state/AppContext';
import { useNetwork } from '../state/NetworkContext';
import { useTheme } from '../theme';
import type { RootStackParamList, Service } from '../types';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme(); const { activeRequest, settings } = useApp(); const { run, offline } = useNetwork();
  const [services, setServices] = useState<Service[]>(SERVICES); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setServices(await run(() => mockApi.listServices())); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  }, [run]);
  useEffect(() => { void load(); }, [load]);
  return <Screen>
    <Row><View style={{ flex: 1, gap: 3 }}><Label size={12} color={theme.secondary}>YOUR ROADSIDE COMPANION</Label><Label size={24} weight="800" style={{ letterSpacing: -1 }}>{MOCK.appName}<Label size={24} color={theme.accent}>.</Label></Label></View><IconButton icon="alert-triangle" label="SOS and location sharing" danger onPress={() => navigation.navigate('SOS')} /></Row>
    <Row><Icon name="map-pin" size={18} color={theme.primaryText} /><Label size={13} weight="600" style={{ flex: 1 }}>{MOCK.locationLabel}</Label><Pill text="DEMO AREA" tone="neutral" /></Row>
    <Card style={{ backgroundColor: theme.primary, borderColor: theme.primary, padding: 24, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: -35, top: -35, width: 170, height: 170, borderWidth: 24, borderColor: '#FFFFFF12', borderRadius: 100 }} />
      <Pill text="WE’VE GOT YOUR BACK" tone="amber" /><Label size={30} weight="800" color="#FFFFFF" style={{ letterSpacing: -0.8, maxWidth: '88%' }}>Stuck?{ '\n' }Let’s get you moving.</Label><Label size={13} color="#DAEEE1" style={{ maxWidth: '85%' }}>Choose a service below. Help starts with one simple request.</Label><Row><Icon name="shield" color="#D9F2E2" size={16} /><Label size={11} color="#D9F2E2">Demo experience · no real dispatch</Label></Row>
    </Card>
    {activeRequest && <Card style={{ borderColor: theme.primaryText }}><Row><Pill text="ACTIVE SIMULATION" /><Label size={12} color={theme.secondary}>{activeRequest.status === 'arrived' ? 'Provider arrived' : 'On the way'}</Label></Row><Label size={19} weight="700">{serviceFor(activeRequest.serviceId).name}</Label><Button title="Track your demo request" icon="navigation" onPress={() => navigation.navigate('Tracking', { requestId: activeRequest.id })} /></Card>}
    <Row><Label size={21} weight="700" style={{ flex: 1 }}>What do you need?</Label><Label size={12} color={theme.secondary}>6 services</Label></Row>
    {!!error && <><ErrorCard message={error} onRetry={() => { void load(); }} /><Label size={11} color={theme.secondary}>Showing the bundled demo catalogue. Requests need connectivity; history is available offline.</Label></>}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {loading ? Array.from({ length: 6 }, (_, index) => <Skeleton key={index} height={163} style={{ width: '48%', flexGrow: 1 }} />) : services.map(service => <Pressable key={service.id} accessibilityRole="button" accessibilityLabel={`${service.name}, starting from ${money(service.basePrice)}, plus dispatch fee`} onPress={() => activeRequest ? navigation.navigate('Tracking', { requestId: activeRequest.id }) : navigation.navigate('Request', { serviceId: service.id })} style={({ pressed }) => ({ width: '47%', flexGrow: 1, opacity: pressed ? 0.7 : 1 })}>
        <Card style={{ flex: 1, padding: 17, gap: 11 }}><View style={{ width: 45, height: 45, backgroundColor: theme.tint, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Icon name={service.icon} color={theme.primaryText} /></View><Label size={15} weight="700">{service.name}</Label><Label size={11} color={theme.secondary}>{service.eta} · simulated</Label><Label size={12} weight="600" color={theme.primaryText}>From {money(service.basePrice)}</Label></Card>
      </Pressable>)}
    </View>
    <Card><Row><View style={{ backgroundColor: theme.dangerTint, padding: 12, borderRadius: 15 }}><Icon name="alert-triangle" color={theme.danger} /></View><View style={{ flex: 1, gap: 4 }}><Label weight="700">Your safety comes first</Label><Label size={12} color={theme.secondary}>Share your location with someone you trust.</Label></View></Row><Button title="SOS · share my location" variant="danger" onPress={() => navigation.navigate('SOS')} /></Card>
    <Label size={11} color={theme.secondary} style={{ textAlign: 'center' }}>{offline ? 'You are offline. Existing requests and receipts remain on this phone.' : 'Prices and arrival times are examples, not real quotes.'}{settings.providerMode ? '\nProvider mode is available in the bottom bar.' : ''}</Label>
  </Screen>;
}

export function HistoryScreen() {
  const theme = useTheme(); const { requests } = useApp(); const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const items = requests.filter(request => filter === 'all' || (filter === 'completed' ? request.status === 'completed' : ['en_route', 'arrived'].includes(request.status)));
  return <Screen><TopBar title="Your requests" /><Heading subtitle="Every request, all in one place. Stored on this phone only.">A little road history.</Heading><Pill text="DEMO HISTORY · INCLUDES SAMPLE REQUESTS" tone="amber" />
    <Row>{(['all', 'active', 'completed'] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={{ flex: 1, backgroundColor: filter === value ? theme.primary : theme.card, borderRadius: 13, paddingVertical: 12, borderWidth: 1, borderColor: theme.border }}><Label size={12} weight="600" color={filter === value ? '#FFFFFF' : theme.secondary} style={{ textAlign: 'center', textTransform: 'capitalize' }}>{value}</Label></Pressable>)}</Row>
    {!items.length && <EmptyState title="A clear road ahead" body="No requests in this category yet. Start a demo request from Get help." />}
    {items.map(request => {
      const service = serviceFor(request.serviceId); const active = ['en_route', 'arrived'].includes(request.status);
      return <Card key={request.id}><Row><View style={{ padding: 13, borderRadius: 14, backgroundColor: theme.tint }}><Icon name={service.icon} color={theme.primaryText} /></View><View style={{ flex: 1 }}><Label weight="700">{service.name}</Label><Label size={12} color={theme.secondary}>{dateLabel(request.createdAt)}</Label></View><Label weight="700">{money(request.quote.total)}</Label></Row><Divider /><Row><Icon name="map-pin" size={15} color={theme.secondary} /><Label size={12} color={theme.secondary} style={{ flex: 1 }}>{request.locationLabel}</Label></Row><Row style={{ justifyContent: 'space-between' }}><Pill text={request.status.replace('_', ' ').toUpperCase()} tone={active ? 'amber' : 'neutral'} />{request.rating && <Row style={{ gap: 4 }}><Icon name="star" size={14} color={theme.accent} /><Label size={12}>{request.rating}.0</Label></Row>}</Row>{request.status !== 'cancelled' && <Button title={active ? 'Track request' : 'View demo receipt'} variant="secondary" icon={active ? 'navigation' : 'file-text'} onPress={() => active ? navigation.navigate('Tracking', { requestId: request.id }) : navigation.navigate('Receipt', { requestId: request.id })} />}</Card>;
    })}
  </Screen>;
}
