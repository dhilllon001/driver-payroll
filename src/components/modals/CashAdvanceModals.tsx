import { useState } from 'react';
import {
  CA_DIVISIONS,
  CA_DRIVERS,
  CA_TYPES,
} from '../../data/cashAdvanceSeed';
import type { CashAdvanceNote, CashAdvanceRow } from '../../types';

function Close({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
      ×
    </button>
  );
}

export function CashAdvanceAddModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (row: Partial<CashAdvanceRow>) => void;
}) {
  const [division, setDivision] = useState(CA_DIVISIONS[0]);
  const [driverCode, setDriverCode] = useState(CA_DRIVERS[0].code);
  const [type, setType] = useState(CA_TYPES[0]);
  const [amount, setAmount] = useState('');
  const [doNotPay, setDoNotPay] = useState(false);
  const [comments, setComments] = useState('');
  const driver = CA_DRIVERS.find((d) => d.code === driverCode) ?? CA_DRIVERS[0];
  const valid = Number(amount) > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg ca-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Add new record</h3>
          <Close onClose={onClose} />
        </div>
        <div className="modal-body">
          <div className="ca-form-grid three">
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
            <div className="field">
              <label>
                Type <span className="req">*</span>
              </label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {CA_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="ca-form-grid">
            <div className="field">
              <label>
                Amount (MXN) <span className="req">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <label className="ca-check">
              <input
                type="checkbox"
                checked={doNotPay}
                onChange={(e) => setDoNotPay(e.target.checked)}
              />
              <span>Do Not Pay</span>
            </label>
          </div>
          <div className="field">
            <label>Comment</label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Comments"
            />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid}
            onClick={() =>
              onSave({
                division,
                driverCode: driver.code,
                driverName: driver.name,
                type,
                subCategory: type,
                amount: Number(amount),
                currency: 'MXN',
                doNotPay,
                comments,
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function CashAdvanceEditModal({
  row,
  onClose,
  onSave,
}: {
  row: CashAdvanceRow;
  onClose: () => void;
  onSave: (patch: Partial<CashAdvanceRow>) => void;
}) {
  const [amount, setAmount] = useState(String(row.amount));
  const [comments, setComments] = useState(row.comments);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm ca-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Edit details</h3>
          <Close onClose={onClose} />
        </div>
        <div className="modal-body">
          <div className="ca-kv-form">
            <div className="ca-kv">
              <span>Cash Advance Id</span>
              <strong>{row.id}</strong>
            </div>
            <div className="ca-kv editable">
              <span>Amount Approved</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="ca-kv">
              <span>Truck</span>
              <strong>{row.truck}</strong>
            </div>
            <div className="ca-kv">
              <span>Trailer</span>
              <strong>{row.trailer}</strong>
            </div>
            <div className="ca-kv">
              <span>Sub Category</span>
              <strong>{row.subCategory}</strong>
            </div>
            <div className="ca-kv editable stacked">
              <span>Comments</span>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comments"
              />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!(Number(amount) > 0)}
            onClick={() => onSave({ amount: Number(amount), comments })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function CashAdvanceDetailModal({
  row,
  onClose,
  onCancel,
}: {
  row: CashAdvanceRow;
  onClose: () => void;
  onCancel: () => void;
}) {
  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: row.currency,
  }).format(row.amount);
  const weekly = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: row.currency,
  }).format(row.weeklyTotal);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-xl ca-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Cash advance details</h3>
          <Close onClose={onClose} />
        </div>
        <div className="modal-body">
          <div className="ca-detail-hero">
            <div>
              <span className="ca-eyebrow">Amount</span>
              <div className="ca-hero-amount">{money}</div>
            </div>
            <span className={`ca-status-pill ${row.status}`}>{row.status.replace(/-/g, ' ')}</span>
          </div>
          <div className="ca-detail-grid">
            <section className="ca-detail-card">
              <h4>Basic information</h4>
              <div className="ca-kv">
                <span>Reference Number</span>
                <strong className="mono">{row.referenceNumber}</strong>
              </div>
              <div className="ca-kv">
                <span>Payment Type</span>
                <span className="ca-tag amber">{row.type.toUpperCase()}</span>
              </div>
              <div className="ca-kv">
                <span>Reason Code</span>
                <strong>{row.reasonCode}</strong>
              </div>
              <div className="ca-kv">
                <span>Weekly Total Cash</span>
                <strong className="money">{weekly}</strong>
              </div>
            </section>
            <section className="ca-detail-card">
              <h4>Personnel</h4>
              <div className="ca-kv">
                <span>Created By</span>
                <strong>{row.createdBy}</strong>
              </div>
              <div className="ca-kv">
                <span>Created On</span>
                <strong>{row.createdOn}</strong>
              </div>
              <div className="ca-kv">
                <span>Issued By</span>
                <strong>{row.issuedBy}</strong>
              </div>
              <div className="ca-kv">
                <span>Issued On</span>
                <strong>{row.issuedOn}</strong>
              </div>
              <div className="ca-kv">
                <span>Authorized By</span>
                <strong>{row.authorizedBy}</strong>
              </div>
            </section>
            <section className="ca-detail-card">
              <h4>Vehicle & trip</h4>
              <div className="ca-kv">
                <span>Trip Number</span>
                <strong>{row.tripNumber}</strong>
              </div>
              <div className="ca-kv">
                <span>Truck</span>
                <strong>{row.truck}</strong>
              </div>
              <div className="ca-kv">
                <span>Trailer</span>
                <strong>{row.trailer}</strong>
              </div>
              <div className="ca-kv">
                <span>Division</span>
                <strong>{row.division}</strong>
              </div>
              <div className="ca-kv">
                <span>Customer</span>
                <strong>{row.customer}</strong>
              </div>
            </section>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel request
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function CashAdvanceNotesPanel({
  row,
  onClose,
  onAdd,
}: {
  row: CashAdvanceRow;
  onClose: () => void;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: row.currency,
  }).format(row.amount);

  return (
    <div className="ca-drawer-backdrop" onClick={onClose}>
      <aside className="ca-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <header className="ca-drawer-head">
          <div>
            <h3>Notes & comments</h3>
            <p>Internal context for this cash advance</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="ca-drawer-body">
          <section>
            <div className="ca-section-label">Internal notes</div>
            <div className="ca-notes-list">
              {row.notes.length ? (
                row.notes.map((note: CashAdvanceNote) => (
                  <div className="ca-note-card" key={note.id}>
                    <p>{note.text}</p>
                    <small>
                      {note.by} · {note.at}
                    </small>
                  </div>
                ))
              ) : (
                <div className="empty-state soft">No notes yet.</div>
              )}
            </div>
            <div className="ca-note-compose">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add an internal note…"
                rows={3}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!text.trim()}
                onClick={() => {
                  onAdd(text.trim());
                  setText('');
                }}
              >
                Add note
              </button>
            </div>
          </section>
          <section>
            <div className="ca-section-label">Record details</div>
            <div className="ca-detail-card flat">
              <div className="ca-kv">
                <span>ID</span>
                <strong>{row.id}</strong>
              </div>
              <div className="ca-kv">
                <span>Driver</span>
                <strong>{row.driverName}</strong>
              </div>
              <div className="ca-kv">
                <span>Amount</span>
                <strong className="money">{money}</strong>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

