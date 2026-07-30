import { Check, Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BASED_ON_OPTIONS, TAX_CODES } from '../../data/configSeed';
import type {
  ConfigStatus,
  PayrollCurrency,
  PayrollMethod,
  PayrollSchedule,
  ScheduleDriver,
  ScheduleMethodLine,
} from '../../types';

function StatusPill({ status }: { status: ConfigStatus }) {
  return (
    <span className={`cfg-status ${status === 'active' ? 'is-active' : 'is-inactive'}`}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
}

function CurrencyBadge({ currency }: { currency: PayrollCurrency }) {
  return <span className="cfg-currency-pill">{currency}</span>;
}

function scheduleInitial(name: string) {
  const clean = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] || 'S').slice(0, 2).toUpperCase();
}

function cloneSchedule(s: PayrollSchedule): PayrollSchedule {
  return {
    ...s,
    methods: s.methods.map((m) => ({ ...m })),
    drivers: s.drivers.map((d) => ({ ...d })),
  };
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function money(n: number) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 4,
  });
}

export function ScheduleDetailPanel({
  schedule,
  allMethods,
  availableDrivers,
  editing,
  onStartEdit,
  onCancelEdit,
  onSave,
}: {
  schedule: PayrollSchedule;
  allMethods: PayrollMethod[];
  availableDrivers: ScheduleDriver[];
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (next: PayrollSchedule) => void;
}) {
  const [draft, setDraft] = useState(() => cloneSchedule(schedule));
  const [addMethodId, setAddMethodId] = useState(allMethods[0]?.id ?? '');
  const [addSingle, setAddSingle] = useState('0');
  const [addTeam, setAddTeam] = useState('0');
  const [addDriverId, setAddDriverId] = useState('');

  useEffect(() => {
    setDraft(cloneSchedule(schedule));
    setAddMethodId(allMethods[0]?.id ?? '');
    setAddSingle('0');
    setAddTeam('0');
    setAddDriverId('');
  }, [schedule, editing, allMethods]);

  const unusedDrivers = useMemo(
    () => availableDrivers.filter((d) => !draft.drivers.some((x) => x.id === d.id)),
    [availableDrivers, draft.drivers],
  );

  const unusedMethods = useMemo(
    () => allMethods.filter((m) => !draft.methods.some((x) => x.methodId === m.id)),
    [allMethods, draft.methods],
  );

  const setField = <K extends keyof PayrollSchedule>(key: K, value: PayrollSchedule[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateMethod = (id: string, patch: Partial<ScheduleMethodLine>) => {
    setDraft((prev) => ({
      ...prev,
      methods: prev.methods.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  const removeMethod = (id: string) => {
    setDraft((prev) => ({ ...prev, methods: prev.methods.filter((m) => m.id !== id) }));
  };

  const addMethod = () => {
    const m = allMethods.find((x) => x.id === addMethodId);
    if (!m) return;
    const line: ScheduleMethodLine = {
      id: uid('sml'),
      methodId: m.id,
      methodName: m.name,
      basedOn: m.basedOn,
      singleRate: Number(addSingle) || 0,
      teamRate: Number(addTeam) || 0,
    };
    setDraft((prev) => ({ ...prev, methods: [...prev.methods, line] }));
    setAddSingle('0');
    setAddTeam('0');
    setAddMethodId(unusedMethods.filter((x) => x.id !== m.id)[0]?.id ?? allMethods[0]?.id ?? '');
  };

  const removeDriver = (id: string) => {
    setDraft((prev) => ({ ...prev, drivers: prev.drivers.filter((d) => d.id !== id) }));
  };

  const addDriver = () => {
    const d = unusedDrivers.find((x) => x.id === addDriverId);
    if (!d) return;
    setDraft((prev) => ({ ...prev, drivers: [...prev.drivers, { ...d }] }));
    setAddDriverId('');
  };

  const view = editing ? draft : schedule;
  const canSave = draft.name.trim().length > 0;
  const tone =
    view.currency === 'CAD' ? 'cad' : view.currency === 'Peso' ? 'mxn' : 'usd';

  return (
    <section className={`cfg-split-detail ${editing ? 'is-editing' : ''}`} aria-live="polite">
      <div className="cfg-detail-head">
        <div className="cfg-detail-head-main">
          {editing ? (
            <div className="cfg-inline-fields">
              <label className="mod-filter grow">
                <span>Schedule name</span>
                <input
                  value={draft.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Schedule name"
                  autoFocus
                />
              </label>
              <label className="mod-filter">
                <span>Tax code</span>
                <select value={draft.taxCode} onChange={(e) => setField('taxCode', e.target.value)}>
                  {TAX_CODES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mod-filter">
                <span>Currency</span>
                <select
                  value={draft.currency}
                  onChange={(e) => setField('currency', e.target.value as PayrollCurrency)}
                >
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="Peso">Peso</option>
                </select>
              </label>
              <label className="mod-filter">
                <span>Status</span>
                <select
                  value={draft.status}
                  onChange={(e) => setField('status', e.target.value as ConfigStatus)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
          ) : (
            <div className="cfg-detail-hero">
              <div className={`cfg-avatar ${tone}`}>{scheduleInitial(view.name)}</div>
              <div>
                <div className="cfg-detail-title-row">
                  <h2>{view.name}</h2>
                  <StatusPill status={view.status} />
                </div>
                <p className="cfg-detail-sub">
                  {view.taxCode} · {view.currency} · {view.methods.length} methods ·{' '}
                  {view.drivers.length} drivers
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="cfg-detail-actions">
          {editing ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onCancelEdit}>
                <X size={13} />
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!canSave}
                onClick={() => onSave({ ...draft, name: draft.name.trim() })}
              >
                <Check size={13} />
                Save changes
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={onStartEdit}>
              <Pencil size={13} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="cfg-detail-kpis">
        <div className="cfg-detail-kpi">
          <span className="cfg-detail-kpi-l">Tax code</span>
          <strong>{view.taxCode}</strong>
        </div>
        <div className="cfg-detail-kpi">
          <span className="cfg-detail-kpi-l">Currency</span>
          <strong>{view.currency}</strong>
        </div>
        <div className="cfg-detail-kpi">
          <span className="cfg-detail-kpi-l">Methods</span>
          <strong>{view.methods.length}</strong>
        </div>
        <div className="cfg-detail-kpi">
          <span className="cfg-detail-kpi-l">Drivers</span>
          <strong>{view.drivers.length}</strong>
        </div>
      </div>

      <div className="cfg-detail-panels">
        <div className="cfg-detail-panel">
          <div className="cfg-detail-panel-head">
            <div>
              <h3>Payroll methods</h3>
              <p>Rates applied on this schedule</p>
            </div>
            <span className="cfg-tab-count">{view.methods.length}</span>
          </div>

          {editing && (
            <div className="cfg-inline-add">
              <select
                value={addMethodId}
                onChange={(e) => setAddMethodId(e.target.value)}
                aria-label="Method"
              >
                {(unusedMethods.length ? unusedMethods : allMethods).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={addSingle}
                onChange={(e) => setAddSingle(e.target.value)}
                placeholder="Single"
                aria-label="Single rate"
              />
              <input
                type="number"
                step="0.01"
                value={addTeam}
                onChange={(e) => setAddTeam(e.target.value)}
                placeholder="Team"
                aria-label="Team rate"
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addMethod}>
                <Plus size={13} />
                Add
              </button>
            </div>
          )}

          {view.methods.length === 0 ? (
            <div className="cfg-detail-empty">No methods linked yet.</div>
          ) : (
            <ul className="cfg-soft-list">
              {view.methods.map((m) => (
                <li key={m.id} className="cfg-soft-item">
                  {editing && (
                    <button
                      type="button"
                      className="btn-icon danger"
                      aria-label="Remove method"
                      onClick={() => removeMethod(m.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <div className="cfg-soft-main">
                    <strong>{m.methodName}</strong>
                    {editing ? (
                      <select
                        value={m.basedOn}
                        onChange={(e) => updateMethod(m.id, { basedOn: e.target.value })}
                      >
                        {BASED_ON_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="cfg-based-on">{m.basedOn}</span>
                    )}
                  </div>
                  <div className="cfg-soft-rates">
                    <label>
                      <span>Single</span>
                      {editing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={m.singleRate}
                          onChange={(e) =>
                            updateMethod(m.id, { singleRate: Number(e.target.value) || 0 })
                          }
                        />
                      ) : (
                        <em>{money(m.singleRate)}</em>
                      )}
                    </label>
                    <label>
                      <span>Team</span>
                      {editing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={m.teamRate}
                          onChange={(e) =>
                            updateMethod(m.id, { teamRate: Number(e.target.value) || 0 })
                          }
                        />
                      ) : (
                        <em>{money(m.teamRate)}</em>
                      )}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cfg-detail-panel">
          <div className="cfg-detail-panel-head">
            <div>
              <h3>Assigned drivers</h3>
              <p>Drivers paid on this schedule</p>
            </div>
            <span className="cfg-tab-count">{view.drivers.length}</span>
          </div>

          {editing && (
            <div className="cfg-inline-add cfg-inline-add-drivers">
              <select
                value={addDriverId}
                onChange={(e) => setAddDriverId(e.target.value)}
                aria-label="Driver"
              >
                <option value="">Select driver…</option>
                {unusedDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!addDriverId}
                onClick={addDriver}
              >
                <UserPlus size={13} />
                Assign
              </button>
            </div>
          )}

          {view.drivers.length === 0 ? (
            <div className="cfg-detail-empty">No drivers assigned.</div>
          ) : (
            <ul className="cfg-soft-list">
              {view.drivers.map((d) => (
                <li key={d.id} className="cfg-soft-item">
                  {editing && (
                    <button
                      type="button"
                      className="btn-icon danger"
                      aria-label="Remove driver"
                      onClick={() => removeDriver(d.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <div className="cfg-driver-avatar">{d.name.slice(0, 1)}</div>
                  <div className="cfg-soft-main">
                    <strong>{d.name}</strong>
                    <span className="cfg-soft-meta">
                      {d.code} · {d.division}
                    </span>
                  </div>
                  <div className="cfg-soft-side">
                    <span className="cfg-class-pill">{d.driverClass}</span>
                    <StatusPill status={d.active ? 'active' : 'inactive'} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function createEmptySchedule(): PayrollSchedule {
  return {
    id: uid('s'),
    name: '',
    taxCode: 'EXEMPT',
    currency: 'CAD',
    status: 'active',
    methods: [],
    drivers: [],
  };
}

export { CurrencyBadge, StatusPill, scheduleInitial };
