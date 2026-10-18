import { NextRequest, NextResponse } from 'next/server';
import { resolveUlpinParcel } from '@/lib/maharashtraData';

export async function GET(
  request: NextRequest,
  { params }: { params: { ulpin: string } }
) {
  const ulpin = params.ulpin || '';
  const result = resolveUlpinParcel(ulpin);

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
