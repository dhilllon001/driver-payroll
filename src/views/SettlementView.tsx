import { Download, FileClock, FileText, Mail, Send, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import { CATEGORIES, DIVISIONS, REGIONS_MOD, SETTLEMENT_ROWS } from '../data/modulesSeed';
import type { SettlementRow } from '../types';
import './modules.css';

const actions = [
  { id: 'email', label: 'Email', icon: Mail }, { id: 'pdf', label: 'Download PDF', icon: Download },
  { id: 'log', label: 'View Log', icon: FileClock }, { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];
const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

export function SettlementView() {
  const { search, toast } = useApp();
  const [rows, setRows] = useState<SettlementRow[]>(SETTLEMENT_ROWS);
  const [region, setRegion] = useState('all'), [division, setDivision] = useState('all'), [category, setCategory] = useState('all');
  const [driver, setDriver] = useState(''), [payrollDate, setPayrollDate] = useState(''), [dateType, setDateType] = useState('Payroll Date');
  const [itinerary, setItinerary] = useState(false), [internal, setInternal] = useState(false);
  const filtered = useMemo(() => {
    const q = `${search} ${driver}`.trim().toLowerCase();
    return rows.filter((r) => (region === 'all' || r.region === region) && (division === 'all' || r.division === division) &&
      (category === 'all' || r.category === category) && (!payrollDate || r.payrollDate === payrollDate) &&
      (!q || `${r.driver} ${r.driverCode} ${r.id}`.toLowerCase().includes(q)));
  }, [rows, region, division, category, payrollDate, driver, search]);
  const rowAction = (id: string, row: SettlementRow) => {
    if (id === 'delete') setRows((all) => all.filter((x) => x.id !== row.id));
    toast(id === 'delete' ? 'Settlement deleted' : `${actions.find((x) => x.id === id)?.label} started for ${row.driverCode}`);
  };
  return <div className="mod-page">
    <div className="mod-filters">
      <label className="mod-filter"><span>Payroll Date Type</span><select value={dateType} onChange={(e) => setDateType(e.target.value)}><option>Payroll Date</option><option>Generated Date</option></select></label>
      <label className="mod-filter"><span>Region</span><select value={region} onChange={(e) => setRegion(e.target.value)}><option value="all">All</option>{REGIONS_MOD.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="mod-filter"><span>Division</span><select value={division} onChange={(e) => setDivision(e.target.value)}><option value="all">All</option>{DIVISIONS.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="mod-filter"><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All</option>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="mod-filter grow"><span>Driver</span><input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Name or code" /></label>
      <label className="mod-filter"><span>Payroll Date</span><input type="date" value={payrollDate} onChange={(e) => setPayrollDate(e.target.value)} /></label>
      <label className="mod-check"><input type="checkbox" checked={itinerary} onChange={(e) => setItinerary(e.target.checked)} />Show Trip Itinerary</label>
      <label className="mod-check"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />Internal</label>
      <div className="mod-filters-actions"><button className="btn btn-primary btn-sm" onClick={() => toast(`Report generated using ${dateType}`)}><FileText size={14}/>Generate Report</button><button className="btn btn-secondary btn-sm" onClick={() => toast('Showing generated reports')}><Download size={14}/>Show Generated</button><button className="btn btn-ghost btn-sm" onClick={() => toast('Bulk email log opened')}><Send size={14}/>Bulk Email Log</button></div>
    </div>
    <div className="mod-table-shell"><div className="mod-table-scroll"><table className="data-table mod-table"><thead><tr><th>ID</th><th>Driver</th><th>Division</th><th>Region</th><th>Category</th><th>Payroll Date</th><th>Status</th><th>Amount</th><th>Emailed</th><th>Generated</th><th className="mod-action-col">Action</th></tr></thead>
      <tbody>{filtered.map((r) => <tr key={r.id}><td><button className="mod-link">{r.id}</button></td><td><div className="driver-cell"><span className="name">{r.driver}</span><span className="uid">{r.driverCode}</span></div></td><td>{r.division}</td><td>{r.region}</td><td>{r.category}</td><td>{r.payrollDate}</td><td><span className={`mod-status ${r.status}`}>{r.status}</span></td><td className="mod-money">{money.format(r.amount)}</td><td>{r.emailed ? 'Yes' : 'No'}</td><td>{r.generatedAt}</td><td className="mod-action-col"><RowActionMenu items={actions} onAction={(id) => rowAction(id, r)} /></td></tr>)}</tbody></table></div>
      <div className="mod-pager"><strong>Total Records: {filtered.length}</strong><div className="mod-pager-nav">Page 1 of 1</div></div>
    </div>
  </div>;
}
