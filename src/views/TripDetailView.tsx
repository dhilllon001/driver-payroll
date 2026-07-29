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
  Sparkles,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  { id: 'ai', label: 'AI Ask', icon: Sparkles },
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

/** Split "Jul 29, 12:15 AM" → { date: "Jul 29", time: "12:15 AM" } */
function splitHistoryWhen(value: string) {
  const [datePart, ...rest] = value.split(',').map((s) => s.trim());
  if (rest.length) return { date: datePart, time: rest.join(', ') };
  return splitEventWhen(value);
}

function LocationsTab({ trip }: { trip: Trip }) {
  return (
    <div className="tab-shell">
      <div className="tab-toolbar">
        <div>
          <h4 className="tab-title">Location History</h4>
          <p className="tab-sub">{trip.locations.length} stops · chronological</p>
        </div>
      </div>
      <div className="apple-table-wrap">
        <table className="apple-table zebra-table history-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th>Event</th>
              <th>Location</th>
              <th>City</th>
              <th>In</th>
              <th>Out</th>
              <th>Dwell</th>
            </tr>
          </thead>
          <tbody>
            {trip.locations.map((loc, i) => {
              const inn = splitHistoryWhen(loc.timeIn);
              const out = splitHistoryWhen(loc.timeOut);
              return (
                <tr key={loc.id} className={loc.isCurrent ? 'is-current' : ''}>
                  <td className="col-num tnum">{i + 1}</td>
                  <td>
                    <span className={`badge badge-event ${eventBadge(loc.eventName)}`}>
                      {loc.eventName}
                    </span>
                    {loc.isCurrent && <span className="inline-now">Now</span>}
                  </td>
                  <td className="cell-strong" title={loc.name}>
                    {loc.name}
                  </td>
                  <td className="cell-muted">{loc.cityState || '—'}</td>
                  <td className="cell-when tnum">
                    {inn.date} · {inn.time}
                  </td>
                  <td className="cell-when tnum">
                    {out.date} · {out.time}
                  </td>
                  <td>
                    <span className="dwell-chip">{loc.duration}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentTab({ trip }: { trip: Trip }) {
  const { setShowPaymentModal, setTrips, toast } = useApp();
  const total = trip.payments.reduce((s, p) => s + p.amount, 0);
  const openPays = trip.payments.filter((p) => p.status === 'open');
  const pendingPays = trip.payments.filter((p) => p.status === 'pending');
  const paidPays = trip.payments.filter((p) => p.status === 'paid');
  const openTotal = openPays.reduce((s, p) => s + p.amount, 0);
  const pendingTotal = pendingPays.reduce((s, p) => s + p.amount, 0);
  const paidTotal = paidPays.reduce((s, p) => s + p.amount, 0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'paid'>('all');

  const visible =
    statusFilter === 'all' ? trip.payments : trip.payments.filter((p) => p.status === statusFilter);

  const toggleFlag = () => {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, flagged: !t.flagged } : t)),
    );
  };

  return (
    <div className="tab-shell pay-shell">
      <div className="tab-toolbar">
        <div>
          <h4 className="tab-title">Trip Payment</h4>
          <p className="tab-sub">
            {trip.payments.length} record{trip.payments.length === 1 ? '' : 's'}
            {trip.payments.length > 0 ? ` · $${total.toFixed(2)} total` : ''}
          </p>
        </div>
        <div className="tab-toolbar-actions">
          <label className="check-inline">
            <input type="checkbox" checked={trip.flagged} onChange={toggleFlag} />
            Flagged
          </label>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowPaymentModal(true)}>
            <Plus size={13} />
            Add Payment
          </button>
        </div>
      </div>

      <div className="pay-status-bar" role="group" aria-label="Payment status">
        <button
          type="button"
          className={`pay-status-card all ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="pay-status-left">
            <span className="pay-status-label">All</span>
            <em>{trip.payments.length} payments</em>
          </div>
          <strong className="tnum">${total.toFixed(2)}</strong>
        </button>
        <button
          type="button"
          className={`pay-status-card open ${statusFilter === 'open' ? 'active' : ''}`}
          onClick={() => setStatusFilter('open')}
        >
          <div className="pay-status-left">
            <span className="pay-status-label">Open</span>
            <em>{openPays.length} unpaid · needs review</em>
          </div>
          <strong className="tnum">${openTotal.toFixed(2)}</strong>
        </button>
        <button
          type="button"
          className={`pay-status-card pending ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <div className="pay-status-left">
            <span className="pay-status-label">Pending</span>
            <em>{pendingPays.length} in payroll queue</em>
          </div>
          <strong className="tnum">${pendingTotal.toFixed(2)}</strong>
        </button>
        <button
          type="button"
          className={`pay-status-card paid ${statusFilter === 'paid' ? 'active' : ''}`}
          onClick={() => setStatusFilter('paid')}
        >
          <div className="pay-status-left">
            <span className="pay-status-label">Paid</span>
            <em>{paidPays.length} settled</em>
          </div>
          <strong className="tnum">${paidTotal.toFixed(2)}</strong>
        </button>
      </div>

      <div className="pay-meta-row">
        <div>
          <span className="eyebrow">Trip</span>
          <strong>{trip.tripNo}</strong>
        </div>
        <div>
          <span className="eyebrow">Lead</span>
          <strong>{trip.leadDriver}</strong>
        </div>
        <div>
          <span className="eyebrow">Team</span>
          <strong>{trip.teamDriver || '—'}</strong>
        </div>
        <div>
          <span className="eyebrow">Pay date</span>
          <strong>{trip.payDate || '—'}</strong>
        </div>
      </div>

      {trip.payments.length === 0 ? (
        <div className="empty-apple">
          <Wallet size={22} strokeWidth={1.5} />
          <strong>No pay records</strong>
          <p>Add a payment to attach pay lines to this trip.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowPaymentModal(true)}>
            <Plus size={13} />
            Add Payment
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-apple compact">
          <strong>No {statusFilter} payments</strong>
          <p>Try another status filter above.</p>
        </div>
      ) : (
        <div className="apple-table-wrap pay-table-wrap">
          <table className="apple-table zebra-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Assets</th>
                <th>Compensated</th>
                <th>Pay Date</th>
                <th>Adjustment</th>
                <th>Lines</th>
                <th className="col-num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr
                  key={p.id}
                  className={`pay-row status-${p.status}`}
                  onClick={() => toast(`${p.status.toUpperCase()} · ${p.assets} · $${p.amount.toFixed(2)}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <span className={`pay-badge ${p.status}`}>{p.status}</span>
                  </td>
                  <td className="cell-strong">{p.assets}</td>
                  <td>{p.compensated}</td>
                  <td className="tnum">{p.payDate}</td>
                  <td className="cell-muted">{p.payAdjustment}</td>
                  <td className="cell-muted">{p.lines.length} line{p.lines.length === 1 ? '' : 's'}</td>
                  <td className="col-num tnum pay-amount">${p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6}>Filtered total</td>
                <td className="col-num tnum">
                  ${visible.reduce((s, p) => s + p.amount, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function ExtrasTab({ trip }: { trip: Trip }) {
  const { toast, setTrips } = useApp();
  const total = trip.extras.reduce((s, x) => s + x.amount, 0);

  const addExtra = () => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? {
              ...t,
              extras: [
                ...t.extras,
                {
                  id: `x${Date.now()}`,
                  type: 'Tip',
                  amount: 0,
                  status: 'pending',
                  note: 'New tip',
                  quantity: 1,
                },
              ],
            }
          : t,
      ),
    );
    toast('Extra row added');
  };

  return (
    <div className="tab-shell">
      <div className="tab-toolbar">
        <div>
          <h4 className="tab-title">Extras & tips</h4>
          <p className="tab-sub">
            {trip.extras.length} items
            {trip.extras.length > 0 ? ` · $${total.toFixed(2)}` : ''}
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addExtra}>
          <Plus size={13} />
          Add Extra
        </button>
      </div>

      {trip.extras.length === 0 ? (
        <div className="empty-apple">
          <Package size={22} strokeWidth={1.5} />
          <strong>No extras</strong>
          <p>Detention, lumper, tips, and advances appear here.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addExtra}>
            <Plus size={13} />
            Add Extra
          </button>
        </div>
      ) : (
        <div className="apple-table-wrap">
          <table className="apple-table zebra-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Note</th>
                <th className="col-num">Qty</th>
                <th className="col-num">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trip.extras.map((x) => (
                <tr key={x.id}>
                  <td>
                    <span className={`cat-tag cat-${x.type.replace(/\s+/g, '')}`}>{x.type}</span>
                  </td>
                  <td className="cell-muted">{x.note || '—'}</td>
                  <td className="col-num tnum">{x.quantity ?? 1}</td>
                  <td className="col-num tnum cell-strong">${x.amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-status ${x.status}`}>{x.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PropertiesTab({ trip }: { trip: Trip }) {
  const { toast } = useApp();
  const tripInfo: { label: string; value: string }[] = [
    { label: 'Trip No.', value: trip.tripNo },
    { label: 'Sub trip', value: String(trip.subTrip) },
    { label: 'Category', value: trip.tripCategory },
    { label: 'Trip role', value: trip.tripRole },
    { label: 'Terminal', value: trip.terminal },
    { label: 'Dispatcher', value: trip.dispatcher },
    { label: 'Drives for', value: trip.drivesFor || '—' },
    { label: 'Customer', value: trip.customer || '—' },
    { label: 'Pay miles', value: trip.payMiles.toFixed(1) },
  ];
  const routeInfo: { label: string; value: string }[] = [
    { label: 'Origin', value: trip.origin || '—' },
    { label: 'Destination', value: trip.destination || '—' },
    { label: 'Tractor', value: trip.tractor || '—' },
    { label: 'Trailer', value: trip.trailer || '—' },
    { label: 'Commodity', value: trip.commodity || '—' },
    { label: 'Date out', value: trip.dateOut },
    { label: 'Date in', value: trip.dateIn },
    { label: 'Closure', value: trip.closureDate },
    { label: 'Last updated', value: `${trip.lastUpdatedBy} · ${trip.lastUpdatedAt}` },
  ];

  return (
    <div className="tab-shell">
      <div className="tab-toolbar">
        <div>
          <h4 className="tab-title">Trip Properties</h4>
          <p className="tab-sub">Trip details and equipment</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast('Add property')}>
          <Plus size={13} />
          Add Property
        </button>
      </div>
      <div className="props-columns">
        <section className="props-card">
          <header className="props-card-head">Trip information</header>
          <div className="props-list">
            {tripInfo.map((f) => (
              <div key={f.label} className="props-row">
                <span className="props-label">{f.label}</span>
                <span className="props-value">{f.value}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="props-card">
          <header className="props-card-head">Route & equipment</header>
          <div className="props-list">
            {routeInfo.map((f) => (
              <div key={f.label} className="props-row">
                <span className="props-label">{f.label}</span>
                <span className="props-value">{f.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function docPreviewSrc(doc: { id: string; type: string; previewUrl?: string; name: string }) {
  if (doc.previewUrl) return doc.previewUrl;
  const lower = `${doc.type} ${doc.name}`.toLowerCase();
  if (lower.includes('pod') || lower.includes('gate')) return '/docs/pod.svg';
  if (lower.includes('seal') || lower.includes('photo')) return '/docs/seal.svg';
  if (lower.includes('yard') || lower.includes('jpg') || lower.includes('png')) return '/docs/yard.svg';
  return null;
}

function DocumentsTab({ trip }: { trip: Trip }) {
  const { toast, setTrips } = useApp();
  const [selectedId, setSelectedId] = useState(trip.documents[0]?.id ?? null);
  const selected = trip.documents.find((d) => d.id === selectedId) ?? trip.documents[0];

  useEffect(() => {
    if (!trip.documents.some((d) => d.id === selectedId)) {
      setSelectedId(trip.documents[0]?.id ?? null);
    }
  }, [trip.documents, selectedId]);

  const addDocument = () => {
    const id = `d${Date.now()}`;
    const doc = {
      id,
      name: `Upload_${trip.tripNo}.pdf`,
      type: 'Other',
      uploadedAt: 'Just now',
      size: '—',
    };
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, documents: [...t.documents, doc] } : t)),
    );
    setSelectedId(id);
    toast('Document added');
  };

  if (trip.documents.length === 0) {
    return (
      <div className="tab-shell">
        <div className="empty-apple">
          <FileText size={22} strokeWidth={1.5} />
          <strong>No documents</strong>
          <p>Attach BOL, POD, photos, and receipts for this trip.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={addDocument}>
            <Plus size={13} />
            Add Document
          </button>
        </div>
      </div>
    );
  }

  const previewSrc = selected ? docPreviewSrc(selected) : null;

  return (
    <div className="docs-split">
      <aside className="docs-rail">
        <div className="docs-rail-head">
          <span>Files</span>
          <button type="button" className="btn-icon" title="Add document" onClick={addDocument}>
            <Plus size={14} />
          </button>
        </div>
        <ul className="docs-rail-list">
          {trip.documents.map((d) => {
            const thumb = docPreviewSrc(d);
            return (
              <li key={d.id}>
                <button
                  type="button"
                  className={`docs-rail-item ${selected?.id === d.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(d.id)}
                >
                  {thumb ? (
                    <img className="docs-thumb" src={thumb} alt="" />
                  ) : (
                    <span className="docs-thumb docs-thumb-pdf">
                      <FileText size={14} strokeWidth={1.75} />
                    </span>
                  )}
                  <span className="docs-rail-name" title={d.name}>
                    {d.name}
                  </span>
                  <span className="docs-rail-type">{d.type}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <div className="docs-preview">
        {selected ? (
          <>
            <div className="docs-preview-bar">
              <div>
                <strong>{selected.name}</strong>
                <p>
                  {selected.type} · {selected.size} · {selected.uploadedAt}
                </p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast('Download started')}>
                Download
              </button>
            </div>
            <div className="docs-canvas">
              {previewSrc ? (
                <div className="docs-photo-frame">
                  <img src={previewSrc} alt={selected.name} />
                </div>
              ) : (
                <div className="docs-sheet">
                  <div className="docs-sheet-mark">{selected.type}</div>
                  <h3>{selected.name}</h3>
                  <p>Trip {trip.tripNo}</p>
                  <div className="docs-sheet-body">
                    <div className="docs-fake-row">
                      <span>Shipper</span>
                      <strong>{trip.customer || trip.origin || '—'}</strong>
                    </div>
                    <div className="docs-fake-row">
                      <span>Consignee</span>
                      <strong>{trip.destination || '—'}</strong>
                    </div>
                    <div className="docs-fake-row">
                      <span>Equipment</span>
                      <strong>
                        {[trip.tractor, trip.trailer].filter(Boolean).join(' / ') || '—'}
                      </strong>
                    </div>
                    <div className="docs-fake-row">
                      <span>Commodity</span>
                      <strong>{trip.commodity || 'General freight'}</strong>
                    </div>
                  </div>
                  <div className="docs-sheet-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <p className="docs-sheet-meta">
                    Preview · {selected.size} · uploaded {selected.uploadedAt}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-apple">Select a document</div>
        )}
      </div>
    </div>
  );
}

function NotesTab({ trip }: { trip: Trip }) {
  const { notesSubTab, setNotesSubTab, setTrips, toast } = useApp();
  const [draft, setDraft] = useState('');
  const notes = trip.notes.filter((n) => n.section === notesSubTab);

  const addNote = () => {
    const body = draft.trim();
    if (!body) {
      toast('Enter a note first');
      return;
    }
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? {
              ...t,
              notes: [
                {
                  id: `n${Date.now()}`,
                  section: notesSubTab,
                  body,
                  author: 'You',
                  at: 'Just now',
                },
                ...t.notes,
              ],
            }
          : t,
      ),
    );
    setDraft('');
    toast('Note added');
  };

  return (
    <div className="tab-shell notes-shell notes-theme">
      <div className="notes-seg">
        {(['Driver', 'Dispatch', 'User'] as const).map((s) => {
          const count = trip.notes.filter((n) => n.section === s).length;
          return (
            <button
              key={s}
              type="button"
              className={`notes-seg-btn ${notesSubTab === s ? 'active' : ''}`}
              onClick={() => setNotesSubTab(s)}
            >
              {s}
              <span className="notes-seg-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="notes-composer">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add a ${notesSubTab.toLowerCase()} note…`}
          rows={3}
        />
        <div className="notes-composer-bar">
          <span className="tab-sub">Visible to {notesSubTab}</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={addNote}>
            <Plus size={13} />
            Add Note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="empty-apple compact">
          <NotebookPen size={20} strokeWidth={1.5} />
          <strong>No {notesSubTab.toLowerCase()} notes</strong>
          <p>Write above to leave the first note in this section.</p>
        </div>
      ) : (
        <div className="notes-feed">
          {notes.map((n) => (
            <article key={n.id} className="note-bubble">
              <header>
                <strong>{n.author}</strong>
                <span>{n.at}</span>
              </header>
              <p>{n.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function IftaTab({ trip }: { trip: Trip }) {
  const { setTrips, toast } = useApp();
  const totalMiles = trip.ifta.reduce((s, r) => s + r.totalMiles, 0);
  const tollMiles = trip.ifta.reduce((s, r) => s + r.tollMiles, 0);

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
    <div className="tab-shell">
      <div className="tab-toolbar">
        <div>
          <h4 className="tab-title">IFTA</h4>
          <p className="tab-sub">Jurisdiction miles for this trip</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addRow}>
          <Plus size={13} />
          Add Row
        </button>
      </div>

      <div className="ifta-stats">
        <div>
          <span className="eyebrow">Jurisdictions</span>
          <strong className="tnum">{trip.ifta.length}</strong>
        </div>
        <div>
          <span className="eyebrow">Total miles</span>
          <strong className="tnum">{totalMiles.toFixed(2)}</strong>
        </div>
        <div>
          <span className="eyebrow">Toll miles</span>
          <strong className="tnum">{tollMiles.toFixed(2)}</strong>
        </div>
        <div>
          <span className="eyebrow">Non-toll</span>
          <strong className="tnum">{(totalMiles - tollMiles).toFixed(2)}</strong>
        </div>
      </div>

      <div className="apple-table-wrap">
        <table className="apple-table zebra-table">
          <thead>
            <tr>
              <th>State</th>
              <th className="col-num">Total miles</th>
              <th className="col-num">Toll miles</th>
              <th className="col-num">Non-toll</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {trip.ifta.map((r) => (
              <tr key={r.id}>
                <td>
                  <span className="state-pill">{r.state || '—'}</span>
                </td>
                <td className="col-num tnum">{r.totalMiles.toFixed(2)}</td>
                <td className="col-num tnum">{r.tollMiles.toFixed(2)}</td>
                <td className="col-num tnum cell-muted">
                  {(r.totalMiles - r.tollMiles).toFixed(2)}
                </td>
                <td>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      title="Edit"
                      onClick={() => toast('Edit IFTA row')}
                    >
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
      </div>
    </div>
  );
}

const AI_ALERTS = [
  {
    id: 'a1',
    severity: 'high',
    title: 'Pay miles mismatch',
    body: 'Event miles are higher than pay miles. Review unpaid legs before settlement.',
  },
  {
    id: 'a2',
    severity: 'med',
    title: 'Missing satellite / gate data',
    body: 'Exception open — no satellite and gate check data found for this trip.',
  },
  {
    id: 'a3',
    severity: 'low',
    title: 'Detention candidate',
    body: 'Dock dwell looks billable. Suggest adding Detention accessorial if policy allows.',
  },
];

const AI_ACTIONS = [
  {
    id: 'q1',
    title: 'Explain unpaid events',
    desc: 'Summarize which events are unpaid and why pay may be blocked.',
  },
  {
    id: 'q2',
    title: 'Draft payroll note',
    desc: 'Write a clean note for payroll about miles delta and exceptions.',
  },
  {
    id: 'q3',
    title: 'Suggest accessorials',
    desc: 'Recommend detention, lumper, tip, or TONU based on history.',
  },
  {
    id: 'q4',
    title: 'IFTA sanity check',
    desc: 'Compare jurisdiction miles to trip pay miles and flag gaps.',
  },
  {
    id: 'q5',
    title: 'Document completeness',
    desc: 'Check BOL, POD, seal photo, and receipts before close.',
  },
  {
    id: 'q6',
    title: 'Driver settlement preview',
    desc: 'Estimate settlement lines from events, extras, and tips.',
  },
];

function AiAskTab({ trip }: { trip: Trip }) {
  const { toast, setDetailTab, setShowExceptionModal } = useApp();
  const [prompt, setPrompt] = useState('');
  const unpaid = trip.events.filter((e) => !e.paid).length;
  const eventMiles = trip.events.reduce((s, e) => s + (e.miles || 0), 0);
  const delta = Number((eventMiles - trip.payMiles).toFixed(1));

  const runAsk = (text?: string) => {
    const q = (text ?? prompt).trim();
    if (!q) {
      toast('Ask a payroll question first');
      return;
    }
    toast(`AI: analyzing “${q.slice(0, 48)}${q.length > 48 ? '…' : ''}”`);
    setPrompt('');
  };

  return (
    <div className="tab-shell ai-shell">
      <div className="tab-toolbar">
        <div>
          <h4 className="tab-title">AI Ask</h4>
          <p className="tab-sub">Payroll insights for {trip.tripNo}</p>
        </div>
        <span className="ai-pill">
          <Sparkles size={12} />
          Assist
        </span>
      </div>

      <div className="ai-summary">
        <div>
          <span className="eyebrow">Unpaid events</span>
          <strong className="tnum">{unpaid}</strong>
        </div>
        <div>
          <span className="eyebrow">Miles delta</span>
          <strong className="tnum">{delta > 0 ? `+${delta}` : delta}</strong>
        </div>
        <div>
          <span className="eyebrow">Extras</span>
          <strong className="tnum">{trip.extras.length}</strong>
        </div>
        <div>
          <span className="eyebrow">Exceptions</span>
          <strong className="tnum">{trip.exceptions.length}</strong>
        </div>
      </div>

      <section className="ai-block">
        <header>
          <h5>Alert suggestions</h5>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowExceptionModal(true)}>
            Open exception
          </button>
        </header>
        <div className="ai-alerts">
          {AI_ALERTS.map((a) => (
            <article key={a.id} className={`ai-alert sev-${a.severity}`}>
              <div className="ai-alert-top">
                <span className="ai-sev">{a.severity}</span>
                <strong>{a.title}</strong>
              </div>
              <p>{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-block">
        <header>
          <h5>What AI can help with</h5>
        </header>
        <div className="ai-actions">
          {AI_ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              className="ai-action"
              onClick={() => runAsk(a.title)}
            >
              <Sparkles size={14} />
              <span>
                <strong>{a.title}</strong>
                <em>{a.desc}</em>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="ai-composer">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about pay miles, detention, IFTA, documents…"
        />
        <div className="ai-composer-bar">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetailTab('notes')}>
            Jump to notes
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => runAsk()}>
            <Sparkles size={13} />
            Ask AI
          </button>
        </div>
      </div>
    </div>
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
  const splitRef = useRef<HTMLDivElement>(null);
  const [leftPct, setLeftPct] = useState(38);
  const dragging = useRef(false);

  const onMove = useCallback((clientX: number) => {
    const el = splitRef.current;
    if (!el || !dragging.current) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setLeftPct(Math.min(65, Math.max(28, pct)));
  }, []);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => onMove(e.clientX);
    const onPointerUp = () => {
      dragging.current = false;
      document.body.classList.remove('is-resizing');
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onMove]);

  if (!trip) return null;

  const toggleFlag = () => {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, flagged: !t.flagged } : t)),
    );
  };

  const addDocument = () => {
    const id = `d${Date.now()}`;
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? {
              ...t,
              documents: [
                ...t.documents,
                {
                  id,
                  name: `Upload_${t.tripNo}.pdf`,
                  type: 'Other',
                  uploadedAt: 'Just now',
                  size: '—',
                },
              ],
            }
          : t,
      ),
    );
    setDetailTab('documents');
    toast('Document added');
  };

  const eventMiles = trip.events.reduce((sum, e) => sum + (e.miles || 0), 0);

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
        <div className="chrome-end">
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
      </div>

      <section className="detail-info-bar">
        <div className="info-top">
          <div className="info-identity">
            <div className="info-avatar">{driverInitials(trip.leadDriver)}</div>
            <div className="info-copy">
              <div className="info-title-row">
                <h2 className="info-title">{trip.leadDriver}</h2>
                <span className={`badge badge-status ${trip.paymentStatus}`}>{trip.paymentStatus}</span>
                {trip.flagged && <span className="badge badge-pending">Flagged</span>}
                <span className="badge badge-neutral">{trip.tripRole}</span>
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
                {trip.customer && (
                  <>
                    <span className="sep">·</span>
                    <span>
                      Customer <strong>{trip.customer}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="info-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm info-view-note"
              onClick={() => {
                if (trip.exceptions.length > 0) {
                  setShowExceptionModal(true);
                } else {
                  setDetailTab('notes');
                  toast(
                    trip.notes.length
                      ? `Opened notes (${trip.notes.length})`
                      : 'No notes yet — Notes tab opened',
                  );
                }
              }}
            >
              <NotebookPen size={13} />
              View Note
              {(trip.exceptions.length > 0 || trip.notes.length > 0) && (
                <span className="info-note-count">
                  {trip.exceptions.length > 0 ? trip.exceptions.length : trip.notes.length}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`btn btn-secondary btn-sm ${trip.flagged ? 'is-on' : ''}`}
              onClick={toggleFlag}
            >
              <Flag size={13} fill={trip.flagged ? 'currentColor' : 'none'} />
              {trip.flagged ? 'Flagged' : 'Flag'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addDocument}>
              <FileText size={13} />
              Add Document
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowPaymentModal(true)}
            >
              <Plus size={13} />
              Add Payment
            </button>
          </div>
        </div>

        {(trip.origin || trip.destination || trip.commodity || trip.drivesFor) && (
          <div className="info-highlights">
            {(trip.origin || trip.destination) && (
              <div className="info-highlight">
                <span className="eyebrow">Route</span>
                <strong>
                  {trip.origin || '—'}
                  <span className="info-arrow">→</span>
                  {trip.destination || '—'}
                </strong>
              </div>
            )}
            {trip.commodity && (
              <div className="info-highlight">
                <span className="eyebrow">Commodity</span>
                <strong>{trip.commodity}</strong>
              </div>
            )}
            {trip.drivesFor && (
              <div className="info-highlight">
                <span className="eyebrow">Drives for</span>
                <strong>{trip.drivesFor}</strong>
              </div>
            )}
            {trip.payDate && (
              <div className="info-highlight">
                <span className="eyebrow">Pay date</span>
                <strong>{trip.payDate}</strong>
              </div>
            )}
          </div>
        )}

        <div className="info-metrics">
          <div className="info-metric">
            <span className="eyebrow">Driver ID</span>
            <strong>{trip.leadDriverId}</strong>
          </div>
          <div className="info-metric">
            <span className="eyebrow">Terminal</span>
            <strong>{trip.terminal}</strong>
          </div>
          <div className="info-metric">
            <span className="eyebrow">Dispatcher</span>
            <strong>{trip.dispatcher}</strong>
          </div>
          <div className="info-metric">
            <span className="eyebrow">Pay mi</span>
            <strong className="tnum">{trip.payMiles.toFixed(1)}</strong>
          </div>
          <div className="info-metric">
            <span className="eyebrow">Event mi</span>
            <strong className="tnum">{eventMiles.toFixed(1)}</strong>
          </div>
          <div className="info-metric">
            <span className="eyebrow">Docs</span>
            <strong className="tnum">{trip.documents.length}</strong>
          </div>
          {(trip.tractor || trip.trailer) && (
            <div className="info-metric">
              <span className="eyebrow">Equipment</span>
              <strong>{[trip.tractor, trip.trailer].filter(Boolean).join(' / ')}</strong>
            </div>
          )}
          <div className="info-metric info-metric-wide">
            <span className="eyebrow">Out → In</span>
            <strong className="tnum">
              {trip.dateOut} → {trip.dateIn}
            </strong>
          </div>
        </div>
      </section>

      <div className="detail-split" ref={splitRef} style={{ gridTemplateColumns: `${leftPct}% 6px minmax(0, 1fr)` }}>
        <aside className="detail-left">
          <EventRouteCards trip={trip} />
        </aside>

        <div
          className="detail-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = true;
            document.body.classList.add('is-resizing');
          }}
        >
          <span className="resizer-grip" />
        </div>

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
            {detailTab === 'ai' && <AiAskTab trip={trip} />}
          </div>
        </section>
      </div>
    </div>
  );
}
