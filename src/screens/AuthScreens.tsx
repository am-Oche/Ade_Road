import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ErrorCard, Field, Heading, Icon, Label, Pill, Row, Screen, TopBar } from '../components/ui';
import { MOCK } from '../data/mockData';
import { normalizePhone, errorMessage } from '../lib/helpers';
import { mockApi } from '../services/mockApi';
import { useNetwork } from '../state/NetworkContext';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../types';

export function WelcomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Welcome'>) {
  const theme = useTheme();
  return <Screen style={{ justifyContent: 'space-between', paddingTop: 30 }}>
    <Row><View style={{ width: 39, height: 39, backgroundColor: theme.primary, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}><Icon name="navigation" color="white" size={23} /></View><Label size={25} weight="800" style={{ letterSpacing: -1 }}>{MOCK.appName}</Label><View style={{ flex: 1 }} /><Pill text="DEMO APP" tone="amber" /></Row>
    <View style={{ gap: 25 }}>
      <View accessibilityLabel="Roadside assistance illustration" style={{ height: 255, borderRadius: 36, backgroundColor: theme.tint, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ position: 'absolute', width: 340, height: 75, backgroundColor: theme.border, transform: [{ rotate: '-33deg' }] }} />
        <View style={{ position: 'absolute', width: 340, height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.card, transform: [{ rotate: '-33deg' }] }} />
        <View style={{ width: 108, height: 108, backgroundColor: theme.primary, borderRadius: 32, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-8deg' }] }}><Icon name="truck" size={53} color="#FFFFFF" /></View>
        <Card style={{ position: 'absolute', bottom: 20, right: 18, padding: 12, borderRadius: 15 }}><Row><Icon name="check-circle" color={theme.primaryText} size={17} /><Label size={12} weight="700">A little help. A lot of relief.</Label></Row></Card>
        <View style={{ position: 'absolute', top: 25, left: 25, backgroundColor: theme.accent, padding: 12, borderRadius: 16 }}><Icon name="map-pin" color={theme.accentText} size={22} /></View>
      </View>
      <View style={{ gap: 13 }}><Pill text="YOUR ROADSIDE COMPANION" /><Label size={38} weight="800" style={{ lineHeight: 44, letterSpacing: -1.5 }}>A bump in the road.{'\n'}Not in your day.</Label><Label size={16} color={theme.secondary}>From a flat tyre to engine trouble, find the right kind of help in a few taps.</Label></View>
    </View>
    <View style={{ gap: 12 }}><Button title="Let’s get you moving" icon="arrow-right" onPress={() => navigation.navigate('Phone')} /><Button title="SOS · share my location" icon="alert-triangle" variant="danger" onPress={() => navigation.navigate('SOS')} /><Label size={11} color={theme.secondary} style={{ textAlign: 'center' }}>Prototype only. No real providers, payments or emergency dispatch.</Label></View>
  </Screen>;
}
export function PhoneScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Phone'>) {
  const theme = useTheme(); const { run } = useNetwork();
  const [input, setInput] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    const phone = normalizePhone(input);
    if (!phone) { setError('Enter a valid Nigerian mobile number, e.g. 080… or +23480… (11 local digits).'); return; }
    setBusy(true); setError('');
    try { await run(() => mockApi.sendOtp(phone)); navigation.navigate('OTP', { phone }); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return <Screen><TopBar title="Welcome aboard" onBack={() => navigation.goBack()} /><View style={{ marginVertical: 20, gap: 20 }}><Pill text="01 / 02 · GET STARTED" /><Heading subtitle="Enter your phone number to try the roadside assistance demo.">Help starts here.</Heading></View>
    <Card><Row><Label size={22}>🇳🇬</Label><Label weight="700">Nigeria</Label><View style={{ flex: 1 }} /><Label color={theme.secondary}>+234</Label></Row><Field label="Mobile number" value={input} onChangeText={setInput} placeholder="080… or +23480…" keyboardType="phone-pad" autoComplete="tel" maxLength={18} editable={!busy} /><Label size={12} color={theme.secondary}>Accepts +234, 11-digit local, or 10-digit mobile numbers.</Label></Card>
    {!!error && <ErrorCard message={error} onRetry={() => { void submit(); }} />}<Button title="Send demo code" loading={busy} icon="arrow-right" onPress={() => { void submit(); }} />
    <Card style={{ backgroundColor: theme.tint }}><Row><Icon name="info" color={theme.primaryText} /><Label weight="700">No SMS will be sent</Label></Row><Label size={13} color={theme.secondary}>Login is mocked, not secure authentication. The phone number stays in local demo storage on this device. Don’t use sensitive information.</Label></Card>
  </Screen>;
}
export function OTPScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'OTP'>) {
  const theme = useTheme(); const { run } = useNetwork(); const { login } = useApp();
  const [code, setCode] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState(Date.now() + MOCK.resendSeconds * 1000); const [seconds, setSeconds] = useState(MOCK.resendSeconds);
  useEffect(() => { const timer = setInterval(() => setSeconds(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))), 500); return () => clearInterval(timer); }, [resendAt]);
  const verify = async () => {
    if (busy) return; setError(''); setBusy(true);
    try { await run(() => mockApi.verifyOtp(route.params.phone, code)); login(route.params.phone); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  const resend = async () => {
    if (busy || seconds > 0) return;
    setBusy(true); setError('');
    try { await run(() => mockApi.sendOtp(route.params.phone)); setResendAt(Date.now() + MOCK.resendSeconds * 1000); setSeconds(MOCK.resendSeconds); setCode(''); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return <Screen><TopBar title="Verify number" onBack={() => navigation.goBack()} /><View style={{ marginVertical: 20, gap: 20 }}><Pill text="02 / 02 · VERIFICATION" /><Heading subtitle={`Demo verification for ${route.params.phone}. No SMS was sent.`}>You’re almost there.</Heading></View>
    <Field label="6-digit demo code" value={code} onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, MOCK.otpLength))} keyboardType="number-pad" maxLength={MOCK.otpLength} autoComplete="sms-otp" textContentType="oneTimeCode" placeholder="• • • • • •" editable={!busy} style={{ textAlign: 'center', fontSize: 30, letterSpacing: 10, height: 80 }} />
    <Card style={{ backgroundColor: theme.tint }}><Label color={theme.primaryText} weight="700">Demo code: {MOCK.otp}</Label><Label size={12} color={theme.secondary}>Valid for 5 minutes. App restarted? Tap resend to create a fresh demo challenge.</Label><Button title="Fill demo code" variant="ghost" onPress={() => setCode(MOCK.otp)} disabled={busy} /></Card>
    {!!error && <ErrorCard message={error} />}<Button title="Verify & continue" loading={busy} disabled={code.length !== MOCK.otpLength} onPress={() => { void verify(); }} /><Pressable accessibilityRole="button" disabled={seconds > 0 || busy} onPress={() => { void resend(); }} style={{ padding: 16 }}><Label color={theme.primaryText} weight="600" style={{ textAlign: 'center' }}>{seconds > 0 ? `Resend demo code in ${seconds}s` : 'Resend demo code'}</Label></Pressable>
  </Screen>;
}
