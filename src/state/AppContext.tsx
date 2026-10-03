import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState as NativeAppState } from 'react-native';
import { DEFAULT_SETTINGS, INITIAL_HISTORY, INITIAL_PROVIDER_JOBS, MOCK } from '../data/mockData';
import { errorMessage } from '../lib/helpers';
import { mockApi } from '../services/mockApi';
import type { PaymentMethod, ProviderJob, RequestDraft, RoadRequest, Settings } from '../types';
import { useNetwork } from './NetworkContext';

type StoredState = { version: 1; phone: string | null; settings: Settings; requests: RoadRequest[]; jobs: ProviderJob[] };
type AppState = {
  ready: boolean; loadError: string; storageError: string; phone: string | null;
  settings: Settings; requests: RoadRequest[]; jobs: ProviderJob[]; activeRequest?: RoadRequest;
  reload: () => Promise<void>; retrySave: () => Promise<void>; reset: () => Promise<void>;
  login: (phone: string) => void; logout: () => void; updateSettings: (patch: Partial<Settings>) => void;
  createRequest: (draft: RequestDraft) => Promise<RoadRequest>;
  cancelRequest: (id: string) => void;
  completeRequest: (id: string, method: PaymentMethod) => Promise<void>;
  rateRequest: (id: string, rating: number, review: string) => void;
  updateJob: (id: string, action: 'accepted' | 'declined' | 'completed') => Promise<void>;
  resetJobs: () => void;
};
const STORAGE_KEY = '@aderoad/demo/v1';
const initial = (): StoredState => ({ version: 1, phone: null, settings: { ...DEFAULT_SETTINGS, emergencyContacts: [] }, requests: INITIAL_HISTORY.map(item => ({ ...item })), jobs: INITIAL_PROVIDER_JOBS.map(item => ({ ...item })) });
const AppContext = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(initial);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [foreground, setForeground] = useState(NativeAppState.currentState === 'active');
  const { run, offline } = useNetwork();
  const stateRef = useRef(state);
  const bookingLock = useRef(false);
  const paymentLock = useRef(false);
  const jobLocks = useRef(new Set<string>());
  const writeQueue = useRef<Promise<void>>(Promise.resolve());
  stateRef.current = state;
  const save = useCallback((snapshot: StoredState) => {
    const next = writeQueue.current.catch(() => {}).then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)));
    writeQueue.current = next;
    return next.then(() => setStorageError('')).catch(error => { setStorageError(`Could not save on this phone: ${errorMessage(error)}`); });
  }, []);
  const reload = useCallback(async () => {
    setLoadError('');
    setReady(false);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState;
        if (parsed.version !== 1 || !Array.isArray(parsed.requests) || !Array.isArray(parsed.jobs) || !parsed.settings || !Array.isArray(parsed.settings.emergencyContacts)) throw new Error('Saved demo data is incompatible. Reset local data to continue.');
        setState({ ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } });
      } else setState(initial());
      setReady(true);
    } catch (error) { setLoadError(errorMessage(error)); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => { void save(state); }, 250);
    return () => clearTimeout(timer);
  }, [state, ready, save]);
  useEffect(() => {
    const subscription = NativeAppState.addEventListener('change', status => {
      setForeground(status === 'active');
      if (ready && status !== 'active') void save(stateRef.current);
    });
    return () => subscription.remove();
  }, [ready, save]);
  useEffect(() => {
    if (!ready || offline || !state.phone || !foreground) return;
    const interval = setInterval(() => {
      setState(current => {
        if (!current.requests.some(request => request.status === 'en_route')) return current;
        return { ...current, requests: current.requests.map((request): RoadRequest => {
          if (request.status !== 'en_route') return request;
          const progress = Math.min(1, request.progress + 1 / MOCK.trackingSteps);
          return { ...request, progress, status: progress >= 1 ? 'arrived' : 'en_route' };
        }) };
      });
    }, MOCK.trackingTickMs);
    return () => clearInterval(interval);
  }, [offline, ready, state.phone, foreground]);
  const updateSettings = (patch: Partial<Settings>) => setState(current => ({ ...current, settings: { ...current.settings, ...patch } }));
  const createRequest = async (draft: RequestDraft) => {
    if (bookingLock.current) throw new Error('Your request is already being created.');
    bookingLock.current = true;
    try {
      if (stateRef.current.requests.some(item => ['en_route', 'arrived'].includes(item.status))) throw new Error('You already have an active request. Open it from Home.');
      const request = await run(() => mockApi.createRequest(draft));
      setState(current => ({ ...current, requests: [request, ...current.requests] }));
      return request;
    } finally { bookingLock.current = false; }
  };
  const completeRequest = async (id: string, method: PaymentMethod) => {
    if (paymentLock.current) throw new Error('Payment is already processing.');
    paymentLock.current = true;
    try {
      await run(() => {
        const request = stateRef.current.requests.find(item => item.id === id);
        if (!request) throw new Error('Request not found.');
        if (request.status === 'completed') return; // Idempotent in this local demo.
        if (request.status !== 'arrived') throw new Error('Wait for the simulated provider to arrive first.');
        setState(current => ({ ...current, requests: current.requests.map((item): RoadRequest => item.id === id ? { ...item, status: 'completed', paymentMethod: method, completedAt: new Date().toISOString() } : item) }));
      });
    } finally { paymentLock.current = false; }
  };
  const updateJob = async (id: string, action: 'accepted' | 'declined' | 'completed') => {
    if (jobLocks.current.has(id)) return;
    jobLocks.current.add(id);
    try {
      await run(() => {
        const job = stateRef.current.jobs.find(item => item.id === id);
        if (!job || (action === 'completed' ? job.status !== 'accepted' : job.status !== 'incoming')) throw new Error('This job has already changed.');
        setState(current => ({ ...current, jobs: current.jobs.map((item): ProviderJob => item.id === id ? { ...item, status: action } : item) }));
      });
    } finally { jobLocks.current.delete(id); }
  };
  const reset = async () => {
    await writeQueue.current.catch(() => {});
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(initial()); setLoadError(''); setStorageError(''); setReady(true);
  };
  return <AppContext.Provider value={{
    ready, loadError, storageError, ...state,
    activeRequest: state.requests.find(request => request.status === 'en_route' || request.status === 'arrived'),
    reload, reset, retrySave: () => save(stateRef.current),
    login: phone => setState(current => ({ ...current, phone })), logout: () => setState(current => ({ ...current, phone: null })),
    updateSettings, createRequest, completeRequest, updateJob,
    resetJobs: () => setState(current => ({ ...current, jobs: mockApi.listProviderJobs() })),
    cancelRequest: id => setState(current => ({ ...current, requests: current.requests.map((request): RoadRequest => request.id === id && ['en_route', 'arrived'].includes(request.status) ? { ...request, status: 'cancelled' } : request) })),
    rateRequest: (id, rating, review) => setState(current => ({ ...current, requests: current.requests.map((request): RoadRequest => request.id === id && request.status === 'completed' ? { ...request, rating: Math.max(1, Math.min(5, rating)), review } : request) })),
  }}>{children}</AppContext.Provider>;
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('AppProvider is missing');
  return value;
}
