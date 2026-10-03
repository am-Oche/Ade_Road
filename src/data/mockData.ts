import type { Coordinate, EmergencyContact, ProviderJob, RoadRequest, Service, Settings } from '../types';

/** ALL demo fixtures and simulation parameters live here. Never use these as real dispatch data. */
export const MOCK = {
  appName: 'AdeRoad', // Placeholder until your friend's company name is supplied. Also update app.json.
  otp: '123456',
  otpLength: 6,
  otpExpiresMs: 5 * 60 * 1000,
  resendSeconds: 30,
  latencyMs: 1000,
  trackingTickMs: 1300,
  trackingSteps: 50,
  initialEtaMinutes: 8,
  dispatchFee: 1500,
  paymentLabel: 'DEMO PAYMENT · NO MONEY MOVES',
  dispatchLabel: 'SIMULATED DISPATCH',
  location: { latitude: 6.4281, longitude: 3.4219 } as Coordinate,
  locationLabel: 'Victoria Island, Lagos',
  vehicleHint: 'e.g. Toyota Corolla · grey · ABC 123 XY',
  provider: {
    name: 'Tunde A.',
    initials: 'TA',
    role: 'Roadside specialist',
    rating: '4.9',
    jobs: 128,
    vehicle: 'Service van · DEMO 01',
    phone: '', // Deliberately blank: never dial an invented phone number. Configure a consenting test number in Settings.
  },
  // Relative waypoints terminate at the customer's selected coordinate. Animation is NOT road routing.
  routeOffsets: [
    { latitude: -0.014, longitude: -0.018 },
    { latitude: -0.011, longitude: -0.018 },
    { latitude: -0.011, longitude: -0.010 },
    { latitude: -0.005, longitude: -0.010 },
    { latitude: -0.005, longitude: 0 },
    { latitude: 0, longitude: 0 },
  ] as Coordinate[],
  transfer: { bank: 'Demo Bank (not a real bank)', account: 'DEMO-ACCOUNT', beneficiary: 'AdeRoad Simulation' },
  supportNote: 'This prototype does not dispatch real help. For immediate danger, contact local emergency services directly.',
};

export const SERVICES: Service[] = [
  { id: 'tow', name: 'Tow truck', description: 'A safe ride for your vehicle', icon: 'truck', basePrice: 18000, eta: '8–15 min' },
  { id: 'battery', name: 'Jump start', description: 'Get your battery going', icon: 'zap', basePrice: 6500, eta: '5–12 min' },
  { id: 'tyre', name: 'Flat tyre', description: 'A little help with a flat', icon: 'disc', basePrice: 5000, eta: '8–15 min' },
  { id: 'fuel', name: 'Fuel delivery', description: 'Enough to get moving again', icon: 'droplet', basePrice: 7500, eta: '10–20 min' },
  { id: 'mechanic', name: 'Engine trouble', description: 'A mechanic at your location', icon: 'tool', basePrice: 12000, eta: '10–20 min' },
  { id: 'lockout', name: 'Car lockout', description: 'Help getting back inside', icon: 'key', basePrice: 10000, eta: '8–18 min' },
];

export const INITIAL_HISTORY: RoadRequest[] = [
  {
    id: 'DEMO-2401', serviceId: 'battery', createdAt: '2026-09-25T10:20:00.000Z', completedAt: '2026-09-25T10:45:00.000Z',
    location: MOCK.location, locationLabel: 'Lekki Phase 1, Lagos', locationSource: 'demo', vehicle: 'Toyota Corolla · grey',
    notes: 'Example request', quote: { base: 6500, dispatch: 1500, total: 8000 }, status: 'completed', progress: 1, paymentMethod: 'transfer', rating: 5,
  },
  {
    id: 'DEMO-2402', serviceId: 'tyre', createdAt: '2026-09-19T13:10:00.000Z', completedAt: '2026-09-19T13:40:00.000Z',
    location: MOCK.location, locationLabel: 'Victoria Island, Lagos', locationSource: 'demo', vehicle: 'Toyota Corolla · grey',
    notes: 'Example request', quote: { base: 5000, dispatch: 1500, total: 6500 }, status: 'completed', progress: 1, paymentMethod: 'cash', rating: 4,
  },
];

export const INITIAL_PROVIDER_JOBS: ProviderJob[] = [
  { id: 'JOB-DEMO-01', customer: 'Chidi O.', serviceId: 'battery', distance: '1.8 km', locationLabel: 'Adeola Odeku St, Victoria Island', vehicle: 'Honda Accord · silver', earnings: 6500, status: 'incoming' },
  { id: 'JOB-DEMO-02', customer: 'Amaka E.', serviceId: 'mechanic', distance: '3.2 km', locationLabel: 'Admiralty Way, Lekki', vehicle: 'Toyota Camry · black', earnings: 12000, status: 'incoming' },
];

export const INITIAL_CONTACTS: EmergencyContact[] = []; // User supplies real emergency contacts; none are invented.
export const DEFAULT_SETTINGS: Settings = { theme: 'system', providerMode: false, emergencyContacts: INITIAL_CONTACTS, providerContactPhone: MOCK.provider.phone };
