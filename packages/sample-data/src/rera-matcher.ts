import { Building, Parcel } from '@sih/shared-types';
import { loadReraDataset, ReraProject } from './rera-loader';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function applyReraMetadataToBuildings(buildings: Building[], parcels: Parcel[]): Building[] {
  const reraProjects = loadReraDataset();
  if (reraProjects.length === 0) return buildings;

  const enhancedBuildings = buildings.map(b => ({ ...b }));

  for (const building of enhancedBuildings) {
    const parcel = parcels.find(p => p.id === building.parcelId);
    if (!parcel) continue;

    const [bLng, bLat] = parcel.centroid;

    let nearestProject: ReraProject | null = null;
    let minDistance = Infinity;

    for (const project of reraProjects) {
      const dist = getDistance(bLat, bLng, project.latitude, project.longitude);
      if (dist < minDistance && dist < 0.001) {
        minDistance = dist;
        nearestProject = project;
      }
    }

    if (nearestProject) {
      building.reraId = nearestProject.reraId;
      building.reraProjectName = nearestProject.projectName;
      building.reraPromoter = nearestProject.promoterName;
      building.reraStatus = nearestProject.status;
    }
  }

  return enhancedBuildings;
}
