import { PropertyCardService } from '../apps/api/src/services/property-card.service';
import { db } from '../apps/api/src/database/store';
import fs from 'fs';
import path from 'path';

async function test() {
  const ulpin = 'MH13BOM04521873'; // A base surface parcel in SAMPLE_PARCELS
  const parcel = db.getParcelByUlpin(ulpin);
  if (!parcel) {
    console.error('Parcel not found');
    return;
  }
  
  const { pdfBuffer, recordHash } = await PropertyCardService.generateCard(parcel, 'Parcel');
  fs.writeFileSync(path.join(__dirname, 'test_property_card.pdf'), pdfBuffer);
  console.log('Successfully generated property card for Surface Parcel! Hash:', recordHash);
}

test().catch(console.error);
