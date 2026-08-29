import { MaharashtraRestAdapter } from './maharashtra-rest.adapter.js';
import { MaharashtraSoapAdapter } from './maharashtra-soap.adapter.js';
import { ApiResult, District, Taluka, Village, ULPINDetails, ParcelDetails, RoRRecord, MutationRecord } from './maharashtra.types.js';
import { jurisdictionScraper } from './maharashtra-jurisdiction.scraper.js';

import { cadastralScraper } from './maharashtra-cadastral.scraper.js';

export class MaharashtraService {
  private restAdapter: MaharashtraRestAdapter;
  private soapAdapter: MaharashtraSoapAdapter;

  constructor() {
    this.restAdapter = new MaharashtraRestAdapter();
    this.soapAdapter = new MaharashtraSoapAdapter();
  }

  private isMockMode(): boolean {
    return process.env.MAHARASHTRA_USE_MOCK_DATA === 'true';
  }

  async getHealth(): Promise<any> {
    const isMock = this.isMockMode();
    return {
      success: true,
      mode: isMock ? 'MOCK_DATA' : 'LIVE_GOVERNMENT_DATA',
      services: {
        districts: 'available',
        ulpin: 'available',
        ror: 'available',
        mutation: 'unavailable',
        parcelGeometry: 'available'
      }
    };
  }

  async getDistricts(): Promise<any> {
    if (this.isMockMode()) {
      return {
        success: true,
        source: 'mock',
        data: [{ id: 'D01', name: 'Mumbai Suburban', sourceId: 'MH-MUM-SUB' }]
      };
    }
    const result = await jurisdictionScraper.getDistricts();
    return { success: true, ...result };
  }

  async getTalukas(districtId: string): Promise<any> {
    if (this.isMockMode()) {
      return {
        success: true,
        source: 'mock',
        data: [{ id: 'T01', districtId, name: 'Andheri', sourceId: 'MH-MUM-AND' }]
      };
    }
    const result = await jurisdictionScraper.getTalukas(districtId);
    return { success: true, ...result };
  }

  async getVillages(districtId: string, talukaId: string): Promise<any> {
    if (this.isMockMode()) {
      return {
        success: true,
        source: 'mock',
        data: [{ id: 'V01', talukaId, name: 'Bandra', sourceId: 'MH-MUM-BAN' }]
      };
    }
    const result = await jurisdictionScraper.getVillages(districtId, talukaId);
    return { success: true, ...result };
  }

  async refreshJurisdictionCache(scope?: string, id?: string): Promise<any> {
    return jurisdictionScraper.invalidateCache(scope, id);
  }

  async getUlpin(ulpin: string): Promise<ApiResult<ULPINDetails>> {
    if (this.isMockMode()) {
      return {
        success: true,
        source: 'mock',
        data: {
          ulpin,
          district: 'Mumbai Suburban',
          taluka: 'Andheri',
          village: 'Bandra',
          surveyNumber: 'SV-1234',
          geometry: null
        }
      };
    }
    return this.restAdapter.getUlpin(ulpin);
  }

  async getParcel(district: string, taluka: string, village: string, cts: string): Promise<any> {
    if (this.isMockMode()) {
      return {
        success: true,
        source: 'mock',
        data: {
          identifier: cts,
          attributes: { area: '1000 sqm', owner: 'Mock Owner' }
        },
        geometryStatus: 'GEOMETRY_UNAVAILABLE'
      };
    }
    return cadastralScraper.getParcel(district, taluka, village, cts);
  }

  async getRoR(district: string, taluka: string, village: string, survey: string): Promise<ApiResult<RoRRecord>> {
    if (this.isMockMode()) {
      return {
        success: true,
        source: 'mock',
        data: {
          surveyNumber: survey,
          owners: ['John Doe'],
          areaSqm: 500,
          status: 'ACTIVE'
        }
      };
    }
    return this.soapAdapter.getRoR(district, taluka, village, survey);
  }

  async getMutation(mutationId: string): Promise<ApiResult<MutationRecord>> {
    if (this.isMockMode()) {
      return {
        success: true,
        source: 'mock',
        data: {
          mutationId,
          ulpin: 'MH123456789012',
          status: 'PENDING',
          details: {}
        }
      };
    }
    return this.soapAdapter.getMutation(mutationId);
  }
}

export const maharashtraService = new MaharashtraService();
