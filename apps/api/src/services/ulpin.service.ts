import { 
  DomainCode, 
  ParsedUlpin3D, 
  parseUlpin3D, 
  formatUlpin3D, 
  VerticalUnit, 
  Parcel, 
  Building, 
  UndergroundAsset 
} from '@sih/shared-types';
import { db } from '../database/store.js';

export interface UlpinResolutionResult {
  ulpin3D: string;
  parsed: ParsedUlpin3D;
  unit?: VerticalUnit;
  building?: Building;
  parcel?: Parcel;
  undergroundAssets?: UndergroundAsset[];
}

export class UlpinService {
  /**
   * Parse and validate 3D ULPIN
   */
  parse(ulpinString: string): ParsedUlpin3D | null {
    return parseUlpin3D(ulpinString);
  }

  /**
   * Format 3D ULPIN from parts
   */
  format(baseUlpin: string, domain: DomainCode, level: number, unitCode: string): string {
    return formatUlpin3D(baseUlpin, domain, level, unitCode);
  }

  /**
   * Resolve full 3D hierarchy for a 3D ULPIN
   */
  resolve(ulpin3DString: string): UlpinResolutionResult | null {
    const parsed = this.parse(ulpin3DString);
    if (!parsed) return null;

    const unit = db.getVerticalUnitBy3DUlpin(ulpin3DString);
    const parcel = db.getParcelByUlpin(parsed.baseUlpin);
    const building = unit ? db.getBuildingById(unit.buildingId) : (parcel ? db.getBuildingsByParcelId(parcel.id)[0] : undefined);
    const undergroundAssets = parcel ? db.getUndergroundAssets(parcel.id) : [];

    return {
      ulpin3D: parsed.rawString,
      parsed,
      unit,
      building,
      parcel,
      undergroundAssets
    };
  }

  /**
   * Universal Cadastral Search
   */
  search(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      type: '3D_UNIT' | 'PARCEL' | 'BUILDING' | 'UNDERGROUND';
      title: string;
      subtitle: string;
      id: string;
      ulpin: string;
      metadata: any;
    }> = [];

    // 1. Search 3D Units
    db.getVerticalUnits().forEach(u => {
      if (
        u.ulpin3D.toLowerCase().includes(q) ||
        u.unitName.toLowerCase().includes(q) ||
        u.ownerName.toLowerCase().includes(q) ||
        u.unitCode.toLowerCase().includes(q)
      ) {
        results.push({
          type: '3D_UNIT',
          title: u.unitName,
          subtitle: `3D ULPIN: ${u.ulpin3D} | Owner: ${u.ownerName}`,
          id: u.id,
          ulpin: u.ulpin3D,
          metadata: u
        });
      }
    });

    // 2. Search Parcels
    db.getParcels().forEach(p => {
      if (
        p.ulpin.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'PARCEL',
          title: `Parcel ${p.ulpin} (${p.village})`,
          subtitle: `Survey No: ${p.surveyNumber} | Area: ${p.areaSqm} sqm`,
          id: p.id,
          ulpin: p.ulpin,
          metadata: p
        });
      }
    });

    // 3. Search Buildings
    db.getBuildings().forEach(b => {
      if (b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)) {
        results.push({
          type: 'BUILDING',
          title: b.name,
          subtitle: `${b.numFloors} Floors | ${b.address}`,
          id: b.id,
          ulpin: b.id,
          metadata: b
        });
      }
    });

    // 4. Search Underground Utilities
    db.getUndergroundAssets().forEach(a => {
      if (
        a.ulpin3D.toLowerCase().includes(q) ||
        a.assetType.toLowerCase().includes(q) ||
        a.owningAgency.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'UNDERGROUND',
          title: `Underground ${a.assetType} Duct`,
          subtitle: `3D ULPIN: ${a.ulpin3D} | Depth: ${a.depthMinM}m to ${a.depthMaxM}m | Agency: ${a.owningAgency}`,
          id: a.id,
          ulpin: a.ulpin3D,
          metadata: a
        });
      }
    });

    return results.slice(0, 15);
  }
}

export const ulpinService = new UlpinService();
