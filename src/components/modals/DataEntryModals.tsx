import { X } from 'lucide-react';
import { useState } from 'react';

type SaveValue = Record<string, string | number | boolean>;
type ModalBase = { onClose: () => void; onSave: (value: SaveValue) => void };

function Close({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="modal-close"
      aria-label="Close"
      data-tooltip="Close"
      data-tooltip-side="bottom"
      onClick={onClose}
    >
      <X size={15} />
    </button>
  );
}

function Frame({ title, valid, onClose, onSave, children }: { title: string; valid: boolean; children: React.ReactNode; onClose: () => void; onSave: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><Close onClose={onClose} /></div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!valid} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export function CoverageDateModal({ onClose, onSave }: ModalBase) {
  const [form, setForm] = useState({ coverageFrom: '', coverageTo: '', referenceNo: '' });
  const set = (key: keyof typeof form, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const valid = Boolean(form.coverageFrom && form.coverageTo && form.referenceNo.trim() && form.coverageTo >= form.coverageFrom);
  return (
    <Frame title="Save Coverage Date" valid={valid} onClose={onClose} onSave={() => onSave(form)}>
      <div className="mod-modal-grid">
        <div className="field"><label>Coverage From *</label><input type="date" value={form.coverageFrom} onChange={(e) => set('coverageFrom', e.target.value)} /></div>
        <div className="field"><label>Coverage To *</label><input type="date" value={form.coverageTo} onChange={(e) => set('coverageTo', e.target.value)} /></div>
        <div className="field wide"><label>Reference No. *</label><input placeholder="e.g. IFTA-Q3-2026" value={form.referenceNo} onChange={(e) => set('referenceNo', e.target.value)} /></div>
      </div>
    </Frame>
  );
}

export function DriverRateModal({ mode, initial, onClose, onSave }: ModalBase & { mode: 'add' | 'edit'; initial?: SaveValue }) {
  const [form, setForm] = useState({
    driverCode: String(initial?.driverCode ?? ''), driverName: String(initial?.driverName ?? ''),
    startDate: String(initial?.startDate ?? ''), endDate: String(initial?.endDate ?? ''),
    category: String(initial?.category ?? 'OTR'), division: String(initial?.division ?? 'Canada Highway'),
    driverClass: String(initial?.driverClass ?? 'Company'), deductMiles: Number(initial?.deductMiles ?? 0),
    deductHour: Number(initial?.deductHour ?? 0), active: initial?.status !== 'inactive',
    comment: String(initial?.comment ?? ''),
  });
  const set = (key: keyof typeof form, value: string | number | boolean) => setForm((old) => ({ ...old, [key]: value }));
  const valid = Boolean(form.driverCode.trim() && form.driverName.trim() && form.startDate && form.endDate && form.endDate >= form.startDate);
  return (
    <Frame title={`${mode === 'add' ? 'Add' : 'Edit'} Reduced Rate`} valid={valid} onClose={onClose} onSave={() => onSave({ ...form, status: form.active ? 'active' : 'inactive' })}>
      <div className="mod-modal-grid">
        <div className="field"><label>Driver Code *</label><input value={form.driverCode} onChange={(e) => set('driverCode', e.target.value)} /></div>
        <div className="field"><label>Driver Name *</label><input value={form.driverName} onChange={(e) => set('driverName', e.target.value)} /></div>
        <div className="field"><label>Start Date *</label><input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></div>
        <div className="field"><label>End Date *</label><input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></div>
        <div className="field"><label>Category</label><input readOnly value={form.category} /></div>
        <div className="field"><label>Division</label><input readOnly value={form.division} /></div>
        <div className="field"><label>Driver Class</label><input readOnly value={form.driverClass} /></div>
        <div className="field"><label>Deduct Miles</label><input type="number" min="0" value={form.deductMiles} onChange={(e) => set('deductMiles', Number(e.target.value))} /></div>
        <div className="field"><label>Deduct Hours</label><input type="number" min="0" step=".25" value={form.deductHour} onChange={(e) => set('deductHour', Number(e.target.value))} /></div>
        <div className="field"><label>Active</label><div className="de-segmented"><button type="button" className={form.active ? 'active' : ''} onClick={() => set('active', true)}>Yes</button><button type="button" className={!form.active ? 'active' : ''} onClick={() => set('active', false)}>No</button></div></div>
        <div className="field wide"><label>Comment</label><textarea value={form.comment} onChange={(e) => set('comment', e.target.value)} /></div>
      </div>
    </Frame>
  );
}

export function BonusModal({ title, mode, fields, initial, onClose, onSave }: ModalBase & {
  title: string; mode: 'add' | 'edit'; fields: 'montreal' | 'usa' | 'canada' | 'otr'; initial?: SaveValue;
}) {
  const [form, setForm] = useState({
    driverCode: String(initial?.driverCode ?? ''), driverName: String(initial?.driverName ?? ''),
    payrollMethod: String(initial?.payrollMethod ?? 'City Premium'), category: String(initial?.category ?? 'OTR'),
    division: String(initial?.division ?? 'USA Highway'), driverClass: String(initial?.driverClass ?? 'Company'),
    rate: Number(initial?.rate ?? 0.03),
    status: String(initial?.status ?? initial?.loyaltyStatus ?? (fields === 'montreal' ? 'active' : fields === 'otr' ? 'exclude' : 'include')),
  });
  const set = (key: keyof typeof form, value: string | number) => setForm((old) => ({ ...old, [key]: value }));
  const statuses = fields === 'montreal' ? ['active', 'inactive'] : ['include', 'exclude'];
  const valid = Boolean(form.driverCode.trim() && (fields !== 'usa' || form.driverName.trim()) && (fields !== 'otr' || form.rate > 0));
  return (
    <Frame title={`${mode === 'add' ? 'Add' : 'Edit'} ${title}`} valid={valid} onClose={onClose} onSave={() => onSave(form)}>
      <div className="mod-modal-grid">
        <div className="field"><label>Driver Code *</label><input value={form.driverCode} onChange={(e) => set('driverCode', e.target.value)} /></div>
        {fields === 'usa' && <div className="field"><label>Driver Name *</label><input value={form.driverName} onChange={(e) => set('driverName', e.target.value)} /></div>}
        {fields === 'montreal' && <div className="field"><label>Payroll Method</label><select value={form.payrollMethod} onChange={(e) => set('payrollMethod', e.target.value)}><option>City Premium</option><option>Night Shift</option><option>Weekend Bonus</option></select></div>}
        {fields === 'usa' && <>
          <div className="field"><label>Category</label><select value={form.category} onChange={(e) => set('category', e.target.value)}><option>OTR</option><option>Regional</option><option>Dedicated</option></select></div>
          <div className="field"><label>Division</label><select value={form.division} onChange={(e) => set('division', e.target.value)}><option>USA Highway</option><option>USA Local</option></select></div>
          <div className="field"><label>Driver Class</label><select value={form.driverClass} onChange={(e) => set('driverClass', e.target.value)}><option>Company</option><option>Owner Operator</option></select></div>
        </>}
        {fields === 'otr' && <div className="field"><label>Bonus Rate *</label><input type="number" min=".001" step=".001" value={form.rate} onChange={(e) => set('rate', Number(e.target.value))} /></div>}
        <div className="field"><label>{fields === 'montreal' ? 'Active' : 'Loyalty Status'}</label><div className="de-segmented">{statuses.map((status) => <button key={status} type="button" className={form.status === status ? 'active' : ''} onClick={() => set('status', status)}>{status}</button>)}</div></div>
      </div>
    </Frame>
  );
}

export function LoyaltyRateModal({ mode, initial, onClose, onSave }: ModalBase & { mode: 'add' | 'edit'; initial?: SaveValue }) {
  const [form, setForm] = useState({
    role: String(initial?.role ?? 'Highway'), type: String(initial?.type ?? 'Single'),
    driverClass: String(initial?.driverClass ?? 'Company'), paidBy: String(initial?.paidBy ?? 'Miles'),
    rate: Number(initial?.rate ?? 0),
  });
  const set = (key: keyof typeof form, value: string | number) => setForm((old) => ({ ...old, [key]: value }));
  return (
    <Frame title={`${mode === 'add' ? 'Add' : 'Edit'} Loyalty Rate`} valid={form.rate > 0} onClose={onClose} onSave={() => onSave(form)}>
      <div className="mod-modal-grid">
        <div className="field"><label>Role</label><select value={form.role} onChange={(e) => set('role', e.target.value)}><option>Highway</option><option>Local</option></select></div>
        <div className="field"><label>Type</label><select value={form.type} onChange={(e) => set('type', e.target.value)}><option>Single</option><option>Team</option></select></div>
        <div className="field"><label>Driver Class</label><select value={form.driverClass} onChange={(e) => set('driverClass', e.target.value)}><option>Company</option><option>Owner Operator</option></select></div>
        <div className="field"><label>Paid By</label><select value={form.paidBy} onChange={(e) => set('paidBy', e.target.value)}><option>Miles</option><option>Hourly</option></select></div>
        <div className="field wide"><label>Rate *</label><input type="number" min=".001" step=".001" value={form.rate} onChange={(e) => set('rate', Number(e.target.value))} /></div>
      </div>
    </Frame>
  );
}
