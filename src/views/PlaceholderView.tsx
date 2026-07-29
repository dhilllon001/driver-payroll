import type { ViewId } from '../types';

const LABELS: Record<ViewId, string> = {
  'trip-board': 'Trip Processing Board',
  payroll: 'Payroll Management',
  settlement: 'Settlement Report',
  audit: 'Audit Report',
  'driver-ledger': 'Driver Ledger',
  fuel: 'Fuel Management',
  incidents: 'MX Driver Incident',
  deductions: 'Deductions & Reimbursements',
  ifta: 'IFTA',
  'data-entry': 'Data Entry',
  'trip-expense': 'Trip Expense',
  'cash-advance': 'MX Cash Advance',
  config: 'Configuration',
};

export function PlaceholderView({ id }: { id: ViewId }) {
  return (
    <div className="placeholder-page">
      <h1>{LABELS[id]}</h1>
      <p>
        This module is wired into navigation and styled with the Accessorial Management theme.
        Open <strong>Trip Processing Board</strong> for the full redesigned payroll workflow.
      </p>
    </div>
  );
}
