import { NextRequest, NextResponse } from 'next/server';
import { getFallbackTalukas } from '@/lib/maharashtraData';

export async function GET(
  request: NextRequest,
  { params }: { params: { district: string } }
) {
  const districtId = params.district || '30';
  const talukas = getFallbackTalukas(districtId);

  return NextResponse.json({
    success: true,
    source: 'maharashtra-government',
    data: talukas
  }, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
