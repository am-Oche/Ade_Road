import { MOCK, SERVICES } from '../data/mockData';
import type { Coordinate, Quote, ServiceId } from '../types';

export const money = (value: number) => `₦${Math.round(value).toLocaleString('en-NG')}`;
export const serviceFor = (id: ServiceId) => SERVICES.find(service => service.id === id)!;
export function normalizePhone(input: string): string | null {
  if (!/^[+\d\s().-]+$/.test(input.trim())) return null;
  let digits = input.replace(/[^0-9]/g, '');
  if (digits.startsWith('234')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^[789]\d{9}$/.test(digits) ? `+234${digits}` : null;
}
export const quoteFor = (id: ServiceId): Quote => ({ base: serviceFor(id).basePrice, dispatch: MOCK.dispatchFee, total: serviceFor(id).basePrice + MOCK.dispatchFee });
export const dateLabel = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const mapLink = (point: Coordinate) => `https://maps.google.com/?q=${point.latitude},${point.longitude}`;
export function routeFor(destination: Coordinate): Coordinate[] {
  return MOCK.routeOffsets.map(offset => ({ latitude: destination.latitude + offset.latitude, longitude: destination.longitude + offset.longitude }));
}
export function positionAt(destination: Coordinate, progress: number): Coordinate {
  if (progress >= 1) return { ...destination };
  const route = routeFor(destination);
  const scaled = Math.max(0, Math.min(1, progress)) * (route.length - 1);
  const index = Math.min(Math.floor(scaled), route.length - 2);
  const from = route[index]!;
  const to = route[index + 1]!;
  const fraction = scaled - index;
  return { latitude: from.latitude + (to.latitude - from.latitude) * fraction, longitude: from.longitude + (to.longitude - from.longitude) * fraction };
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';
export function validCoordinate(latitude: string, longitude: string): Coordinate | null {
  if (!latitude.trim() || !longitude.trim()) return null;
  const lat = Number(latitude), lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { latitude: lat, longitude: lng } : null;
}
