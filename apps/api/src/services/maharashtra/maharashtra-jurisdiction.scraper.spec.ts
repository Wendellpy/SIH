import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { jurisdictionScraper } from './maharashtra-jurisdiction.scraper.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('MaharashtraJurisdictionScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    jurisdictionScraper.invalidateCache();
  });

  it('should parse districts correctly from HTML', async () => {
    const mockHtml = `
      <select id="lgdDistrict">
        <option value="0">- - - Select District- - - </option>
        <option value="5">Akola</option>
        <option value="7">Amravati</option>
      </select>
    `;
    mockedAxios.post.mockResolvedValueOnce({ data: mockHtml });

    const result = await jurisdictionScraper.getDistricts();
    expect(result.success).toBeUndefined(); // Wrapped externally
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('5');
    expect(result.data[0].name).toBe('Akola');
    expect(result.source).toBe('maharashtra-government');
    expect(result.cached).toBe(false);
  });

  it('should return cached data on second call', async () => {
    const mockHtml = `<option value="5">Akola</option>`;
    mockedAxios.post.mockResolvedValueOnce({ data: mockHtml });

    await jurisdictionScraper.getDistricts();
    const result2 = await jurisdictionScraper.getDistricts();
    
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(result2.cached).toBe(true);
    expect(result2.data[0].name).toBe('Akola');
  });

  it('should parse talukas correctly', async () => {
    const mockHtml = `
      <option value="0">- - - Select Taluka- - - </option>
      <option value="0501">Akot</option>
    `;
    mockedAxios.post.mockResolvedValueOnce({ data: mockHtml });

    const result = await jurisdictionScraper.getTalukas('5');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('0501');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('action=T'),
      expect.any(Object)
    );
  });

  it('should parse villages correctly', async () => {
    const mockHtml = `
      <option value="0">- - - Select Village- - - </option>
      <option value="2345">Shirpur</option>
    `;
    mockedAxios.post.mockResolvedValueOnce({ data: mockHtml });

    const result = await jurisdictionScraper.getVillages('5', '0501');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('2345');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('action=V'),
      expect.any(Object)
    );
  });

  it('should throw UPSTREAM_UNAVAILABLE on failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    
    await expect(jurisdictionScraper.getDistricts()).rejects.toThrow('UPSTREAM_UNAVAILABLE');
  });
});
