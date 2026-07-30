import {
  Banknote,
  ChevronDown,
  ClipboardList,
  FileBarChart,
  FileText,
  Fuel,
  LayoutGrid,
  LogOut,
  Map,
  PanelLeft,
  PanelLeftClose,
  Receipt,
  Settings,
  ShieldAlert,
  Ticket,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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

type NavChild = { id: ViewId; label: string };
type NavFolder = {
  key: string;
  label: string;
  icon: typeof ClipboardList;
  children: NavChild[];
  /** Parent landing view when folder itself is clicked while collapsed */
  defaultId: ViewId;
};

const FOLDERS: NavFolder[] = [
  {
    key: 'ifta',
    label: 'IFTA',
    icon: Map,
    defaultId: 'ifta-tax-rate',
    children: [
      { id: 'ifta-tax-rate', label: 'IFTA Tax Rate' },
      { id: 'ifta-reports', label: 'IFTA Reports' },
    ],
  },
  {
    key: 'data-entry',
    label: 'Data Entry',
    icon: FileText,
    defaultId: 'de-driver-reduced-rate',
    children: [
      { id: 'de-driver-reduced-rate', label: 'Driver Reduced Rate' },
      { id: 'de-california-pay', label: 'California Pay Record' },
      { id: 'de-montreal-bonus', label: 'Montreal Bonus' },
      { id: 'de-usa-loyalty', label: 'USA Loyalty Bonus' },
      { id: 'de-usa-loyalty-rate', label: 'USA Loyalty Bonus Rate' },
      { id: 'de-us-otr-bonus', label: 'US OTR Bonus (Excluded Drivers)' },
      { id: 'de-canada-loyalty', label: 'Canada Loyalty Bonus' },
      { id: 'de-manage-miles', label: 'Manage Miles' },
      { id: 'de-mx-base-pay', label: 'Mx-Base Pay' },
    ],
  },
  {
    key: 'trip-expense',
    label: 'Trip Expense',
    icon: Receipt,
    defaultId: 'te-assigned',
    children: [
      { id: 'te-assigned', label: 'Assigned To Me' },
      { id: 'te-unassigned', label: 'Unassigned' },
      { id: 'te-reimbursements', label: 'Reimbursements' },
      { id: 'te-history', label: 'History' },
      { id: 'te-bulk-uploads', label: 'Bulk Uploads' },
    ],
  },
  {
    key: 'nomilinea',
    label: 'Nomilinea',
    icon: Ticket,
    defaultId: 'nomilinea-concepts',
    children: [
      { id: 'nomilinea-payroll', label: 'Nomilinea Payroll' },
      { id: 'nomilinea-concepts', label: 'Nomilinea Concepts' },
    ],
  },
];

const CONFIG_FOLDER: NavFolder = {
  key: 'config',
  label: 'Payroll Configuration',
  icon: Settings,
  defaultId: 'config-regions',
  children: [
    { id: 'config-regions', label: 'Regions' },
    { id: 'config-methods', label: 'Methods' },
    { id: 'config-schedules', label: 'Schedules' },
  ],
};

const SINGLE_OPS: { id: ViewId; label: string; icon: typeof ClipboardList }[] = [
  { id: 'cash-advance', label: 'MX Cash Advance', icon: Banknote },
];

function folderOpenForView(view: ViewId, folder: NavFolder) {
  return folder.children.some((c) => c.id === view) || view === folder.key;
}

export function Sidebar() {
  const { view, setView, sidebarCollapsed, setSidebarCollapsed, setSelectedTripId, setSearch } =
    useApp();

  const initialOpen = useMemo(() => {
    const keys = new Set<string>();
    for (const f of [...FOLDERS, CONFIG_FOLDER]) {
      if (folderOpenForView(view, f)) keys.add(f.key);
    }
    // Default expand Trip Expense + Data Entry like legacy screenshots
    if (keys.size === 0) {
      keys.add('ifta');
      keys.add('data-entry');
      keys.add('trip-expense');
    }
    if (view === 'config' || view.startsWith('config-')) keys.add('config');
    return keys;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- seed once

  const [openFolders, setOpenFolders] = useState<Set<string>>(initialOpen);

  const go = (id: ViewId) => {
    if (id !== view) setSearch('');
    setView(id);
    if (id === 'trip-board') setSelectedTripId(null);
  };

  const toggleFolder = (key: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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

        {!sidebarCollapsed && (
          <div className="nav-group">
            <div className="nav-section">Operations</div>

            {FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const open = openFolders.has(folder.key) || folderOpenForView(view, folder);
              const childActive = folder.children.some((c) => c.id === view);
              return (
                <div key={folder.key} className="nav-folder">
                  <button
                    type="button"
                    className={`nav-item nav-folder-btn ${childActive ? 'has-active' : ''}`}
                    onClick={() => {
                      toggleFolder(folder.key);
                      if (!open) go(folder.defaultId);
                    }}
                    title={folder.label}
                    aria-expanded={open}
                  >
                    <span className="nav-ico">
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <span className="nav-label">{folder.label}</span>
                    <ChevronDown
                      size={14}
                      className={`nav-chevron ${open ? 'open' : ''}`}
                      strokeWidth={2}
                    />
                  </button>
                  {open && (
                    <div className="nav-children">
                      {folder.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          className={`nav-item nav-child ${view === child.id ? 'active' : ''}`}
                          onClick={() => go(child.id)}
                          title={child.label}
                        >
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {SINGLE_OPS.map(({ id, label, icon: Icon }) => (
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
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {sidebarCollapsed &&
          [
            ...FOLDERS.map((f) => ({ id: f.defaultId, label: f.label, icon: f.icon })),
            ...SINGLE_OPS,
            { id: CONFIG_FOLDER.defaultId, label: CONFIG_FOLDER.label, icon: CONFIG_FOLDER.icon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${view === id || (id === 'config-regions' && view.startsWith('config')) ? 'active' : ''}`}
              onClick={() => go(id)}
              title={label}
            >
              <span className="nav-ico">
                <Icon size={16} strokeWidth={2} />
              </span>
            </button>
          ))}

        {!sidebarCollapsed && (() => {
          const folder = CONFIG_FOLDER;
          const Icon = folder.icon;
          const open = openFolders.has(folder.key) || folderOpenForView(view, folder) || view === 'config';
          const childActive =
            folder.children.some((c) => c.id === view) || view === 'config';
          return (
            <div className="nav-folder cfg-nav-folder">
              <button
                type="button"
                className={`nav-item nav-folder-btn ${childActive ? 'has-active' : ''}`}
                onClick={() => {
                  toggleFolder(folder.key);
                  if (!open) go(folder.defaultId);
                }}
                title={folder.label}
                aria-expanded={open}
              >
                <span className="nav-ico">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="nav-label">{folder.label}</span>
                <ChevronDown
                  size={14}
                  className={`nav-chevron ${open ? 'open' : ''}`}
                  strokeWidth={2}
                />
              </button>
              {open && (
                <div className="nav-children">
                  {folder.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`nav-item nav-child ${view === child.id || (view === 'config' && child.id === 'config-regions') ? 'active' : ''}`}
                      onClick={() => go(child.id)}
                      title={child.label}
                    >
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
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
