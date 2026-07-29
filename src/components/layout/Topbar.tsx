import {
  Bell,
  Download,
  FileBarChart,
  Filter,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ViewId } from '../../types';

const TITLES: Record<ViewId, string> = {
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

type HeaderAction = {
  id: string;
  label: string;
  icon: typeof Search;
  variant: 'primary' | 'secondary' | 'ghost';
  toast: string;
};

type HeaderProfile = {
  placeholder: string;
  showSearch: boolean;
  actions: HeaderAction[];
  /** Center the search between title and right actions */
  centerSearch?: boolean;
};

const HEADERS: Record<ViewId, HeaderProfile> = {
  'trip-board': {
    placeholder: 'Search trips, drivers, equipment…',
    showSearch: true,
    actions: [
      { id: 'adv', label: 'Advanced Search', icon: Search, variant: 'secondary', toast: 'Advanced search coming soon' },
      { id: 'upload', label: 'Upload Pay', icon: Upload, variant: 'primary', toast: 'Upload Pay started' },
    ],
  },
  payroll: {
    placeholder: 'Search payroll dates, regions, creators…',
    showSearch: true,
    centerSearch: true,
    actions: [],
  },
  settlement: {
    placeholder: 'Search settlements, drivers, batches…',
    showSearch: true,
    actions: [
      { id: 'export', label: 'Export', icon: Download, variant: 'secondary', toast: 'Export started' },
      { id: 'gen', label: 'Generate Report', icon: FileBarChart, variant: 'primary', toast: 'Settlement report generating' },
    ],
  },
  audit: {
    placeholder: 'Search audit entries, trips, users…',
    showSearch: true,
    actions: [
      { id: 'filter', label: 'Filters', icon: Filter, variant: 'secondary', toast: 'Audit filters coming soon' },
      { id: 'export', label: 'Export', icon: Download, variant: 'primary', toast: 'Audit export started' },
    ],
  },
  'driver-ledger': {
    placeholder: 'Search drivers, ledger entries…',
    showSearch: true,
    actions: [
      { id: 'export', label: 'Export Ledger', icon: Download, variant: 'primary', toast: 'Ledger export started' },
    ],
  },
  fuel: {
    placeholder: 'Search fuel tickets, drivers, units…',
    showSearch: true,
    actions: [
      { id: 'import', label: 'Import Fuel', icon: Upload, variant: 'primary', toast: 'Fuel import started' },
    ],
  },
  incidents: {
    placeholder: 'Search incidents, drivers, locations…',
    showSearch: true,
    actions: [
      { id: 'add', label: 'Add Incident', icon: Plus, variant: 'primary', toast: 'Add incident coming soon' },
    ],
  },
  deductions: {
    placeholder: 'Search deductions, reimbursements…',
    showSearch: true,
    actions: [
      { id: 'add', label: 'Add Entry', icon: Plus, variant: 'primary', toast: 'Add deduction coming soon' },
    ],
  },
  ifta: {
    placeholder: 'Search IFTA periods, jurisdictions…',
    showSearch: true,
    actions: [
      { id: 'export', label: 'Export IFTA', icon: Download, variant: 'primary', toast: 'IFTA export started' },
    ],
  },
  'data-entry': {
    placeholder: 'Search data entry batches…',
    showSearch: true,
    actions: [
      { id: 'new', label: 'New Entry', icon: Plus, variant: 'primary', toast: 'New data entry started' },
    ],
  },
  'trip-expense': {
    placeholder: 'Search trip expenses, trips…',
    showSearch: true,
    actions: [
      { id: 'add', label: 'Add Expense', icon: Plus, variant: 'primary', toast: 'Add expense coming soon' },
    ],
  },
  'cash-advance': {
    placeholder: 'Search cash advances, drivers…',
    showSearch: true,
    actions: [
      { id: 'add', label: 'New Advance', icon: Plus, variant: 'primary', toast: 'New cash advance started' },
    ],
  },
  config: {
    placeholder: 'Search regions, methods, schedules…',
    showSearch: true,
    centerSearch: true,
    actions: [],
  },
};

export function Topbar() {
  const { view, search, setSearch, toast, selectedTripId } = useApp();
  const profile = HEADERS[view] ?? HEADERS['trip-board'];
  const title = selectedTripId ? 'Trip Detail' : TITLES[view] || 'Driver Payroll';
  const centered = profile.centerSearch && !selectedTripId;

  return (
    <header className={`topbar ${centered ? 'topbar-centered' : ''}`}>
      <h1 className="topbar-title">{title}</h1>

      {profile.showSearch && (
        <div className={`searchbar ${centered ? 'searchbar-center' : ''}`}>
          <Search size={14} strokeWidth={2} />
          <input
            type="search"
            placeholder={profile.placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={profile.placeholder}
          />
        </div>
      )}

      <div className="topbar-right">
        {profile.actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              className={`btn btn-${action.variant} btn-sm`}
              onClick={() => toast(action.toast)}
            >
              <Icon size={13} />
              {action.label}
            </button>
          );
        })}
        <button type="button" className="tico" aria-label="Notifications">
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
