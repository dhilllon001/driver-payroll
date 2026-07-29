import {
  ArrowLeft,
  Flag,
  FilePlus2,
  Maximize2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { DetailTab, EventType, Trip } from '../types';
import './views.css';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'payment', label: 'Trip Payment Record' },
  { id: 'extras', label: 'Extras' },
  { id: 'properties', label: 'Trip Properties' },
  { id: 'documents', label: 'Documents' },
  { id: 'notes', label: 'Notes' },
  { id: 'ifta', label: 'IFTA' },
];

function eventClass(event: EventType) {
  const map: Record<EventType, string> = {
    ACQUIRE: 'ev-acquire',
    HOOK: 'ev-hook',
    'GATE PASS': 'ev-gate-pass',
    DROP: 'ev-drop',
    RELEASE: 'ev-release',
    DETENTION: 'ev-detention',
    LAYOVER: 'ev-layover',
  };
  return `badge badge-event ${map[event]}`;
}

function EventsTable({ trip }: { trip: Trip }) {
  return (
    <div className="events-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Status</th>
            <th>Equipment</th>
            <th>Location</th>
            <th>City / State</th>
            <th>POD Required</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Miles</th>
          </tr>
        </thead>
        <tbody>
          {trip.events.map((e) => (
            <tr key={e.id}>
              <td>
                <span className={eventClass(e.event)}>{e.event}</span>
              </td>
              <td>
                <span className={`status-dot ${e.paid ? 'paid' : ''}`}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>$</span>
                </span>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{e.equipment}</td>
              <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.location}
              </td>
              <td>{e.cityState}</td>
              <td>{e.podRequired ? 'Yes' : ''}</td>
              <td className="tnum" style={{ whiteSpace: 'nowrap' }}>
                {e.startTime}
              </td>
              <td className="tnum" style={{ whiteSpace: 'nowrap' }}>
                {e.endTime}
              </td>
              <td className="tnum">{e.miles || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentTab({ trip }: { trip: Trip }) {
  const { setShowPaymentModal, setTrips, toast } = useApp();

  const toggleFlag = () => {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, flagged: !t.flagged } : t)),
    );
  };

  return (
    <>
      <div className="pay-summary">
        <div className="pay-summary-row">
          <span className="k">Trip No.</span>
          <span className="v">{trip.tripNo}</span>
        </div>
        <div className="pay-summary-row">
          <span className="k">Lead Driver</span>
          <span className="v">{trip.leadDriver}</span>
        </div>
        <div className="pay-summary-row">
          <span className="k">Team Driver</span>
          <span className="v">{trip.teamDriver || '—'}</span>
        </div>
      </div>

      <div className="pay-actions">
        <label className="check-inline">
          <input type="checkbox" checked={trip.flagged} onChange={toggleFlag} />
          Flagged
        </label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPaymentModal(true)}>
          <Plus size={13} />
          Add Payment Record
        </button>
      </div>

      {trip.payments.length === 0 ? (
        <div className="empty-state">No pay record exist for this trip</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Assets</th>
              <th>Compensated</th>
              <th>Pay Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {trip.payments.map((p) => (
              <tr key={p.id}>
                <td>{p.assets}</td>
                <td>{p.compensated}</td>
                <td>{p.payDate}</td>
                <td className="tnum">${p.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {trip.payments.length === 0 && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => toast('No records found.')}
        >
          Refresh
        </button>
      )}
    </>
  );
}

function ExtrasTab({ trip }: { trip: Trip }) {
  if (trip.extras.length === 0) {
    return <div className="empty-state">No extras for this trip</div>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {trip.extras.map((x) => (
          <tr key={x.id}>
            <td>
              <span className={`cat-tag cat-${x.type}`}>{x.type}</span>
            </td>
            <td className="tnum">${x.amount.toFixed(2)}</td>
            <td>
              <span className={`badge badge-status ${x.status}`}>{x.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PropertiesTab({ trip }: { trip: Trip }) {
  return (
    <>
      <div className="alert-banner" style={{ marginBottom: 16 }}>
        Last Updated by {trip.lastUpdatedBy} at {trip.lastUpdatedAt}
      </div>
      <div className="props-grid">
        <div className="prop-item">
          <span className="lbl">Terminal</span>
          <span className="val">{trip.terminal}</span>
        </div>
        <div className="prop-item">
          <span className="lbl">Category</span>
          <span className="val">{trip.tripCategory}</span>
        </div>
        <div className="prop-item">
          <span className="lbl">Dispatcher</span>
          <span className="val">{trip.dispatcher}</span>
        </div>
        <div className="prop-item">
          <span className="lbl">Trip Role</span>
          <span className="val">{trip.tripRole}</span>
        </div>
        <div className="prop-item">
          <span className="lbl">Closure Date</span>
          <span className="val">{trip.closureDate}</span>
        </div>
        <div className="prop-item">
          <span className="lbl">Drives For</span>
          <span className="val">{trip.drivesFor || '—'}</span>
        </div>
        <div className="prop-item">
          <span className="lbl">Pay Miles</span>
          <span className="val tnum">{trip.payMiles.toFixed(1)}</span>
        </div>
        <div className="prop-item">
          <span className="lbl">Sub Trip</span>
          <span className="val">{trip.subTrip}</span>
        </div>
      </div>
    </>
  );
}

function DocumentsTab({ trip }: { trip: Trip }) {
  if (trip.documents.length === 0) {
    return <div className="empty-state">No documents attached</div>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {trip.documents.map((d) => (
          <tr key={d.id}>
            <td>{d.name}</td>
            <td>
              <span className="badge badge-neutral">{d.type}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NotesTab({ trip }: { trip: Trip }) {
  const { notesSubTab, setNotesSubTab } = useApp();
  const notes = trip.notes.filter((n) => n.section === notesSubTab);

  return (
    <>
      <div className="subtabs">
        {(['Payroll', 'Driver', 'Dispatch'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`subtab ${notesSubTab === s ? 'active' : ''}`}
            onClick={() => setNotesSubTab(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {notes.length === 0 ? (
        <div className="empty-state">No records found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                padding: 12,
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-1)',
              }}
            >
              <div style={{ fontSize: 'var(--fs-small)', color: 'var(--fg-3)', marginBottom: 4 }}>
                {n.author} · {n.at}
              </div>
              <div>{n.body}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function IftaTab({ trip }: { trip: Trip }) {
  const { setTrips, toast } = useApp();

  const addRow = () => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? {
              ...t,
              ifta: [
                ...t.ifta,
                { id: `i${Date.now()}`, state: '', totalMiles: 0, tollMiles: 0 },
              ],
            }
          : t,
      ),
    );
    toast('IFTA row added');
  };

  const removeRow = (id: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id ? { ...t, ifta: t.ifta.filter((r) => r.id !== id) } : t,
      ),
    );
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addRow}>
          <Plus size={13} />
          Add Row
        </button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>State</th>
            <th>Total miles</th>
            <th>Toll miles</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trip.ifta.map((r) => (
            <tr key={r.id}>
              <td>{r.state || '—'}</td>
              <td className="tnum">{r.totalMiles}</td>
              <td className="tnum">{r.tollMiles}</td>
              <td>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button type="button" className="btn-icon" title="Edit" onClick={() => toast('Edit IFTA row')}>
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon danger"
                    title="Delete"
                    onClick={() => removeRow(r.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function TripDetailView() {
  const {
    trips,
    selectedTripId,
    setSelectedTripId,
    detailTab,
    setDetailTab,
    setShowPaymentModal,
    setShowExceptionModal,
    setTrips,
  } = useApp();

  const trip = trips.find((t) => t.id === selectedTripId);
  if (!trip) return null;

  const toggleFlag = () => {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, flagged: !t.flagged } : t)),
    );
  };

  return (
    <div className="detail">
      <div className="detail-head">
        <button type="button" className="btn btn-ghost btn-sm back" onClick={() => setSelectedTripId(null)}>
          <ArrowLeft size={14} />
          Board
        </button>
        <div className="detail-trip-id">
          <Flag size={14} color="var(--action)" />
          {trip.tripNo}
          <span className="sub">{trip.subTrip}</span>
        </div>
        <div className="detail-driver">{trip.leadDriver}</div>
        <div className="detail-cat">{trip.tripCategory}</div>
        <div className="detail-times">
          <span>{trip.dateOut}</span>
          <span>→</span>
          <span>{trip.dateIn}</span>
        </div>
        <div className="detail-head-actions">
          <button
            type="button"
            className={`btn-icon warn ${trip.flagged ? 'on' : ''}`}
            title="Flag"
            onClick={toggleFlag}
          >
            <Flag size={15} fill={trip.flagged ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            className={`btn-icon pay ${trip.paymentStatus !== 'unpaid' ? 'on' : ''}`}
            title="Payment"
            onClick={() => setShowPaymentModal(true)}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>$</span>
          </button>
          {trip.exceptions.length > 0 && (
            <button
              type="button"
              className="btn-icon danger"
              title="Exceptions"
              onClick={() => setShowExceptionModal(true)}
            >
              <FilePlus2 size={15} />
            </button>
          )}
          <button type="button" className="btn-icon" title="Expand">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      <aside className="loc-panel">
        <div className="loc-panel-head">Location History</div>
        <div className="loc-list">
          {trip.locations.map((loc) => (
            <div key={loc.id} className="loc-item">
              <div className={`loc-dot ${loc.isCurrent ? 'current' : ''}`} />
              <div className="loc-meta">
                <div className="loc-name">{loc.name}</div>
                <div className="loc-time">{loc.timestamp}</div>
                {loc.duration && <div className="loc-dur">{loc.duration}</div>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="events-panel">
        <EventsTable trip={trip} />
      </section>

      <aside className="pay-panel">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab ${detailTab === t.id ? 'active' : ''}`}
              onClick={() => setDetailTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="pay-panel-body">
          {detailTab === 'payment' && <PaymentTab trip={trip} />}
          {detailTab === 'extras' && <ExtrasTab trip={trip} />}
          {detailTab === 'properties' && <PropertiesTab trip={trip} />}
          {detailTab === 'documents' && <DocumentsTab trip={trip} />}
          {detailTab === 'notes' && <NotesTab trip={trip} />}
          {detailTab === 'ifta' && <IftaTab trip={trip} />}
        </div>
      </aside>
    </div>
  );
}
