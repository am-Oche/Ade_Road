import React from 'react';
import { Alert, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Divider, EmptyState, Heading, Icon, Label, Pill, Row, Screen, TopBar } from '../components/ui';
import { TrackingMap } from '../components/TrackingMap';
import { MOCK } from '../data/mockData';
import { money, serviceFor } from '../lib/helpers';
import { contactProvider } from '../services/contact';
import { useApp } from '../state/AppContext';
import { useNetwork } from '../state/NetworkContext';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../types';

export function TrackingScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Tracking'>) {
  const theme = useTheme(); const { requests, settings, cancelRequest } = useApp(); const { offline } = useNetwork();
  const request = requests.find(item => item.id === route.params.requestId);
  if (!request) return <Screen><TopBar title="Tracking" onBack={() => navigation.popToTop()} /><EmptyState title="Request not found" body="Return home and start a new demo request." /></Screen>;
  const arrived = request.status === 'arrived'; const completed = request.status === 'completed';
  const eta = Math.max(1, Math.ceil((1 - request.progress) * MOCK.initialEtaMinutes));
  const cancel = () => Alert.alert('Cancel this demo request?', 'No cancellation fee is charged in this prototype.', [{ text: 'Keep request', style: 'cancel' }, { text: 'Cancel request', onPress: () => { cancelRequest(request.id); navigation.popToTop(); } }]);
  if (request.status === 'cancelled') return <Screen><TopBar title="Request cancelled" onBack={() => navigation.popToTop()} /><EmptyState title="You’re all set" body="This demo request was cancelled. No payment was made." /></Screen>;
  return <Screen><TopBar title="Track your help" onBack={() => navigation.popToTop()} right={<Pill text="SIMULATED" tone="amber" />} />
    <Heading subtitle={offline ? 'Offline. The last position is saved; simulation is paused.' : completed ? 'Your simulated service is complete.' : arrived ? 'Your simulated provider is at the pickup point.' : 'Sit tight. Your simulated provider is on the way.'}>{completed ? 'Back on the road.' : arrived ? 'Your help is here.' : 'Help is on its way.'}</Heading>
    <TrackingMap destination={request.location} progress={request.progress} height={285} />
    <Card><Row><View style={{ flex: 1, gap: 5 }}><Label size={11} color={theme.secondary}>{offline ? 'LAST SIMULATED ETA' : 'SIMULATED ARRIVAL'}</Label><Label size={30} weight="800" color={theme.primaryText}>{completed ? 'Complete' : arrived ? 'Arrived' : `${eta} min`}</Label></View><View style={{ padding: 15, backgroundColor: theme.tint, borderRadius: 17 }}><Icon name={arrived ? 'check-circle' : 'navigation'} color={theme.primaryText} size={27} /></View></Row>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(request.progress * 100) }} style={{ height: 6, backgroundColor: theme.border, borderRadius: 5 }}><View style={{ height: 6, width: `${request.progress * 100}%`, backgroundColor: theme.primaryText, borderRadius: 5 }} /></View>
      <Row style={{ justifyContent: 'space-between' }}>{['Matched', 'On the way', 'Arrived'].map((step, index) => <Label key={step} size={10} color={index < 2 || arrived || completed ? theme.primaryText : theme.secondary} weight="600">{step}</Label>)}</Row><Label size={11} color={theme.secondary}>Animation only, not live GPS or road routing. The demo runs in about one minute while online and open.</Label>
    </Card>
    <Card><Row><View style={{ width: 55, height: 55, borderRadius: 19, backgroundColor: theme.tint, justifyContent: 'center', alignItems: 'center' }}><Label size={20} weight="800" color={theme.primaryText}>{MOCK.provider.initials}</Label></View><View style={{ flex: 1 }}><Label size={19} weight="700">{MOCK.provider.name}</Label><Label size={12} color={theme.secondary}>{MOCK.provider.role} · simulated</Label></View><Row style={{ gap: 4 }}><Icon name="star" color={theme.accent} size={15} /><Label size={13} weight="700">{MOCK.provider.rating}</Label></Row></Row><Label size={12} color={theme.secondary}>{MOCK.provider.vehicle} · {MOCK.provider.jobs} example jobs</Label><Row><Button title="Call" icon="phone" variant="secondary" style={{ flex: 1 }} onPress={() => contactProvider(settings.providerContactPhone, 'call', '')} /><Button title="WhatsApp" icon="message-circle" variant="secondary" style={{ flex: 1 }} onPress={() => contactProvider(settings.providerContactPhone, 'whatsapp', `AdeRoad TEST: I am testing request ${request.id}. This is not a real assistance request.`)} /></Row><Label size={11} color={theme.secondary}>Contact actions use your configured test number, not a real provider.</Label></Card>
    <Card><Row><Label style={{ flex: 1 }} weight="700">{serviceFor(request.serviceId).name}</Label><Label weight="700">{money(request.quote.total)}</Label></Row><Divider /><Row><Icon name="map-pin" color={theme.primaryText} size={17} /><Label style={{ flex: 1 }} size={13}>{request.locationLabel}</Label></Row><Label size={12} color={theme.secondary}>{request.vehicle}</Label></Card>
    {completed ? <Button title="Open receipt" icon="file-text" onPress={() => navigation.replace('Receipt', { requestId: request.id })} /> : arrived ? <><Button title="Finish demo assistance & pay" icon="check-circle" onPress={() => navigation.navigate('Payment', { requestId: request.id })} /><Label size={11} color={theme.secondary}>Only continue after assistance in a real app. This button simulates completion.</Label></> : <Button title={offline ? 'Offline · simulation paused' : 'Waiting for simulated arrival…'} disabled onPress={() => {}} />}
    <Button title="SOS · share my location" icon="alert-triangle" variant="danger" onPress={() => navigation.navigate('SOS')} />{!completed && <Button title="Cancel demo request" variant="ghost" onPress={cancel} />}
  </Screen>;
}
