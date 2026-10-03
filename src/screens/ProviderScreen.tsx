import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Card, Divider, EmptyState, ErrorCard, Heading, Icon, Label, Pill, Row, Screen, TopBar } from '../components/ui';
import { errorMessage, money, serviceFor } from '../lib/helpers';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';

export function ProviderScreen() {
  const theme = useTheme(); const { jobs, updateJob, resetJobs } = useApp(); const [busy, setBusy] = useState<string | null>(null); const [error, setError] = useState('');
  const [retry, setRetry] = useState<{ id: string; action: 'accepted' | 'declined' | 'completed' } | null>(null);
  const act = async (id: string, action: 'accepted' | 'declined' | 'completed') => {
    if (busy) return; setBusy(id); setError(''); setRetry({ id, action });
    try { await updateJob(id, action); setRetry(null); } catch (err) { setError(errorMessage(err)); } finally { setBusy(null); }
  };
  const active = jobs.filter(job => job.status === 'accepted' || job.status === 'incoming');
  const done = jobs.filter(job => job.status === 'completed');
  return <Screen><TopBar title="Provider workspace" right={<Pill text="DEMO MODE" tone="amber" />} /><Heading subtitle="A simple view of incoming roadside jobs.">Ready to lend a hand?</Heading>
    <Card style={{ backgroundColor: theme.primary, borderColor: theme.primary }}><Row><View style={{ flex: 1 }}><Label size={12} color="#D8EBDF">SIMULATED EARNINGS</Label><Label size={34} weight="800" color="#FFFFFF">{money(done.reduce((sum, job) => sum + job.earnings, 0))}</Label></View><Icon name="briefcase" size={35} color="#FFFFFF" /></Row><Label size={12} color="#D8EBDF">{done.length} completed sample job{done.length === 1 ? '' : 's'} · no payout</Label></Card>
    <Label size={12} color={theme.secondary}>These are separate local sample jobs, not customer requests. No real job offers, location broadcasts or earnings are involved.</Label>
    {!!error && <ErrorCard message={error} onRetry={retry ? () => { void act(retry.id, retry.action); } : undefined} />}
    <Row><Label size={20} weight="700" style={{ flex: 1 }}>Your job queue</Label><Pill text={`${active.length} OPEN`} /></Row>
    {!active.length && <EmptyState icon="check-circle" title="You’re all caught up" body="No incoming sample jobs. Reset the demo queue to try again." />}
    {active.map(job => <Card key={job.id}><Row style={{ justifyContent: 'space-between' }}><Pill text={job.status === 'accepted' ? 'ACCEPTED · IN PROGRESS' : 'INCOMING DEMO JOB'} tone={job.status === 'incoming' ? 'amber' : 'green'} /><Label size={12} color={theme.secondary}>{job.distance}</Label></Row><Row><View style={{ backgroundColor: theme.tint, padding: 14, borderRadius: 14 }}><Icon name={serviceFor(job.serviceId).icon} color={theme.primaryText} /></View><View style={{ flex: 1 }}><Label size={20} weight="700">{serviceFor(job.serviceId).name}</Label><Label size={12} color={theme.secondary}>{job.customer} · sample customer</Label></View></Row><Divider /><Row><Icon name="map-pin" color={theme.secondary} size={17} /><Label size={13} style={{ flex: 1 }}>{job.locationLabel}</Label></Row><Row><Icon name="truck" color={theme.secondary} size={17} /><Label size={13} style={{ flex: 1 }}>{job.vehicle}</Label></Row><Row style={{ justifyContent: 'space-between' }}><Label size={12} color={theme.secondary}>Example provider fee</Label><Label size={21} weight="800" color={theme.primaryText}>{money(job.earnings)}</Label></Row>
      {job.status === 'incoming' ? <Row><Button title="Decline" variant="secondary" style={{ flex: 1 }} disabled={!!busy} onPress={() => { void act(job.id, 'declined'); }} /><Button title="Accept" icon="check" style={{ flex: 1 }} loading={busy === job.id} disabled={!!busy && busy !== job.id} onPress={() => { void act(job.id, 'accepted'); }} /></Row> : <Button title="Mark demo job complete" icon="check-circle" loading={busy === job.id} disabled={!!busy && busy !== job.id} onPress={() => Alert.alert('Complete this sample job?', 'This records a local completion only. No customer is charged.', [{ text: 'Not yet', style: 'cancel' }, { text: 'Complete', onPress: () => { void act(job.id, 'completed'); } }])} />}
    </Card>)}
    {jobs.filter(job => job.status === 'completed' || job.status === 'declined').map(job => <Card key={job.id}><Row><Icon name={job.status === 'completed' ? 'check-circle' : 'minus-circle'} color={theme.primaryText} /><View style={{ flex: 1 }}><Label weight="700">{serviceFor(job.serviceId).name}</Label><Label size={12} color={theme.secondary}>{job.customer}</Label></View><Pill text={job.status.toUpperCase()} tone="neutral" /></Row></Card>)}
    <Button title="Reset sample job queue" variant="secondary" icon="refresh-cw" disabled={!!busy} onPress={() => Alert.alert('Reset sample jobs?', 'Sample statuses and simulated earnings will reset.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset queue', onPress: resetJobs }])} />
  </Screen>;
}
