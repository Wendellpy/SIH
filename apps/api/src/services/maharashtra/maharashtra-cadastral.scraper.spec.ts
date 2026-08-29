import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { MaharashtraCadastralScraper } from './maharashtra-cadastral.scraper.js';
import { jurisdictionScraper } from './maharashtra-jurisdiction.scraper.js';

vi.mock('axios');
vi.mock('./maharashtra-jurisdiction.scraper.js', () => ({
  jurisdictionScraper: {
    getDistricts: vi.fn(),
    getTalukas: vi.fn(),
    getVillages: vi.fn()
  }
}));

describe('MaharashtraCadastralScraper', () => {
  let scraper: MaharashtraCadastralScraper;

  beforeEach(() => {
    vi.resetAllMocks();
    scraper = new MaharashtraCadastralScraper();
    
    vi.mocked(jurisdictionScraper.getDistricts).mockResolvedValue({ success: true, data: [{ id: '1', name: 'MockDistrict' }] } as any);
    vi.mocked(jurisdictionScraper.getTalukas).mockResolvedValue({ success: true, data: [{ id: '2', name: 'MockTaluka' }] } as any);
    vi.mocked(jurisdictionScraper.getVillages).mockResolvedValue({ success: true, data: [{ id: '3', name: 'MockVillage' }] } as any);
  });

  it('1. Correct district + taluka + village + survey → success', async () => {
    // Mock CTSSUB verification
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: `<option value="0">- Select -</option><option value="45A">45A</option>`
    });
    // Mock getAllData
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: [{ v_type: 'D', saja_name: 'Test Saja', off_name: 'Test Off' }]
    });

    const result = await scraper.getParcel('1', '2', '3', '45A');

    expect(result.success).toBe(true);
    expect(result.parcel?.district?.name).toBe('MockDistrict');
    expect(result.parcel?.taluka?.name).toBe('MockTaluka');
    expect(result.parcel?.village?.name).toBe('MockVillage');
    expect(result.parcel?.surveyNumber).toBe('45A');
  });

  it('2. Correct survey number but WRONG village → PARCEL_NOT_VERIFIED', async () => {
    // Mock CTSSUB returning different options, not including 45A
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: `<option value="0">- Select -</option><option value="123">123</option>`
    });

    const result = await scraper.getParcel('1', '2', 'WRONG_VILLAGE', '45A');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PARCEL_NOT_VERIFIED');
  });

  it('5. Government returns only office information but CTSSUB is empty -> PARCEL_NOT_VERIFIED', async () => {
    // Even if getAllData returns office info, if CTSSUB is empty, it fails verification
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: `<option value="0">- Select -</option>`
    });

    const result = await scraper.getParcel('1', '2', '3', '123');
    
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PARCEL_NOT_VERIFIED');
  });

  it('6. Government returns empty response -> PARCEL_NOT_FOUND', async () => {
    // CTSSUB verifies it
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: `<option value="0">- Select -</option><option value="45A">45A</option>`
    });
    // But getAllData returns empty
    vi.mocked(axios.post).mockResolvedValueOnce({ data: [] });

    const result = await scraper.getParcel('1', '2', '3', '45A');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('PARCEL_NOT_FOUND');
  });

  it('7. Government service unavailable → UPSTREAM_UNAVAILABLE', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network timeout'));

    const result = await scraper.getParcel('1', '2', '3', '45A');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('8. Valid parcel but no geometry → success + GEOMETRY_UNAVAILABLE', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: `<option value="0">- Select -</option><option value="45A">45A</option>`
    });
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: [{ v_type: 'D', saja_name: 'Test Saja' }]
    });

    const result = await scraper.getParcel('1', '2', '3', '45A');

    expect(result.success).toBe(true);
    expect(result.geometryStatus).toBe('GEOMETRY_UNAVAILABLE');
    expect(result.geometry).toBeNull();
  });
});
