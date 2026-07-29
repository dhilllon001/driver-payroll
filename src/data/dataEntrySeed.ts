const people = ['Avery Singh', 'Maya Chen', 'Noah Martin', 'Emma Wilson', 'Liam Brown', 'Sofia Garcia'];
const stamp = (i: number) => `2026-07-${String(28 - (i % 18)).padStart(2, '0')} ${String(8 + (i % 9)).padStart(2, '0')}:15`;
const audit = (i: number) => ({ createdBy: people[i % people.length], createdAt: stamp(i) });
const drivers = [
  ['D1024', 'Jordan Campbell'], ['D1188', 'Amelia Roy'], ['D1240', 'Ethan Tremblay'],
  ['D1307', 'Olivia Johnson'], ['D1422', 'Lucas Gagnon'], ['D1515', 'Chloe Patel'],
  ['D1639', 'Mason Lee'], ['D1710', 'Isabella Moore'], ['D1822', 'Benjamin Clark'],
  ['D1906', 'Mia Robinson'], ['D2041', 'Logan Hall'], ['D2185', 'Charlotte Young'],
  ['D2270', 'James Walker'], ['D2354', 'Ava King'], ['D2491', 'Henry Scott'], ['D2536', 'Ella Green'],
] as const;

const jurisdictions = [
  'ALABAMA', 'ALBERTA', 'ARIZONA', 'ARKANSAS', 'BRITISH COLUMBIA', 'CALIFORNIA',
  'COLORADO', 'CONNECTICUT', 'FLORIDA', 'GEORGIA', 'IDAHO', 'ILLINOIS', 'INDIANA',
  'IOWA', 'KANSAS', 'KENTUCKY', 'MANITOBA', 'MICHIGAN', 'MINNESOTA', 'MISSOURI',
];
export const IFTA_TAX_RATES = jurisdictions.map((jurisdiction, i) => ({
  id: `IFTA-${String(i + 1).padStart(3, '0')}`, jurisdiction,
  rate: Number((0.18 + (i % 9) * 0.0215).toFixed(4)),
  effectiveFrom: `2026-${String((i % 4) * 3 + 1).padStart(2, '0')}-01`,
  effectiveTo: `2026-${String((i % 4) * 3 + 3).padStart(2, '0')}-30`,
  coverageFrom: '2026-07-01', coverageTo: '2026-09-30', ...audit(i), active: i % 7 !== 0,
}));

const reportTypes = ['IFTA Report', 'Road Tax', 'Truck Mileage'] as const;
export const IFTA_REPORT_REQUESTS = Array.from({ length: 15 }, (_, i) => ({
  id: `RPT-${260701 + i}`, reportType: reportTypes[i % 3],
  fields: i % 3 === 0 ? ['Q3 2026', 'All jurisdictions'] : i % 3 === 1 ? ['July 2026', 'US Fleet'] : ['2026-07-01 – 2026-07-28', 'All trucks'],
  status: (i % 5 === 0 ? 'failed' : 'processed') as 'processed' | 'failed', ...audit(i),
}));

export const REDUCED_RATES = Array.from({ length: 18 }, (_, i) => ({
  id: `RR-${String(i + 1).padStart(3, '0')}`, driverCode: drivers[i % drivers.length][0],
  driverName: drivers[i % drivers.length][1], drivesFor: i % 2 ? 'Bison Transport' : 'Sukhdeep Logistics',
  region: ['Canada West', 'Canada East', 'USA Central'][i % 3],
  deductMiles: [25, 40, 50, 75][i % 4], deductHour: [0.5, 1, 1.5][i % 3],
  startDate: `2026-0${(i % 7) + 1}-01`, endDate: i % 4 ? '2026-12-31' : '2026-08-31',
  comment: ['Terminal positioning adjustment', 'Training period rate', 'Dedicated lane allowance'][i % 3],
  status: (i % 5 ? 'active' : 'inactive') as 'active' | 'inactive', ...audit(i),
}));

export const CA_PAY_RECORDS = Array.from({ length: 16 }, (_, i) => ({
  id: `CAP-${i + 1}`, tripNo: `T-${48320 + i}`, hours: Number((6.5 + (i % 7) * 0.75).toFixed(2)),
  amount: Number((198 + i * 17.25).toFixed(2)), payrollDate: `2026-07-${String(4 + (i % 4) * 7).padStart(2, '0')}`,
}));

export const MONTREAL_BONUS = Array.from({ length: 14 }, (_, i) => ({
  id: `MTL-${i + 1}`, driverCode: drivers[i][0], payrollMethod: ['City Premium', 'Night Shift', 'Weekend Bonus'][i % 3],
  status: (i % 6 ? 'active' : 'inactive') as 'active' | 'inactive', ...audit(i),
  modifiedBy: people[(i + 2) % people.length], modifiedAt: stamp(i + 2),
}));

export const USA_LOYALTY = Array.from({ length: 16 }, (_, i) => ({
  id: `USL-${i + 1}`, driverCode: drivers[i][0], driverName: drivers[i][1],
  category: ['OTR', 'Regional', 'Dedicated'][i % 3], division: ['USA Highway', 'USA Local'][i % 2],
  driverClass: i % 3 ? 'Company' : 'Owner Operator',
  loyaltyStatus: (i % 5 ? 'include' : 'exclude') as 'include' | 'exclude', ...audit(i),
  modifiedBy: people[(i + 1) % people.length], modifiedAt: stamp(i + 1),
}));

export const USA_LOYALTY_RATES = Array.from({ length: 10 }, (_, i) => ({
  id: `ULR-${i + 1}`, role: (i % 2 ? 'Local' : 'Highway') as 'Highway' | 'Local',
  type: (i % 3 ? 'Single' : 'Team') as 'Single' | 'Team',
  driverClass: (i % 4 ? 'Company' : 'Owner Operator') as 'Company' | 'Owner Operator',
  paidBy: (i % 2 ? 'Hourly' : 'Miles') as 'Miles' | 'Hourly',
  rate: Number((i % 2 ? 1.25 + i * 0.15 : 0.035 + i * 0.004).toFixed(3)),
}));

export const US_OTR_BONUS = Array.from({ length: 14 }, (_, i) => ({
  id: `OTR-${i + 1}`, driverCode: drivers[i][0],
  status: (i % 4 ? 'exclude' : 'include') as 'exclude' | 'include', rate: Number((0.025 + i * 0.0025).toFixed(4)),
  ...audit(i), modifiedBy: people[(i + 3) % people.length], modifiedAt: stamp(i + 3),
}));

export const CANADA_LOYALTY = Array.from({ length: 16 }, (_, i) => ({
  id: `CAL-${i + 1}`, driverCode: drivers[i][0],
  status: (i % 6 ? 'include' : 'exclude') as 'include' | 'exclude', ...audit(i),
  modifiedBy: people[(i + 4) % people.length], modifiedAt: stamp(i + 4),
}));

const locations = [
  ['Winnipeg Terminal', '1001 Logan Ave, Winnipeg MB'], ['Calgary Yard', '2929 52 St SE, Calgary AB'],
  ['Toronto DC', '6700 Airport Rd, Mississauga ON'], ['Montreal Hub', '5555 St-François Rd, Montreal QC'],
  ['Chicago Crossdock', '3501 S Pulaski Rd, Chicago IL'], ['Dallas Terminal', '4200 Irving Blvd, Dallas TX'],
] as const;
export const MANAGE_MILES = Array.from({ length: 12 }, (_, i) => ({
  id: `MIL-${i + 1}`, fromName: locations[i % 6][0], fromAddress: locations[i % 6][1],
  fromVerified: i % 4 !== 0, fromStatus: i % 4 ? 'Matched' : 'Review',
  toName: locations[(i + 2) % 6][0], toAddress: locations[(i + 2) % 6][1],
  toVerified: i % 5 !== 0, toStatus: i % 5 ? 'Matched' : 'Review',
  alkPostal: `${218 + i * 37} mi`, alkLatLong: `${221 + i * 37} mi`,
  alkDiff: `${i % 2 ? '+' : '-'}${2 + (i % 8)} mi`, alkAddress: `${219 + i * 37} mi`,
}));

export const MX_BASE_PAY = Array.from({ length: 14 }, (_, i) => ({
  id: `MXP-${i + 1}`, driverCode: drivers[i][0], driverName: drivers[i][1],
  basePay: 6250 + i * 275, currency: 'MXN', status: i % 6 ? 'active' : 'inactive',
  effectiveFrom: `2026-0${(i % 7) + 1}-01`, updatedBy: people[(i + 2) % people.length], updatedAt: stamp(i + 2),
}));
