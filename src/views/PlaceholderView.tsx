import { opsTitle } from '../data/opsSeed';
import type { ViewId } from '../types';

const LABELS: Partial<Record<ViewId, string>> = {
  'trip-board': 'Trip Processing Board',
  payroll: 'Payroll Management',
  settlement: 'Settlement Report',
  audit: 'Audit Report',
  'driver-ledger': 'Driver Ledger',
  fuel: 'Fuel Management',
  incidents: 'MX Driver Incident',
  deductions: 'Deductions',
  config: 'Payroll Configuration',
  'config-regions': 'Regions',
  'config-methods': 'Methods',
  'config-schedules': 'Schedules',
};

export function PlaceholderView({ id }: { id: ViewId }) {
  const title = LABELS[id] || opsTitle(id) || id;
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>
        This module is wired into navigation and styled with the Accessorial Management theme.
        Open <strong>Trip Processing Board</strong> or <strong>Payroll Management</strong> for full
        redesigned workflows.
      </p>
    </div>
  );
}
