import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Icon, Label, Pill, Button, Skeleton } from './ui';
import { DARK_MAP_STYLE, useTheme } from '../theme';
import { useNetwork } from '../state/NetworkContext';
import { positionAt, routeFor } from '../lib/helpers';
import type { Coordinate } from '../types';

export function TrackingMap({ destination, progress = 0, height = 285, showProvider = true }: { destination: Coordinate; progress?: number; height?: number; showProvider?: boolean }) {
  const theme = useTheme(); const { offline } = useNetwork();
  const ref = useRef<MapView>(null);
  const [ready, setReady] = useState(false); const [loaded, setLoaded] = useState(false); const [timedOut, setTimedOut] = useState(false); const [key, setKey] = useState(0);
  useEffect(() => { setReady(false); setLoaded(false); setTimedOut(false); }, [offline, key]);
  useEffect(() => {
    if (offline || loaded) return;
    const timer = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [key, offline, loaded]);
  const fit = () => {
    if (showProvider) ref.current?.fitToCoordinates(routeFor(destination), { edgePadding: { top: 70, left: 45, bottom: 45, right: 45 }, animated: true });
    else ref.current?.animateToRegion({ ...destination, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 500);
  };
  useEffect(() => { if (ready) fit(); }, [destination.latitude, destination.longitude, ready]);
  if (offline) return <View style={{ height, backgroundColor: theme.tint, borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 25, gap: 12 }}><Icon name="wifi-off" size={32} color={theme.primaryText} /><Label weight="700">Map unavailable offline</Label><Label size={12} color={theme.secondary} style={{ textAlign: 'center' }}>Pickup: {destination.latitude.toFixed(5)}, {destination.longitude.toFixed(5)}{showProvider ? '\nSimulation paused. Reconnect to continue.' : ''}</Label></View>;
  return <View style={{ height, borderRadius: 24, overflow: 'hidden', backgroundColor: theme.skeleton }}>
    <MapView key={key} ref={ref} style={{ flex: 1 }} userInterfaceStyle={theme.dark ? 'dark' : 'light'} customMapStyle={theme.dark ? DARK_MAP_STYLE : []} initialRegion={{ ...destination, latitudeDelta: 0.036, longitudeDelta: 0.036 }} onMapReady={() => { setReady(true); }} onMapLoaded={() => { setLoaded(true); setTimedOut(false); }} toolbarEnabled={false} accessibilityLabel={showProvider ? 'Simulated provider location map' : 'Pickup location map'}>
      {showProvider && <Polyline coordinates={routeFor(destination)} strokeWidth={5} strokeColor={theme.primary} />}
      <Marker coordinate={destination} title="Pickup location" description="Confirm that this is your pickup point"><View style={{ backgroundColor: theme.primary, borderRadius: 22, padding: 9, borderWidth: 3, borderColor: '#FFFFFF' }}><Icon name="map-pin" size={20} color="#FFFFFF" /></View></Marker>
      {showProvider && <Marker coordinate={positionAt(destination, progress)} title="Simulated provider" description="Animation only · not real GPS"><View style={{ backgroundColor: theme.accent, borderRadius: 14, padding: 9, borderWidth: 3, borderColor: '#FFFFFF' }}><Icon name="truck" color={theme.accentText} size={22} /></View></Marker>}
    </MapView>
    <View pointerEvents="none" style={{ position: 'absolute', top: 15, left: 15, right: 15 }}><Pill text={showProvider ? 'SIMULATED ROUTE · NOT LIVE GPS' : 'CONFIRM YOUR PICKUP POINT'} tone="amber" /></View>
    <View style={{ position: 'absolute', bottom: 12, right: 12 }}><Button title="Centre" icon="crosshair" variant="secondary" onPress={fit} style={{ minHeight: 40, paddingVertical: 8 }} /></View>
    {!loaded && <View style={{ position: 'absolute', top: 58, left: 14, right: 14, backgroundColor: theme.card, padding: 12, borderRadius: 12, gap: 8 }}>{!timedOut && <Skeleton height={20} />}<Label size={12}>{timedOut ? 'Map is taking longer than usual. Your request is still available.' : 'Loading map…'}</Label>{timedOut && <Button title="Retry map" variant="secondary" onPress={() => { setKey(value => value + 1); }} />}</View>}
  </View>;
}
