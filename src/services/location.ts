import * as Location from 'expo-location';
import type { Coordinate } from '../types';

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Location took too long. Move into an open area and retry, or enter your pickup coordinates manually.')), milliseconds);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}
/** Foreground-only lookup. Never substitutes mock coordinates for a real SOS. */
export async function getDeviceLocation(): Promise<Coordinate> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('Location permission is off. Enable it in your phone settings or enter a pickup point manually.');
  if (!await Location.hasServicesEnabledAsync()) throw new Error('Your phone’s location services are off. Turn them on and try again.');
  const position = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 18000);
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}
