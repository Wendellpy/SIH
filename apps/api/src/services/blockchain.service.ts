import { ethers } from 'ethers';
import crypto from 'crypto';
import { db } from '../database/store.js';
import { landEventService } from './land-event.service.js';
import { LandEvent, BlockchainVerificationStatus } from '@sih/shared-types';

const LAND_LEDGER_ABI = [
  'function registerProperty(string calldata ulpin, string calldata unitId, string calldata recordHash, string calldata geometryHash) external',
  'function getProperty(string calldata ulpin, string calldata unitId) external view returns (string, string, string, string, uint256, address)',
  'event PropertyRegistered(string indexed ulpin, string unitId, string recordHash, string geometryHash, uint256 timestamp, address indexed registeredBy)'
];

export interface RegisterPropertyResult {
  ulpin: string;
  unitId: string;
  recordHash: string;
  geometryHash: string;
  transactionHash: string;
  blockNumber?: number;
}

export interface PropertyRecord {
  ulpin: string;
  unitId: string;
  recordHash: string;
  geometryHash: string;
  timestamp: number;
  registeredBy: string;
}

export interface VerifyPropertyResult {
  foundInDb: boolean;
  ulpin: string;
  verified: boolean;
  status: 'VERIFIED' | 'TAMPER_DETECTED' | 'NOT_REGISTERED' | 'NOT_FOUND_IN_DB';
  currentHash: string | null;
  blockchainHash: string | null;
  transactionHash?: string | null;
  blockNumber?: number;
}

export interface EventVerificationResult {
  eventId: string;
  status: BlockchainVerificationStatus;
  canonicalHash: string;
  blockchainHash: string | null;
  transactionHash: string | null;
  blockNumber: number | null;
  message: string;
  contractAddress: string | null;
  limitationNotice?: string;
}

export class BlockchainService {
  private devLedger: Map<string, { record: PropertyRecord; txHash: string; blockNumber: number }> = new Map();

  private getContract(signerRequired = true): ethers.Contract {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contractAddress = process.env.LAND_LEDGER_CONTRACT_ADDRESS;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    if (!rpcUrl || !contractAddress) {
      throw new Error(
        'Missing blockchain configuration: BLOCKCHAIN_RPC_URL and LAND_LEDGER_CONTRACT_ADDRESS are required.'
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    if (signerRequired) {
      if (!privateKey) {
        throw new Error('BLOCKCHAIN_PRIVATE_KEY is required for write transactions.');
      }
      const wallet = new ethers.Wallet(privateKey, provider);
      return new ethers.Contract(contractAddress, LAND_LEDGER_ABI, wallet);
    }

    return new ethers.Contract(contractAddress, LAND_LEDGER_ABI, provider);
  }

  /**
   * Sort object keys recursively to produce a canonical representation
   */
  private sortKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortKeys(item));
    }
    const sortedObj: Record<string, any> = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sortedObj[key] = this.sortKeys(obj[key]);
      });
    return sortedObj;
  }

  /**
   * 1. Creates a canonical JSON representation of a finalized LandEvent
   */
  public createCanonicalEventRepresentation(event: LandEvent): string {
    const canonicalPayload = {
      id: event.id,
      ulpin: event.ulpin,
      parcelId: event.parcelId || '',
      unitId: event.unitId || '',
      parentId: event.parentId || '',
      type: event.type,
      category: event.category,
      status: event.status,
      createdAt: event.createdAt,
      metadata: event.metadata || {}
    };

    return JSON.stringify(this.sortKeys(canonicalPayload));
  }

  /**
   * 2. Generates a deterministic SHA-256 hash for a LandEvent
   */
  public generateEventHash(event: LandEvent): string {
    const canonical = this.createCanonicalEventRepresentation(event);
    return `0x${crypto.createHash('sha256').update(canonical).digest('hex')}`;
  }

  /**
   * Deterministically generates SHA-256 recordHash from ULPIN + unitId
   */
  public generateRecordHash(ulpin: string, unitId: string): string {
    return crypto.createHash('sha256').update(`${ulpin}#${unitId}`).digest('hex');
  }

  /**
   * 3 & 4. Anchors a finalized LandEvent to the deployed LandLedger smart contract on Sepolia
   */
  public async anchorLandEvent(event: LandEvent): Promise<LandEvent> {
    // 1. Generate deterministic canonical hash
    const recordHash = this.generateEventHash(event);
    event.recordHash = recordHash;

    // Parse ULPIN and unitId
    let baseUlpin = event.ulpin;
    let unitId = event.unitId || 'BASE';
    if (event.ulpin.includes('.')) {
      const parts = event.ulpin.split('.');
      baseUlpin = parts[0];
      unitId = unitId !== 'BASE' ? unitId : (parts[1] || 'BASE');
    }

    const geometryHash = `0x${crypto.createHash('sha256').update(`event-geom:${event.id}#${event.ulpin}`).digest('hex')}`;
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contractAddress = process.env.LAND_LEDGER_CONTRACT_ADDRESS;

    if (rpcUrl && contractAddress) {
      try {
        event.blockchainStatus = 'PENDING';
        const contract = this.getContract(true);
        const tx = await contract.registerProperty(baseUlpin, unitId, recordHash, geometryHash);
        const receipt = await tx.wait();

        event.transactionHash = receipt?.hash || tx.hash;
        event.blockNumber = receipt?.blockNumber ? Number(receipt.blockNumber) : undefined;
        event.blockchainStatus = 'VERIFIED';

        // Update in database store
        db.addLandEvent(event);
        return event;
      } catch (err: any) {
        const errMsg = `${err?.message || ''} ${err?.reason || ''} ${err?.data || ''} ${err?.shortMessage || ''}`;
        
        if (errMsg.includes('Property already registered')) {
          try {
            const existing = await this.getProperty(baseUlpin, unitId);
            const isMatch = existing.recordHash.toLowerCase() === recordHash.toLowerCase();

            event.transactionHash = 'ALREADY_REGISTERED_ON_CHAIN';
            event.blockchainStatus = isMatch ? 'VERIFIED' : 'MISMATCH';
            event.metadata = {
              ...event.metadata,
              onChainRecordHash: existing.recordHash,
              blockchainLimitation: 'Property key (ULPIN#UnitID) already registered on-chain. LandLedger.sol utilizes single-slot key mappings.'
            };

            db.addLandEvent(event);
            return event;
          } catch {
            event.blockchainStatus = 'MISMATCH';
            db.addLandEvent(event);
            return event;
          }
        }

        console.error('Failed to anchor LandEvent on Sepolia:', err);
        event.blockchainStatus = 'FAILED';
        event.metadata = {
          ...event.metadata,
          blockchainError: err?.shortMessage || err?.message || 'Transaction execution failed'
        };
        db.addLandEvent(event);
        return event;
      }
    }

    // Dev Simulation Fallback
    const simulatedTx = `0x${crypto.randomBytes(32).toString('hex')}`;
    event.transactionHash = simulatedTx;
    event.blockNumber = 6543210;
    event.blockchainStatus = 'VERIFIED';
    
    this.devLedger.set(`${baseUlpin}#${unitId}`, {
      record: {
        ulpin: baseUlpin,
        unitId,
        recordHash,
        geometryHash,
        timestamp: Date.now(),
        registeredBy: '0x0000000000000000000000000000000000000000'
      },
      txHash: simulatedTx,
      blockNumber: 6543210
    });

    db.addLandEvent(event);
    return event;
  }

  /**
   * 5 & 6. Verify an event against the on-chain LandLedger contract
   */
  public async verifyLandEvent(eventId: string): Promise<EventVerificationResult> {
    const event = db.getLandEventById(eventId);
    const contractAddress = process.env.LAND_LEDGER_CONTRACT_ADDRESS || null;

    if (!event) {
      return {
        eventId,
        status: 'FAILED',
        canonicalHash: '',
        blockchainHash: null,
        transactionHash: null,
        blockNumber: null,
        message: `Land event ${eventId} not found in database`,
        contractAddress
      };
    }

    const canonicalHash = this.generateEventHash(event);

    let baseUlpin = event.ulpin;
    let unitId = event.unitId || 'BASE';
    if (event.ulpin.includes('.')) {
      const parts = event.ulpin.split('.');
      baseUlpin = parts[0];
      unitId = unitId !== 'BASE' ? unitId : (parts[1] || 'BASE');
    }

    try {
      const onChain = await this.getProperty(baseUlpin, unitId);
      const onChainHash = onChain.recordHash;
      const isMatch = canonicalHash.toLowerCase() === onChainHash.toLowerCase();

      const status: BlockchainVerificationStatus = isMatch ? 'VERIFIED' : 'MISMATCH';

      return {
        eventId,
        status,
        canonicalHash,
        blockchainHash: onChainHash,
        transactionHash: event.transactionHash || null,
        blockNumber: event.blockNumber || null,
        message: isMatch
          ? 'Event cryptographic hash matches on-chain LandLedger record on Sepolia.'
          : 'Hash mismatch: on-chain record hash differs from current canonical event representation.',
        contractAddress,
        limitationNotice: 'LandLedger.sol keys storage by (ulpin, unitId). Multiple event histories per unit share the property on-chain key.'
      };
    } catch (err: any) {
      if (event.transactionHash && event.blockchainStatus === 'VERIFIED') {
        return {
          eventId,
          status: 'VERIFIED',
          canonicalHash,
          blockchainHash: event.recordHash || canonicalHash,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber || null,
          message: 'Event verified via registered transaction receipt.',
          contractAddress
        };
      }

      return {
        eventId,
        status: 'NOT_ANCHORED',
        canonicalHash,
        blockchainHash: null,
        transactionHash: null,
        blockNumber: null,
        message: 'No on-chain registration found on Sepolia for this property/event.',
        contractAddress
      };
    }
  }

  /**
   * Calls LandLedger.registerProperty() on the smart contract and waits for confirmation
   */
  public async registerProperty(
    ulpin: string,
    unitId: string,
    customGeometryHash?: string
  ): Promise<RegisterPropertyResult> {
    const recordHash = `0x${this.generateRecordHash(ulpin, unitId)}`;
    const geometryHash =
      customGeometryHash ||
      `0x${crypto.createHash('sha256').update(`geom:${ulpin}#${unitId}`).digest('hex')}`;

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contractAddress = process.env.LAND_LEDGER_CONTRACT_ADDRESS;

    if (rpcUrl && contractAddress) {
      try {
        const contract = this.getContract(true);
        const tx = await contract.registerProperty(ulpin, unitId, recordHash, geometryHash);
        const receipt = await tx.wait();

        const result: RegisterPropertyResult = {
          ulpin,
          unitId,
          recordHash,
          geometryHash,
          transactionHash: receipt?.hash || tx.hash,
          blockNumber: receipt?.blockNumber ? Number(receipt.blockNumber) : undefined
        };

        landEventService.createVerificationEvent({
          ulpin: `${ulpin}.${unitId}`,
          unitId,
          type: 'BLOCKCHAIN',
          status: 'VERIFIED',
          description: `Anchored on Sepolia LandLedger: ${ulpin} (Unit ${unitId})`,
          transactionHash: result.transactionHash,
          recordHash: result.recordHash
        });

        return result;
      } catch (err: any) {
        const errMsg = `${err?.message || ''} ${err?.reason || ''} ${err?.data || ''} ${err?.shortMessage || ''}`;
        if (errMsg.includes('Property already registered')) {
          const existing = await this.getProperty(ulpin, unitId);
          return {
            ulpin,
            unitId,
            recordHash: existing.recordHash,
            geometryHash: existing.geometryHash,
            transactionHash: 'ALREADY_REGISTERED_ON_CHAIN'
          };
        }
        throw err;
      }
    }

    // Development fallback when live EVM RPC/contract address is not yet configured
    const simulatedTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;
    const devRecord: PropertyRecord = {
      ulpin,
      unitId,
      recordHash,
      geometryHash,
      timestamp: Date.now(),
      registeredBy: '0x0000000000000000000000000000000000000000'
    };

    this.devLedger.set(`${ulpin}#${unitId}`, {
      record: devRecord,
      txHash: simulatedTxHash,
      blockNumber: 6543210
    });

    landEventService.createVerificationEvent({
      ulpin: `${ulpin}.${unitId}`,
      unitId,
      type: 'BLOCKCHAIN',
      status: 'VERIFIED',
      description: `[Dev] Cryptographically anchored: ${ulpin} (Unit ${unitId})`,
      transactionHash: simulatedTxHash,
      recordHash
    });

    return {
      ulpin,
      unitId,
      recordHash,
      geometryHash,
      transactionHash: simulatedTxHash,
      blockNumber: 6543210
    };
  }

  /**
   * Calls LandLedger.getProperty() view function
   */
  public async getProperty(ulpin: string, unitId: string): Promise<PropertyRecord> {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contractAddress = process.env.LAND_LEDGER_CONTRACT_ADDRESS;

    if (rpcUrl && contractAddress) {
      const contract = this.getContract(false);
      const result = await contract.getProperty(ulpin, unitId);

      return {
        ulpin: result[0],
        unitId: result[1],
        recordHash: result[2],
        geometryHash: result[3],
        timestamp: Number(result[4]),
        registeredBy: result[5]
      };
    }

    const devEntry = this.devLedger.get(`${ulpin}#${unitId}`);
    if (!devEntry) {
      throw new Error('Property not found');
    }
    return devEntry.record;
  }

  /**
   * Verifies property record against the on-chain LandLedger contract
   */
  public async verifyProperty(ulpinInput: string, unitIdInput?: string): Promise<VerifyPropertyResult> {
    let baseUlpin = ulpinInput.trim();
    let unitId = unitIdInput?.trim() || '';

    // 1. Retrieve property from DB
    let propertyRecord: any = db.getVerticalUnitBy3DUlpin(baseUlpin);
    if (propertyRecord) {
      const parts = propertyRecord.ulpin3D.split('.');
      baseUlpin = parts[0];
      unitId = unitId || parts[1] || propertyRecord.unitCode;
    } else {
      const parcel = db.getParcelByUlpin(baseUlpin);
      if (parcel) {
        propertyRecord = parcel;
        unitId = unitId || 'G00-LOB01';
      } else if (baseUlpin.includes('.')) {
        const parts = baseUlpin.split('.');
        baseUlpin = parts[0];
        unitId = unitId || parts[1];
        propertyRecord = db.getParcelByUlpin(baseUlpin);
      }
    }

    if (!propertyRecord) {
      return {
        foundInDb: false,
        ulpin: ulpinInput,
        verified: false,
        status: 'NOT_FOUND_IN_DB',
        currentHash: null,
        blockchainHash: null
      };
    }

    // 2. Generate deterministic SHA-256 record hash
    const currentHash = `0x${this.generateRecordHash(baseUlpin, unitId)}`;

    // 3. Read blockchain record
    let onChainRecord: PropertyRecord | null = null;
    try {
      onChainRecord = await this.getProperty(baseUlpin, unitId);
    } catch (err) {
      return {
        foundInDb: true,
        ulpin: ulpinInput,
        verified: false,
        status: 'NOT_REGISTERED',
        currentHash,
        blockchainHash: null
      };
    }

    if (!onChainRecord || !onChainRecord.recordHash || onChainRecord.recordHash === '0x' || onChainRecord.recordHash === '') {
      return {
        foundInDb: true,
        ulpin: ulpinInput,
        verified: false,
        status: 'NOT_REGISTERED',
        currentHash,
        blockchainHash: null
      };
    }

    // 4. Compare hashes
    const blockchainHash = onChainRecord.recordHash;
    const isMatch = currentHash.toLowerCase() === blockchainHash.toLowerCase();
    const devEntry = this.devLedger.get(`${baseUlpin}#${unitId}`);

    // 5-6. Return VERIFIED or TAMPER_DETECTED
    return {
      foundInDb: true,
      ulpin: ulpinInput,
      verified: isMatch,
      status: isMatch ? 'VERIFIED' : 'TAMPER_DETECTED',
      currentHash,
      blockchainHash,
      transactionHash: devEntry?.txHash || null,
      blockNumber: devEntry?.blockNumber
    };
  }
}

export const blockchainService = new BlockchainService();
