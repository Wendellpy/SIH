import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const tileJson = {
    tilejson: '3.0.0',
    name: 'Mumbai OpenMapTiles Vector 3D',
    description: 'Vector tiles for Mumbai extracted from OpenStreetMap with 3D building heights',
    version: '3.11.0',
    attribution: '© OpenStreetMap contributors, OpenMapTiles, SIH 3D Cadastre',
    scheme: 'xyz',
    tiles: [`${origin}/api/tiles/{z}/{x}/{y}`],
    minzoom: 0,
    maxzoom: 14,
    bounds: [72.415, 18.466, 73.516, 19.5],
    center: [72.8777, 19.076, 14],
    vector_layers: [
      { id: 'building', description: '3D building polygons with render_height and render_min_height' },
      { id: 'water', description: 'Water bodies, ocean and rivers' },
      { id: 'waterway', description: 'Rivers and streams' },
      { id: 'transportation', description: 'Roads, railways, and highways' },
      { id: 'transportation_name', description: 'Road names' },
      { id: 'landuse', description: 'Residential, commercial, industrial zones' },
      { id: 'landcover', description: 'Parks, forests, grass' },
      { id: 'place', description: 'City and neighbourhood labels' },
      { id: 'poi', description: 'Points of interest' }
    ]
  };

  return NextResponse.json(tileJson, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
