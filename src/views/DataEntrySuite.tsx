import { Download, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BonusModal, CoverageDateModal, DriverRateModal, LoyaltyRateModal } from '../components/modals/DataEntryModals';
import { RowActionMenu, type RowActionItem } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import {
  CANADA_LOYALTY, CA_PAY_RECORDS, IFTA_REPORT_REQUESTS, IFTA_TAX_RATES, MANAGE_MILES,
  MONTREAL_BONUS, MX_BASE_PAY, REDUCED_RATES, USA_LOYALTY, USA_LOYALTY_RATES, US_OTR_BONUS,
} from '../data/dataEntrySeed';
import type { ViewId } from '../types';
import './modules.css';
import './data-entry.css';

type Row = Record<string, any>;
type ModalState = { kind: string; mode?: 'add' | 'edit'; row?: Row } | null;
type Column = { key: string; label: string; render?: (row: Row) => ReactNode; className?: string };

const EDIT_DELETE: RowActionItem[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];
const created = (r: Row) => <div className="driver-cell"><span className="name">{r.createdBy}</span><span className="uid">{r.createdAt}</span></div>;
const pill = (value: string, tone = '') => <span className={`de-pill ${tone || value.toLowerCase().replace(/\s/g, '-')}`}>{value}</span>;
const money = (amount: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

function Footer({ count, label }: { count: number; label?: string }) {
  return <div className="mod-pager"><strong>Total Records: {count}</strong><span className="mod-pager-nav">{label}</span></div>;
}

function Filters({ children, action }: { children?: ReactNode; action: ReactNode }) {
  return <div className="mod-filters">{children}<div className="mod-filters-actions">{action}</div></div>;
}

function SearchField({ value, onChange, label = 'Search' }: { value: string; onChange: (value: string) => void; label?: string }) {
  return <label className="mod-filter grow"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search records…" /></label>;
}

function Table({ rows, columns, actions, onAction, minWidth }: {
  rows: Row[]; columns: Column[]; actions?: RowActionItem[]; onAction?: (action: string, row: Row) => void; minWidth?: number;
}) {
  return (
    <div className="mod-table-shell">
      <div className="mod-table-scroll">
        <table className="data-table mod-table compact" style={minWidth ? { minWidth } : undefined}>
          <thead><tr>{actions && <th className="mod-action-col">Action</th>}{columns.map((column) => <th key={column.key} className={column.className}>{column.label}</th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}>
            {actions && <td className="mod-action-col"><RowActionMenu items={actions} onAction={(action) => onAction?.(action, row)} /></td>}
            {columns.map((column) => <td key={column.key} className={column.className}>{column.render ? column.render(row) : row[column.key]}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <Footer count={rows.length} />
    </div>
  );
}

function SimpleRecordModal({ kind, onClose, onSave }: { kind: 'tax' | 'california' | 'mx'; onClose: () => void; onSave: (row: Row) => void }) {
  const [form, setForm] = useState<Row>(kind === 'tax'
    ? { jurisdiction: '', rate: 0, effectiveFrom: '', effectiveTo: '' }
    : kind === 'california'
      ? { tripNo: '', hours: 0, amount: 0, payrollDate: '' }
      : { driverCode: '', driverName: '', basePay: 0, currency: 'MXN', status: 'active', effectiveFrom: '' });
  const set = (key: string, value: string | number) => setForm((old) => ({ ...old, [key]: value }));
  const valid = kind === 'tax' ? form.jurisdiction && form.rate > 0 && form.effectiveFrom && form.effectiveTo
    : kind === 'california' ? form.tripNo && form.hours > 0 && form.amount > 0 && form.payrollDate
      : form.driverCode && form.driverName && form.basePay > 0 && form.effectiveFrom;
  return <div className="modal-backdrop" onClick={onClose}><div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
    <div className="modal-head"><h3>{kind === 'tax' ? 'Add IFTA Rate' : kind === 'california' ? 'Add California Pay' : 'Add Mexico Base Pay'}</h3><button className="modal-close" onClick={onClose}>×</button></div>
    <div className="modal-body"><div className="mod-modal-grid">
      {kind === 'tax' && <><div className="field wide"><label>Jurisdiction *</label><input value={form.jurisdiction} onChange={(e) => set('jurisdiction', e.target.value.toUpperCase())} /></div><div className="field"><label>Rate *</label><input type="number" step=".0001" value={form.rate} onChange={(e) => set('rate', Number(e.target.value))} /></div><div className="field"><label>Effective From *</label><input type="date" value={form.effectiveFrom} onChange={(e) => set('effectiveFrom', e.target.value)} /></div><div className="field"><label>Effective To *</label><input type="date" value={form.effectiveTo} onChange={(e) => set('effectiveTo', e.target.value)} /></div></>}
      {kind === 'california' && <><div className="field"><label>Trip No. *</label><input value={form.tripNo} onChange={(e) => set('tripNo', e.target.value)} /></div><div className="field"><label>Payroll Date *</label><input type="date" value={form.payrollDate} onChange={(e) => set('payrollDate', e.target.value)} /></div><div className="field"><label>Hours *</label><input type="number" step=".25" value={form.hours} onChange={(e) => set('hours', Number(e.target.value))} /></div><div className="field"><label>Amount *</label><input type="number" step=".01" value={form.amount} onChange={(e) => set('amount', Number(e.target.value))} /></div></>}
      {kind === 'mx' && <><div className="field"><label>Driver Code *</label><input value={form.driverCode} onChange={(e) => set('driverCode', e.target.value)} /></div><div className="field"><label>Driver Name *</label><input value={form.driverName} onChange={(e) => set('driverName', e.target.value)} /></div><div className="field"><label>Base Pay *</label><input type="number" value={form.basePay} onChange={(e) => set('basePay', Number(e.target.value))} /></div><div className="field"><label>Effective From *</label><input type="date" value={form.effectiveFrom} onChange={(e) => set('effectiveFrom', e.target.value)} /></div></>}
    </div></div>
    <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!valid} onClick={() => onSave(form)}>Save</button></div>
  </div></div>;
}

function IftaTaxRate() {
  const { search, setSearch, toast } = useApp();
  const [rows, setRows] = useState<Row[]>(IFTA_TAX_RATES);
  const [active, setActive] = useState('all');
  const [modal, setModal] = useState<ModalState>(null);
  const filtered = rows.filter((r) => (active === 'all' || String(r.active) === active) && `${r.jurisdiction} ${r.createdBy}`.toLowerCase().includes(search.toLowerCase()));
  const save = (value: Row) => {
    if (modal?.kind === 'coverage') {
      setRows((all) => all.map((r) => ({ ...r, coverageFrom: value.coverageFrom, coverageTo: value.coverageTo })));
      toast(`Coverage saved · ${value.referenceNo}`);
    } else {
      setRows((all) => [{ id: `IFTA-${Date.now()}`, coverageFrom: '—', coverageTo: '—', createdBy: 'You', createdAt: 'Just now', active: true, ...value }, ...all]);
      toast('IFTA rate added');
    }
    setModal(null);
  };
  return <div className="mod-page">
    <Filters action={<><button className="btn btn-secondary btn-sm" onClick={() => setModal({ kind: 'coverage' })}>Save Coverage Date</button><button className="btn btn-primary btn-sm" onClick={() => setModal({ kind: 'tax' })}><Plus size={13} />Add Rate</button></>}>
      <SearchField value={search} onChange={setSearch} />
      <label className="mod-filter"><span>Status</span><select value={active} onChange={(e) => setActive(e.target.value)}><option value="all">All</option><option value="true">Active</option><option value="false">Inactive</option></select></label>
    </Filters>
    <Table rows={filtered} columns={[
      { key: 'jurisdiction', label: 'Jurisdiction' }, { key: 'rate', label: 'Rate', render: (r) => r.rate.toFixed(4) },
      { key: 'effective', label: 'Effective', render: (r) => <span>{r.effectiveFrom}<br /><small>{r.effectiveTo}</small></span> },
      { key: 'coverage', label: 'Coverage', render: (r) => <span>{r.coverageFrom}<br /><small>{r.coverageTo}</small></span> },
      { key: 'created', label: 'Created', render: created },
    ]} actions={[{ id: 'coverage', label: 'Edit Coverage', icon: Pencil }, { id: 'edit', label: 'Edit Rate', icon: Pencil }, { id: 'delete', label: 'Delete', icon: Trash2, danger: true }]} onAction={(action, row) => {
      if (action === 'delete') { setRows((all) => all.filter((r) => r.id !== row.id)); toast('Rate deleted'); }
      else if (action === 'coverage') setModal({ kind: 'coverage', row });
      else { setModal({ kind: 'tax', row }); toast(`Editing ${row.jurisdiction}`); }
    }} />
    {modal?.kind === 'coverage' && <CoverageDateModal onClose={() => setModal(null)} onSave={save} />}
    {modal?.kind === 'tax' && <SimpleRecordModal kind="tax" onClose={() => setModal(null)} onSave={save} />}
  </div>;
}

function IftaReports() {
  const { toast } = useApp();
  const [tab, setTab] = useState<'IFTA Report' | 'Road Tax' | 'Truck Mileage'>('IFTA Report');
  const [rows, setRows] = useState<Row[]>(IFTA_REPORT_REQUESTS);
  const fields = tab === 'IFTA Report' ? ['Quarter', 'Fleet', 'Jurisdictions'] : tab === 'Road Tax' ? ['Month', 'Country', 'Division'] : ['From Date', 'To Date', 'Truck'];
  return <div className="mod-page de-report-grid">
    <section className="de-report-builder">
      <div className="tabs">{(['IFTA Report', 'Road Tax', 'Truck Mileage'] as const).map((name) => <button key={name} className={`tab ${tab === name ? 'active' : ''}`} onClick={() => setTab(name)}>{name}</button>)}</div>
      <div className="de-report-form">{fields.map((field, i) => <div className="field" key={field}><label>{field}</label>{i === 0 && tab !== 'Truck Mileage' ? <select><option>{tab === 'IFTA Report' ? 'Q3 2026' : 'July 2026'}</option></select> : <input type={tab === 'Truck Mileage' && i < 2 ? 'date' : 'text'} placeholder={`Select ${field.toLowerCase()}`} />}</div>)}</div>
      <div className="de-report-submit"><button className="btn btn-primary" onClick={() => toast(`${tab} request submitted`)}>Generate Report</button></div>
    </section>
    <section className="mod-table-shell">
      <div className="de-section-title">Requested Reports</div>
      <div className="mod-table-scroll"><table className="data-table mod-table compact de-report-table"><thead><tr><th className="mod-action-col">Action</th><th>Report</th><th>Parameters</th><th>Status</th><th>Created By</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}><td className="mod-action-col"><RowActionMenu items={[{ id: 'download', label: 'Download', icon: Download }, { id: 'retry', label: 'Retry', icon: RefreshCw }, { id: 'delete', label: 'Delete', icon: Trash2, danger: true }]} onAction={(action) => action === 'delete' ? setRows((all) => all.filter((r) => r.id !== row.id)) : toast(`${action === 'retry' ? 'Retrying' : 'Downloading'} ${row.id}`)} /></td><td><strong>{row.reportType}</strong><br /><small>{row.id}</small></td><td>{row.fields.join(' · ')}</td><td>{pill(row.status, row.status)}</td><td>{created(row)}</td></tr>)}</tbody>
      </table></div><Footer count={rows.length} />
    </section>
  </div>;
}

function ReducedRate() {
  const { search, setSearch, toast } = useApp();
  const [rows, setRows] = useState<Row[]>(REDUCED_RATES);
  const [modal, setModal] = useState<ModalState>(null);
  const filtered = rows.filter((r) => `${r.driverCode} ${r.driverName} ${r.region} ${r.drivesFor}`.toLowerCase().includes(search.toLowerCase()));
  const save = (value: Row) => {
    if (modal?.mode === 'edit') setRows((all) => all.map((r) => r.id === modal.row?.id ? { ...r, ...value } : r));
    else setRows((all) => [{ id: `RR-${Date.now()}`, drivesFor: 'Bison Transport', region: 'Canada West', createdBy: 'You', createdAt: 'Just now', ...value }, ...all]);
    setModal(null); toast('Reduced rate saved');
  };
  return <div className="mod-page"><Filters action={<button className="btn btn-primary btn-sm" onClick={() => setModal({ kind: 'rate', mode: 'add' })}><Plus size={13} />Add Reduced Rate</button>}><SearchField value={search} onChange={setSearch} /></Filters>
    <Table rows={filtered} minWidth={1250} columns={[
      { key: 'driver', label: 'Driver', render: (r) => <div className="driver-cell"><span className="name">{r.driverName}</span><span className="uid">{r.driverCode}</span></div> },
      { key: 'drivesFor', label: 'Drives For' }, { key: 'region', label: 'Region' }, { key: 'deductMiles', label: 'Deduct Miles' }, { key: 'deductHour', label: 'Deduct Hour' },
      { key: 'dates', label: 'Date Range', render: (r) => `${r.startDate} – ${r.endDate}` }, { key: 'comment', label: 'Comment', className: 'mod-comment' },
      { key: 'status', label: 'Status', render: (r) => pill(r.status) }, { key: 'created', label: 'Created', render: created },
    ]} actions={EDIT_DELETE} onAction={(action, row) => action === 'delete' ? (setRows((all) => all.filter((r) => r.id !== row.id)), toast('Reduced rate deleted')) : setModal({ kind: 'rate', mode: 'edit', row })} />
    {modal?.kind === 'rate' && <DriverRateModal mode={modal.mode!} initial={modal.row} onClose={() => setModal(null)} onSave={save} />}
  </div>;
}

function CaliforniaPay() {
  const { toast } = useApp();
  const [rows, setRows] = useState<Row[]>(CA_PAY_RECORDS);
  const [date, setDate] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = rows.filter((r) => !date || r.payrollDate === date);
  return <div className="mod-page"><Filters action={<button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}><Plus size={13} />Add</button>}><label className="mod-filter"><span>Payroll Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></Filters>
    <Table rows={filtered} columns={[{ key: 'tripNo', label: 'Trip No.' }, { key: 'hours', label: 'Hours' }, { key: 'amount', label: 'Amount', render: (r) => money(r.amount) }, { key: 'payrollDate', label: 'Payroll Date' }]} actions={[{ id: 'delete', label: 'Delete', icon: Trash2, danger: true }]} onAction={(_, row) => { setRows((all) => all.filter((r) => r.id !== row.id)); toast('Pay record deleted'); }} />
    {open && <SimpleRecordModal kind="california" onClose={() => setOpen(false)} onSave={(row) => { setRows((all) => [{ id: `CAP-${Date.now()}`, ...row }, ...all]); setOpen(false); toast('California pay added'); }} />}
  </div>;
}

function BonusScreen({ kind }: { kind: 'montreal' | 'usa' | 'canada' | 'otr' }) {
  const source = kind === 'montreal' ? MONTREAL_BONUS : kind === 'usa' ? USA_LOYALTY : kind === 'canada' ? CANADA_LOYALTY : US_OTR_BONUS;
  const title = kind === 'montreal' ? 'Montreal Bonus' : kind === 'usa' ? 'USA Loyalty' : kind === 'canada' ? 'Canada Loyalty' : 'US OTR Bonus';
  const { search, setSearch, toast } = useApp();
  const [rows, setRows] = useState<Row[]>(source);
  const [modal, setModal] = useState<ModalState>(null);
  useEffect(() => setRows(source), [kind]);
  const filtered = rows.filter((r) => `${r.driverCode} ${r.driverName ?? ''} ${r.payrollMethod ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const columns: Column[] = kind === 'montreal' ? [
    { key: 'driverCode', label: 'Driver Code' }, { key: 'payrollMethod', label: 'Payroll Method', render: (r) => pill(r.payrollMethod, 'soft') }, { key: 'status', label: 'Status', render: (r) => pill(r.status) }, { key: 'created', label: 'Created', render: created },
  ] : kind === 'usa' ? [
    { key: 'driver', label: 'Driver', render: (r) => <div className="driver-cell"><span className="name">{r.driverName}</span><span className="uid">{r.driverCode}</span></div> }, { key: 'category', label: 'Category' }, { key: 'division', label: 'Division' }, { key: 'driverClass', label: 'Class' }, { key: 'loyaltyStatus', label: 'Loyalty', render: (r) => pill(r.loyaltyStatus) }, { key: 'created', label: 'Created', render: created },
  ] : kind === 'otr' ? [
    { key: 'driverCode', label: 'Driver Code' }, { key: 'status', label: 'Status', render: (r) => pill(r.status) }, { key: 'rate', label: 'Rate', render: (r) => Number(r.rate).toFixed(4) }, { key: 'created', label: 'Created', render: created },
  ] : [
    { key: 'driverCode', label: 'Driver Code' }, { key: 'status', label: 'Loyalty Status', render: (r) => pill(r.status) }, { key: 'created', label: 'Created', render: created }, { key: 'modified', label: 'Modified', render: (r) => <div className="driver-cell"><span className="name">{r.modifiedBy}</span><span className="uid">{r.modifiedAt}</span></div> },
  ];
  const save = (value: Row) => {
    const normalized = kind === 'usa' ? { ...value, loyaltyStatus: value.status } : value;
    if (modal?.mode === 'edit') setRows((all) => all.map((r) => r.id === modal.row?.id ? { ...r, ...normalized } : r));
    else setRows((all) => [{ id: `${kind}-${Date.now()}`, createdBy: 'You', createdAt: 'Just now', modifiedBy: 'You', modifiedAt: 'Just now', ...normalized }, ...all]);
    setModal(null); toast(`${title} saved`);
  };
  return <div className="mod-page"><Filters action={<button className="btn btn-primary btn-sm" onClick={() => setModal({ kind, mode: 'add' })}><Plus size={13} />Add</button>}><SearchField value={search} onChange={setSearch} /></Filters>
    <Table rows={filtered} columns={columns} actions={EDIT_DELETE} onAction={(action, row) => action === 'delete' ? (setRows((all) => all.filter((r) => r.id !== row.id)), toast(`${title} deleted`)) : setModal({ kind, mode: 'edit', row })} />
    {modal && <BonusModal title={title} mode={modal.mode!} fields={kind} initial={modal.row} onClose={() => setModal(null)} onSave={save} />}
  </div>;
}

function LoyaltyRates() {
  const { toast } = useApp();
  const [rows, setRows] = useState<Row[]>(USA_LOYALTY_RATES);
  const [modal, setModal] = useState<ModalState>(null);
  const save = (value: Row) => {
    if (modal?.mode === 'edit') setRows((all) => all.map((r) => r.id === modal.row?.id ? { ...r, ...value } : r));
    else setRows((all) => [{ id: `ULR-${Date.now()}`, ...value }, ...all]);
    setModal(null); toast('Loyalty rate saved');
  };
  return <div className="mod-page"><Filters action={<button className="btn btn-primary btn-sm" onClick={() => setModal({ kind: 'loyalty-rate', mode: 'add' })}><Plus size={13} />Add Rate</button>} />
    <Table rows={rows} columns={[
      { key: 'role', label: 'Role', render: (r) => pill(r.role, 'soft teal') }, { key: 'type', label: 'Type', render: (r) => pill(r.type, 'soft purple') },
      { key: 'driverClass', label: 'Driver Class', render: (r) => pill(r.driverClass, 'soft') }, { key: 'paidBy', label: 'Paid By', render: (r) => pill(r.paidBy, 'soft teal') },
      { key: 'rate', label: 'Rate', render: (r) => Number(r.rate).toFixed(3) },
    ]} actions={EDIT_DELETE} onAction={(action, row) => action === 'delete' ? setRows((all) => all.filter((r) => r.id !== row.id)) : setModal({ kind: 'loyalty-rate', mode: 'edit', row })} />
    {modal && <LoyaltyRateModal mode={modal.mode!} initial={modal.row} onClose={() => setModal(null)} onSave={save} />}
  </div>;
}

function ManageMiles() {
  const { toast } = useApp();
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', diff: '' });
  const set = (key: keyof typeof filters, value: string) => setFilters((old) => ({ ...old, [key]: value }));
  const rows = useMemo(() => searched ? MANAGE_MILES.filter((r) => `${r.fromName} ${r.fromAddress}`.toLowerCase().includes(filters.from.toLowerCase()) && `${r.toName} ${r.toAddress}`.toLowerCase().includes(filters.to.toLowerCase()) && (!filters.diff || r.alkDiff.includes(filters.diff))) : [], [searched, filters]);
  return <div className="mod-page"><Filters action={<button className="btn btn-primary btn-sm" onClick={() => setSearched(true)}><Search size={13} />Search</button>}>
    <label className="mod-filter grow"><span>From Location</span><input value={filters.from} onChange={(e) => set('from', e.target.value)} placeholder="Name or address" /></label>
    <label className="mod-filter grow"><span>To Location</span><input value={filters.to} onChange={(e) => set('to', e.target.value)} placeholder="Name or address" /></label>
    <label className="mod-filter"><span>Miles Diff</span><input value={filters.diff} onChange={(e) => set('diff', e.target.value)} placeholder="e.g. +4" /></label>
  </Filters>
  <div className="mod-table-shell"><div className="mod-table-scroll">{!searched ? <div className="empty-state">Please enter search locations</div> : <table className="data-table mod-table compact de-miles-table"><thead><tr><th rowSpan={2} className="mod-action-col">Action</th><th colSpan={3}>From Location</th><th colSpan={3}>To Location</th><th colSpan={4}>ALK Miles</th></tr><tr><th>Name</th><th>Address</th><th>Verified / Status</th><th>Name</th><th>Address</th><th>Verified / Status</th><th>Postal</th><th>Lat/Long</th><th>Diff</th><th>Address</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td className="mod-action-col"><RowActionMenu items={[{ id: 'review', label: 'Review Route', icon: Search }]} onAction={() => toast(`Opening ${r.id}`)} /></td><td>{r.fromName}</td><td>{r.fromAddress}</td><td>{pill(r.fromVerified ? 'Verified' : r.fromStatus, r.fromVerified ? 'include' : 'failed')}</td><td>{r.toName}</td><td>{r.toAddress}</td><td>{pill(r.toVerified ? 'Verified' : r.toStatus, r.toVerified ? 'include' : 'failed')}</td><td>{r.alkPostal}</td><td>{r.alkLatLong}</td><td>{r.alkDiff}</td><td>{r.alkAddress}</td></tr>)}</tbody></table>}</div><Footer count={rows.length} /></div>
  </div>;
}

function MexicoBasePay() {
  const { search, setSearch, toast } = useApp();
  const [rows, setRows] = useState<Row[]>(MX_BASE_PAY);
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const filtered = rows.filter((r) => (status === 'all' || r.status === status) && `${r.driverCode} ${r.driverName}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="mod-page"><Filters action={<button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}><Plus size={13} />Add</button>}><SearchField value={search} onChange={setSearch} /><label className="mod-filter"><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All</option><option>active</option><option>inactive</option></select></label></Filters>
    <Table rows={filtered} columns={[
      { key: 'driver', label: 'Driver', render: (r) => <div className="driver-cell"><span className="name">{r.driverName}</span><span className="uid">{r.driverCode}</span></div> },
      { key: 'basePay', label: 'Base Pay', render: (r) => money(r.basePay, 'MXN') }, { key: 'currency', label: 'Currency' }, { key: 'status', label: 'Status', render: (r) => pill(r.status) }, { key: 'effectiveFrom', label: 'Effective From' }, { key: 'updated', label: 'Updated', render: (r) => <div className="driver-cell"><span className="name">{r.updatedBy}</span><span className="uid">{r.updatedAt}</span></div> },
    ]} actions={EDIT_DELETE} onAction={(action, row) => action === 'delete' ? (setRows((all) => all.filter((r) => r.id !== row.id)), toast('Base pay deleted')) : toast(`Editing ${row.driverCode}`)} />
    {open && <SimpleRecordModal kind="mx" onClose={() => setOpen(false)} onSave={(row) => { setRows((all) => [{ id: `MXP-${Date.now()}`, updatedBy: 'You', updatedAt: 'Just now', ...row }, ...all]); setOpen(false); toast('Base pay added'); }} />}
  </div>;
}

export function DataEntrySuite({ id }: { id: ViewId }) {
  switch (id) {
    case 'ifta-tax-rate': return <IftaTaxRate />;
    case 'ifta-reports': return <IftaReports />;
    case 'de-driver-reduced-rate': return <ReducedRate />;
    case 'de-california-pay': return <CaliforniaPay />;
    case 'de-montreal-bonus': return <BonusScreen kind="montreal" />;
    case 'de-usa-loyalty': return <BonusScreen kind="usa" />;
    case 'de-usa-loyalty-rate': return <LoyaltyRates />;
    case 'de-us-otr-bonus': return <BonusScreen kind="otr" />;
    case 'de-canada-loyalty': return <BonusScreen kind="canada" />;
    case 'de-manage-miles': return <ManageMiles />;
    case 'de-mx-base-pay': return <MexicoBasePay />;
    default: return <ReducedRate />;
  }
}
