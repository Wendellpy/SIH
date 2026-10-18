import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const query = await req.text();
    if (!query || !query.trim()) {
      return NextResponse.json({ elements: [] });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        signal: controller.signal,
        headers: {
          'User-Agent': 'SIH-GeoElevate-App/1.0',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.json({ elements: [] });
      }

      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      clearTimeout(timeout);
      return NextResponse.json({ elements: [] });
    }
  } catch (err: any) {
    return NextResponse.json({ elements: [], error: err?.message || 'Failed to query Overpass' });
  }
}
