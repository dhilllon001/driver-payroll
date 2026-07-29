import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  BASED_ON_OPTIONS,
  DIVISIONS,
  TAX_CODES,
} from '../../data/configSeed';
import type {
  ConfigStatus,
  CoveragePeriod,
  PayrollCurrency,
  PayrollMethod,
  PayrollRegion,
  ScheduleDriver,
  ScheduleMethodLine,
} from '../../types';

export interface RegionForm {
  name: string;
  coveragePeriod: CoveragePeriod;
  divisions: string[];
  status: ConfigStatus;
}

export interface MethodForm {
  name: string;
  basedOn: string;
}

export interface ScheduleForm {
  name: string;
  taxCode: string;
  currency: PayrollCurrency;
  status: ConfigStatus;
  methods: ScheduleMethodLine[];
  drivers: ScheduleDriver[];
}

const COVERAGE: CoveragePeriod[] = ['Weekly', 'BiWeekly', 'SemiMonthly', 'Monthly'];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  render,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  render?: (v: T) => React.ReactNode;
}) {
  return (
    <div className="cfg-segmented" role="group">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={value === opt ? 'active' : ''}
          onClick={() => onChange(opt)}
        >
          {render ? render(opt) : opt === 'active' ? 'Active' : opt === 'inactive' ? 'Inactive' : opt}
        </button>
      ))}
    </div>
  );
}

export function RegionModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  initial?: PayrollRegion;
  onClose: () => void;
  onSave: (form: RegionForm) => boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [coveragePeriod, setCoveragePeriod] = useState<CoveragePeriod>(
    initial?.coveragePeriod ?? 'SemiMonthly',
  );
  const [divisions, setDivisions] = useState<string[]>(initial?.divisions ?? []);
  const [status, setStatus] = useState<ConfigStatus>(initial?.status ?? 'active');

  const toggleDivision = (d: string) => {
    setDivisions((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="modal-head">
          <h3>{mode === 'edit' ? 'Edit Region' : 'Add Region'}</h3>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="modal-body">
          <div className="cfg-form-stack">
            <div className="field">
              <label>
                Region name<span className="req">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Canada"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Coverage period</label>
              <select
                value={coveragePeriod}
                onChange={(e) => setCoveragePeriod(e.target.value as CoveragePeriod)}
              >
                {COVERAGE.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Divisions</label>
              <div className="cfg-chip-select">
                {DIVISIONS.map((d) => {
                  const on = divisions.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      className={`cfg-chip ${on ? 'on' : ''}`}
                      onClick={() => toggleDivision(d)}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="field">
              <label>Status</label>
              <Segmented
                value={status}
                options={['active', 'inactive']}
                onChange={setStatus}
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
            disabled={!name.trim()}
            onClick={() => onSave({ name, coveragePeriod, divisions, status })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function MethodModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  initial?: PayrollMethod;
  onClose: () => void;
  onSave: (form: MethodForm) => boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [basedOn, setBasedOn] = useState(initial?.basedOn ?? BASED_ON_OPTIONS[0]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="modal-head">
          <h3>{mode === 'edit' ? 'Edit Method' : 'Add Method'}</h3>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="modal-body">
          <div className="cfg-form-stack">
            <div className="field">
              <label>
                Method name<span className="req">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mileage Loaded"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Based on method</label>
              <select value={basedOn} onChange={(e) => setBasedOn(e.target.value)}>
                {BASED_ON_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
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
            disabled={!name.trim()}
            onClick={() => onSave({ name, basedOn })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

type ScheduleTab = 'details' | 'methods' | 'drivers';

export function ScheduleModal({
  mode,
  initial,
  allMethods,
  availableDrivers,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  initial?: {
    name: string;
    taxCode: string;
    currency: PayrollCurrency;
    status: ConfigStatus;
    methods: ScheduleMethodLine[];
    drivers: ScheduleDriver[];
  };
  allMethods: PayrollMethod[];
  availableDrivers: ScheduleDriver[];
  onClose: () => void;
  onSave: (form: ScheduleForm) => boolean;
}) {
  const [tab, setTab] = useState<ScheduleTab>('details');
  const [name, setName] = useState(initial?.name ?? '');
  const [taxCode, setTaxCode] = useState(initial?.taxCode ?? 'EXEMPT');
  const [currency, setCurrency] = useState<PayrollCurrency>(initial?.currency ?? 'CAD');
  const [status, setStatus] = useState<ConfigStatus>(initial?.status ?? 'active');
  const [methods, setMethods] = useState<ScheduleMethodLine[]>(
    () => initial?.methods.map((m) => ({ ...m })) ?? [],
  );
  const [drivers, setDrivers] = useState<ScheduleDriver[]>(
    () => initial?.drivers.map((d) => ({ ...d })) ?? [],
  );
  const [driverQ, setDriverQ] = useState('');
  const [editingLine, setEditingLine] = useState<ScheduleMethodLine | null>(null);
  const [addMethodId, setAddMethodId] = useState(allMethods[0]?.id ?? '');
  const [addSingle, setAddSingle] = useState('0');
  const [addTeam, setAddTeam] = useState('0');
  const [showAddMethod, setShowAddMethod] = useState(false);

  const unusedDrivers = useMemo(
    () => availableDrivers.filter((d) => !drivers.some((x) => x.id === d.id)),
    [availableDrivers, drivers],
  );

  const filteredAssigned = useMemo(() => {
    const q = driverQ.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.division.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q),
    );
  }, [drivers, driverQ]);

  const addMethodLine = () => {
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
    if (editingLine) {
      setMethods((prev) => prev.map((l) => (l.id === editingLine.id ? { ...line, id: editingLine.id } : l)));
      setEditingLine(null);
    } else {
      setMethods((prev) => [...prev, line]);
    }
    setShowAddMethod(false);
    setAddSingle('0');
    setAddTeam('0');
  };

  const startEditLine = (line: ScheduleMethodLine) => {
    setEditingLine(line);
    setAddMethodId(line.methodId);
    setAddSingle(String(line.singleRate));
    setAddTeam(String(line.teamRate));
    setShowAddMethod(true);
  };

  const addDriver = (d: ScheduleDriver) => {
    setDrivers((prev) => [...prev, { ...d }]);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg cfg-schedule-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="modal-head">
          <h3>{mode === 'edit' ? 'Edit Payroll Schedule' : 'Add Payroll Schedule'}</h3>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="tabs cfg-modal-tabs">
          <button
            type="button"
            className={`tab ${tab === 'details' ? 'active' : ''}`}
            onClick={() => setTab('details')}
          >
            Details
          </button>
          <button
            type="button"
            className={`tab ${tab === 'methods' ? 'active' : ''}`}
            onClick={() => setTab('methods')}
          >
            Payroll methods ({methods.length})
          </button>
          <button
            type="button"
            className={`tab ${tab === 'drivers' ? 'active' : ''}`}
            onClick={() => setTab('drivers')}
          >
            Assign drivers ({drivers.length})
          </button>
        </div>

        <div className="modal-body">
          {(methods.length === 0 || drivers.length === 0) && (
            <div className="alert-banner cfg-inline-alert">
              {methods.length === 0 && drivers.length === 0
                ? 'This schedule has no payroll methods and no assigned drivers.'
                : methods.length === 0
                  ? 'This schedule has no payroll methods yet.'
                  : 'This schedule has no assigned drivers yet.'}
            </div>
          )}

          {tab === 'details' && (
            <div className="cfg-form-stack">
              <div className="field">
                <label>
                  Schedule name<span className="req">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. City Drivers - 26/hrs"
                  autoFocus
                />
              </div>
              <div className="cfg-form-row">
                <div className="field">
                  <label>Tax code</label>
                  <select value={taxCode} onChange={(e) => setTaxCode(e.target.value)}>
                    {TAX_CODES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Currency</label>
                  <Segmented
                    value={currency}
                    options={['CAD', 'USD', 'Peso']}
                    onChange={setCurrency}
                    render={(c) => (
                      <>
                        <span aria-hidden>
                          {c === 'CAD' ? '🇨🇦' : c === 'USD' ? '🇺🇸' : '🇲🇽'}
                        </span>{' '}
                        {c}
                      </>
                    )}
                  />
                </div>
              </div>
              <div className="field">
                <label>Status</label>
                <Segmented value={status} options={['active', 'inactive']} onChange={setStatus} />
              </div>
            </div>
          )}

          {tab === 'methods' && (
            <div className="cfg-tab-panel">
              <div className="cfg-tab-toolbar">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingLine(null);
                    setShowAddMethod(true);
                    setAddMethodId(allMethods[0]?.id ?? '');
                    setAddSingle('0');
                    setAddTeam('0');
                  }}
                >
                  <Plus size={13} />
                  Add item
                </button>
              </div>

              {showAddMethod && (
                <div className="cfg-inline-form">
                  <div className="field">
                    <label>Method</label>
                    <select value={addMethodId} onChange={(e) => setAddMethodId(e.target.value)}>
                      {allMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.basedOn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Single rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={addSingle}
                      onChange={(e) => setAddSingle(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Team rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={addTeam}
                      onChange={(e) => setAddTeam(e.target.value)}
                    />
                  </div>
                  <div className="cfg-inline-form-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setShowAddMethod(false);
                        setEditingLine(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={addMethodLine}>
                      {editingLine ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

              {methods.length === 0 ? (
                <div className="empty-state">No payroll methods on this schedule.</div>
              ) : (
                <div className="cfg-modal-table-wrap">
                  <table className="data-table cfg-table">
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Based on</th>
                        <th>Single rate</th>
                        <th>Team rate</th>
                        <th className="cfg-col-actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {methods.map((l) => (
                        <tr key={l.id}>
                          <td className="cfg-strong">{l.methodName}</td>
                          <td>
                            <span className="cfg-based-on">{l.basedOn}</span>
                          </td>
                          <td>{l.singleRate}</td>
                          <td>{l.teamRate}</td>
                          <td className="cfg-col-actions">
                            <button
                              type="button"
                              className="btn-icon"
                              aria-label="Edit"
                              onClick={() => startEditLine(l)}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon danger"
                              aria-label="Remove"
                              onClick={() => setMethods((prev) => prev.filter((x) => x.id !== l.id))}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'drivers' && (
            <div className="cfg-tab-panel">
              <div className="cfg-tab-toolbar">
                <div className="cfg-panel-search">
                  <Search size={13} />
                  <input
                    type="search"
                    placeholder="Search assigned drivers…"
                    value={driverQ}
                    onChange={(e) => setDriverQ(e.target.value)}
                  />
                </div>
                {unusedDrivers.length > 0 && (
                  <div className="cfg-add-driver">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const d = unusedDrivers.find((x) => x.id === e.target.value);
                        if (d) addDriver(d);
                        e.target.value = '';
                      }}
                    >
                      <option value="" disabled>
                        Add driver…
                      </option>
                      {unusedDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {filteredAssigned.length === 0 ? (
                <div className="empty-state">
                  {drivers.length === 0 ? 'No drivers assigned.' : 'No matching drivers.'}
                </div>
              ) : (
                <div className="cfg-modal-table-wrap">
                  <table className="data-table cfg-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Division</th>
                        <th>Class</th>
                        <th className="cfg-col-actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssigned.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <span
                              className={`cfg-status ${d.active ? 'is-active' : 'is-inactive'}`}
                            >
                              {d.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="cfg-strong">{d.name}</td>
                          <td>{d.code}</td>
                          <td className="cfg-muted">{d.category}</td>
                          <td className="cfg-muted">{d.division}</td>
                          <td>{d.driverClass}</td>
                          <td className="cfg-col-actions">
                            <button
                              type="button"
                              className="btn-icon danger"
                              aria-label="Remove driver"
                              onClick={() =>
                                setDrivers((prev) => prev.filter((x) => x.id !== d.id))
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={() => onSave({ name, taxCode, currency, status, methods, drivers })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
