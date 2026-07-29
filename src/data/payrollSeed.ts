import type { DriverClassification, ExchangeRates, PayrollRun, PayrollRunStatus } from '../types';

export const PAYROLL_REGIONS = ['United States', 'Mexico', 'Canada'] as const;
export const DRIVER_CLASSES: DriverClassification[] = [
  'Company Driver',
  'Owner Operator',
  'Temporary Drivers',
];
export const PAYROLL_STATUSES = ['closed', 'open', 'processing'] as const;
export const COVERAGE_PERIODS = ['Weekly', 'BiWeekly', 'SemiMonthly', 'Monthly'] as const;

const ALL_CLASSES: DriverClassification[] = [...DRIVER_CLASSES];
const US_CLASSES: DriverClassification[] = ['Owner Operator', 'Temporary Drivers', 'Company Driver'];
const MX_CLASSES: DriverClassification[] = ['Temporary Drivers', 'Owner Operator'];
const CA_CLASSES: DriverClassification[] = ['Company Driver', 'Owner Operator'];

const EX: Record<string, ExchangeRates> = {
  'United States': { usdToCad: 1.4267, usdToPeso: 17.93, cadToPeso: 16.64 },
  Mexico: { usdToCad: 1.412, usdToPeso: 18.05, cadToPeso: 16.9 },
  Canada: { usdToCad: 1.3985, usdToPeso: 17.75, cadToPeso: 16.52 },
};

const CLASSES: Record<string, DriverClassification[]> = {
  'United States': US_CLASSES,
  Mexico: MX_CLASSES,
  Canada: CA_CLASSES,
};

const PEOPLE = [
  'Ashu Bhatia',
  'Kajal Jaiswal',
  'Hasandeep Singh',
  'Yoshua',
  'Priya Sharma',
  'Miguel Santos',
];

/** Weekly payroll dates: pay date → cover window */
const PERIODS: { pay: string; from: string; to: string }[] = [
  { pay: 'Jan 16, 2026', from: 'Jan 5, 2026', to: 'Jan 11, 2026' },
  { pay: 'Jan 9, 2026', from: 'Dec 29, 2025', to: 'Jan 4, 2026' },
  { pay: 'Jan 2, 2026', from: 'Dec 22, 2025', to: 'Dec 28, 2025' },
  { pay: 'Dec 26, 2025', from: 'Dec 15, 2025', to: 'Dec 21, 2025' },
  { pay: 'Dec 19, 2025', from: 'Dec 8, 2025', to: 'Dec 14, 2025' },
  { pay: 'Dec 12, 2025', from: 'Dec 1, 2025', to: 'Dec 7, 2025' },
  { pay: 'Dec 5, 2025', from: 'Nov 24, 2025', to: 'Nov 30, 2025' },
  { pay: 'Nov 28, 2025', from: 'Nov 17, 2025', to: 'Nov 23, 2025' },
  { pay: 'Nov 21, 2025', from: 'Nov 10, 2025', to: 'Nov 16, 2025' },
  { pay: 'Nov 14, 2025', from: 'Nov 3, 2025', to: 'Nov 9, 2025' },
  { pay: 'Nov 7, 2025', from: 'Oct 27, 2025', to: 'Nov 2, 2025' },
  { pay: 'Oct 31, 2025', from: 'Oct 20, 2025', to: 'Oct 26, 2025' },
  { pay: 'Oct 24, 2025', from: 'Oct 13, 2025', to: 'Oct 19, 2025' },
  { pay: 'Oct 17, 2025', from: 'Oct 6, 2025', to: 'Oct 12, 2025' },
  { pay: 'Oct 10, 2025', from: 'Sep 29, 2025', to: 'Oct 5, 2025' },
  { pay: 'Oct 3, 2025', from: 'Sep 22, 2025', to: 'Sep 28, 2025' },
  { pay: 'Sep 26, 2025', from: 'Sep 15, 2025', to: 'Sep 21, 2025' },
  { pay: 'Sep 19, 2025', from: 'Sep 8, 2025', to: 'Sep 14, 2025' },
];

function statusFor(periodIdx: number, regionIdx: number): PayrollRunStatus {
  if (periodIdx === 0 && regionIdx === 0) return 'open';
  if (periodIdx === 0 && regionIdx === 1) return 'processing';
  if (periodIdx === 1 && regionIdx === 2) return 'open';
  if (periodIdx === 5 && regionIdx === 0) return 'open';
  return 'closed';
}

function classesFor(region: string, periodIdx: number): DriverClassification[] {
  if (periodIdx % 7 === 3) return ALL_CLASSES;
  if (periodIdx % 5 === 2 && region === 'Mexico') return ['Temporary Drivers'];
  if (periodIdx % 6 === 1 && region === 'Canada') return ['Company Driver'];
  return CLASSES[region];
}

function stamp(person: string, label: string) {
  return { by: person, at: label };
}

export const PAYROLL_RUNS: PayrollRun[] = PERIODS.flatMap((period, pi) =>
  PAYROLL_REGIONS.map((region, ri) => {
    const creator = PEOPLE[(pi + ri) % PEOPLE.length];
    const updater = PEOPLE[(pi + ri + 2) % PEOPLE.length];
    const created = stamp(creator, `Jul 30, 2025 ${String(8 + ((pi + ri) % 8)).padStart(2, '0')}:1${ri} AM`);
    const updated = stamp(
      updater,
      pi < 2
        ? `Jan 5, 2026 ${String(10 + ri)}:0${ri} AM`
        : `${period.to} ${String(12 + ((pi + ri) % 6)).padStart(2, '0')}:${String(10 + ri).padStart(2, '0')} PM`,
    );
    const fx = { ...EX[region] };
    // slight variation per period
    fx.usdToCad = Number((fx.usdToCad + (pi % 5) * 0.002).toFixed(4));
    fx.usdToPeso = Number((fx.usdToPeso + (pi % 4) * 0.02).toFixed(4));
    fx.cadToPeso = Number((fx.cadToPeso + (pi % 3) * 0.01).toFixed(4));

    return {
      id: `pr-${pi + 1}-${ri + 1}`,
      payrollDate: period.pay,
      coverFrom: period.from,
      coverTo: period.to,
      status: statusFor(pi, ri),
      region,
      classifications: classesFor(region, pi),
      coveragePeriod: 'Weekly' as const,
      exchange: fx,
      createdBy: created.by,
      createdAt: created.at,
      updatedBy: updated.by,
      updatedAt: updated.at,
    };
  }),
);
