import { describe, it, expect } from 'vitest';
import { parseUlpin3D, formatUlpin3D } from '@sih/shared-types';
import { ulpinService } from '../src/services/ulpin.service.js';
import { db } from '../src/database/store.js';

describe('3D ULPIN Specification & Generator Tests', () => {
  it('should format 3D ULPIN according to DoLR standard', () => {
    const formatted = formatUlpin3D('MH13BOM04521873', 'A', 3, 'B302');
    expect(formatted).toBe('MH13BOM04521873.A+03-B302');

    const basementFormatted = formatUlpin3D('MH13BOM04521873', 'U', -2, 'PKG201');
    expect(basementFormatted).toBe('MH13BOM04521873.U-02-PKG201');

    const groundFormatted = formatUlpin3D('MH13BOM04521873', 'G', 0, 'LOB01');
    expect(groundFormatted).toBe('MH13BOM04521873.G00-LOB01');
  });

  it('should parse 3D ULPIN correctly', () => {
    const parsed = parseUlpin3D('MH13BOM04521873.A+03-B302');
    expect(parsed).not.toBeNull();
    expect(parsed?.baseUlpin).toBe('MH13BOM04521873');
    expect(parsed?.domainCode).toBe('A');
    expect(parsed?.levelCode).toBe('+03');
    expect(parsed?.levelNumber).toBe(3);
    expect(parsed?.unitCode).toBe('B302');
  });

  it('should resolve full 3D hierarchy for a unit', () => {
    const resolved = ulpinService.resolve('MH13BOM04521873.A+02-201');
    expect(resolved).not.toBeNull();
    expect(resolved?.unit).toBeDefined();
    expect(resolved?.unit?.validationStatus).toBe('CONFLICT');
    expect(resolved?.building).toBeDefined();
    expect(resolved?.parcel).toBeDefined();
    expect(resolved?.undergroundAssets?.length).toBeGreaterThan(0);
  });

  it('should perform universal search across units, parcels, buildings, and utilities', () => {
    const results = ulpinService.search('BKC');
    expect(results.length).toBeGreaterThan(0);

    const waterResults = ulpinService.search('WATER_SUPPLY');
    expect(waterResults.length).toBeGreaterThan(0);
  });

  it('should record immutable audit logs on mutation', () => {
    const initialLogCount = db.getAuditLogs().length;
    db.logAudit({
      actor: 'Tester',
      actorRole: 'SURVEYOR',
      action: 'UPDATE',
      entityType: 'PARCEL',
      entityId: 'test-parcel-01',
      summary: 'Automated test mutation'
    });
    const newLogs = db.getAuditLogs();
    expect(newLogs.length).toBe(initialLogCount + 1);
    expect(newLogs[0].hashSignature).toBeDefined();
    expect(newLogs[0].hashSignature.length).toBe(64); // SHA-256 length
  });
});
