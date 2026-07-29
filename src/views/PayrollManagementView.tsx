import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PayrollDateModal,
  type PayrollDateForm,
} from '../components/modals/PayrollDateModal';
import { useApp } from '../context/AppContext';
import {
  DRIVER_CLASSES,
  PAYROLL_REGIONS,
  PAYROLL_RUNS,
  PAYROLL_STATUSES,
} from '../data/payrollSeed';
import type { PayrollRun, PayrollRunStatus } from '../types';
import './views.css';
import './payroll.css';

type MenuAction =
  | 'edit'
  | 'duplicate'
  | 'delete'
  | 'wd-log'
  | 'wd-report'
  | 'internal'
  | 'group'
  | 'send-wd'
  | 'invoice';

const MENU_ITEMS: { id: MenuAction; label: string; icon: typeof Pencil; danger?: boolean }[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'duplicate', label: 'Duplicate', icon: Copy },
  { id: 'wd-log', label: 'Download Workday Log', icon: Download },
  { id: 'wd-report', label: 'Download Workday Report', icon: Download },
  { id: 'internal', label: 'Download Internal Report', icon: FileText },
  { id: 'group', label: 'Download Group Report', icon: FileText },
  { id: 'send-wd', label: 'Send to Workday', icon: Send },
  { id: 'invoice', label: 'View Invoice Status', icon: FileText },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

function uid() {
  return `pr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function coverEnd(coverFrom: string) {
  return coverFrom || '—';
}

function StatusPill({ status }: { status: PayrollRunStatus }) {
  return <span className={`pay-run-status ${status}`}>{status}</span>;
}

function ClassChips({ items }: { items: string[] }) {
  if (items.length <= 2) {
    return <span className="pay-classes">{items.join(', ')}</span>;
  }
  return (
    <span className="pay-classes" title={items.join(', ')}>
      {items[0]}, {items[1]}
      <span className="pay-more">+{items.length - 2}</span>
    </span>
  );
}

function FxCompact({ run }: { run: PayrollRun }) {
  const { usdToCad, usdToPeso, cadToPeso } = run.exchange;
  return (
    <div className="pay-fx-cell" title={`1 USD = ${usdToCad} CAD · 1 USD = ${usdToPeso} PESO · 1 CAD = ${cadToPeso} PESO`}>
      <span>USD→CAD {usdToCad.toFixed(4)}</span>
      <span>USD→MXN {usdToPeso.toFixed(2)}</span>
    </div>
  );
}

function RowMenu({
  run,
  onAction,
}: {
  run: PayrollRun;
  onAction: (id: MenuAction, run: PayrollRun) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuW = 220;
    const left = Math.min(window.innerWidth - menuW - 8, Math.max(8, rect.right - menuW));
    setPos({ top: rect.bottom + 4, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`btn-icon pay-more-btn ${open ? 'on' : ''}`}
        aria-label="Row actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical size={16} />
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="pay-row-menu"
            style={{ top: pos.top, left: pos.left }}
            role="menu"
          >
            {MENU_ITEMS.map(({ id, label, icon: Icon, danger }) => (
              <button
                key={id}
                type="button"
                className={`pay-row-menu-item ${danger ? 'danger' : ''}`}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onAction(id, run);
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export function PayrollManagementView() {
  const { toast, search } = useApp();
  const [runs, setRuns] = useState<PayrollRun[]>(() =>
    PAYROLL_RUNS.map((r) => ({ ...r, classifications: [...r.classifications], exchange: { ...r.exchange } })),
  );
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('all');
  const [status, setStatus] = useState('all');
  const [region, setRegion] = useState('all');
  const [classification, setClassification] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; item?: PayrollRun } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PayrollRun | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return runs.filter((r) => {
      if (year !== 'all' && !r.payrollDate.includes(year) && !r.coverFrom.includes(year) && !r.coverTo.includes(year)) {
        return false;
      }
      if (month !== 'all') {
        const mon = month.slice(0, 3).toLowerCase();
        if (!r.payrollDate.toLowerCase().includes(mon)) return false;
      }
      if (status !== 'all' && r.status !== status) return false;
      if (region !== 'all' && r.region !== region) return false;
      if (classification !== 'all' && !r.classifications.includes(classification as never)) return false;
      if (q) {
        const hay = [
          r.payrollDate,
          r.coverFrom,
          r.coverTo,
          r.region,
          r.status,
          r.createdBy,
          r.updatedBy,
          r.classifications.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [runs, year, month, status, region, classification, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => {
    setPage(1);
  }, [year, month, status, region, classification, search, perPage]);

  const saveForm = (form: PayrollDateForm) => {
    if (modal?.mode === 'edit' && modal.item) {
      const item = modal.item;
      setRuns((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? {
                ...r,
                payrollDate: form.payrollDate.trim(),
                coverFrom: form.coverFrom.trim(),
                coverTo: item.coverTo || coverEnd(form.coverFrom),
                coveragePeriod: form.coveragePeriod,
                classifications: form.classifications,
                region: form.region,
                exchange: form.exchange,
                updatedBy: 'You',
                updatedAt: 'Just now',
              }
            : r,
        ),
      );
      toast('Payroll date updated');
    } else {
      const next: PayrollRun = {
        id: uid(),
        payrollDate: form.payrollDate.trim(),
        coverFrom: form.coverFrom.trim(),
        coverTo: coverEnd(form.coverFrom),
        status: 'open',
        region: form.region,
        classifications: form.classifications,
        coveragePeriod: form.coveragePeriod,
        exchange: form.exchange,
        createdBy: 'You',
        createdAt: 'Just now',
        updatedBy: 'You',
        updatedAt: 'Just now',
      };
      setRuns((prev) => [next, ...prev]);
      toast('Payroll date added');
    }
    setModal(null);
  };

  const onAction = (id: MenuAction, run: PayrollRun) => {
    if (id === 'edit') {
      setModal({ mode: 'edit', item: run });
      return;
    }
    if (id === 'duplicate') {
      setRuns((prev) => [
        {
          ...run,
          id: uid(),
          status: 'open',
          createdBy: 'You',
          createdAt: 'Just now',
          updatedBy: 'You',
          updatedAt: 'Just now',
        },
        ...prev,
      ]);
      toast(`Duplicated ${run.payrollDate} · ${run.region}`);
      return;
    }
    if (id === 'delete') {
      setPendingDelete(run);
      return;
    }
    const labels: Record<string, string> = {
      'wd-log': 'Workday Log download started',
      'wd-report': 'Workday Report download started',
      internal: 'Internal Report download started',
      group: 'Group Report download started',
      'send-wd': 'Sent to Workday',
      invoice: 'Invoice status: Settled',
    };
    toast(labels[id] || 'Done');
  };

  return (
    <div className="pay-mgmt">
      <div className="pay-filters">
        <label className="pay-filter">
          <span>Year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">All</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </label>
        <label className="pay-filter">
          <span>Month</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">All</option>
            {[
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="pay-filter">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            {PAYROLL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="pay-filter">
          <span>Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">All</option>
            {PAYROLL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="pay-filter">
          <span>Classification</span>
          <select value={classification} onChange={(e) => setClassification(e.target.value)}>
            <option value="all">All</option>
            {DRIVER_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-primary btn-sm pay-filters-add"
          onClick={() => setModal({ mode: 'add' })}
        >
          <Plus size={14} />
          Add Payroll Date
        </button>
      </div>

      {pendingDelete && (
        <div className="pay-confirm-strip">
          <span>
            Delete payroll date <strong>{pendingDelete.payrollDate}</strong> ({pendingDelete.region})?
          </span>
          <div className="pay-confirm-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm pay-btn-danger"
              onClick={() => {
                setRuns((prev) => prev.filter((r) => r.id !== pendingDelete.id));
                toast('Payroll date deleted');
                setPendingDelete(null);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="pay-table-shell">
        <div className="pay-table-scroll">
          <table className="data-table pay-table">
            <thead>
              <tr>
                <th>Payroll Date</th>
                <th>Covers From – To</th>
                <th>Status</th>
                <th>Region</th>
                <th>Driver Class</th>
                <th>Currency Exchange</th>
                <th>Created By</th>
                <th>Last Updated By</th>
                <th className="pay-col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">No payroll dates match your filters.</div>
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button
                        type="button"
                        className="pay-date-link"
                        onClick={() => setModal({ mode: 'edit', item: r })}
                      >
                        {r.payrollDate}
                      </button>
                    </td>
                    <td className="pay-cover">
                      {r.coverFrom}
                      <span className="pay-to"> to </span>
                      {r.coverTo}
                    </td>
                    <td>
                      <StatusPill status={r.status} />
                    </td>
                    <td>{r.region}</td>
                    <td>
                      <ClassChips items={r.classifications} />
                    </td>
                    <td>
                      <FxCompact run={r} />
                    </td>
                    <td>
                      <div className="pay-person">
                        <strong>{r.createdBy}</strong>
                        <span>{r.createdAt}</span>
                      </div>
                    </td>
                    <td>
                      <div className="pay-person">
                        <strong>{r.updatedBy}</strong>
                        <span>{r.updatedAt}</span>
                      </div>
                    </td>
                    <td className="pay-col-action">
                      <RowMenu run={r} onAction={onAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pay-pager">
          <span className="pay-pager-total">Total Records: {filtered.length}</span>
          <label className="pay-pager-size">
            Items per page
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="pay-pager-nav">
            <button
              type="button"
              className="btn-icon"
              disabled={safePage <= 1}
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {safePage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-icon"
              disabled={safePage >= totalPages}
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <PayrollDateModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSave={saveForm}
        />
      )}
    </div>
  );
}
