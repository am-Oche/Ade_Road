import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useNetwork } from '../state/NetworkContext';
import { useApp } from '../state/AppContext';
export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme(); return <Feather name={name} size={size} color={color ?? theme.text} />;
}
export function Label({ children, size = 15, weight = '400', color, style, ...rest }: { children: React.ReactNode; size?: number; weight?: TextStyle['fontWeight']; color?: string; style?: StyleProp<TextStyle>; numberOfLines?: number; accessibilityRole?: 'header' | 'text' }) {
  const theme = useTheme();
  return <Text {...rest} style={[{ fontSize: size, lineHeight: size * 1.42, color: color ?? theme.text, fontWeight: weight }, style]}>{children}</Text>;
}
export function Heading({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  const theme = useTheme();
  return <View style={{ gap: 7 }}><Label size={28} weight="700" accessibilityRole="header" style={{ letterSpacing: -0.8 }}>{children}</Label>{subtitle && <Label color={theme.secondary}>{subtitle}</Label>}</View>;
}
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[{ backgroundColor: theme.card, borderRadius: 22, borderWidth: 1, borderColor: theme.border, padding: 20, gap: 14 }, style]}>{children}</View>;
}
export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>;
}
export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent'; icon?: IconName; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const background = variant === 'primary' ? theme.primary : variant === 'danger' ? theme.danger : variant === 'accent' ? theme.accent : variant === 'secondary' ? theme.tint : 'transparent';
  const color = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : variant === 'accent' ? theme.accentText : theme.primaryText;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [{ minHeight: 54, paddingHorizontal: 17, paddingVertical: 14, backgroundColor: background, borderRadius: 15, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }, style]}>
    <Row style={{ justifyContent: 'center' }}>{loading ? <ActivityIndicator color={color} /> : icon ? <Icon name={icon} size={19} color={color} /> : null}<Label weight="700" color={color} style={{ flexShrink: 1, textAlign: 'center' }}>{title}</Label></Row>
  </Pressable>;
}
export function IconButton({ icon, label, onPress, danger = false }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  const theme = useTheme();
  return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ width: 46, height: 46, borderRadius: 16, backgroundColor: danger ? theme.dangerTint : theme.card, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}><Icon name={icon} color={danger ? theme.danger : theme.text} /></Pressable>;
}
export function Pill({ text, icon, tone = 'green' }: { text: string; icon?: IconName; tone?: 'green' | 'amber' | 'neutral' }) {
  const theme = useTheme();
  return <Row style={{ alignSelf: 'flex-start', maxWidth: '100%', flexShrink: 1, gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, backgroundColor: tone === 'amber' ? theme.accent : tone === 'neutral' ? theme.background : theme.tint }}>
    {icon && <Icon name={icon} size={12} color={tone === 'amber' ? theme.accentText : theme.primaryText} />}<Label size={10} weight="800" color={tone === 'amber' ? theme.accentText : tone === 'neutral' ? theme.secondary : theme.primaryText} style={{ letterSpacing: 0.8, flexShrink: 1 }}>{text}</Label>
  </Row>;
}
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const theme = useTheme();
  return <View style={{ gap: 8 }}><Label size={13} weight="600">{label}</Label><TextInput accessibilityLabel={label} placeholderTextColor={theme.secondary} {...props} style={[{ borderWidth: 1, borderColor: error ? theme.danger : theme.border, backgroundColor: theme.card, color: theme.text, borderRadius: 14, padding: 16, minHeight: 55, fontSize: 16, textAlignVertical: props.multiline ? 'top' : 'center' }, props.style]} />{error && <Label size={12} color={theme.dangerText}>{error}</Label>}</View>;
}
export function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();
  return <View accessibilityLiveRegion="polite" style={{ backgroundColor: theme.dangerTint, borderRadius: 16, padding: 16, gap: 10 }}><Row><Icon name="alert-circle" color={theme.danger} /><Label color={theme.dangerText} size={13} style={{ flex: 1 }}>{message}</Label></Row>{onRetry && <Button title="Try again" variant="secondary" onPress={onRetry} icon="refresh-cw" />}</View>;
}
export function NetworkBanner() {
  const theme = useTheme();
  const { offline, simulateOffline, refresh } = useNetwork();
  const { storageError, retrySave } = useApp();
  return <>{offline && <Pressable onPress={() => { void refresh(); }} accessibilityRole="button" accessibilityLabel="Offline. Tap to check connection" style={{ backgroundColor: theme.accent, padding: 10 }}><Row style={{ justifyContent: 'center' }}><Icon name="wifi-off" size={16} color={theme.accentText} /><Label size={12} color={theme.accentText} weight="600" style={{ flexShrink: 1 }}>{simulateOffline ? 'Demo offline mode · turn off in Settings' : 'Offline · saved data available · tap to retry'}</Label></Row></Pressable>}{!!storageError && <Pressable onPress={() => { void retrySave(); }} style={{ backgroundColor: theme.dangerTint, padding: 10 }}><Label size={12} color={theme.dangerText}>Local save failed. Tap to retry. Don’t close the app yet.</Label></Pressable>}</>;
}
export function Screen({ children, scroll = true, style }: { children: React.ReactNode; scroll?: boolean; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme(); const insets = useSafeAreaInsets();
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}><NetworkBanner /><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ padding: 22, paddingBottom: 32 + insets.bottom, gap: 22, flexGrow: 1 }, style]}>{children}</ScrollView> : <View style={[{ flex: 1 }, style]}>{children}</View>}
  </KeyboardAvoidingView></SafeAreaView>;
}
export function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return <Row style={{ minHeight: 46 }}>{onBack && <IconButton icon="arrow-left" label="Go back" onPress={onBack} />}<Label size={17} weight="700" style={{ flex: 1 }}>{title}</Label>{right}</Row>;
}
export function Divider() { const theme = useTheme(); return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border }} />; }
export function Skeleton({ height = 100, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme(); const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true })]));
    animation.start(); return () => animation.stop();
  }, [opacity]);
  return <Animated.View accessibilityLabel="Loading" style={[{ height, borderRadius: 20, backgroundColor: theme.skeleton, opacity }, style]} />;
}
export function EmptyState({ icon = 'inbox', title, body, action }: { icon?: IconName; title: string; body: string; action?: React.ReactNode }) {
  const theme = useTheme();
  return <Card style={{ alignItems: 'center', paddingVertical: 36 }}><Icon name={icon} size={34} color={theme.primaryText} /><Label size={20} weight="700">{title}</Label><Label color={theme.secondary} style={{ textAlign: 'center' }}>{body}</Label>{action}</Card>;
}
