import { Settings2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { PayLine, PaymentRecord } from '../../types';

const DEFAULT_LINES: PayLine[] = [
  { method: 'Lay Overs', basedOn: 'Layovers', quantity: 0, payRate: 545, amount: 0 },
  { method: 'Misc Flat', basedOn: 'Flat Rate', quantity: 0, payRate: 0, amount: 0 },
  { method: 'Hourly', basedOn: 'Regular Hours', quantity: 2, payRate: 135, amount: 270 },
];

export function AddPaymentModal() {
  const { trips, selectedTripId, setShowPaymentModal, setTrips, toast } = useApp();
  const trip = trips.find((t) => t.id === selectedTripId);

  const [driver, setDriver] = useState('');
  const [compensate, setCompensate] = useState('');
  const [payrollDate, setPayrollDate] = useState('Aug 07, 2026');
  const [taxCode, setTaxCode] = useState('EXEMPT');
  const [payAdjustment, setPayAdjustment] = useState('Regular Pay');
  const [tab, setTab] = useState<'standard' | 'routing'>('standard');
  const [lines, setLines] = useState<PayLine[]>(DEFAULT_LINES);
  const [notes, setNotes] = useState('');

  const driverOptions = useMemo(() => {
    if (!trip) return [];
    const opts = [{ id: trip.leadDriverId, name: trip.leadDriver }];
    if (trip.teamDriver) opts.push({ id: trip.teamDriverId, name: trip.teamDriver });
    return opts;
  }, [trip]);

  if (!trip) return null;

  const driverValue =
    driver || `(${trip.leadDriverId}) ${trip.leadDriver}`;
  const compensateValue = compensate || driverValue;

  const total = lines.reduce((s, l) => s + l.amount, 0);

  const updateLine = (idx: number, patch: Partial<PayLine>) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const next = { ...l, ...patch };
        if ('quantity' in patch || 'payRate' in patch) {
          next.amount = Number((next.quantity * next.payRate).toFixed(2));
        }
        return next;
      }),
    );
  };

  const save = () => {
    const record: PaymentRecord = {
      id: `p${Date.now()}`,
      assets: trip.events[0]?.equipment.split(' ')[0] || '—',
      compensated: compensateValue,
      payDate: payrollDate,
      amount: total,
      taxCode,
      payAdjustment,
      lines,
      notes,
      status: 'open',
    };
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? {
              ...t,
              payments: [...t.payments, record],
              payDate: payrollDate,
              paymentStatus: 'pending',
            }
          : t,
      ),
    );
    setShowPaymentModal(false);
    toast(`Payment saved for ${trip.tripNo}`);
  };

  return (
    <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="modal-head">
          <h3>
            Add Trip Payment — {trip.tripNo}, SubTrip — {trip.subTrip}
          </h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            data-tooltip="Close" data-tooltip-side="bottom"
            onClick={() => setShowPaymentModal(false)}
          >
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>
                Driver<span className="req">*</span>
              </label>
              <select
                value={driverValue}
                onChange={(e) => {
                  setDriver(e.target.value);
                  setCompensate(e.target.value);
                }}
              >
                {driverOptions.map((d) => (
                  <option key={d.id} value={`(${d.id}) ${d.name}`}>
                    ({d.id}) {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                Compensate<span className="req">*</span>
              </label>
              <select value={compensateValue} onChange={(e) => setCompensate(e.target.value)}>
                {driverOptions.map((d) => (
                  <option key={d.id} value={`(${d.id}) ${d.name}`}>
                    ({d.id}) {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                Payroll Date<span className="req">*</span>
              </label>
              <input value={payrollDate} onChange={(e) => setPayrollDate(e.target.value)} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>
                Tax Code<span className="req">*</span>
              </label>
              <select value={taxCode} onChange={(e) => setTaxCode(e.target.value)}>
                <option value="EXEMPT">EXEMPT</option>
                <option value="TAXABLE">TAXABLE</option>
              </select>
            </div>
            <div className="field">
              <label>
                Pay Adjustment<span className="req">*</span>
              </label>
              <select value={payAdjustment} onChange={(e) => setPayAdjustment(e.target.value)}>
                <option value="Regular Pay">Regular Pay</option>
                <option value="Bonus">Bonus</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>
          </div>

          <div className="pay-tabs-row">
            <div className="tabs">
              <button
                type="button"
                className={`tab ${tab === 'standard' ? 'active' : ''}`}
                onClick={() => setTab('standard')}
              >
                Standard Pay
              </button>
              <button
                type="button"
                className={`tab ${tab === 'routing' ? 'active' : ''}`}
                onClick={() => setTab('routing')}
              >
                Trip Routing
              </button>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast('Change payroll methods')}>
              <Settings2 size={13} />
              Change Payroll Methods
            </button>
          </div>

          {tab === 'standard' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payroll Method</th>
                  <th>Based On</th>
                  <th>Quantity</th>
                  <th>Pay Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.method}>
                    <td>{l.method}</td>
                    <td>{l.basedOn}</td>
                    <td>
                      <input
                        className="tnum"
                        style={{
                          width: 80,
                          border: '1px solid var(--border-2)',
                          borderRadius: 6,
                          padding: '4px 8px',
                        }}
                        type="number"
                        step="0.01"
                        value={l.quantity}
                        onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td className="tnum">${l.payRate.toFixed(4)}</td>
                    <td className="tnum">${l.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={4}>Total</td>
                  <td className="tnum">${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="empty-state">Trip routing miles: {trip.payMiles.toFixed(1)}</div>
          )}

          <div className="modal-meta-row">
            <div className="times">
              <div>
                <strong>Date Out:</strong>
                {trip.dateOut}
              </div>
              <div>
                <strong>Date In:</strong>
                {trip.dateIn}
              </div>
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes…" />
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExceptionModal() {
  const { trips, selectedTripId, setShowExceptionModal } = useApp();
  const trip = trips.find((t) => t.id === selectedTripId);
  if (!trip) return null;

  return (
    <div className="modal-backdrop" onClick={() => setShowExceptionModal(false)}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="modal-head">
          <h3>Trip Exception — {trip.tripNo}</h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            data-tooltip="Close" data-tooltip-side="bottom"
            onClick={() => setShowExceptionModal(false)}
          >
            <X size={14} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Custom Note</th>
                <th>Error Exception</th>
                <th>Rule Name</th>
              </tr>
            </thead>
            <tbody>
              {trip.exceptions.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--fg-4)' }}>
                    No exceptions
                  </td>
                </tr>
              ) : (
                trip.exceptions.map((ex, i) => (
                  <tr key={i}>
                    <td>{ex.customNote}</td>
                    <td>{ex.errorException}</td>
                    <td>{ex.ruleName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-primary" onClick={() => setShowExceptionModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
