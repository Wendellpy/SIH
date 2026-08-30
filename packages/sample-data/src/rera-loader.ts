export interface ReraProject {
  reraId: string;
  projectName: string;
  promoterName: string;
  latitude: number;
  longitude: number;
  status: string;
  completionDate: string;
}

export function loadReraDataset(): ReraProject[] {
  // Hardcoded mock of the Kaggle dataset to ensure browser-compatibility in the Next.js bundle
  return [
    {
      reraId: 'P51800021345',
      projectName: 'Fintech Hub Tower 1',
      promoterName: 'L&T Realty',
      latitude: 19.0607,
      longitude: 72.8688,
      status: 'On-Going Project',
      completionDate: '31-12-2027'
    },
    {
      reraId: 'P51800045678',
      projectName: 'Bharat Diamond Bourse Annex',
      promoterName: 'BDB Consortium',
      latitude: 19.0620,
      longitude: 72.8710,
      status: 'Completed',
      completionDate: '15-08-2025'
    },
    {
      reraId: 'P51900088888',
      projectName: 'Lodha Altamount',
      promoterName: 'Lodha Group',
      latitude: 18.9715,
      longitude: 72.8090,
      status: 'New Project',
      completionDate: '01-01-2030'
    }
  ];
}
