import { Download, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import { DEDUCTION_ROWS } from '../data/opsSeed';
import { usePageHeader } from '../hooks/usePageHeader';
import type { DeductionRow } from '../types';
import './modules.css';

const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

const ACTIONS = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

function flag(currency: DeductionRow['currency']) {
  return currency === 'CAD' ? '🇨🇦' : currency === 'USD' ? '🇺🇸' : '🇲🇽';
}

export function DeductionsView() {
  const { search, toast } = useApp();
  const [rows, setRows] = useState(() => DEDUCTION_ROWS.map((r) => ({ ...r })));
  const [region, setRegion] = useState('all');
  const [payrollType, setPayrollType] = useState('open');
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [division, setDivision] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const divisions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.division))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (region !== 'all' && r.region !== region) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (payment !== 'all' && r.paymentType !== payment) return false;
      if (division !== 'all' && r.division !== division) return false;
      if (type !== 'all' && r.type !== type) return false;
      if (payrollType === 'open' && r.payrollDate !== 'Pending' && r.status === 'closed') return false;
      if (q && !`${r.driverName} ${r.driverCode} ${r.dedCode} ${r.comments}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [rows, region, status, payment, division, type, payrollType, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const reset = () => {
    setRegion('all');
    setPayrollType('open');
    setStatus('all');
    setPayment('all');
    setDivision('all');
    setType('all');
    setPage(1);
  };

  usePageHeader([
    {
      id: 'reset',
      label: 'Reset filters',
      icon: RotateCcw,
      onClick: reset,
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: () => toast(`Exported ${filtered.length} records`),
    },
    {
      id: 'add',
      label: 'Add Entry',
      icon: Plus,
      primary: true,
      onClick: () => toast('Add deduction coming soon'),
    },
  ]);

  return (
    <div className="mod-page">
      <div className="mod-filters">
        <label className="mod-filter">
          <span>Region</span>
          <select value={region} onChange={(e) => { setRegion(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option>Mexico</option>
            <option>United States</option>
            <option>Canada</option>
          </select>
        </label>
        <label className="mod-filter">
          <span>Payroll Type</span>
          <select value={payrollType} onChange={(e) => { setPayrollType(e.target.value); setPage(1); }}>
            <option value="open">Open</option>
            <option value="all">All</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="mod-filter">
          <span>Division</span>
          <select value={division} onChange={(e) => { setDivision(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            {divisions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="mod-filter">
          <span>Type</span>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="deduct">Deduct</option>
            <option value="reimburse">Reimburse</option>
          </select>
        </label>
        <label className="mod-filter">
          <span>Status</span>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="mod-filter">
          <span>Payment</span>
          <select value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="one-time">One-time</option>
            <option value="installment">Installment</option>
          </select>
        </label>
      </div>

      <div className="mod-table-shell">
        <div className="mod-table-scroll">
          <table className="data-table mod-table compact">
            <thead>
              <tr>
                <th className="mod-action-col">Action</th>
                <th>Driver</th>
                <th>Division</th>
                <th>Eff. Date</th>
                <th>Ded. Code</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Created</th>
                <th>Payroll</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={13}>
                    <div className="empty-state">No deductions match your filters.</div>
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id}>
                    <td className="mod-action-col">
                      <RowActionMenu
                        items={ACTIONS}
                        onAction={(id) => {
                          if (id === 'delete') {
                            setRows((all) => all.filter((x) => x.id !== r.id));
                            toast('Entry deleted');
                          } else toast(`Editing ${r.id}`);
                        }}
                      />
                    </td>
                    <td>
                      <div className="driver-cell">
                        <span className="name">{r.driverName}</span>
                        <span className="uid">{r.driverCode}</span>
                      </div>
                    </td>
                    <td>{r.division}</td>
                    <td>{r.effDate}</td>
                    <td>{r.dedCode}</td>
                    <td>
                      <span className={`mod-status ${r.type === 'deduct' ? 'exception' : 'completed'}`}>
                        {r.type === 'deduct' ? 'Deduct' : 'Reimburse'}
                      </span>
                    </td>
                    <td className={`mod-money ${r.amount < 0 ? 'mod-neg' : 'mod-pos'}`}>
                      <span className="mod-fx">{flag(r.currency)}</span>{' '}
                      {money.format(Math.abs(r.amount))}
                    </td>
                    <td>
                      <span
                        className={`mod-status ${r.paymentType === 'installment' ? 'flagged' : 'none'}`}
                      >
                        {r.paymentType === 'installment' ? 'Installment' : 'One-time'}
                      </span>
                    </td>
                    <td>
                      <div className="driver-cell">
                        <span className="name">
                          {money.format(r.balancePaid)} / {money.format(r.balanceTotal)}
                        </span>
                        <span className={`uid ${r.paymentsDone >= r.paymentsTotal ? 'mod-pos' : ''}`}>
                          {r.paymentsDone}/{r.paymentsTotal} payments
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`mod-status ${r.status === 'active' ? 'open' : 'closed'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="mod-comment" title={r.comments}>
                      {r.comments}
                    </td>
                    <td>
                      <div className="driver-cell">
                        <span className="name">{r.createdBy}</span>
                        <span className="uid">{r.createdAt}</span>
                      </div>
                    </td>
                    <td>{r.payrollDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mod-pager">
          <strong>Total Records: {filtered.length}</strong>
          <div className="mod-pager-nav">
            <button
              type="button"
              className="btn-icon"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous"
            >
              ‹
            </button>
            <span>
              {safePage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-icon"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
