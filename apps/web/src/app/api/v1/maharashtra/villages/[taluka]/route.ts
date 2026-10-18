import { NextRequest, NextResponse } from 'next/server';
import { getFallbackVillages } from '@/lib/maharashtraData';

export async function GET(
  request: NextRequest,
  { params }: { params: { taluka: string } }
) {
  const talukaId = params.taluka || '3001';
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('district') || talukaId.substring(0, 2) || '30';
  const villages = getFallbackVillages(districtId, talukaId);

  return NextResponse.json({
    success: true,
    source: 'maharashtra-government',
    data: villages
  }, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
