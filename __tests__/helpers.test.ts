import { MOCK, SERVICES } from '../src/data/mockData';
import { normalizePhone, positionAt, quoteFor, routeFor, validCoordinate } from '../src/lib/helpers';

describe('Nigerian phone normalization', () => {
  // Synthetic test values are not provider or emergency contact fixtures and are never dialled.
  test.each([
    ['08000000000', '+2348000000000'],
    ['+234 800 000 0000', '+2348000000000'],
    ['8000000000', '+2348000000000'],
    ['23408000000000', '+2348000000000'],
  ])('%s normalizes', (input, output) => expect(normalizePhone(input)).toBe(output));
  test.each(['', '123', '+14445556666', '06000000000', '080000000000'])('%s is rejected', input => expect(normalizePhone(input)).toBeNull());
});
describe('quotes', () => {
  test.each(SERVICES)('$name includes dispatch once', service => {
    const quote = quoteFor(service.id);
    expect(quote.base).toBe(service.basePrice);
    expect(quote.dispatch).toBe(MOCK.dispatchFee);
    expect(quote.total).toBe(service.basePrice + MOCK.dispatchFee);
  });
});
describe('simulated route', () => {
  const destination = MOCK.location;
  test('starts at the first offset', () => expect(positionAt(destination, 0)).toEqual(routeFor(destination)[0]));
  test('ends at pickup', () => expect(positionAt(destination, 1)).toEqual(destination));
  test('clamps progress safely', () => {
    expect(positionAt(destination, -1)).toEqual(positionAt(destination, 0));
    expect(positionAt(destination, 2)).toEqual(destination);
  });
  test('intermediate points are valid coordinates', () => {
    const middle = positionAt(destination, 0.5);
    expect(Number.isFinite(middle.latitude)).toBe(true);
    expect(Number.isFinite(middle.longitude)).toBe(true);
  });
});
describe('coordinate validation', () => {
  test('accepts zero coordinates', () => expect(validCoordinate('0', '0')).toEqual({ latitude: 0, longitude: 0 }));
  test.each([['', '3'], ['6', ''], ['91', '3'], ['6', '181'], ['NaN', '3']])('rejects %s,%s', (lat, lng) => expect(validCoordinate(lat, lng)).toBeNull());
});
