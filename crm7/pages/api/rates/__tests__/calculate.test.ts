import { NextRequest } from 'next/server';
import calculateHandler from '../calculate';

describe('calculate handler', () => {
  it('should calculate rates', async () => {
    const req = new NextRequest('http://localhost:3000/api/rates/calculate', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Rate',
        baseRate: 25.0,
        baseMargin: 1.5,
        superRate: 0.1,
        effectiveFrom: '2024-01-01',
        orgId: 'test-org',
        hours: 38,
        date: '2024-01-01',
      }),
    });

    const response = await calculateHandler(req);
    expect(response.status).toBe(200);
  });

  it('should handle validation errors', async () => {
    const req = new NextRequest('http://localhost:3000/api/rates/calculate', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
      }),
    });

    const response = await calculateHandler(req);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle internal errors', async () => {
    const req = new NextRequest('http://localhost:3000/api/rates/calculate', {
      method: 'POST',
      body: JSON.stringify({
        orgId: 'invalid-org',
        name: 'Test Rate',
        templateType: 'hourly',
        baseRate: -1, // Invalid value
        baseMargin: 1.5,
        superRate: 0.1,
        effectiveFrom: '2024-01-01',
      }),
    });

    const response = await calculateHandler(req);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
