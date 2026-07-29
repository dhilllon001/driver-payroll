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
  | 'data-entry'
  | 'trip-expense'
  | 'cash-advance'
  | 'config';

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

export interface PayrollRegion {
  id: string;
  name: string;
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
