import { Download, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import { AUDIT_ROWS } from '../data/modulesSeed';
import './modules.css';

const actions = [{ id: 'view', label: 'View Trip', icon: ExternalLink }, { id: 'export', label: 'Export Row', icon: Download }];

export function AuditView() {
  const { search, toast } = useApp();
  const [driver, setDriver] = useState(''), [payrollDate, setPayrollDate] = useState('');
  const rows = useMemo(() => {
    const q = `${search} ${driver}`.trim().toLowerCase();
    return AUDIT_ROWS.filter((r) => (!q || `${r.driverCode} ${r.tripNo} ${r.description}`.toLowerCase().includes(q)) && (!payrollDate || r.createdOn.startsWith(payrollDate)));
  }, [search, driver, payrollDate]);
  return <div className="mod-page">
    <div className="mod-filters"><label className="mod-filter grow"><span>Driver Code</span><input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Search driver code" /></label><label className="mod-filter"><span>Payroll Date</span><input type="date" value={payrollDate} onChange={(e) => setPayrollDate(e.target.value)} /></label><div className="mod-filters-actions"><button className="btn btn-primary btn-sm" onClick={() => toast(`Exported ${rows.length} audit rows`)}><Download size={14}/>Export CSV</button></div></div>
    <div className="mod-table-shell"><div className="mod-table-scroll"><table className="data-table mod-table"><thead><tr><th>Trip No.</th><th>Flag Status</th><th>Driver Code</th><th>Description</th><th>Type</th><th>Created On</th><th className="mod-action-col">Action</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.id}><td><button className="mod-link" onClick={() => toast(`Opening ${r.tripNo}`)}>{r.tripNo}</button></td><td><span className={`mod-status ${r.flagStatus}`}>{r.flagStatus}</span></td><td>{r.driverCode}</td><td>{r.description}</td><td>{r.type}</td><td>{r.createdOn}</td><td className="mod-action-col"><RowActionMenu items={actions} onAction={(id) => toast(id === 'view' ? `Opening ${r.tripNo}` : `Exported ${r.tripNo}`)} /></td></tr>)}
    </tbody></table></div><div className="mod-pager"><strong>Total Records: {rows.length}</strong><div className="mod-pager-nav">Page 1 of 1</div></div></div>
  </div>;
}
