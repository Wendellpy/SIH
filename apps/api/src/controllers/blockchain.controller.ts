import { Request, Response, Router } from 'express';
import { blockchainService } from '../services/blockchain.service.js';

export const blockchainRouter = Router();

/**
 * POST /api/v1/blockchain/register
 * Register a 3D unit on the LandLedger smart contract
 */
blockchainRouter.post('/blockchain/register', async (req: Request, res: Response) => {
  try {
    let { ulpin, unitId } = req.body;

    if (!ulpin || typeof ulpin !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid field: ulpin is required and must be a string'
      });
    }

    if (!unitId && ulpin.includes('.')) {
      const parts = ulpin.split('.');
      ulpin = parts[0];
      unitId = parts[1];
    }

    if (!unitId || typeof unitId !== 'string') {
      unitId = 'G00-LOB01';
    }

    const result = await blockchainService.registerProperty(ulpin, unitId);

    return res.status(201).json({
      status: 'success',
      data: {
        ulpin: result.ulpin,
        unitId: result.unitId,
        recordHash: result.recordHash,
        geometryHash: result.geometryHash,
        transactionHash: result.transactionHash
      }
    });
  } catch (error: any) {
    console.error('Blockchain registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Internal server error while registering on blockchain'
    });
  }
});

/**
 * GET /api/v1/blockchain/verify/:ulpin
 * Verify property record against on-chain LandLedger smart contract
 */
blockchainRouter.get('/blockchain/verify/:ulpin', async (req: Request, res: Response) => {
  try {
    const { ulpin } = req.params;
    const unitId = req.query.unitId as string | undefined;

    if (!ulpin) {
      return res.status(400).json({
        status: 'error',
        message: 'ULPIN parameter is required'
      });
    }

    const result = await blockchainService.verifyProperty(ulpin, unitId);

    if (!result.foundInDb) {
      return res.status(404).json({
        status: 'error',
        message: `Property with ULPIN ${ulpin} not found in database`
      });
    }

    return res.json({
      ulpin: result.ulpin,
      verified: result.verified,
      status: result.status,
      currentHash: result.currentHash,
      blockchainHash: result.blockchainHash,
      transactionHash: result.transactionHash || null
    });
  } catch (error: any) {
    console.error('Blockchain verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Internal server error during blockchain verification'
    });
  }
});
