import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemeMode } from './types';

const light = {
  background: '#F6F8F6', card: '#FFFFFF', text: '#182A21', secondary: '#68776E', border: '#E3EAE4',
  primary: '#0B6B3A', primaryText: '#0B6B3A', tint: '#E9F3EC', accent: '#FFB400', accentText: '#493600',
  danger: '#E5322D', dangerText: '#B42320', dangerTint: '#FFF0EE', skeleton: '#E5EBE6', mapOverlay: '#FFFFFF', dark: false,
};
const dark: typeof light = {
  background: '#101A15', card: '#1B2A21', text: '#F4F8F5', secondary: '#B0C0B6', border: '#304237',
  primary: '#0B6B3A', primaryText: '#70DEA0', tint: '#203D2C', accent: '#FFB400', accentText: '#231A00',
  danger: '#E5322D', dangerText: '#FF9690', dangerTint: '#422522', skeleton: '#304237', mapOverlay: '#1B2A21', dark: true,
};
export type Theme = typeof light;
const ThemeContext = createContext<Theme>(light);
export function AppThemeProvider({ mode, children }: { mode: ThemeMode; children: React.ReactNode }) {
  const system = useColorScheme();
  return <ThemeContext.Provider value={(mode === 'system' ? system === 'dark' : mode === 'dark') ? dark : light}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
export const spacing = { xs: 6, sm: 12, md: 18, lg: 24, xl: 32 };

// Google Maps on Android uses custom styles; Apple Maps uses userInterfaceStyle.
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#192A20' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#B3C6B9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#101A15' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#364F40' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#50634F' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#102D34' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
