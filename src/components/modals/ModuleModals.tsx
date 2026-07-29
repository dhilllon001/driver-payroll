import { X } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES, DIVISIONS, INCIDENT_STATUSES, INCIDENT_TYPES } from '../../data/modulesSeed';
import type { FuelRow, IncidentNote, IncidentRow, IncidentStatus } from '../../types';

function Close({ onClose }: { onClose: () => void }) {
  return <button type="button" className="modal-close" aria-label="Close" onClick={onClose}><X size={14} /></button>;
}

export function FuelAdjustmentModal({ receipt, onClose, onSave }: { receipt: FuelRow; onClose: () => void; onSave: (receipt: FuelRow) => void }) {
  const [row, setRow] = useState({ ...receipt });
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Fuel Adjustment · {receipt.receiptNo}</h3><Close onClose={onClose} /></div>
        <div className="modal-body"><div className="mod-modal-grid">
          <div className="field"><label>Driver Code</label><input value={row.driverCode} onChange={(e) => setRow({ ...row, driverCode: e.target.value })} /></div>
          <div className="field"><label>Truck No.</label><input value={row.truckNo} onChange={(e) => setRow({ ...row, truckNo: e.target.value })} /></div>
          <div className="field"><label>Item Type</label><select value={row.itemType} onChange={(e) => setRow({ ...row, itemType: e.target.value })}><option>Diesel</option><option>DEF</option><option>Reefer Fuel</option></select></div>
          <div className="field"><label>Quantity (L)</label><input type="number" value={row.qtyLtr} onChange={(e) => setRow({ ...row, qtyLtr: Number(e.target.value) })} /></div>
          <div className="field"><label>Driver Rate</label><input type="number" step=".01" value={row.driverRate} onChange={(e) => setRow({ ...row, driverRate: Number(e.target.value) })} /></div>
          <div className="field"><label>Tax</label><input type="number" step=".01" value={row.tax} onChange={(e) => setRow({ ...row, tax: Number(e.target.value) })} /></div>
          <label className="mod-check"><input type="checkbox" checked={row.impactIfta} onChange={(e) => setRow({ ...row, impactIfta: e.target.checked })} />Impact IFTA</label>
          <label className="mod-check"><input type="checkbox" checked={row.allowDeduction} onChange={(e) => setRow({ ...row, allowDeduction: e.target.checked })} />Allow deduction</label>
        </div></div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(row)}>Save Adjustment</button></div>
      </div>
    </div>
  );
}

const emptyIncident = (): IncidentRow => ({
  id: `INC-${Date.now().toString().slice(-6)}`, driverCode: '', driverName: '', division: DIVISIONS[0], category: CATEGORIES[0], hireDate: '', truckNo: '',
  incidentType: INCIDENT_TYPES[0], from: '', to: '', email: '', status: 'open', emergencyName: '', emergencyPhone: '', emergencyAddress: '',
  createdBy: 'You', createdOn: new Date().toISOString().slice(0, 16).replace('T', ' '), notes: [],
});

export function IncidentFormModal({ mode, initial, onClose, onSave }: { mode: 'add' | 'edit'; initial?: IncidentRow; onClose: () => void; onSave: (incident: IncidentRow) => void }) {
  const [row, setRow] = useState<IncidentRow>(() => initial ? { ...initial, notes: [...initial.notes] } : emptyIncident());
  const set = (key: keyof IncidentRow, value: string) => setRow((prev) => ({ ...prev, [key]: value }));
  const valid = row.driverCode.trim() && row.driverName.trim() && row.from;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{mode === 'add' ? 'Add Incident' : `Edit Incident · ${row.id}`}</h3><Close onClose={onClose} /></div>
        <div className="modal-body"><div className="mod-modal-grid">
          <div className="field"><label>Driver Code *</label><input value={row.driverCode} onChange={(e) => set('driverCode', e.target.value)} /></div>
          <div className="field"><label>Driver Name *</label><input value={row.driverName} onChange={(e) => set('driverName', e.target.value)} /></div>
          <div className="field"><label>Division</label><select value={row.division} onChange={(e) => set('division', e.target.value)}>{DIVISIONS.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="field"><label>Category</label><select value={row.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="field"><label>Incident Type</label><select value={row.incidentType} onChange={(e) => set('incidentType', e.target.value)}>{INCIDENT_TYPES.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="field"><label>Status</label><select value={row.status} onChange={(e) => setRow({ ...row, status: e.target.value as IncidentStatus })}>{INCIDENT_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="field"><label>From *</label><input type="date" value={row.from} onChange={(e) => set('from', e.target.value)} /></div>
          <div className="field"><label>To</label><input type="date" value={row.to} onChange={(e) => set('to', e.target.value)} /></div>
          <div className="field"><label>Hire Date</label><input type="date" value={row.hireDate} onChange={(e) => set('hireDate', e.target.value)} /></div>
          <div className="field"><label>Truck No.</label><input value={row.truckNo} onChange={(e) => set('truckNo', e.target.value)} /></div>
          <div className="field"><label>Email</label><input type="email" value={row.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div className="field"><label>Emergency Contact</label><input value={row.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} /></div>
          <div className="field"><label>Emergency Phone</label><input value={row.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} /></div>
          <div className="field"><label>Emergency Address</label><input value={row.emergencyAddress} onChange={(e) => set('emergencyAddress', e.target.value)} /></div>
        </div></div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!valid} onClick={() => onSave(row)}>Save Incident</button></div>
      </div>
    </div>
  );
}

export function NotesModal({ title, notes, onClose, onAdd }: { title: string; notes: IncidentNote[]; onClose: () => void; onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><Close onClose={onClose} /></div>
        <div className="modal-body"><div className="mod-notes">
          {notes.length ? notes.map((note) => <div className="mod-note" key={note.id}><p>{note.text}</p><small>{note.by} · {note.at}</small></div>) : <div className="empty-state">No notes yet.</div>}
        </div><div className="mod-note-compose"><textarea aria-label="New note" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note…" /><button className="btn btn-primary" disabled={!text.trim()} onClick={() => { onAdd(text.trim()); setText(''); }}>Add</button></div></div>
      </div>
    </div>
  );
}
