export type ViewId =
  | 'trip-board'
  | 'payroll'
  | 'settlement'
  | 'audit'
  | 'driver-ledger'
  | 'fuel'
  | 'incidents'
  | 'deductions'
  | 'ifta'
  | 'ifta-tax-rate'
  | 'ifta-reports'
  | 'data-entry'
  | 'de-driver-reduced-rate'
  | 'de-california-pay'
  | 'de-montreal-bonus'
  | 'de-usa-loyalty'
  | 'de-usa-loyalty-rate'
  | 'de-us-otr-bonus'
  | 'de-canada-loyalty'
  | 'de-manage-miles'
  | 'de-mx-base-pay'
  | 'trip-expense'
  | 'te-assigned'
  | 'te-unassigned'
  | 'te-reimbursements'
  | 'te-history'
  | 'te-bulk-uploads'
  | 'cash-advance'
  | 'nomilinea'
  | 'nomilinea-payroll'
  | 'nomilinea-concepts'
  | 'config'
  | 'config-regions'
  | 'config-methods'
  | 'config-schedules';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'exception';
export type FlagStatus = 'none' | 'flagged';
export type TripRole = 'Local' | 'Team' | 'Owner Operator' | 'Company';

export type EventType = 'ACQUIRE' | 'HOOK' | 'GATE PASS' | 'DROP' | 'RELEASE' | 'DETENTION' | 'LAYOVER';

export interface TripException {
  customNote: string;
  errorException: string;
  ruleName: string;
}

export interface TripEvent {
  id: string;
  event: EventType;
  paid: boolean;
  equipment: string;
  location: string;
  cityState: string;
  podRequired: boolean;
  startTime: string;
  endTime: string;
  miles: number;
}

export interface LocationStop {
  id: string;
  name: string;
  eventName: EventType;
  timeIn: string;
  timeOut: string;
  duration: string;
  cityState?: string;
  isCurrent?: boolean;
}

export interface PayLine {
  method: string;
  basedOn: string;
  quantity: number;
  payRate: number;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  assets: string;
  compensated: string;
  payDate: string;
  amount: number;
  taxCode: string;
  payAdjustment: string;
  lines: PayLine[];
  notes: string;
  status: 'open' | 'paid' | 'pending';
}

export interface IftaRow {
  id: string;
  state: string;
  totalMiles: number;
  tollMiles: number;
}

export type NotesSubTab = 'Driver' | 'Dispatch' | 'User';

export interface TripNote {
  id: string;
  section: NotesSubTab;
  body: string;
  author: string;
  at: string;
}

export interface TripDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
  previewUrl?: string;
}

export interface TripExtra {
  id: string;
  type: string;
  amount: number;
  status: string;
  note?: string;
  quantity?: number;
}

export interface Trip {
  id: string;
  tripNo: string;
  subTrip: number;
  leadDriver: string;
  leadDriverId: string;
  teamDriver: string;
  teamDriverId: string;
  drivesFor: string;
  tripCategory: string;
  tripRole: TripRole;
  payMiles: number;
  payDate: string;
  dateOut: string;
  dateIn: string;
  flagged: boolean;
  paymentStatus: PaymentStatus;
  tags: string[];
  terminal: string;
  dispatcher: string;
  closureDate: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  tractor?: string;
  trailer?: string;
  commodity?: string;
  origin?: string;
  destination?: string;
  customer?: string;
  exceptions: TripException[];
  events: TripEvent[];
  locations: LocationStop[];
  payments: PaymentRecord[];
  ifta: IftaRow[];
  notes: TripNote[];
  documents: TripDocument[];
  extras: TripExtra[];
}

export type DetailTab =
  | 'locations'
  | 'payment'
  | 'extras'
  | 'properties'
  | 'documents'
  | 'notes'
  | 'ifta'
  | 'ai';

export type ConfigStatus = 'active' | 'inactive';
export type PayrollCurrency = 'CAD' | 'USD' | 'Peso';
export type CoveragePeriod = 'Weekly' | 'BiWeekly' | 'SemiMonthly' | 'Monthly';

export type PayrollCountry = 'Canada' | 'Mexico' | 'USA';

export interface PayrollRegion {
  id: string;
  name: string;
  country: PayrollCountry;
  currency: PayrollCurrency;
  coveragePeriod: CoveragePeriod;
  divisions: string[];
  status: ConfigStatus;
}

export interface PayrollMethod {
  id: string;
  name: string;
  basedOn: string;
}

export interface ScheduleMethodLine {
  id: string;
  methodId: string;
  methodName: string;
  basedOn: string;
  singleRate: number;
  teamRate: number;
}

export interface ScheduleDriver {
  id: string;
  name: string;
  code: string;
  category: string;
  division: string;
  driverClass: string;
  active: boolean;
}

export interface PayrollSchedule {
  id: string;
  name: string;
  taxCode: string;
  currency: PayrollCurrency;
  status: ConfigStatus;
  methods: ScheduleMethodLine[];
  drivers: ScheduleDriver[];
}

export type PayrollRunStatus = 'closed' | 'open' | 'processing';
export type DriverClassification = 'Company Driver' | 'Owner Operator' | 'Temporary Drivers';

export interface ExchangeRates {
  usdToCad: number;
  usdToPeso: number;
  cadToPeso: number;
}

export interface PayrollRun {
  id: string;
  payrollDate: string;
  coverFrom: string;
  coverTo: string;
  status: PayrollRunStatus;
  region: string;
  classifications: DriverClassification[];
  coveragePeriod: CoveragePeriod;
  exchange: ExchangeRates;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SettlementRow {
  id: string;
  driver: string;
  driverCode: string;
  division: string;
  region: string;
  category: string;
  payrollDate: string;
  status: 'closed' | 'open';
  amount: number;
  emailed: boolean;
  generatedAt: string;
}

export interface AuditRow {
  id: string;
  tripNo: string;
  flagStatus: 'none' | 'flagged' | 'exception';
  driverCode: string;
  description: string;
  type: string;
  createdOn: string;
}

export interface LedgerRow {
  id: string;
  driver: string;
  driverCode: string;
  txnDate: string;
  description: string;
  debit: number;
  credit: number;
  exchangeRate: number;
  exchangeAmount: number;
  balance: number;
  balanceFx: number;
  updatedBy: string;
}

export interface FuelRow {
  id: string;
  receiptNo: string;
  receiptDate: string;
  effectiveDate: string;
  payrollDate: string;
  driverCode: string;
  truckNo: string;
  itemType: string;
  qtyLtr: number;
  vendor: string;
  cityState: string;
  driverRate: number;
  tax: number;
  impactIfta: boolean;
  allowDeduction: boolean;
}

export type IncidentStatus = 'open' | 'scheduled' | 'ongoing' | 'rejected' | 'completed';

export interface IncidentNote {
  id: string;
  text: string;
  at: string;
  by: string;
}

export interface IncidentRow {
  id: string;
  driverCode: string;
  driverName: string;
  division: string;
  category: string;
  hireDate: string;
  truckNo: string;
  incidentType: string;
  from: string;
  to: string;
  email: string;
  status: IncidentStatus;
  emergencyName: string;
  emergencyPhone: string;
  emergencyAddress: string;
  createdBy: string;
  createdOn: string;
  notes: IncidentNote[];
}

export type DeductionType = 'deduct' | 'reimburse';

export interface DeductionRow {
  id: string;
  driverName: string;
  driverCode: string;
  division: string;
  region: string;
  effDate: string;
  dedCode: string;
  type: DeductionType;
  amount: number;
  currency: 'CAD' | 'USD' | 'Peso';
  paymentType: 'one-time' | 'installment';
  balancePaid: number;
  balanceTotal: number;
  paymentsDone: number;
  paymentsTotal: number;
  status: 'active' | 'closed';
  comments: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  payrollDate: string;
}

export interface OpsCatalogRow {
  id: string;
  name: string;
  code: string;
  division: string;
  category: string;
  amount: number;
  status: 'active' | 'inactive' | 'pending';
  effectiveDate: string;
  updatedBy: string;
  updatedAt: string;
}

