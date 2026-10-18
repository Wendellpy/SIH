import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ulpin: string } }
) {
  const ulpin = params.ulpin || 'PARCEL-EVENT';

  const events = [
    {
      id: `EVT-01-${ulpin.slice(0, 8)}`,
      ulpin,
      eventType: 'CADASTRAL_SURVEY',
      title: 'Geodetic Cadastral Survey Validated',
      date: '2023-04-12',
      authority: 'Department of Land Resources & Settlement Commissioner, Maharashtra',
      status: 'VERIFIED',
      description: 'High-precision cadastral boundary anchored and normalized to EPSG:4326.'
    },
    {
      id: `EVT-02-${ulpin.slice(0, 8)}`,
      ulpin,
      eventType: 'TITLE_REGISTRATION',
      title: 'Registered Title Deed Record',
      date: '2023-08-19',
      authority: 'Inspector General of Registration (IGR Maharashtra)',
      status: 'RECORDED',
      description: 'Document registered under the Registration Act 1908. Title confirmed.'
    },
    {
      id: `EVT-03-${ulpin.slice(0, 8)}`,
      ulpin,
      eventType: 'MUTATION_CLEARANCE',
      title: 'Mutation Certificate & 7/12 RoR Update',
      date: '2024-02-05',
      authority: 'Talathi Office / Tahsildar Portal',
      status: 'APPROVED',
      description: 'Mutation entry sanitized and synced with MahaBhulekh land records system.'
    },
    {
      id: `EVT-04-${ulpin.slice(0, 8)}`,
      ulpin,
      eventType: 'LEDGER_ATTESTATION',
      title: 'Cryptographic Ledger Attestation',
      date: '2024-06-11',
      authority: 'Ethereum EVM State Land Registry',
      status: 'COMMITTED',
      description: 'ULPIN-3D spatial hash anchored to immutable blockchain ledger.'
    }
  ];

  return NextResponse.json({
    success: true,
    data: events
  }, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
