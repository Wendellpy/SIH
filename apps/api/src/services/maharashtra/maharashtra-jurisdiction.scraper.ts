import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import qs from 'qs';
import { Logger } from '../../utils/logger'; // assuming a logger exists, if not console

export interface JurisdictionItem {
  id: string;
  name: string;
  source: 'maharashtra-government';
}

export interface CachedResponse {
  source: 'maharashtra-government';
  cached: boolean;
  stale?: boolean;
  cachedAt: Date;
  expiresAt: Date;
  data: JurisdictionItem[];
}

export class MaharashtraJurisdictionScraper {
  private cache: NodeCache;
  private readonly baseUrl = 'https://mahavillages.mahabhumi.gov.in/mahvil_urban_surverynumbers_ajaxprosearch_epcis.php';

  constructor() {
    const ttlSeconds = parseInt(process.env.MAHARASHTRA_JURISDICTION_CACHE_TTL || '86400', 10);
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
  }

  private async fetchHtmlOptions(data: Record<string, string>): Promise<JurisdictionItem[]> {
    try {
      const response = await axios.post(
        this.baseUrl,
        qs.stringify(data),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000
        }
      );

      const $ = cheerio.load(response.data);
      const items: JurisdictionItem[] = [];

      $('option').each((i, el) => {
        const id = $(el).attr('value');
        let name = $(el).text().trim();
        if (id && id !== '0' && id !== '' && !name.includes('Select')) {
          items.push({
            id: id,
            name: name,
            source: 'maharashtra-government'
          });
        }
      });

      return items;
    } catch (error: any) {
      console.error(`[MaharashtraJurisdictionScraper] Error fetching data:`, error.message);
      throw error;
    }
  }

  public async getDistricts(): Promise<CachedResponse> {
    const cacheKey = 'districts';
    return this.getOrFetch(cacheKey, () => this.fetchHtmlOptions({ action: 'dist' }));
  }

  public async getTalukas(districtId: string): Promise<CachedResponse> {
    const cacheKey = `talukas:${districtId}`;
    return this.getOrFetch(cacheKey, () => this.fetchHtmlOptions({ action: 'T', lgddistrict: districtId }));
  }

  public async getVillages(districtId: string, talukaId: string): Promise<CachedResponse> {
    const cacheKey = `villages:${talukaId}`;
    return this.getOrFetch(cacheKey, () => this.fetchHtmlOptions({ action: 'V', lgddistrict: districtId, lgdTaluka: talukaId }));
  }

  private async getOrFetch(cacheKey: string, fetcher: () => Promise<JurisdictionItem[]>): Promise<CachedResponse> {
    const cachedData = this.cache.get<{ data: JurisdictionItem[], cachedAt: Date, expiresAt: Date }>(cacheKey);
    
    if (cachedData) {
      return {
        source: 'maharashtra-government',
        cached: true,
        cachedAt: cachedData.cachedAt,
        expiresAt: cachedData.expiresAt,
        data: cachedData.data
      };
    }

    try {
      const data = await fetcher();
      if (data.length === 0) {
        throw new Error("No data returned from portal");
      }
      const ttl = this.cache.options.stdTTL || 86400;
      const cachedAt = new Date();
      const expiresAt = new Date(Date.now() + ttl * 1000);
      
      this.cache.set(cacheKey, { data, cachedAt, expiresAt });
      
      return {
        source: 'maharashtra-government',
        cached: false,
        cachedAt,
        expiresAt,
        data
      };
    } catch (e: any) {
       // if we have stale data, we could return it here if node-cache didn't delete it, 
       // but node-cache deletes expired keys. 
       // Let's implement a fallback pattern if needed, but for now we throw UPSTREAM_UNAVAILABLE
       const err: any = new Error('UPSTREAM_UNAVAILABLE');
       err.code = 'UPSTREAM_UNAVAILABLE';
       throw err;
    }
  }

  public async invalidateCache(scope?: string, id?: string) {
    if (!scope) {
      this.cache.flushAll();
    } else if (scope === 'districts') {
      this.cache.del('districts');
    } else if (scope === 'talukas' && id) {
      this.cache.del(`talukas:${id}`);
    } else if (scope === 'villages' && id) {
      this.cache.del(`villages:${id}`);
    }
    return { success: true, message: 'Cache invalidated' };
  }
}

export const jurisdictionScraper = new MaharashtraJurisdictionScraper();
