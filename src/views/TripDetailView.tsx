import {
  ArrowLeft,
  Bell,
  FileText,
  Flag,
  MapPin,
  NotebookPen,
  Package,
  Pencil,
  Plus,
  Receipt,
  Search,
  Settings2,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { DetailTab, EventType, Trip, TripEvent } from '../types';
import './views.css';

const HTABS: { id: DetailTab; label: string; icon: typeof MapPin }[] = [
  { id: 'locations', label: 'Location History', icon: MapPin },
  { id: 'payment', label: 'Trip Payment', icon: Wallet },
  { id: 'extras', label: 'Extras', icon: Package },
  { id: 'properties', label: 'Trip Properties', icon: Settings2 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'ifta', label: 'IFTA', icon: Receipt },
];

function eventBadge(event: EventType): string {
  const map: Record<EventType, string> = {
    ACQUIRE: 'ev-acquire',
    HOOK: 'ev-hook',
    'GATE PASS': 'ev-gate-pass',
    DROP: 'ev-drop',
    RELEASE: 'ev-release',
    DETENTION: 'ev-detention',
    LAYOVER: 'ev-layover',
  };
  return map[event];
}

function eventStatusLabel(e: TripEvent, index: number, _total: number) {
  if (e.paid) return { label: 'Paid', cls: 'st-paid' };
  if (index === 0) return { label: 'Active', cls: 'st-active' };
  return { label: 'Open', cls: 'st-pending' };
}

/** Split "29 Jul 12:15" → { date: "29 Jul", time: "12:15" } */
function splitEventWhen(value: string) {
  const parts = value.trim().split(/\s+/);
  if (parts.length >= 3) {
    return { date: `${parts[0]} ${parts[1]}`, time: parts.slice(2).join(' ') };
  }
  if (parts.length === 2) return { date: parts[0], time: parts[1] };
  return { date: value, time: '' };
}

function EventRouteCards({ trip }: { trip: Trip }) {
  const { setShowPaymentModal, toast, setTrips } = useApp();

  const eventMiles = trip.events.reduce((sum, e) => sum + (e.miles || 0), 0);
  const unpaidCount = trip.events.filter((e) => !e.paid).length;
  const paidCount = trip.events.length - unpaidCount;
  const payDelta = Number((eventMiles - trip.payMiles).toFixed(1));

  const markAllPaid = () => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? { ...t, events: t.events.map((e) => ({ ...e, paid: true })) }
          : t,
      ),
    );
    toast('All events marked paid');
  };

  return (
    <div className="route-col">
      <div className="route-col-head">
        <h3>Trip Events</h3>
        <span className="panel-count">{trip.events.length} events</span>
      </div>

      <div className="route-stats">
        <div className="route-stat">
          <span className="eyebrow">Events</span>
          <strong className="tnum">{trip.events.length}</strong>
          <span className="stat-sub">
            {paidCount} paid · {unpaidCount} open
          </span>
        </div>
        <div className="route-stat highlight">
          <span className="eyebrow">Event miles</span>
          <strong className="tnum miles-hi">{eventMiles.toFixed(1)}</strong>
          <span className="stat-sub">sum of event legs</span>
        </div>
        <div className="route-stat highlight">
          <span className="eyebrow">Pay miles</span>
          <strong className="tnum miles-hi">{trip.payMiles.toFixed(1)}</strong>
          <span className="stat-sub">
            {payDelta === 0
              ? 'matches pay'
              : payDelta > 0
                ? `+${payDelta} vs pay`
                : `${payDelta} vs pay`}
          </span>
        </div>
      </div>

      <div className="route-actions">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowPaymentModal(true)}
        >
          <Plus size={13} />
          Add to Pay
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={markAllPaid}
          disabled={unpaidCount === 0}
        >
          Mark events paid
        </button>
      </div>

      <div className="route-cards">
        {trip.events.map((e, i) => {
          const status = eventStatusLabel(e, i, trip.events.length);
          const when = splitEventWhen(e.startTime);
          const endWhen = e.endTime !== e.startTime ? splitEventWhen(e.endTime) : null;
          return (
            <div key={e.id} className="route-card">
              <div className="route-rail">
                <span className="route-num">{i + 1}</span>
                {i < trip.events.length - 1 && <span className="route-line" />}
              </div>
              <div className="route-card-body">
                <div className="route-card-main">
                  <div className="route-card-left">
                    <div className="route-card-tags">
                      <span className={`badge badge-event ${eventBadge(e.event)}`}>
                        {e.event}
                      </span>
                      <span className={`miles-chip ${e.miles > 0 ? 'has-miles' : ''}`}>
                        <span className="tnum">{e.miles > 0 ? e.miles.toFixed(1) : '0'}</span>
                        <span className="mi">mi</span>
                      </span>
                      {e.podRequired && <span className="pod-tag">POD</span>}
                    </div>
                    <div className="route-card-title" title={e.location}>
                      {e.location}
                    </div>
                    <div className="route-card-foot">
                      <span>{e.cityState}</span>
                      <span className="sep">·</span>
                      <span>{e.equipment}</span>
                    </div>
                  </div>
                  <div className="route-card-right">
                    <span className={`status-pill ${status.cls}`}>{status.label}</span>
                    <div className="event-when">
                      <span className="event-date tnum">{when.date}</span>
                      <span className="event-time tnum">{when.time}</span>
                    </div>
                    {endWhen && (
                      <div className="event-when end">
                        <span className="event-date tnum">{endWhen.date}</span>
                        <span className="event-time tnum">{endWhen.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocationsTab({ trip }: { trip: Trip }) {
  return (
    <div className="loc-list airy">
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
  );
}

function PaymentTab({ trip }: { trip: Trip }) {
  const { setShowPaymentModal, setTrips } = useApp();

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
          Add Payment
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
    </>
  );
}

function ExtrasTab({ trip }: { trip: Trip }) {
  if (trip.extras.length === 0) return <div className="empty-state">No extras for this trip</div>;
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
    <div className="insight-grid">
      <div className="insight-card">
        <span className="eyebrow">Terminal</span>
        <strong>{trip.terminal}</strong>
      </div>
      <div className="insight-card">
        <span className="eyebrow">Category</span>
        <strong>{trip.tripCategory}</strong>
      </div>
      <div className="insight-card">
        <span className="eyebrow">Dispatcher</span>
        <strong>{trip.dispatcher}</strong>
      </div>
      <div className="insight-card">
        <span className="eyebrow">Trip Role</span>
        <strong>{trip.tripRole}</strong>
      </div>
      <div className="insight-card">
        <span className="eyebrow">Closure Date</span>
        <strong>{trip.closureDate}</strong>
      </div>
      <div className="insight-card">
        <span className="eyebrow">Drives For</span>
        <strong>{trip.drivesFor || '—'}</strong>
      </div>
      <div className="insight-card">
        <span className="eyebrow">Pay Miles</span>
        <strong className="tnum">{trip.payMiles.toFixed(1)}</strong>
      </div>
      <div className="insight-card">
        <span className="eyebrow">Sub Trip</span>
        <strong>{trip.subTrip}</strong>
      </div>
    </div>
  );
}

function DocumentsTab({ trip }: { trip: Trip }) {
  if (trip.documents.length === 0) return <div className="empty-state">No documents attached</div>;
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
        <div className="notes-list">
          {notes.map((n) => (
            <div key={n.id} className="note-card">
              <div className="note-meta">
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
              ifta: [...t.ifta, { id: `i${Date.now()}`, state: '', totalMiles: 0, tollMiles: 0 }],
            }
          : t,
      ),
    );
    toast('IFTA row added');
  };

  const removeRow = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, ifta: t.ifta.filter((r) => r.id !== id) } : t)),
    );
  };

  return (
    <>
      <div className="panel-toolbar">
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
            <th />
          </tr>
        </thead>
        <tbody>
          {trip.ifta.map((r) => (
            <tr key={r.id}>
              <td>{r.state || '—'}</td>
              <td className="tnum">{r.totalMiles}</td>
              <td className="tnum">{r.tollMiles}</td>
              <td>
                <div className="inline-actions">
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

function driverInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('');
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
    search,
    setSearch,
    toast,
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
      <div className="detail-chrome">
        <button type="button" className="chrome-back" onClick={() => setSelectedTripId(null)}>
          <ArrowLeft size={14} />
          Back to board
        </button>
        <div className="chrome-search">
          <Search size={14} strokeWidth={2} />
          <input
            type="search"
            placeholder="Search events, equipment, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="chrome-bell"
          aria-label="Notifications"
          onClick={() =>
            toast(
              trip.exceptions.length
                ? trip.exceptions[0].customNote
                : 'No new notifications',
            )
          }
        >
          <Bell size={16} />
          {trip.exceptions.length > 0 && <span className="chrome-bell-dot" />}
        </button>
      </div>

      <section className="detail-info-bar">
        <div className="info-identity">
          <div className="info-avatar">{driverInitials(trip.leadDriver)}</div>
          <div className="info-copy">
            <div className="info-title-row">
              <h2 className="info-title">{trip.leadDriver}</h2>
              <span className={`badge badge-status ${trip.paymentStatus}`}>{trip.paymentStatus}</span>
              {trip.flagged && <span className="badge badge-pending">Flagged</span>}
            </div>
            <div className="info-ids">
              <span>
                Trip <strong>{trip.tripNo}</strong>
              </span>
              <span className="sep">·</span>
              <span>
                Sub <strong>{trip.subTrip}</strong>
              </span>
              <span className="sep">·</span>
              <span>{trip.tripCategory}</span>
              <span className="sep">·</span>
              <span>
                Team <strong>{trip.teamDriver || '—'}</strong>
              </span>
            </div>
            <div className="info-sub">
              <span>{trip.leadDriverId}</span>
              <span className="sep">·</span>
              <span>{trip.terminal}</span>
              <span className="sep">·</span>
              <span>Disp. {trip.dispatcher}</span>
              <span className="sep">·</span>
              <span className="tnum">{trip.dateOut}</span>
              <span className="sep">→</span>
              <span className="tnum">{trip.dateIn}</span>
            </div>
          </div>
        </div>

        <div className="info-actions">
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${trip.flagged ? 'is-on' : ''}`}
            onClick={toggleFlag}
          >
            <Flag size={13} fill={trip.flagged ? 'currentColor' : 'none'} />
            {trip.flagged ? 'Flagged' : 'Flag'}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowPaymentModal(true)}>
            <Plus size={13} />
            Add Payment
          </button>
          {trip.exceptions.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm danger-text"
              onClick={() => setShowExceptionModal(true)}
            >
              View notes
            </button>
          )}
        </div>
      </section>

      <div className="detail-split">
        <aside className="detail-left">
          <EventRouteCards trip={trip} />
        </aside>

        <section className="detail-right">
          <div className="htabs">
            {HTABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`htab ${detailTab === id ? 'active' : ''}`}
                onClick={() => setDetailTab(id)}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
          <div className="htab-body">
            {detailTab === 'locations' && <LocationsTab trip={trip} />}
            {detailTab === 'payment' && <PaymentTab trip={trip} />}
            {detailTab === 'extras' && <ExtrasTab trip={trip} />}
            {detailTab === 'properties' && <PropertiesTab trip={trip} />}
            {detailTab === 'documents' && <DocumentsTab trip={trip} />}
            {detailTab === 'notes' && <NotesTab trip={trip} />}
            {detailTab === 'ifta' && <IftaTab trip={trip} />}
          </div>
        </section>
      </div>
    </div>
  );
}
