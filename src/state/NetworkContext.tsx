import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { MOCK } from '../data/mockData';

type NetworkState = {
  offline: boolean;
  simulateOffline: boolean;
  setSimulateOffline: (value: boolean) => void;
  failNext: boolean;
  setFailNext: (value: boolean) => void;
  refresh: () => Promise<void>;
  run: <T>(operation: () => T | Promise<T>) => Promise<T>;
};
const NetworkContext = createContext<NetworkState | null>(null);
export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [deviceOffline, setDeviceOffline] = useState(false);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [failNext, setFailNextState] = useState(false);
  const offline = deviceOffline || simulateOffline;
  const offlineRef = useRef(offline);
  const failRef = useRef(false);
  offlineRef.current = offline;
  useEffect(() => NetInfo.addEventListener(state => setDeviceOffline(state.isConnected === false || state.isInternetReachable === false)), []);
  const setFailNext = (value: boolean) => { failRef.current = value; setFailNextState(value); };
  const refresh = async () => {
    try {
      const state = await NetInfo.fetch();
      setDeviceOffline(state.isConnected === false || state.isInternetReachable === false);
    } catch { setDeviceOffline(true); }
  };
  const run = useCallback(async <T,>(operation: () => T | Promise<T>): Promise<T> => {
    if (offlineRef.current) throw new Error('You’re offline. Reconnect, then tap retry. Your details are still here.');
    const shouldFail = failRef.current;
    if (shouldFail) { failRef.current = false; setFailNextState(false); }
    await new Promise<void>(resolve => setTimeout(resolve, MOCK.latencyMs));
    if (offlineRef.current) throw new Error('Connection lost. Reconnect and retry; nothing has been charged.');
    if (shouldFail) throw new Error('Simulated network timeout. Please try again.');
    return operation();
  }, []);
  return <NetworkContext.Provider value={{ offline, simulateOffline, setSimulateOffline, failNext, setFailNext, refresh, run }}>{children}</NetworkContext.Provider>;
}
export function useNetwork() {
  const value = useContext(NetworkContext);
  if (!value) throw new Error('NetworkProvider is missing');
  return value;
}
