import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    mode: 'LIVE_GOVERNMENT_DATA',
    services: {
      districts: 'available',
      talukas: 'available',
      villages: 'available',
      ulpin: 'available',
      ror: 'available',
      mutation: 'available',
      parcelGeometry: 'available'
    }
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
