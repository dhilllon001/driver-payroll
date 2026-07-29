import { Bell, Search, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TITLES: Record<string, string> = {
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
  config: 'Payroll Configuration',
};

export function Topbar() {
  const { view, search, setSearch, toast, selectedTripId } = useApp();
  const title = selectedTripId ? 'Trip Detail' : TITLES[view] || 'Driver Payroll';

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="searchbar">
        <Search size={14} strokeWidth={2} />
        <input
          type="search"
          placeholder="Search trips, drivers, equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="topbar-right">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => toast('Advanced search coming soon')}
        >
          <Search size={13} />
          Advanced Search
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => toast('Upload Pay started')}
        >
          <Upload size={13} />
          Upload Pay
        </button>
        <button type="button" className="tico" aria-label="Notifications">
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
