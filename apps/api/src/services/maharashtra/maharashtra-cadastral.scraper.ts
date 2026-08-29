import axios from 'axios';
import NodeCache from 'node-cache';
import qs from 'qs';
import { ApiResult, ParcelDetails } from './maharashtra.types.js';
import { jurisdictionScraper } from './maharashtra-jurisdiction.scraper.js';
import { geometryResolver, GeometryStatus } from './maharashtra-geometry.resolver.js';

export interface CadastralResponse extends ApiResult<ParcelDetails> {
  geometryStatus?: GeometryStatus;
  geometryMetadata?: any;
  geometry?: any;
  parcel?: any;
}

export class MaharashtraCadastralScraper {
  private cache: NodeCache;
  private readonly baseUrl = 'https://mahavillages.mahabhumi.gov.in/mahvil_urban_surverynumbers_ajaxprosearch_epcis.php';

  constructor() {
    const ttlSeconds = parseInt(process.env.MAHARASHTRA_PARCEL_CACHE_TTL || '86400', 10);
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
  }

  public async getParcel(districtId: string, talukaId: string, villageId: string, cts: string): Promise<CadastralResponse> {
    const cacheKey = `${districtId}:${talukaId}:${villageId}:${cts}`;
    const cachedData = this.cache.get<CadastralResponse>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      // 1. Verify that the parcel exists for this specific District, Taluka, and Village
      const verifyResponse = await axios.post(
        this.baseUrl,
        qs.stringify({
          lgddistrict: districtId,
          lgdTaluka: talukaId,
          lgdVillage: villageId,
          ctsno: cts,
          action: 'CTSSUB'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 15000
        }
      );

      const html = verifyResponse.data;
      if (typeof html !== 'string') {
        return {
          success: false,
          source: 'maharashtra-government',
          error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Invalid response from government service.' }
        };
      }

      // 2. Parse the HTML to check if the CTS is in the dropdown options
      const regex = /<option value="([^"]+)">([^<]+)<\/option>/g;
      let match;
      let verified = false;
      let availableOptions = 0;
      
      while ((match = regex.exec(html)) !== null) {
        const value = match[1];
        if (value !== '0' && value !== '') {
          availableOptions++;
          if (value === cts) {
            verified = true;
            break;
          }
        }
      }

      if (!verified) {
        if (availableOptions === 0 && html.includes('Select ctsno')) {
          // It returned a valid dropdown but our CTS wasn't in it (and it might be empty except for the placeholder)
          // Wait, if it's not in the dropdown but options exist, it's not verified for this location
        }
        
        // As per instructions, if we can't verify it against the selected location, return PARCEL_NOT_VERIFIED
        const notVerified: CadastralResponse = {
          success: false,
          source: 'maharashtra-government',
          error: { code: 'PARCEL_NOT_VERIFIED', message: 'Government response could not be verified against the selected location and parcel identifier.' }
        };
        // Don't cache verification failures for long
        this.cache.set(cacheKey, notVerified, 300);
        return notVerified;
      }

      // 3. We have confirmed the parcel exists in the official records. Fetch its attributes.
      const dataResponse = await axios.post(
        this.baseUrl,
        qs.stringify({
          lgddistrict: districtId,
          lgdTaluka: talukaId,
          lgdVillage: villageId,
          ctsnosub: cts,
          action: 'getAllData'
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      let recordData = dataResponse.data;
      if (typeof recordData === 'string') {
        try {
          recordData = JSON.parse(recordData);
        } catch(e) {
          recordData = [];
        }
      }

      if (!Array.isArray(recordData) || recordData.length === 0) {
        const notFound: CadastralResponse = {
          success: false,
          source: 'maharashtra-government',
          error: { code: 'PARCEL_NOT_FOUND', message: 'Parcel record could not be retrieved.' }
        };
        this.cache.set(cacheKey, notFound, 300);
        return notFound;
      }

      // 4. Resolve official names from the Jurisdiction scraper cache
      const districtsRes = await jurisdictionScraper.getDistricts();
      const districtName = districtsRes.data?.find(d => d.id === districtId)?.name || '';

      const talukasRes = await jurisdictionScraper.getTalukas(districtId);
      const talukaName = talukasRes.data?.find(t => t.id === talukaId)?.name || '';

      const villagesRes = await jurisdictionScraper.getVillages(districtId, talukaId);
      const villageName = villagesRes.data?.find(v => v.id === villageId)?.name || '';

      // 5. Construct final response without fabricating geometry
      // The government portal only returns SRO office information for this endpoint.
      // As requested, we preserve all official attributes returned by the government service.
      
      // Resolve geometry using the dedicated resolver
      const geometryResult = await geometryResolver.resolveGeometry(districtId, talukaId, villageId, cts, districtName, talukaName, villageName);

      const successData: CadastralResponse = {
        success: true,
        source: {
          landRecords: 'maharashtra-government',
          geometry: geometryResult.source || 'unavailable'
        } as any,
        parcel: {
          district: { id: districtId, name: districtName },
          taluka: { id: talukaId, name: talukaName },
          village: { id: villageId, name: villageName },
          surveyNumber: cts,
          attributes: recordData[0] 
        },
        data: {
          identifier: cts,
          attributes: recordData[0]
        },
        geometry: geometryResult.geometry || null,
        geometryStatus: geometryResult.status,
        geometryMetadata: geometryResult.metadata
      };

      this.cache.set(cacheKey, successData);
      return successData;

    } catch (error: any) {
      console.error(`[MaharashtraCadastralScraper] Error fetching parcel:`, error.message);
      
      return {
        success: false,
        source: 'maharashtra-government',
        error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Maharashtra government cadastral service is currently unavailable.' }
      };
    }
  }
}

export const cadastralScraper = new MaharashtraCadastralScraper();
