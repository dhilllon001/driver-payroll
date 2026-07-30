import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FuelAdjustmentModal } from '../components/modals/ModuleModals';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import { FUEL_ROWS } from '../data/modulesSeed';
import type { FuelRow } from '../types';
import './modules.css';

const actions = [{ id: 'adjust', label: 'Add Adjustment', icon: Plus }, { id: 'edit', label: 'Edit', icon: Pencil }, { id: 'delete', label: 'Delete', icon: Trash2, danger: true }];
const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

export function FuelView() {
  const { search, toast } = useApp();
  const [rows, setRows] = useState<FuelRow[]>(FUEL_ROWS), [driver, setDriver] = useState(''), [receipt, setReceipt] = useState('');
  const [type, setType] = useState('all'), [from, setFrom] = useState(''), [to, setTo] = useState(''), [truck, setTruck] = useState('');
  const [modalRow, setModalRow] = useState<FuelRow | null>(null);
  const filtered = useMemo(() => {
    const q = `${search} ${driver}`.trim().toLowerCase();
    return rows.filter((r) => (!q || r.driverCode.toLowerCase().includes(q)) && (!receipt || r.receiptNo.toLowerCase().includes(receipt.toLowerCase())) &&
      (type === 'all' || r.itemType === type) && (!truck || r.truckNo.toLowerCase().includes(truck.toLowerCase())) &&
      (!from || r.receiptDate >= from) && (!to || r.receiptDate <= to));
  }, [rows, search, driver, receipt, type, truck, from, to]);
  const action = (id: string, row: FuelRow) => {
    if (id === 'delete') { setRows((all) => all.filter((x) => x.id !== row.id)); toast('Fuel receipt deleted'); }
    else setModalRow(row);
  };
  return <div className="mod-page">
    <div className="mod-filters">
      <label className="mod-filter"><span>Driver</span><input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Driver code" /></label>
      <label className="mod-filter grow"><span>Receipt Search</span><input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="Receipt number" /></label>
      <label className="mod-filter"><span>Receipt Type</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All</option><option>Diesel</option><option>DEF</option><option>Reefer Fuel</option></select></label>
      <label className="mod-filter"><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="mod-filter"><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      <label className="mod-filter"><span>Truck</span><input value={truck} onChange={(e) => setTruck(e.target.value)} placeholder="Truck no." /></label>
      <div className="mod-filters-actions"><button className="btn btn-primary btn-sm" disabled={!filtered.length} onClick={() => setModalRow(filtered[0])}><Plus size={14}/>Add Adjustment</button></div>
    </div>
    <div className="mod-table-shell"><div className="mod-table-scroll"><table className="data-table mod-table compact"><thead><tr><th className="mod-action-col">Action</th><th>Receipt</th><th>Receipt Date</th><th>Effective</th><th>Payroll</th><th>Driver</th><th>Truck</th><th>Type</th><th>Qty L</th><th>Vendor</th><th>Location</th><th>Rate</th><th>Tax</th><th>IFTA</th><th>Deduct</th></tr></thead><tbody>
      {filtered.map((r) => <tr key={r.id}><td className="mod-action-col"><RowActionMenu items={actions} onAction={(id) => action(id, r)} /></td><td><button className="mod-link" onClick={() => setModalRow(r)}>{r.receiptNo}</button></td><td>{r.receiptDate}</td><td>{r.effectiveDate}</td><td>{r.payrollDate}</td><td>{r.driverCode}</td><td>{r.truckNo}</td><td>{r.itemType}</td><td className="mod-money">{r.qtyLtr.toFixed(1)}</td><td>{r.vendor}</td><td>{r.cityState}</td><td className="mod-money">{money.format(r.driverRate)}</td><td className="mod-money">{money.format(r.tax)}</td><td>{r.impactIfta ? 'Yes' : 'No'}</td><td>{r.allowDeduction ? 'Yes' : 'No'}</td></tr>)}
    </tbody></table></div><div className="mod-pager"><strong>Total Records: {filtered.length}</strong><div className="mod-pager-nav">Page 1 of 1</div></div></div>
    {modalRow && <FuelAdjustmentModal receipt={modalRow} onClose={() => setModalRow(null)} onSave={(saved) => { setRows((all) => all.map((x) => x.id === saved.id ? saved : x)); setModalRow(null); toast('Fuel adjustment saved'); }} />}
  </div>;
}
