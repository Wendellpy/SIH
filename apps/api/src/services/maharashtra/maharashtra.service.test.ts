import { describe, it, expect, vi } from 'vitest';
import { MaharashtraService } from './maharashtra.service.js';
import { jurisdictionScraper } from './maharashtra-jurisdiction.scraper.js';

vi.mock('./maharashtra-jurisdiction.scraper.js', () => ({
  jurisdictionScraper: {
    getDistricts: vi.fn().mockResolvedValue({ source: 'maharashtra-government', cached: false, data: [] }),
    getTalukas: vi.fn().mockRejectedValue(Object.assign(new Error('UPSTREAM_UNAVAILABLE'), { code: 'UPSTREAM_UNAVAILABLE' })),
    getVillages: vi.fn()
  }
}));

describe('MaharashtraService', () => {
  const service = new MaharashtraService();

  it('should return health status', async () => {
    const health = await service.getHealth();
    expect(health.success).toBe(true);
    expect(health.services.districts).toBeDefined();
  });

  it('should return mock districts when mock mode is enabled', async () => {
    process.env.MAHARASHTRA_USE_MOCK_DATA = 'true';
    const res = await service.getDistricts();
    expect(res.success).toBe(true);
    expect(res.source).toBe('mock');
    expect(res.data).toHaveLength(1);
    expect(res.data![0].name).toBe('Mumbai Suburban');
  });

  it('should return scraper data when mock mode is disabled', async () => {
    process.env.MAHARASHTRA_USE_MOCK_DATA = 'false';
    const res = await service.getDistricts();
    expect(res.success).toBe(true);
    expect(res.source).toBe('maharashtra-government');
  });

  it('should handle scraper failure', async () => {
    process.env.MAHARASHTRA_USE_MOCK_DATA = 'false';
    await expect(service.getTalukas('D01')).rejects.toThrow('UPSTREAM_UNAVAILABLE');
  });

  it('should handle missing ULPIN API contract', async () => {
    process.env.MAHARASHTRA_USE_MOCK_DATA = 'false';
    const res = await service.getUlpin('MH123456789');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('should test SOAP RoR fallback to UNAVAILABLE', async () => {
    process.env.MAHARASHTRA_USE_MOCK_DATA = 'false';
    // This will hit the real .svc endpoint without valid auth/schema and return a SOAP fault or unavailable
    const res = await service.getRoR('D01', 'T01', 'V01', 'SV-123');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('UPSTREAM_UNAVAILABLE');
  });
});
