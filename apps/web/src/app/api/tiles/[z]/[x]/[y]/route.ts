import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import zlib from 'node:zlib';

function getMbtilesPath(): string {
  const envPath = process.env.MBTILES_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidatePaths = [
    'c:\\Users\\Wendell\\Downloads\\osm-2020-02-10-v3.11_india_mumbai.mbtiles',
    'C:\\Users\\Wendell\\Downloads\\osm-2020-02-10-v3.11_india_mumbai.mbtiles',
    path.join(process.cwd(), 'data', 'osm-2020-02-10-v3.11_india_mumbai.mbtiles'),
    path.join(process.cwd(), '..', '..', 'data', 'osm-2020-02-10-v3.11_india_mumbai.mbtiles')
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }

  return 'c:\\Users\\Wendell\\Downloads\\osm-2020-02-10-v3.11_india_mumbai.mbtiles';
}

let dbInstance: any = null;

function getDatabase() {
  if (dbInstance) return dbInstance;

  try {
    const { DatabaseSync } = require('node:sqlite');
    const mbtilesFile = getMbtilesPath();

    if (!fs.existsSync(mbtilesFile)) {
      console.warn(`[MBTiles] File not found at ${mbtilesFile}`);
      return null;
    }

    dbInstance = new DatabaseSync(mbtilesFile, { open: true, readOnly: true });
    return dbInstance;
  } catch (err) {
    console.error('[MBTiles] Failed to initialize SQLite database:', err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { z: string; x: string; y: string } }
) {
  const z = parseInt(params.z, 10);
  const x = parseInt(params.x, 10);
  const y = parseInt(params.y, 10);

  if (isNaN(z) || isNaN(x) || isNaN(y) || z < 0 || z > 20 || x < 0 || y < 0) {
    return new NextResponse('Invalid tile coordinates', { status: 400 });
  }

  // Convert XYZ to TMS: tms_y = (2^zoom - 1) - y
  const tmsY = (1 << z) - 1 - y;

  const db = getDatabase();
  if (!db) {
    return new NextResponse('MBTiles database unavailable', { status: 503 });
  }

  try {
    const stmt = db.prepare(
      'SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?'
    );
    const row = stmt.get(z, x, tmsY) as { tile_data: Buffer | Uint8Array } | undefined;

    if (!row || !row.tile_data) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let tileBuffer = Buffer.from(row.tile_data);

    // Decompress gzip if compressed to ensure standard protobuf delivery to browser
    const isGzipped = tileBuffer.length > 2 && tileBuffer[0] === 0x1f && tileBuffer[1] === 0x8b;
    if (isGzipped) {
      try {
        tileBuffer = zlib.gunzipSync(tileBuffer);
      } catch (e) {
        // If gunzip fails, keep original buffer
      }
    }

    return new NextResponse(tileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-protobuf',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  } catch (err: any) {
    console.error(`[MBTiles] Error querying tile ${z}/${x}/${y}:`, err);
    return new NextResponse('Internal server error querying tile', { status: 500 });
  }
}
