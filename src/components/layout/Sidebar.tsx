import {
  Banknote,
  ClipboardList,
  FileBarChart,
  FileText,
  Flame,
  Fuel,
  LayoutGrid,
  LogOut,
  Map,
  PanelLeft,
  PanelLeftClose,
  Settings,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ViewId } from '../../types';

const PRIMARY: { id: ViewId; label: string; icon: typeof ClipboardList }[] = [
  { id: 'payroll', label: 'Payroll Management', icon: Wallet },
  { id: 'trip-board', label: 'Trip Processing Board', icon: LayoutGrid },
  { id: 'settlement', label: 'Settlement Report', icon: FileBarChart },
  { id: 'audit', label: 'Audit Report', icon: ClipboardList },
  { id: 'driver-ledger', label: 'Driver Ledger', icon: FileText },
  { id: 'fuel', label: 'Fuel Management', icon: Fuel },
  { id: 'incidents', label: 'MX Driver Incident', icon: ShieldAlert },
  { id: 'deductions', label: 'Deductions & Reimbursements', icon: Banknote },
];

const GROUPS: { label: string; items: { id: ViewId; label: string; icon: typeof ClipboardList }[] }[] =
  [
    {
      label: 'Operations',
      items: [
        { id: 'ifta', label: 'IFTA', icon: Map },
        { id: 'data-entry', label: 'Data Entry', icon: FileText },
        { id: 'trip-expense', label: 'Trip Expense', icon: Flame },
        { id: 'cash-advance', label: 'MX Cash Advance', icon: Banknote },
      ],
    },
  ];

export function Sidebar() {
  const { view, setView, sidebarCollapsed, setSidebarCollapsed, setSelectedTripId, setSearch } =
    useApp();

  const go = (id: ViewId) => {
    if (id !== view) setSearch('');
    setView(id);
    if (id === 'trip-board') setSelectedTripId(null);
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sb-top">
        <button
          type="button"
          className="sb-toggle"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed((c) => !c)}
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {!sidebarCollapsed && (
          <div className="sb-brand">
            Charger Logistics
            <span>Driver Payroll</span>
          </div>
        )}
      </div>

      <nav className="sb-nav">
        {PRIMARY.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item ${view === id ? 'active' : ''}`}
            onClick={() => go(id)}
            title={label}
          >
            <span className="nav-ico">
              <Icon size={16} strokeWidth={2} />
            </span>
            {!sidebarCollapsed && <span>{label}</span>}
          </button>
        ))}

        {!sidebarCollapsed &&
          GROUPS.map((g) => (
            <div key={g.label} className="nav-group">
              <div className="nav-section">{g.label}</div>
              <div className="nav-children">
                {g.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`nav-item nav-child ${view === id ? 'active' : ''}`}
                    onClick={() => go(id)}
                    title={label}
                  >
                    <span className="nav-ico">
                      <Icon size={14} strokeWidth={2} />
                    </span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

        {sidebarCollapsed &&
          GROUPS.flatMap((g) => g.items).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${view === id ? 'active' : ''}`}
              onClick={() => go(id)}
              title={label}
            >
              <span className="nav-ico">
                <Icon size={16} strokeWidth={2} />
              </span>
            </button>
          ))}

        <button
          type="button"
          className={`nav-item ${view === 'config' ? 'active' : ''}`}
          onClick={() => go('config')}
          title="Configuration"
        >
          <span className="nav-ico">
            <Settings size={16} strokeWidth={2} />
          </span>
          {!sidebarCollapsed && <span>Configuration</span>}
        </button>
      </nav>

      <div className="sb-user">
        <div className="sb-avatar">SD</div>
        {!sidebarCollapsed && (
          <>
            <div className="sb-user-meta">
              <div className="sb-user-name">Sukhdeep Profile</div>
              <div className="sb-user-role">Payroll Ops</div>
            </div>
            <button type="button" className="sb-logout" title="Logout" aria-label="Logout">
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
