import { NextRequest, NextResponse } from 'next/server';
import { generateClientParcelResult, resolveUlpinParcel } from '@/lib/maharashtraData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') || '30';
  const taluka = searchParams.get('taluka') || '3001';
  const village = searchParams.get('village') || '300101';
  const cts = searchParams.get('cts') || searchParams.get('survey') || '45';

  const clean = cts.trim().toUpperCase();
  if (clean.startsWith('MH') && clean.length >= 14) {
    const ulpinResult = resolveUlpinParcel(clean);
    return NextResponse.json(ulpinResult, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const result = generateClientParcelResult(district, taluka, village, cts);
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
