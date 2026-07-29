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
  timestamp: string;
  duration: string;
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
}

export interface IftaRow {
  id: string;
  state: string;
  totalMiles: number;
  tollMiles: number;
}

export interface TripNote {
  id: string;
  section: 'Payroll' | 'Driver' | 'Dispatch';
  body: string;
  author: string;
  at: string;
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
  exceptions: TripException[];
  events: TripEvent[];
  locations: LocationStop[];
  payments: PaymentRecord[];
  ifta: IftaRow[];
  notes: TripNote[];
  documents: { id: string; name: string; type: string }[];
  extras: { id: string; type: string; amount: number; status: string }[];
}

export type DetailTab =
  | 'payment'
  | 'extras'
  | 'properties'
  | 'documents'
  | 'notes'
  | 'ifta';

export type NotesSubTab = 'Payroll' | 'Driver' | 'Dispatch';
