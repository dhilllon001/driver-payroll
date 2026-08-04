import { AlertTriangle, CheckCircle2, ClipboardList, FileSpreadsheet, Flag, Search, Upload } from 'lucide-react';
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
  const [createdBy, setCreatedBy] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searched, setSearched] = useState(false);
  const [perPage, setPerPage] = useState(100);

  const sampleRows = [
    {
      role: 'TEAM',
      trip: '10656970',
      sub: '1',
      inTime: '7/27/2026 11:24:00 AM',
      outTime: '7/28/2026 12:45:00 AM',
      drv: 'JORGEL',
      qty: '790.2',
      method: 'Mileage',
      reason: '',
    },
    {
      role: 'TEAM',
      trip: '10656970',
      sub: '1',
      inTime: '7/27/2026 11:24:00 AM',
      outTime: '7/28/2026 12:45:00 AM',
      drv: 'EDUARDOR',
      qty: '790.2',
      method: 'Mileage',
      reason: '',
    },
    {
      role: 'SINGLE',
      trip: '10656971',
      sub: '1',
      inTime: '7/27/2026 10:00:00 AM',
      outTime: '7/27/2026 6:00:00 PM',
      drv: 'ERNESTO1',
      qty: '136.6',
      method: 'Mileage',
      reason: 'Adjustment',
    },
  ];

  const [logs, setLogs] = useState([
    {
      id: '1',
      fileName: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890_pay_upload.xlsx',
      status: 'Completed' as const,
      message: 'Processed with 1 validation error(s). 0 row(s) updated.',
      createdBy: 'michelle.serrano@charger.com',
      createdAt: 'Aug 4, 2026, 10:05:40 AM',
    },
    {
      id: '2',
      fileName: 'f9e8d7c6-b5a4-3210-fedc-ba0987654321_team_pay.xlsx',
      status: 'Failed' as const,
      message:
        'Column validation failed. The following required column(s) are missing: PayrollMethod, Reason.',
      createdBy: 'sukhdeep.dhillon@charger.com',
      createdAt: 'Aug 3, 2026, 3:22:11 PM',
    },
    {
      id: '3',
      fileName: '11223344-5566-7788-99aa-bbccddeeff00_local_miles.xlsx',
      status: 'Completed' as const,
      message: 'Processed successfully. 24 row(s) updated.',
      createdBy: 'ops.desk@charger.com',
      createdAt: 'Aug 2, 2026, 9:18:02 AM',
    },
  ]);

  const filteredLogs = logs.filter((log) => {
    if (!searched && !createdBy && !from && !to) return true;
    if (createdBy && !log.createdBy.toLowerCase().includes(createdBy.toLowerCase())) return false;
    return true;
  });

  const pickFile = (file?: File | null) => {
    if (file) setFileName(file.name);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-xl upload-pay-modal"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3>Upload Pay</h3>
            <p className="upload-pay-sub">Import Excel pay adjustments and review processing history</p>
          </div>
          <Close onClose={onClose} />
        </div>

        <div className="modal-body upload-pay-body">
          <div className="upload-pay-top">
            <section className="upload-pay-panel">
              <header className="upload-pay-panel-head">
                <Upload size={15} strokeWidth={2.25} />
                <h4>Upload file</h4>
              </header>
              <label
                className={`board-upload-zone upload-pay-drop ${dragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
              >
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  className="sr-only"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
                <span className="upload-pay-drop-ico">
                  <Upload size={22} />
                </span>
                <strong>
                  {fileName || 'Drag & drop your Excel file here'}
                </strong>
                <span className="upload-pay-or">or</span>
                <span className="btn btn-secondary btn-sm">Browse File</span>
              </label>
              <p className="upload-pay-formats">Supported formats: .xls, .xlsx</p>
              <button
                type="button"
                className="btn btn-primary upload-pay-submit"
                disabled={!fileName}
                onClick={() => {
                  const id = String(Date.now());
                  setLogs((prev) => [
                    {
                      id,
                      fileName,
                      status: 'Completed',
                      message: 'Processed successfully. 12 row(s) updated.',
                      createdBy: 'you@charger.com',
                      createdAt: 'Just now',
                    },
                    ...prev,
                  ]);
                  onUpload(fileName);
                  setFileName('');
                }}
              >
                Upload & process
              </button>
            </section>

            <section className="upload-pay-panel">
              <header className="upload-pay-panel-head">
                <FileSpreadsheet size={15} strokeWidth={2.25} />
                <h4>Excel sample</h4>
              </header>
              <div className="upload-pay-sample-scroll">
                <table className="upload-pay-sample-table">
                  <thead>
                    <tr>
                      <th>DriverRole</th>
                      <th>TripNumber</th>
                      <th>SubTripNumber</th>
                      <th>InTime</th>
                      <th>OutTime</th>
                      <th>DrvCode</th>
                      <th>Qty</th>
                      <th>PayrollMethod</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.role}</td>
                        <td>{row.trip}</td>
                        <td>{row.sub}</td>
                        <td>{row.inTime}</td>
                        <td>{row.outTime}</td>
                        <td>{row.drv}</td>
                        <td>{row.qty}</td>
                        <td>{row.method}</td>
                        <td>{row.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="upload-pay-panel upload-pay-logs">
            <header className="upload-pay-panel-head">
              <ClipboardList size={15} strokeWidth={2.25} />
              <h4>Processing audit logs</h4>
            </header>

            <div className="upload-pay-filters">
              <div className="field">
                <label htmlFor="upload-created-by">Created By</label>
                <input
                  id="upload-created-by"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="Name or email"
                />
              </div>
              <div className="field">
                <label htmlFor="upload-from">Upload Date From</label>
                <input
                  id="upload-from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="upload-to">Upload Date To</label>
                <input
                  id="upload-to"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="upload-pay-filter-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSearched(true)}
                >
                  Search
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setCreatedBy('');
                    setFrom('');
                    setTo('');
                    setSearched(false);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="upload-pay-table-wrap">
              <table className="upload-pay-audit-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, perPage).map((log) => (
                    <tr key={log.id}>
                      <td>
                        <button type="button" className="upload-pay-file-link" title={log.fileName}>
                          {log.fileName}
                        </button>
                      </td>
                      <td>
                        <span className={`upload-pay-status ${log.status.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <span className="upload-pay-msg" title={log.message}>
                          {log.message}
                        </span>
                      </td>
                      <td>
                        <div className="upload-pay-created">
                          <strong>{log.createdBy}</strong>
                          <span>{log.createdAt}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredLogs.length && (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state soft">No audit logs match your filters.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="upload-pay-pager">
              <label>
                Per page
                <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
              <span>1 of 1</span>
            </div>
          </section>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
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
