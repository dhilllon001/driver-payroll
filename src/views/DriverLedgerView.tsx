import { Download, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import { LEDGER_ROWS } from '../data/modulesSeed';
import { usePageHeader } from '../hooks/usePageHeader';
import './modules.css';

const actions = [
  { id: 'view', label: 'View Detail', icon: Eye },
  { id: 'export', label: 'Export', icon: Download },
];
const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

export function DriverLedgerView() {
  const { search, toast } = useApp();
  const [payrollDate, setPayrollDate] = useState('');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LEDGER_ROWS.filter(
      (r) =>
        (!q || `${r.driver} ${r.driverCode} ${r.description}`.toLowerCase().includes(q)) &&
        (!payrollDate || r.txnDate === payrollDate) &&
        (status === 'all' || (status === 'credit' ? r.credit > 0 : r.debit > 0)) &&
        (!from || r.txnDate >= from) &&
        (!to || r.txnDate <= to),
    );
  }, [search, payrollDate, status, from, to]);

  usePageHeader([
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      primary: true,
      onClick: () => toast(`Exported ${rows.length} ledger entries`),
    },
  ]);

  return (
    <div className="mod-page">
      <div className="mod-filters">
        <label className="mod-filter">
          <span>Payroll Date</span>
          <input
            type="date"
            value={payrollDate}
            onChange={(e) => setPayrollDate(e.target.value)}
          />
        </label>
        <label className="mod-filter">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </label>
        <label className="mod-filter">
          <span>From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="mod-filter">
          <span>To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
      <div className="mod-table-shell">
        <div className="mod-table-scroll">
          <table className="data-table mod-table">
            <thead>
              <tr>
                <th className="mod-action-col">Action</th>
                <th>Date</th>
                <th>Driver</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>FX Rate</th>
                <th>FX Amount</th>
                <th>Balance</th>
                <th>Balance FX</th>
                <th>Updated By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mod-action-col">
                    <RowActionMenu
                      items={actions}
                      onAction={(id) => toast(`${id === 'view' ? 'Opening' : 'Exported'} ${r.id}`)}
                    />
                  </td>
                  <td>{r.txnDate}</td>
                  <td>
                    <div className="driver-cell">
                      <span className="name">{r.driver}</span>
                      <span className="uid">{r.driverCode}</span>
                    </div>
                  </td>
                  <td>{r.description}</td>
                  <td className="mod-money">{r.debit ? money.format(r.debit) : '—'}</td>
                  <td className="mod-money">{r.credit ? money.format(r.credit) : '—'}</td>
                  <td className="mod-money">{r.exchangeRate.toFixed(4)}</td>
                  <td className="mod-money">{money.format(r.exchangeAmount)}</td>
                  <td className="mod-money">{money.format(r.balance)}</td>
                  <td className="mod-money">{money.format(r.balanceFx)}</td>
                  <td>{r.updatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mod-pager">
          <strong>Total Records: {rows.length}</strong>
          <div className="mod-pager-nav">Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
}
