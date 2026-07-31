import { AlertTriangle, CheckCircle2, Flag, Search, Upload } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Trip } from '../../types';

function Close({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
      ×
    </button>
  );
}

export function ConfirmActionModal({
  title,
  message,
  confirmLabel,
  tone = 'default',
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'default' | 'danger' | 'success';
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm board-alert-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <Close onClose={onClose} />
        </div>
        <div className="modal-body">
          <div className={`board-alert-banner ${tone}`}>
            {tone === 'danger' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <p>{message}</p>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdvancedSearchModal({
  initial,
  onClose,
  onApply,
}: {
  initial: {
    search: string;
    role: string;
    tag: string;
    status: string;
  };
  onClose: () => void;
  onApply: (next: { search: string; role: string; tag: string; status: string }) => void;
}) {
  const [search, setSearch] = useState(initial.search);
  const [role, setRole] = useState(initial.role);
  const [tag, setTag] = useState(initial.tag);
  const [status, setStatus] = useState(initial.status);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Advanced search</h3>
          <Close onClose={onClose} />
        </div>
        <div className="modal-body">
          <div className="board-alert-banner info">
            <Search size={16} />
            <p>Filter trips by driver, status, role, or tags. Results update on the board immediately.</p>
          </div>
          <div className="board-modal-grid">
            <div className="field">
              <label>Keyword</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Trip no, driver, category…"
              />
            </div>
            <div className="field">
              <label>Payment status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="exception">Exception</option>
              </select>
            </div>
            <div className="field">
              <label>Trip role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="all">All roles</option>
                <option value="Local">Local</option>
                <option value="Team">Team</option>
                <option value="Owner Operator">Owner Operator</option>
                <option value="Company">Company</option>
              </select>
            </div>
            <div className="field">
              <label>Tag</label>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. hot, canada" />
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
            onClick={() => onApply({ search, role, tag, status })}
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
}

export function UploadPayModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (fileName: string) => void;
}) {
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Upload pay file</h3>
          <Close onClose={onClose} />
        </div>
        <div className="modal-body">
          <div className="board-alert-banner info">
            <Upload size={16} />
            <p>Upload a payroll CSV or XLS file. You’ll get a confirmation once processing starts.</p>
          </div>
          <label
            className={`board-upload-zone ${dragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) setFileName(file.name);
            }}
          >
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
            />
            <Upload size={22} />
            <strong>{fileName || 'Drop pay file here'}</strong>
            <span>{fileName ? 'Ready to upload' : 'CSV, XLS, or XLSX · click to browse'}</span>
          </label>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!fileName}
            onClick={() => onUpload(fileName)}
          >
            Start upload
          </button>
        </div>
      </div>
    </div>
  );
}

export function TripHoverCard({ trip }: { trip: Trip }) {
  const exception = trip.exceptions[0];
  const exceptionText =
    exception?.errorException?.trim() ||
    exception?.customNote?.trim() ||
    exception?.ruleName?.trim() ||
    '';
  const showException = !!exception && (exceptionText || exception.ruleName);

  return (
    <div className="trip-hover-card">
      <header>
        <div className="trip-hover-title">
          <strong>{trip.tripNo}</strong>
          <div className="trip-hover-badges">
            <span className={`pay-status-pill ${trip.paymentStatus}`}>{trip.paymentStatus}</span>
            {trip.flagged && (
              <span className="trip-hover-flag">
                <Flag size={11} fill="currentColor" /> Flagged
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="trip-hover-body">
        <div className="trip-hover-row stacked">
          <span className="trip-hover-label">Lead driver</span>
          <span className="trip-hover-value">
            {trip.leadDriver}
            <small>{trip.leadDriverId}</small>
          </span>
        </div>
        <div className="trip-hover-grid">
          <div className="trip-hover-row">
            <span className="trip-hover-label">Category</span>
            <span className="trip-hover-value">{trip.tripCategory}</span>
          </div>
          <div className="trip-hover-row">
            <span className="trip-hover-label">Role</span>
            <span className="trip-hover-value">{trip.tripRole}</span>
          </div>
          <div className="trip-hover-row">
            <span className="trip-hover-label">Pay miles</span>
            <span className="trip-hover-value tnum">{trip.payMiles.toFixed(1)}</span>
          </div>
        </div>
        <div className="trip-hover-row stacked">
          <span className="trip-hover-label">Dates</span>
          <span className="trip-hover-value trip-hover-dates tnum">
            <span>{trip.dateOut}</span>
            <span className="trip-hover-arrow">→</span>
            <span>{trip.dateIn}</span>
          </span>
        </div>
        {(trip.origin || trip.destination) && (
          <div className="trip-hover-row stacked">
            <span className="trip-hover-label">Route</span>
            <span className="trip-hover-value trip-hover-dates">
              <span>{trip.origin || '—'}</span>
              <span className="trip-hover-arrow">→</span>
              <span>{trip.destination || '—'}</span>
            </span>
          </div>
        )}
      </div>

      {showException && (
        <div className="trip-hover-exception">
          <AlertTriangle size={13} />
          <div>
            <strong>{exception.ruleName || 'Exception'}</strong>
            {exceptionText && exceptionText !== exception.ruleName ? (
              <span>{exceptionText}</span>
            ) : (
              <span>Needs review</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TripHoverWrap({ trip, children }: { trip: Trip; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  return (
    <span
      className="trip-hover-wrap"
      onMouseEnter={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const width = 300;
        const estHeight = 280;
        let left = r.left;
        let top = r.bottom + 8;
        if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
        if (top + estHeight > window.innerHeight - 12) top = Math.max(8, r.top - estHeight - 8);
        setPos({ top, left: Math.max(8, left) });
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <div className="trip-hover-portal" style={{ top: pos.top, left: pos.left }}>
          <TripHoverCard trip={trip} />
        </div>
      )}
    </span>
  );
}

export type BoardConfirm =
  | { kind: 'flag'; trip: Trip }
  | { kind: 'export'; trip: Trip }
  | { kind: 'open'; trip: Trip }
  | null;
