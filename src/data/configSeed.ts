import type { PayrollMethod, PayrollRegion, PayrollSchedule } from '../types';

export const DIVISIONS = [
  'CHARGER LOGISTICS INC',
  'TS TRUCKING',
  'CLX MEXICO',
  'CLX CANADA',
  'ROMULUS DISPATCH',
  'QC DEDICATED',
];

export const BASED_ON_OPTIONS = [
  'Flat Rate',
  'All Miles',
  'Loaded Miles',
  'Regular Hours',
  'Layovers',
];

export const TAX_CODES = ['EXEMPT', 'TAXABLE', 'NON-RES'];

export const REGIONS: PayrollRegion[] = [
  {
    id: 'r1',
    name: 'Canada',
    coveragePeriod: 'SemiMonthly',
    divisions: ['CHARGER LOGISTICS INC', 'CLX CANADA', 'QC DEDICATED'],
    status: 'active',
  },
  {
    id: 'r2',
    name: 'Mexico',
    coveragePeriod: 'Weekly',
    divisions: ['CLX MEXICO', 'TS TRUCKING'],
    status: 'active',
  },
  {
    id: 'r3',
    name: 'United States',
    coveragePeriod: 'BiWeekly',
    divisions: ['CHARGER LOGISTICS INC', 'ROMULUS DISPATCH'],
    status: 'active',
  },
  {
    id: 'r4',
    name: 'Prairie Test Region',
    coveragePeriod: 'Monthly',
    divisions: ['CLX CANADA'],
    status: 'inactive',
  },
];

export const METHODS: PayrollMethod[] = [
  { id: 'm1', name: 'Acworth GA', basedOn: 'Flat Rate' },
  { id: 'm2', name: 'Additional', basedOn: 'Flat Rate' },
  { id: 'm3', name: 'Additional Extra Movement', basedOn: 'All Miles' },
  { id: 'm4', name: 'Misc Flat', basedOn: 'Flat Rate' },
  { id: 'm5', name: 'Extra Movements', basedOn: 'Flat Rate' },
  { id: 'm6', name: 'CLX TIJTransfer', basedOn: 'Flat Rate' },
  { id: 'm7', name: 'DODA Validation Payment', basedOn: 'Flat Rate' },
  { id: 'm8', name: 'Mileage Loaded', basedOn: 'Loaded Miles' },
  { id: 'm9', name: 'Hourly Regular', basedOn: 'Regular Hours' },
  { id: 'm10', name: 'Layover Standard', basedOn: 'Layovers' },
  { id: 'm11', name: 'Detention Accessorial', basedOn: 'Flat Rate' },
  { id: 'm12', name: 'Fuel Surcharge Assist', basedOn: 'All Miles' },
  { id: 'm13', name: 'Team Split Bonus', basedOn: 'Flat Rate' },
  { id: 'm14', name: 'Unused Archive Method', basedOn: 'Flat Rate' },
];

const driverPool: PayrollSchedule['drivers'] = [
  {
    id: 'd1',
    name: 'Amit 2101',
    code: 'AMIT1',
    category: '(AB) AB HWY (CAN)',
    division: 'CHARGER LOGISTICS INC',
    driverClass: 'Company',
    active: true,
  },
  {
    id: 'd2',
    name: 'Bakshi Testone',
    code: 'BAKSHIT',
    category: '(CLX) MX Local',
    division: 'TS TRUCKING',
    driverClass: 'Company',
    active: true,
  },
  {
    id: 'd3',
    name: 'Chandigarh Driver One',
    code: 'CHANDIGD',
    category: '(CLX) MX Local',
    division: 'CLX MEXICO',
    driverClass: 'Company',
    active: false,
  },
  {
    id: 'd4',
    name: 'Ernesto Morales',
    code: 'ERNESTO1',
    category: 'MXMTY-Local',
    division: 'CLX MEXICO',
    driverClass: 'Local',
    active: true,
  },
  {
    id: 'd5',
    name: 'K Davinder',
    code: 'KDAVINDER',
    category: 'QC DEDICATED SH',
    division: 'CLX CANADA',
    driverClass: 'Company',
    active: true,
  },
  {
    id: 'd6',
    name: 'Balour Singh',
    code: 'BSINGH',
    category: 'RomulusDispatch',
    division: 'ROMULUS DISPATCH',
    driverClass: 'Team',
    active: true,
  },
];

function methodLines(
  picks: { methodId: string; single: number; team?: number }[],
): PayrollSchedule['methods'] {
  return picks.map((p, i) => {
    const m = METHODS.find((x) => x.id === p.methodId)!;
    return {
      id: `sml-${p.methodId}-${i}`,
      methodId: m.id,
      methodName: m.name,
      basedOn: m.basedOn,
      singleRate: p.single,
      teamRate: p.team ?? p.single,
    };
  });
}

export const SCHEDULES: PayrollSchedule[] = [
  {
    id: 's1',
    name: '(CLX) BITIJTRANSFER',
    taxCode: 'EXEMPT',
    currency: 'USD',
    status: 'active',
    methods: methodLines([
      { methodId: 'm4', single: 0 },
      { methodId: 'm5', single: 67 },
      { methodId: 'm6', single: 67 },
      { methodId: 'm7', single: 0 },
    ]),
    drivers: [driverPool[1], driverPool[3]],
  },
  {
    id: 's2',
    name: '40 cents/mile - 16',
    taxCode: 'EXEMPT',
    currency: 'CAD',
    status: 'active',
    methods: methodLines([{ methodId: 'm8', single: 0.4 }]),
    drivers: [driverPool[0], driverPool[4]],
  },
  {
    id: 's3',
    name: 'CALI Driver-25/hr - not to be used only for test driver',
    taxCode: 'TAXABLE',
    currency: 'USD',
    status: 'inactive',
    methods: methodLines([{ methodId: 'm9', single: 25 }]),
    drivers: [driverPool[2]],
  },
  {
    id: 's4',
    name: 'City Drivers - 26/hrs',
    taxCode: 'EXEMPT',
    currency: 'CAD',
    status: 'active',
    methods: methodLines([{ methodId: 'm9', single: 26 }]),
    drivers: [driverPool[0], driverPool[4], driverPool[5]],
  },
  {
    id: 's5',
    name: 'B1KelloggDedicated',
    taxCode: 'EXEMPT',
    currency: 'USD',
    status: 'active',
    methods: methodLines([
      { methodId: 'm8', single: 1.85 },
      { methodId: 'm11', single: 150 },
    ]),
    drivers: [driverPool[5]],
  },
  {
    id: 's6',
    name: 'MX Local Semi - Apodaca',
    taxCode: 'EXEMPT',
    currency: 'Peso',
    status: 'active',
    methods: methodLines([
      { methodId: 'm4', single: 850 },
      { methodId: 'm6', single: 1200 },
    ]),
    drivers: [driverPool[1], driverPool[3]],
  },
  {
    id: 's7',
    name: 'Prairie Shuttle Company',
    taxCode: 'NON-RES',
    currency: 'CAD',
    status: 'active',
    methods: methodLines([{ methodId: 'm8', single: 1.55 }, { methodId: 'm10', single: 545 }]),
    drivers: [driverPool[4]],
  },
  {
    id: 's8',
    name: 'Romulus Team Split',
    taxCode: 'EXEMPT',
    currency: 'USD',
    status: 'active',
    methods: methodLines([{ methodId: 'm13', single: 200, team: 100 }]),
    drivers: [driverPool[5]],
  },
  {
    id: 's9',
    name: 'QC Local Hourly',
    taxCode: 'EXEMPT',
    currency: 'CAD',
    status: 'active',
    methods: methodLines([{ methodId: 'm9', single: 32.5 }]),
    drivers: [driverPool[4]],
  },
  {
    id: 's10',
    name: 'Legacy Empty Schedule',
    taxCode: 'EXEMPT',
    currency: 'USD',
    status: 'inactive',
    methods: [],
    drivers: [],
  },
  {
    id: 's11',
    name: 'Detention Only Accessorial',
    taxCode: 'TAXABLE',
    currency: 'USD',
    status: 'active',
    methods: methodLines([{ methodId: 'm11', single: 175 }]),
    drivers: [driverPool[0]],
  },
  {
    id: 's12',
    name: 'Fuel Assist CAD',
    taxCode: 'EXEMPT',
    currency: 'CAD',
    status: 'active',
    methods: methodLines([{ methodId: 'm12', single: 0.12 }]),
    drivers: [driverPool[0], driverPool[4]],
  },
  {
    id: 's13',
    name: 'MX Gate Tip Bundle',
    taxCode: 'EXEMPT',
    currency: 'Peso',
    status: 'inactive',
    methods: methodLines([{ methodId: 'm2', single: 350 }]),
    drivers: [driverPool[2]],
  },
  {
    id: 's14',
    name: 'Owner Operator Mileage',
    taxCode: 'TAXABLE',
    currency: 'CAD',
    status: 'active',
    methods: methodLines([{ methodId: 'm8', single: 2.1 }]),
    drivers: [driverPool[0]],
  },
  {
    id: 's15',
    name: 'Extra Movement Pool',
    taxCode: 'EXEMPT',
    currency: 'USD',
    status: 'active',
    methods: methodLines([{ methodId: 'm3', single: 45 }, { methodId: 'm5', single: 67 }]),
    drivers: [driverPool[1], driverPool[5]],
  },
];

export const AVAILABLE_DRIVERS = driverPool;
