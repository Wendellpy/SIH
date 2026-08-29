import { XMLParser } from 'fast-xml-parser';
import { ApiResult, RoRRecord, MutationRecord } from './maharashtra.types.js';

export class MaharashtraSoapAdapter {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true
    });
  }

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

  async getRoR(district: string, taluka: string, village: string, survey: string): Promise<ApiResult<RoRRecord>> {
    try {
      const url = 'https://ehakk.mahabhumi.gov.in/DSPRoRServiceRest/RoRDspService.svc';
      
      // We cannot guess the exact SOAP Action or Payload without schema definitions,
      // but we will attempt a standard connection to the endpoint to detect availability.
      // If the service doesn't respond to our mock envelope, we return UNAVAILABLE.
      const soapEnvelope = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
           <soapenv:Header/>
           <soapenv:Body>
              <tem:GetRoR>
                 <tem:District>${district}</tem:District>
                 <tem:Taluka>${taluka}</tem:Taluka>
                 <tem:Village>${village}</tem:Village>
                 <tem:SurveyNo>${survey}</tem:SurveyNo>
              </tem:GetRoR>
           </soapenv:Body>
        </soapenv:Envelope>`;

      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'http://tempuri.org/IRoRDspService/GetRoR'
        },
        body: soapEnvelope
      });

      if (!response.ok) {
        return {
          success: false,
          source: 'maharashtra-government',
          error: { code: 'UPSTREAM_UNAVAILABLE', message: 'API contract for RoR is missing WSDL definitions or requires authentication.' }
        };
      }

      const xmlText = await response.text();
      const jsonObj = this.parser.parse(xmlText);

      if (jsonObj.Envelope?.Body?.Fault) {
        return {
          success: false,
          source: 'maharashtra-government',
          error: { code: 'UPSTREAM_UNAVAILABLE', message: 'SOAP Fault returned by upstream.' }
        };
      }

      return {
        success: false,
        source: 'maharashtra-government',
        error: { code: 'UPSTREAM_UNAVAILABLE', message: 'API contract for RoR is incomplete.' }
      };
    } catch (err) {
      return {
        success: false,
        source: 'maharashtra-government',
        error: { code: 'UPSTREAM_UNAVAILABLE', message: 'The Maharashtra government service is unavailable.' }
      };
    }
  }

  async getMutation(mutationId: string): Promise<ApiResult<MutationRecord>> {
    return {
      success: false,
      source: 'maharashtra-government',
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'API contract for Mutation is unknown.' }
    };
  }
}
