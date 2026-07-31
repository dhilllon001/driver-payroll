import {
  Check,
  Download,
  Eye,
  FileText,
  LayoutGrid,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Table2,
  Upload,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { HeaderFilters } from '../components/layout/HeaderFilters';
import {
  CashAdvanceAddModal,
  CashAdvanceDetailModal,
  CashAdvanceEditModal,
  CashAdvanceNotesPanel,
} from '../components/modals/CashAdvanceModals';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import {
  CA_DIVISIONS,
  CA_DRIVERS,
  CA_HISTORY,
  CA_STATUSES,
  CA_TYPES,
  CASH_ADVANCE_ROWS,
  initials,
} from '../data/cashAdvanceSeed';
import { usePageHeader } from '../hooks/usePageHeader';
import type { CashAdvanceRow, CashAdvanceStatus, ViewId } from '../types';
import './modules.css';
import './cash-advance.css';

const moneyMx = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' });
const moneyUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmt = (amount: number, currency: 'MXN' | 'USD') =>
  (currency === 'USD' ? moneyUsd : moneyMx).format(amount);

function BoardView() {
  const { search, toast } = useApp();
  const [rows, setRows] = useState(() =>
    CASH_ADVANCE_ROWS.map((r) => ({ ...r, notes: [...r.notes] })),
  );
  const [status, setStatus] = useState<CashAdvanceStatus | 'all'>('open');
  const [from, setFrom] = useState('2026-07-01');
  const [to, setTo] = useState('2026-07-31');
  const [layout, setLayout] = useState<'table' | 'cards'>('table');
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<CashAdvanceRow | null>(null);
  const [detailRow, setDetailRow] = useState<CashAdvanceRow | null>(null);
  const [notesRow, setNotesRow] = useState<CashAdvanceRow | null>(null);

  const counts = useMemo(() => {
    const map = Object.fromEntries(CA_STATUSES.map((s) => [s.id, 0])) as Record<
      CashAdvanceStatus,
      number
    >;
    rows.forEach((r) => {
      map[r.status] += 1;
    });
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (
        q &&
        !`${r.id} ${r.driverName} ${r.driverCode} ${r.tripNumber} ${r.truck} ${r.amount}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [rows, status, search]);

  usePageHeader([
    {
      id: 'bulk-add',
      label: 'Bulk Add',
      icon: Upload,
      onClick: () => toast('Bulk add opened'),
    },
    {
      id: 'add',
      label: 'Add New',
      icon: Plus,
      primary: true,
      onClick: () => setAddOpen(true),
    },
  ]);

  const rowActions = [
    { id: 'view', label: 'View Details', icon: Eye },
    { id: 'edit', label: 'Edit', icon: Pencil },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const onAction = (id: string, row: CashAdvanceRow) => {
    if (id === 'view') setDetailRow(row);
    else if (id === 'edit') setEditRow(row);
    else if (id === 'notes') setNotesRow(row);
    else toast(`Exported ${row.id}`);
  };

  return (
    <div className="mod-page ca-page">
      <HeaderFilters>
        <div className="topbar-date-range" role="group" aria-label="Date range">
          <span className="label">Date</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
          <span className="sep">–</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
        </div>
      </HeaderFilters>

      <div className="ca-stage-strip" role="tablist" aria-label="Cash advance stages">
        {CA_STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={status === s.id}
            className={`ca-stage ${status === s.id ? 'active' : ''} tone-${s.id}`}
            onClick={() => setStatus(s.id)}
          >
            <span className="ca-stage-label">{s.label}</span>
            <span className="ca-stage-count">{counts[s.id]}</span>
          </button>
        ))}
      </div>

      <div className="ca-toolbar">
        <div className="ca-view-toggle" role="group" aria-label="Layout">
          <button
            type="button"
            className={layout === 'table' ? 'active' : ''}
            onClick={() => setLayout('table')}
          >
            <Table2 size={14} />
            Table
          </button>
          <button
            type="button"
            className={layout === 'cards' ? 'active' : ''}
            onClick={() => setLayout('cards')}
          >
            <LayoutGrid size={14} />
            Cards
          </button>
        </div>
        <div className="ca-toolbar-meta">
          <strong>{filtered.length}</strong> records
          <button
            type="button"
            className="btn-icon"
            aria-label="Refresh"
            data-tooltip="Refresh"
            onClick={() => toast('Refreshed')}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {layout === 'table' ? (
        <div className="mod-table-shell">
          <div className="mod-table-scroll">
            <table className="data-table mod-table compact">
              <thead>
                <tr>
                  <th className="mod-action-col">Action</th>
                  <th>ID</th>
                  <th>Driver Name</th>
                  <th>Driver Code</th>
                  <th>Division</th>
                  <th>Trip Number</th>
                  <th>Truck</th>
                  <th>Trailer</th>
                  <th>Probill</th>
                  <th>Customer</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="mod-action-col">
                      <div className="ca-row-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          aria-label="Notes"
                          data-tooltip="Notes"
                          onClick={() => setNotesRow(r)}
                        >
                          <FileText size={14} />
                        </button>
                        <RowActionMenu items={rowActions} onAction={(id) => onAction(id, r)} />
                      </div>
                    </td>
                    <td>
                      <button type="button" className="mod-link" onClick={() => setDetailRow(r)}>
                        {r.id}
                      </button>
                    </td>
                    <td>{r.driverName}</td>
                    <td>{r.driverCode}</td>
                    <td>{r.division}</td>
                    <td>{r.tripNumber}</td>
                    <td>{r.truck}</td>
                    <td>{r.trailer}</td>
                    <td>{r.probill}</td>
                    <td>{r.customer}</td>
                    <td className="tnum">{fmt(r.amount, r.currency)}</td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state">No cash advances in this stage.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="ca-card-grid">
          {filtered.map((r) => (
            <article key={r.id} className="ca-board-card">
              <header>
                <div>
                  <strong>{r.driverName}</strong>
                  <span>{r.driverCode}</span>
                </div>
                <span className={`ca-status-pill ${r.status}`}>{r.status.replace(/-/g, ' ')}</span>
              </header>
              <div className="ca-board-amount">{fmt(r.amount, r.currency)}</div>
              <div className="ca-board-meta">
                <span>Trip {r.tripNumber}</span>
                <span>{r.division}</span>
                <span>
                  {r.truck} · {r.trailer}
                </span>
              </div>
              <footer>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetailRow(r)}>
                  Details
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditRow(r)}>
                  Edit
                </button>
              </footer>
            </article>
          ))}
          {!filtered.length && <div className="empty-state">No cash advances in this stage.</div>}
        </div>
      )}

      {addOpen && (
        <CashAdvanceAddModal
          onClose={() => setAddOpen(false)}
          onSave={(patch) => {
            const id = String(38800 + rows.length);
            setRows((all) => [
              {
                id,
                driverName: patch.driverName || '',
                driverCode: patch.driverCode || '',
                division: patch.division || CA_DIVISIONS[0],
                tripNumber: '—',
                truck: '—',
                trailer: '—',
                probill: '—',
                customer: '—',
                amount: patch.amount || 0,
                currency: patch.currency || 'MXN',
                type: patch.type || 'Advance',
                subCategory: patch.subCategory || 'Advance',
                status: 'open',
                doNotPay: !!patch.doNotPay,
                comments: patch.comments || '',
                createdBy: 'You',
                createdOn: 'Just now',
                issuedBy: '—',
                issuedOn: '—',
                authorizedBy: '—',
                referenceNumber: `REF-${Date.now()}`,
                reasonCode: 'CASHADV',
                weeklyTotal: patch.amount || 0,
                notes: [],
              },
              ...all,
            ]);
            setAddOpen(false);
            setStatus('open');
            toast('Cash advance added');
          }}
        />
      )}
      {editRow && (
        <CashAdvanceEditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={(patch) => {
            setRows((all) => all.map((r) => (r.id === editRow.id ? { ...r, ...patch } : r)));
            setEditRow(null);
            toast('Details saved');
          }}
        />
      )}
      {detailRow && (
        <CashAdvanceDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onCancel={() => {
            setRows((all) =>
              all.map((r) => (r.id === detailRow.id ? { ...r, status: 'rejected' as const } : r)),
            );
            setDetailRow(null);
            toast('Request cancelled');
          }}
        />
      )}
      {notesRow && (
        <CashAdvanceNotesPanel
          row={notesRow}
          onClose={() => setNotesRow(null)}
          onAdd={(text) => {
            const note = { id: `n-${Date.now()}`, text, at: 'Just now', by: 'You' };
            setRows((all) =>
              all.map((r) => (r.id === notesRow.id ? { ...r, notes: [note, ...r.notes] } : r)),
            );
            setNotesRow((cur) => (cur ? { ...cur, notes: [note, ...cur.notes] } : cur));
            toast('Note added');
          }}
        />
      )}
    </div>
  );
}

function IssueView() {
  const { toast } = useApp();
  const [paymentType, setPaymentType] = useState<'qcheck' | 'commcheck'>('qcheck');
  const [division, setDivision] = useState(CA_DIVISIONS[0]);
  const [driverCode, setDriverCode] = useState(CA_DRIVERS[0].code);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'MXN'>('MXN');
  const [authorizedBy, setAuthorizedBy] = useState('Michelle Serrano');
  const [tripNumber, setTripNumber] = useState('');
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('CASHADV');
  const [deductible, setDeductible] = useState(true);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const valid = Number(amount) > 0 && !!driverCode && !!authorizedBy && !!reason;

  usePageHeader([]);

  return (
    <div className="mod-page ca-page ca-issue-page">
      <div className="ca-issue-intro">
        <h2>Issue cash advance</h2>
        <p>Create and issue payment requests for MX drivers</p>
      </div>

      <div className="ca-issue-grid">
        <section className="ca-panel">
          <header className="ca-panel-head">Payment type</header>
          <div className="ca-type-cards">
            <button
              type="button"
              className={`ca-type-card ${paymentType === 'qcheck' ? 'active' : ''}`}
              onClick={() => setPaymentType('qcheck')}
            >
              <strong>QCheck</strong>
              <span>Quick payment method</span>
              {paymentType === 'qcheck' && <Check size={16} className="ca-type-check" />}
            </button>
            <button
              type="button"
              className={`ca-type-card ${paymentType === 'commcheck' ? 'active' : ''}`}
              onClick={() => setPaymentType('commcheck')}
            >
              <strong>CommCheck</strong>
              <span>Commercial check payment</span>
              {paymentType === 'commcheck' && <Check size={16} className="ca-type-check" />}
            </button>
          </div>
        </section>

        <section className="ca-panel">
          <header className="ca-panel-head">Payment details</header>
          <div className="ca-form-grid two">
            <div className="field">
              <label>
                Amount <span className="req">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                Currency <span className="req">*</span>
              </label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as 'USD' | 'MXN')}>
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="field">
              <label>
                Authorized By <span className="req">*</span>
              </label>
              <select value={authorizedBy} onChange={(e) => setAuthorizedBy(e.target.value)}>
                <option>Michelle Serrano</option>
                <option>Sukhdeep Dhillon</option>
                <option>Ops Supervisor</option>
              </select>
            </div>
            <div className="field">
              <label>Trip Number</label>
              <input value={tripNumber} onChange={(e) => setTripNumber(e.target.value)} />
            </div>
            <div className="field wide">
              <label>Comments</label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter any additional comments or notes."
              />
            </div>
          </div>
        </section>

        <section className="ca-panel">
          <header className="ca-panel-head">Recipient</header>
          <div className="ca-recipient-tabs">
            <button type="button" className="active">
              Driver
            </button>
          </div>
          <div className="ca-form-grid">
            <div className="field">
              <label>
                Division <span className="req">*</span>
              </label>
              <select value={division} onChange={(e) => setDivision(e.target.value)}>
                {CA_DIVISIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                Driver <span className="req">*</span>
              </label>
              <select value={driverCode} onChange={(e) => setDriverCode(e.target.value)}>
                {CA_DRIVERS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="ca-panel">
          <header className="ca-panel-head">Reason & details</header>
          <div className="field">
            <label>
              Reason <span className="req">*</span>
            </label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="CASHADV">Cash Advance</option>
              <option value="PENSION">Pension</option>
              <option value="EMERGENCY">Emergency</option>
              {CA_TYPES.map((t) => (
                <option key={t} value={t.toUpperCase()}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      <section className="ca-panel ca-panel-full">
        <label className="ca-toggle-row">
          <span>Make this amount deductible from payroll</span>
          <button
            type="button"
            className={`ca-switch ${deductible ? 'on' : ''}`}
            role="switch"
            aria-checked={deductible}
            onClick={() => setDeductible((v) => !v)}
          />
        </label>
      </section>

      <section className="ca-panel ca-panel-full">
        <header className="ca-panel-head">Invoice & attachments</header>
        <div className="ca-form-grid two">
          <div className="field">
            <label>Invoice Number</label>
            <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </div>
          <div className="field">
            <label>Invoice Date</label>
            <input
              type="datetime-local"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>
        <div className="ca-dropzone">
          <Upload size={18} />
          <div>
            <strong>Choose files</strong>
            <span>Supported: PDF, DOC, XLS, Images</span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast('File picker opened')}>
            Browse
          </button>
        </div>
      </section>

      <div className="ca-issue-foot">
        <button type="button" className="btn btn-ghost" onClick={() => toast('Cancelled')}>
          <X size={14} />
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!valid}
          onClick={() => toast(`${paymentType === 'qcheck' ? 'QCheck' : 'CommCheck'} issued`)}
        >
          <Check size={14} />
          Issue payment
        </button>
      </div>
    </div>
  );
}

function HistoryView() {
  const { search, toast } = useApp();
  const [driver, setDriver] = useState('all');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('2026-07-16');
  const [to, setTo] = useState('2026-07-31');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CA_HISTORY.filter((h) => {
      if (driver !== 'all' && h.driverCode !== driver) return false;
      if (status !== 'all' && h.status !== status) return false;
      if (
        q &&
        !`${h.driverName} ${h.driverCode} ${h.reference} ${h.tripNumber} ${h.amount}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [search, driver, status]);

  usePageHeader([
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: () => toast(`Exported ${filtered.length} history rows`),
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      onClick: () => toast('History refreshed'),
    },
  ]);

  return (
    <div className="mod-page ca-page">
      <HeaderFilters>
        <label className="mod-filter">
          <span>Driver</span>
          <select value={driver} onChange={(e) => setDriver(e.target.value)}>
            <option value="all">All drivers</option>
            {CA_DRIVERS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <div className="topbar-date-range" role="group" aria-label="Date range">
          <span className="label">Date</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
          <span className="sep">–</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
        </div>
      </HeaderFilters>

      <div className="mod-filters">
        <div className="mod-chip-row">
          {(['all', 'pending', 'posted', 'cancelled'] as const).map((x) => (
            <button
              key={x}
              type="button"
              className={`mod-chip ${status === x ? 'active' : ''}`}
              onClick={() => setStatus(x)}
            >
              {x === 'all' ? 'All status' : x}
            </button>
          ))}
        </div>
      </div>

      <div className="ca-history-head">
        <h2>Cash advance history</h2>
        <span>{filtered.length} records found</span>
      </div>

      <div className="ca-timeline">
        {filtered.map((h) => (
          <article key={h.id} className={`ca-timeline-item ${h.status}`}>
            <time>{h.at}</time>
            <div className="ca-timeline-dot" />
            <div className="ca-timeline-card">
              <div className="ca-timeline-amount">
                <strong>{fmt(h.amount, 'USD')}</strong>
                <span>Weekly total {fmt(h.weeklyTotal, 'USD')}</span>
                <span className={`ca-status-pill ${h.status}`}>{h.status}</span>
              </div>
              <div className="ca-timeline-mid">
                <div className="mono">
                  REF: {h.reference}
                  <br />
                  TRIP: {h.tripNumber}
                </div>
                <div className="ca-tag-row">
                  <span className="ca-tag soft">{h.reasonCode}</span>
                  <span className="ca-tag soft">{h.company}</span>
                  <span className="ca-tag amber">{h.paymentType}</span>
                </div>
              </div>
              <div className="ca-timeline-driver">
                <div>
                  <strong>{h.driverName}</strong>
                  <span>{h.driverCode}</span>
                </div>
                <div className="ca-avatar">{initials(h.driverName)}</div>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && <div className="empty-state">No history matches your filters.</div>}
      </div>
    </div>
  );
}

function BulkView() {
  const { toast } = useApp();
  const [selected, setSelected] = useState('template');
  const [rows] = useState<
    { id: string; division: string; driverName: string; driverCode: string; amount: string; comments: string }[]
  >([]);

  usePageHeader([
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      primary: true,
      onClick: () => toast('Import started'),
    },
  ]);

  return (
    <div className="mod-page ca-page">
      <HeaderFilters>
        <label className="mod-filter">
          <span>Template</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="template">Select template</option>
            <option value="weekly">Weekly advances</option>
            <option value="pension">Pension batch</option>
          </select>
        </label>
      </HeaderFilters>

      <div className="ca-bulk-bar">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={selected === 'template'}
          onClick={() => toast('Reference code generated')}
        >
          Generate reference code
        </button>
      </div>

      <div className="mod-table-shell">
        <div className="mod-table-scroll">
          <table className="data-table mod-table">
            <thead>
              <tr>
                <th>Issue QCheck</th>
                <th>Division</th>
                <th>Driver Name</th>
                <th>Driver Code</th>
                <th>Amount</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{r.division}</td>
                    <td>{r.driverName}</td>
                    <td>{r.driverCode}</td>
                    <td>{r.amount}</td>
                    <td>{r.comments}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Grid has no data. Import a file or generate a reference code.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mod-pager">
          <strong>Items per page</strong>
          <select defaultValue={50}>
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </select>
          <span className="mod-pager-nav">1 of 1</span>
        </div>
      </div>
    </div>
  );
}

export function CashAdvanceSuite({ id }: { id: ViewId }) {
  switch (id) {
    case 'ca-issue':
      return <IssueView />;
    case 'ca-history':
      return <HistoryView />;
    case 'ca-bulk':
      return <BulkView />;
    case 'ca-board':
    case 'cash-advance':
    default:
      return <BoardView />;
  }
}
