import { Bell, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { opsTitle } from '../../data/opsSeed';
import type { ConfigStatus, ViewId } from '../../types';
import { Tooltip } from '../ui/Tooltip';

const TITLES: Partial<Record<ViewId, string>> = {
  'trip-board': 'Trip Processing Board',
  payroll: 'Payroll Management',
  settlement: 'Settlement Report',
  audit: 'Audit Report',
  'driver-ledger': 'Driver Ledger',
  fuel: 'Fuel Management',
  incidents: 'MX Driver Incident',
  deductions: 'Deductions',
  ifta: 'IFTA',
  'ifta-tax-rate': 'IFTA Tax Rate',
  'ifta-reports': 'IFTA Reports',
  'data-entry': 'Data Entry',
  'trip-expense': 'Trip Expense',
  'cash-advance': 'MX Cash Advance',
  'ca-issue': 'Issue Cash Advance',
  'ca-board': 'Cash Advances',
  'ca-history': 'Cash Advance History',
  'ca-bulk': 'Bulk Issue',
  nomilinea: 'Nomilinea',
  'nomilinea-payroll': 'Nomilinea Payroll',
  'nomilinea-concepts': 'Nomilinea Concepts',
  config: 'Payroll Configuration',
  'config-regions': 'Regions',
  'config-methods': 'Methods',
  'config-schedules': 'Schedules',
};

type HeaderProfile = {
  placeholder: string;
  showSearch: boolean;
  centerSearch?: boolean;
};

const DEFAULT_OPS: HeaderProfile = {
  placeholder: 'Search records…',
  showSearch: true,
  centerSearch: true,
};

const HEADERS: Partial<Record<ViewId, HeaderProfile>> = {
  'trip-board': {
    placeholder: 'Search trips, drivers, equipment…',
    showSearch: true,
    centerSearch: true,
  },
  payroll: {
    placeholder: 'Search payroll dates, regions, creators…',
    showSearch: true,
    centerSearch: true,
  },
  settlement: {
    placeholder: 'Search settlements, drivers, divisions…',
    showSearch: true,
    centerSearch: true,
  },
  audit: {
    placeholder: 'Search audit trips, drivers, descriptions…',
    showSearch: true,
    centerSearch: true,
  },
  'driver-ledger': {
    placeholder: 'Search ledger drivers, descriptions…',
    showSearch: true,
    centerSearch: true,
  },
  fuel: {
    placeholder: 'Search receipts, drivers, trucks…',
    showSearch: true,
    centerSearch: true,
  },
  incidents: {
    placeholder: 'Search incidents by driver code or name…',
    showSearch: true,
    centerSearch: true,
  },
  deductions: {
    placeholder: 'Search deductions, reimbursements, comments…',
    showSearch: true,
    centerSearch: true,
  },
  'ca-board': {
    placeholder: 'Search drivers, amounts, IDs, trip numbers…',
    showSearch: true,
    centerSearch: true,
  },
  'cash-advance': {
    placeholder: 'Search drivers, amounts, IDs, trip numbers…',
    showSearch: true,
    centerSearch: true,
  },
  'ca-history': {
    placeholder: 'Search drivers, amounts, reference numbers, trip…',
    showSearch: true,
    centerSearch: true,
  },
  'ca-bulk': {
    placeholder: 'Search bulk rows…',
    showSearch: true,
    centerSearch: true,
  },
  'ca-issue': {
    placeholder: 'Search…',
    showSearch: false,
    centerSearch: false,
  },
  config: {
    placeholder: 'Search regions, methods, schedules…',
    showSearch: true,
    centerSearch: true,
  },
  'config-regions': {
    placeholder: 'Search regions, divisions…',
    showSearch: true,
    centerSearch: true,
  },
  'config-methods': {
    placeholder: 'Search methods…',
    showSearch: true,
    centerSearch: true,
  },
  'config-schedules': {
    placeholder: 'Search schedules…',
    showSearch: true,
    centerSearch: true,
  },
};

function titleFor(view: ViewId) {
  return TITLES[view] || opsTitle(view) || 'Driver Payroll';
}

function profileFor(view: ViewId): HeaderProfile {
  return HEADERS[view] || DEFAULT_OPS;
}

export function Topbar() {
  const {
    view,
    search,
    setSearch,
    selectedTripId,
    configStatusFilter,
    setConfigStatusFilter,
    pageHeader,
  } = useApp();
  const profile = profileFor(view);
  const title = selectedTripId ? 'Trip Detail' : titleFor(view);
  const centered = profile.centerSearch && !selectedTripId;
  const actions = !selectedTripId && pageHeader ? pageHeader.actions : [];
  const showStatus = !selectedTripId && !!pageHeader?.showStatus;

  return (
    <header className={`topbar ${centered ? 'topbar-centered' : ''}`}>
      <h1 className="topbar-title">{title}</h1>

      {profile.showSearch && (
        <div className={`topbar-search-cluster ${centered ? 'is-centered' : ''}`}>
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
          <div id="topbar-inline-filters" className="topbar-inline-filters" />
        </div>
      )}

      {!profile.showSearch && <div id="topbar-inline-filters" className="topbar-inline-filters" />}

      <div className="topbar-right">
        {showStatus && (
          <label className="topbar-status" data-tooltip="Filter by status" data-tooltip-side="bottom">
            <span className="sr-only">Status</span>
            <select
              value={configStatusFilter}
              onChange={(e) => setConfigStatusFilter(e.target.value as 'all' | ConfigStatus)}
              aria-label="Filter by status"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        )}

        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              className={`topbar-btn ${action.primary ? 'topbar-btn-primary' : 'topbar-btn-secondary'}`}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              <Icon size={13} strokeWidth={2.25} />
              <span>{action.label}</span>
            </button>
          );
        })}

        <Tooltip label="Notifications" side="bottom">
          <button type="button" className="tico" aria-label="Notifications">
            <Bell size={15} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
