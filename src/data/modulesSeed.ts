import type { AuditRow, FuelRow, IncidentRow, LedgerRow, SettlementRow } from '../types';

export const DIVISIONS = ['Linehaul', 'Regional', 'Dedicated', 'Local'];
export const REGIONS_MOD = ['Canada East', 'Canada West', 'United States'];
export const CATEGORIES = ['Company Driver', 'Owner Operator', 'Team Driver'];
export const INCIDENT_TYPES = ['Medical Leave', 'Accident', 'Training', 'Suspension', 'Personal Leave'];
export const INCIDENT_STATUSES = ['open', 'scheduled', 'ongoing', 'rejected', 'completed'] as const;

const names = ['Aiden Singh', 'Maya Patel', 'Noah Brown', 'Emma Wilson', 'Liam Martin', 'Olivia Chen', 'Ethan Davis', 'Sofia Garcia'];
const date = (i: number) => `2026-${String(7 - Math.floor(i / 12)).padStart(2, '0')}-${String(28 - (i % 20)).padStart(2, '0')}`;
const code = (i: number) => `DRV-${String(1041 + i).padStart(4, '0')}`;

export const SETTLEMENT_ROWS: SettlementRow[] = Array.from({ length: 36 }, (_, i) => ({
  id: `SET-${260700 + i}`,
  driver: names[i % names.length],
  driverCode: code(i),
  division: DIVISIONS[i % DIVISIONS.length],
  region: REGIONS_MOD[i % REGIONS_MOD.length],
  category: CATEGORIES[i % CATEGORIES.length],
  payrollDate: i < 12 ? '2026-07-24' : i < 24 ? '2026-07-10' : '2026-06-26',
  status: i % 4 === 0 ? 'open' : 'closed',
  amount: 1840 + i * 137.45,
  emailed: i % 3 !== 0,
  generatedAt: `${date(i)} ${String(8 + (i % 9)).padStart(2, '0')}:20`,
}));

const auditDescriptions = ['Missing POD document', 'Pay miles exceed route miles', 'Fuel receipt requires review', 'Duplicate detention payment', 'Trip successfully audited'];
export const AUDIT_ROWS: AuditRow[] = Array.from({ length: 32 }, (_, i) => ({
  id: `AUD-${5000 + i}`,
  tripNo: `TR-${88210 + i}`,
  flagStatus: i % 5 === 0 ? 'exception' : i % 3 === 0 ? 'flagged' : 'none',
  driverCode: code(i),
  description: auditDescriptions[i % auditDescriptions.length],
  type: ['Trip Audit', 'Payroll Rule', 'Document', 'Fuel'][i % 4],
  createdOn: `${date(i)} ${String(9 + (i % 8)).padStart(2, '0')}:15`,
}));

export const LEDGER_ROWS: LedgerRow[] = Array.from({ length: 40 }, (_, i) => {
  const debit = i % 3 === 0 ? 125 + i * 4.25 : 0;
  const credit = i % 3 !== 0 ? 760 + i * 31.5 : 0;
  const balance = 4200 + i * 510 + credit - debit;
  return {
    id: `LED-${7100 + i}`,
    driver: names[i % names.length],
    driverCode: code(i % 14),
    txnDate: date(i),
    description: ['Trip earnings', 'Fuel deduction', 'Safety bonus', 'Cash advance', 'Tax adjustment'][i % 5],
    debit,
    credit,
    exchangeRate: i % 4 === 0 ? 1.3742 : 1,
    exchangeAmount: (credit - debit) * (i % 4 === 0 ? 1.3742 : 1),
    balance,
    balanceFx: balance * (i % 4 === 0 ? 1.3742 : 1),
    updatedBy: ['A. Cooper', 'M. Jones', 'Payroll Bot'][i % 3],
  };
});

export const FUEL_ROWS: FuelRow[] = Array.from({ length: 34 }, (_, i) => ({
  id: `FUEL-${8300 + i}`,
  receiptNo: `RC-${2607000 + i}`,
  receiptDate: date(i),
  effectiveDate: date(Math.max(0, i - 1)),
  payrollDate: i < 12 ? '2026-07-24' : '2026-07-10',
  driverCode: code(i % 16),
  truckNo: `T-${310 + (i % 12)}`,
  itemType: ['Diesel', 'DEF', 'Reefer Fuel'][i % 3],
  qtyLtr: 185 + (i % 7) * 42.5,
  vendor: ['Pilot', 'Flying J', 'Petro Canada', 'Love’s'][i % 4],
  cityState: ['Toronto, ON', 'Detroit, MI', 'Calgary, AB', 'Buffalo, NY'][i % 4],
  driverRate: 1.42 + (i % 5) * 0.06,
  tax: 18.2 + i * 1.35,
  impactIfta: i % 3 !== 1,
  allowDeduction: i % 4 !== 0,
}));

export const INCIDENT_ROWS: IncidentRow[] = Array.from({ length: 28 }, (_, i) => ({
  id: `INC-${260100 + i}`,
  driverCode: code(i),
  driverName: names[i % names.length],
  division: DIVISIONS[i % DIVISIONS.length],
  category: CATEGORIES[i % CATEGORIES.length],
  hireDate: `20${18 + (i % 7)}-0${1 + (i % 8)}-12`,
  truckNo: `T-${310 + (i % 12)}`,
  incidentType: INCIDENT_TYPES[i % INCIDENT_TYPES.length],
  from: date(i),
  to: date(Math.max(0, i - 3)),
  email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@fleet.example`,
  status: INCIDENT_STATUSES[i % INCIDENT_STATUSES.length],
  emergencyName: ['Harpreet Singh', 'Lucas Martin', 'Grace Chen'][i % 3],
  emergencyPhone: `+1 416 555 ${String(1200 + i).slice(-4)}`,
  emergencyAddress: `${120 + i} Main Street`,
  createdBy: ['A. Cooper', 'S. Reed', 'HR Admin'][i % 3],
  createdOn: `${date(i)} 10:30`,
  notes: i % 3 === 0 ? [{ id: `NOTE-${i}`, text: 'Follow-up documentation requested.', at: `${date(i)} 13:00`, by: 'HR Admin' }] : [],
}));
