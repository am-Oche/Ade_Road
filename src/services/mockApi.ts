import { INITIAL_PROVIDER_JOBS, MOCK, SERVICES } from '../data/mockData';
import { quoteFor } from '../lib/helpers';
import type { RequestDraft, RoadRequest } from '../types';

/** Adapter seam: replace with authenticated backend methods. This is explicitly NOT secure authentication. */
const otpChallenges = new Map<string, number>();
export const mockApi = {
  sendOtp(phone: string) {
    otpChallenges.set(phone, Date.now());
    return { phone, expiresAt: Date.now() + MOCK.otpExpiresMs };
  },
  verifyOtp(phone: string, code: string) {
    const sentAt = otpChallenges.get(phone);
    if (!sentAt || Date.now() - sentAt > MOCK.otpExpiresMs) throw new Error('Demo code expired. Request a new code.');
    if (code !== MOCK.otp) throw new Error(`That code is incorrect. This demo uses ${MOCK.otp}.`);
    otpChallenges.delete(phone);
    return { phone };
  },
  listServices() { return [...SERVICES]; },
  createRequest(draft: RequestDraft): RoadRequest {
    return { ...draft, id: `DEMO-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), quote: quoteFor(draft.serviceId), status: 'en_route', progress: 0 };
  },
  listProviderJobs() { return INITIAL_PROVIDER_JOBS.map(job => ({ ...job })); },
};
