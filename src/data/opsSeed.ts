import type {
  DeductionRow,
  DeductionType,
  OpsCatalogRow,
} from '../types';

const drivers = [
  { name: 'JOAQUIN AUNDBERTO PASTRANA GASPAR', code: 'JOAQUINP', division: 'TS TRUCKING' },
  { name: 'ERNESTO MARTIN SANTIAGO MORALES', code: 'ERNESTO1', division: 'CLX MEXICO' },
  { name: 'BALOUR SINGH', code: 'BSINGH', division: 'ROMULUS DISPATCH' },
  { name: 'MIGUEL ANGEL RUIZ', code: 'MIGUELR', division: 'ZIP EXPRESS US LTD' },
  { name: 'NESTORM RAYMUNDO', code: 'NESTORA', division: 'BAJA FREIGHT LTD' },
  { name: 'FELIPE DE JESUS', code: 'FELIPES', division: 'TS TRUCKING' },
];

const dedCodes = [
  'Operational Advance',
  'Bonus',
  'Security Deposit',
  'Trip Expenses',
  'Internal Shop Repair',
  'Cash Advance',
  'Uniform Deduction',
  'Parking Fine',
];

export const DEDUCTION_ROWS: DeductionRow[] = Array.from({ length: 48 }, (_, i) => {
  const d = drivers[i % drivers.length];
  const type: DeductionType = i % 3 === 0 ? 'reimburse' : 'deduct';
  const amount = type === 'reimburse' ? 100 + (i % 7) * 50 : -(200 + (i % 9) * 75);
  const currency = (['CAD', 'USD', 'Peso'] as const)[i % 3];
  const installment = i % 4 === 1;
  const paid = i % 5 === 0 ? 1 : 0;
  const totalPays = installment ? 4 : 1;
  return {
    id: `DR-${260800 + i}`,
    driverName: d.name,
    driverCode: d.code,
    division: d.division,
    region: ['Mexico', 'United States', 'Canada'][i % 3],
    effDate: `2026-0${7 + (i % 2)}-${String(28 - (i % 20)).padStart(2, '0')}`,
    dedCode: dedCodes[i % dedCodes.length],
    type,
    amount,
    currency,
    paymentType: installment ? 'installment' : 'one-time',
    balancePaid: Math.abs(amount) * paid,
    balanceTotal: Math.abs(amount),
    paymentsDone: paid,
    paymentsTotal: totalPays,
    status: i % 11 === 0 ? 'closed' : 'active',
    comments: `${d.code}: ${type === 'deduct' ? 'Payroll deduction' : 'Reimbursement'} — logged by ops ${i + 1}`,
    createdAt: `Jul ${20 + (i % 9)}, 2026, ${10 + (i % 8)}:${String(10 + (i % 40)).padStart(2, '0')} PM`,
    createdBy: ['Himanshu Tripathi', 'Kajal Jaiswal', 'Yoshua'][i % 3],
    updatedAt: i % 3 === 0 ? `Jul ${22 + (i % 6)}, 2026, 2:15 PM` : '',
    payrollDate: i % 4 === 0 ? 'Pending' : `Aug ${3 + (i % 5)}, 2026`,
  };
});

const OPS_TITLES: Record<string, string> = {
  'ifta-tax-rate': 'IFTA Tax Rate',
  'ifta-reports': 'IFTA Reports',
  'de-driver-reduced-rate': 'Driver Reduced Rate',
  'de-california-pay': 'California Pay Record',
  'de-montreal-bonus': 'Montreal Bonus',
  'de-usa-loyalty': 'USA Loyalty Bonus',
  'de-usa-loyalty-rate': 'USA Loyalty Bonus Rate',
  'de-us-otr-bonus': 'US OTR Bonus (Excluded Drivers)',
  'de-canada-loyalty': 'Canada Loyalty Bonus',
  'de-manage-miles': 'Manage Miles',
  'de-mx-base-pay': 'Mx-Base Pay',
  'te-assigned': 'Trip Expense · Assigned To Me',
  'te-unassigned': 'Trip Expense · Unassigned',
  'te-reimbursements': 'Trip Expense · Reimbursements',
  'te-history': 'Trip Expense · History',
  'te-bulk-uploads': 'Trip Expense · Bulk Uploads',
  'cash-advance': 'MX Cash Advance',
  'nomilinea-payroll': 'Nomilinea Payroll',
  'nomilinea-concepts': 'Nomilinea Concepts',
};

export function opsTitle(id: string) {
  return OPS_TITLES[id] || id;
}

export function buildOpsRows(viewId: string): OpsCatalogRow[] {
  const title = opsTitle(viewId);
  return Array.from({ length: 24 }, (_, i) => {
    const d = drivers[i % drivers.length];
    return {
      id: `${viewId.toUpperCase().slice(0, 6)}-${1000 + i}`,
      name: d.name,
      code: d.code,
      division: d.division,
      category: title.includes('Bonus') ? 'Bonus' : title.includes('Miles') ? 'Miles' : 'Standard',
      amount: 250 + i * 37.5,
      status: i % 5 === 0 ? 'pending' : i % 7 === 0 ? 'inactive' : 'active',
      effectiveDate: `2026-07-${String(28 - (i % 20)).padStart(2, '0')}`,
      updatedBy: ['Ashu Bhatia', 'Kajal Jaiswal', 'Hasandeep Singh'][i % 3],
      updatedAt: `Jul ${15 + (i % 12)}, 2026`,
    };
  });
}
