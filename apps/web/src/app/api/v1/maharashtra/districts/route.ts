import { NextResponse } from 'next/server';
import { DEFAULT_DISTRICTS } from '@/lib/maharashtraData';

export async function GET() {
  return NextResponse.json({
    success: true,
    source: 'maharashtra-government',
    data: DEFAULT_DISTRICTS
  }, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
