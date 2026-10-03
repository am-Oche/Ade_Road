import { mockApi } from '../src/services/mockApi';
import { MOCK, SERVICES } from '../src/data/mockData';

describe('mock OTP challenges', () => {
  const phone = '+2348000000000';
  afterEach(() => jest.restoreAllMocks());
  test('requires a challenge', () => expect(() => mockApi.verifyOtp('unsent', MOCK.otp)).toThrow('expired'));
  test('accepts the demo code and consumes the challenge', () => {
    mockApi.sendOtp(phone);
    expect(mockApi.verifyOtp(phone, MOCK.otp)).toEqual({ phone });
    expect(() => mockApi.verifyOtp(phone, MOCK.otp)).toThrow('expired');
  });
  test('rejects a wrong code without consuming a challenge', () => {
    mockApi.sendOtp(phone);
    expect(() => mockApi.verifyOtp(phone, 'wrong')).toThrow('incorrect');
    expect(mockApi.verifyOtp(phone, MOCK.otp).phone).toBe(phone);
  });
  test('expires after five minutes', () => {
    jest.spyOn(Date, 'now').mockReturnValue(10000);
    mockApi.sendOtp(phone);
    jest.spyOn(Date, 'now').mockReturnValue(10000 + MOCK.otpExpiresMs + 1);
    expect(() => mockApi.verifyOtp(phone, MOCK.otp)).toThrow('expired');
  });
});
describe('request creation', () => {
  test('preserves selected pickup rather than substituting mock location', () => {
    const location = { latitude: 9.0765, longitude: 7.3986 };
    const result = mockApi.createRequest({ serviceId: SERVICES[0]!.id, location, locationSource: 'manual', locationLabel: 'Manual pickup', vehicle: 'Test vehicle', notes: '' });
    expect(result.location).toEqual(location);
    expect(result.locationSource).toBe('manual');
    expect(result.status).toBe('en_route');
    expect(result.progress).toBe(0);
    expect(result.id).toMatch(/^DEMO-/);
  });
});
