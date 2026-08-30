import { ApiResult, District, Taluka, Village, ULPINDetails, ParcelDetails } from './maharashtra.types.js';

export class MaharashtraRestAdapter {
  private async fetchWithTimeout(url: string, options: any, timeoutMs = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('UPSTREAM_TIMEOUT');
      }
      throw err;
    }
  }

  async getDistricts(): Promise<ApiResult<District[]>> {
    try {
      // In a real scenario, this would parse the HTML or call the hidden API.
      // Since it's an HTML portal and GetState is a POST without known contract,
      // we implement the adapter interface and throw an error to trigger mock or UNAVAILABLE response.
      const res = await this.fetchWithTimeout('https://mahavillages.mahabhumi.gov.in/', {});
      if (!res.ok) throw new Error('HTTP_ERROR');
      
      return {
        success: false,
        source: 'maharashtra-government',
        error: { code: 'UPSTREAM_UNAVAILABLE', message: 'API contract for districts is unknown (HTML only).' }
      };
    } catch (err) {
      return {
        success: false,
        source: 'maharashtra-government',
        error: { code: 'UPSTREAM_UNAVAILABLE', message: 'The Maharashtra government service is unavailable.' }
      };
    }
  }

  async getTalukas(districtId: string): Promise<ApiResult<Taluka[]>> {
    return {
      success: false,
      source: 'maharashtra-government',
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'API contract for talukas is unknown.' }
    };
  }

  async getVillages(talukaId: string): Promise<ApiResult<Village[]>> {
    return {
      success: false,
      source: 'maharashtra-government',
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'API contract for villages is unknown.' }
    };
  }

  async getUlpin(ulpin: string): Promise<ApiResult<ULPINDetails>> {
    return {
      success: false,
      source: 'maharashtra-government',
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'API contract for ULPIN is unknown.' }
    };
  }

  async getParcel(district: string, taluka: string, village: string, cts: string): Promise<ApiResult<ParcelDetails>> {
    return {
      success: false,
      source: 'maharashtra-government',
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'No official geometry service found.' }
    };
  }
}
