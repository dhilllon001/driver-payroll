import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AVAILABLE_DRIVERS,
  BASED_ON_OPTIONS,
  DIVISIONS,
  METHODS as SEED_METHODS,
  REGIONS as SEED_REGIONS,
  SCHEDULES as SEED_SCHEDULES,
} from '../data/configSeed';
import type {
  ConfigStatus,
  PayrollCurrency,
  PayrollMethod,
  PayrollRegion,
  PayrollSchedule,
} from '../types';
import {
  MethodModal,
  RegionModal,
  type MethodForm,
  type RegionForm,
} from '../components/modals/ConfigModals';
import {
  ScheduleDetailPanel,
  createEmptySchedule,
} from '../components/config/ScheduleDetailPanel';
import { RowActionMenu, type RowActionItem } from '../components/ui/RowActionMenu';
import './modules.css';
import './config.css';

export type ConfigSection = 'regions' | 'methods' | 'schedules';
type PendingDelete =
  | { kind: 'region'; id: string; name: string }
  | { kind: 'method'; id: string; name: string }
  | { kind: 'schedule'; id: string; name: string }
  | null;

const EDIT_DELETE: RowActionItem[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function regionLabel(r: Pick<PayrollRegion, 'country' | 'name'>) {
  if (r.country === 'USA') return 'United States';
  return r.name || r.country;
}

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

function countryCode(country: PayrollRegion['country']) {
  if (country === 'Canada') return 'CA';
  if (country === 'Mexico') return 'MX';
  return 'US';
}

export function PayrollConfigView({ section }: { section: ConfigSection }) {
  const {
    toast,
    search,
    configStatusFilter,
    setConfigStatusFilter,
    setConfigHeader,
  } = useApp();

  const [regions, setRegions] = useState<PayrollRegion[]>(() =>
    SEED_REGIONS.map((r) => ({ ...r, divisions: [...r.divisions] })),
  );
  const [methods, setMethods] = useState<PayrollMethod[]>(() => SEED_METHODS.map((m) => ({ ...m })));
  const [schedules, setSchedules] = useState<PayrollSchedule[]>(() =>
    SEED_SCHEDULES.map((s) => ({
      ...s,
      methods: s.methods.map((m) => ({ ...m })),
      drivers: s.drivers.map((d) => ({ ...d })),
    })),
  );

  const [regionModal, setRegionModal] = useState<{ mode: 'add' | 'edit'; item?: PayrollRegion } | null>(
    null,
  );
  const [methodModal, setMethodModal] = useState<{ mode: 'add' | 'edit'; item?: PayrollMethod } | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(SEED_REGIONS[0]?.id ?? null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(SEED_METHODS[0]?.id ?? null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    SEED_SCHEDULES[0]?.id ?? null,
  );
  const [scheduleEditing, setScheduleEditing] = useState(false);
  const [isNewSchedule, setIsNewSchedule] = useState(false);
  const [methodDraft, setMethodDraft] = useState<{ name: string; basedOn: string } | null>(null);

  useEffect(() => {
    setConfigStatusFilter('all');
    setScheduleEditing(false);
    setIsNewSchedule(false);
    setMethodDraft(null);
  }, [section, setConfigStatusFilter]);

  const q = search.trim().toLowerCase();
  const statusFilter = configStatusFilter;

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.divisions.some((d) => d.toLowerCase().includes(q))
      );
    });
  }, [regions, statusFilter, q]);

  const filteredMethods = useMemo(() => {
    if (!q) return methods;
    return methods.filter(
      (m) => m.name.toLowerCase().includes(q) || m.basedOn.toLowerCase().includes(q),
    );
  }, [methods, q]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.currency.toLowerCase().includes(q) ||
        s.taxCode.toLowerCase().includes(q)
      );
    });
  }, [schedules, statusFilter, q]);

  useEffect(() => {
    if (section !== 'regions') return;
    if (filteredRegions.length === 0) {
      setSelectedRegionId(null);
      return;
    }
    if (!selectedRegionId || !filteredRegions.some((r) => r.id === selectedRegionId)) {
      setSelectedRegionId(filteredRegions[0].id);
    }
  }, [section, filteredRegions, selectedRegionId]);

  useEffect(() => {
    if (section !== 'methods') return;
    if (filteredMethods.length === 0) {
      setSelectedMethodId(null);
      setMethodDraft(null);
      return;
    }
    if (!selectedMethodId || !filteredMethods.some((m) => m.id === selectedMethodId)) {
      setSelectedMethodId(filteredMethods[0].id);
      setMethodDraft(null);
    }
  }, [section, filteredMethods, selectedMethodId]);

  useEffect(() => {
    if (section !== 'schedules') return;
    if (isNewSchedule) return;
    if (filteredSchedules.length === 0) {
      setSelectedScheduleId(null);
      setScheduleEditing(false);
      return;
    }
    if (!selectedScheduleId || !filteredSchedules.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(filteredSchedules[0].id);
      setScheduleEditing(false);
    }
  }, [section, filteredSchedules, selectedScheduleId, isNewSchedule]);

  const selectedRegion = regions.find((r) => r.id === selectedRegionId) ?? null;
  const selectedMethod = methods.find((m) => m.id === selectedMethodId) ?? null;
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId) ?? null;

  const methodUsage = useMemo(() => {
    const map = new Map<string, number>();
    const scheduleNames = new Map<string, string[]>();
    for (const s of schedules) {
      for (const line of s.methods) {
        map.set(line.methodId, (map.get(line.methodId) ?? 0) + 1);
        const names = scheduleNames.get(line.methodId) ?? [];
        if (!names.includes(s.name)) names.push(s.name);
        scheduleNames.set(line.methodId, names);
      }
    }
    return { counts: map, schedules: scheduleNames };
  }, [schedules]);

  const beginAddSchedule = useCallback(() => {
    const draft = createEmptySchedule();
    draft.name = 'New Payroll Schedule';
    setSchedules((prev) => [draft, ...prev]);
    setSelectedScheduleId(draft.id);
    setIsNewSchedule(true);
    setScheduleEditing(true);
  }, []);

  const onAdd = useCallback(() => {
    if (section === 'regions') setRegionModal({ mode: 'add' });
    else if (section === 'methods') setMethodModal({ mode: 'add' });
    else beginAddSchedule();
  }, [section, beginAddSchedule]);

  useEffect(() => {
    setConfigHeader({
      showStatus: section === 'regions' || section === 'schedules',
      addLabel:
        section === 'regions' ? 'Add Region' : section === 'methods' ? 'Add Method' : 'Add Schedule',
      onAdd,
    });
    return () => setConfigHeader(null);
  }, [section, onAdd, setConfigHeader]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'region') {
      setRegions((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      toast(`Region “${pendingDelete.name}” deleted`);
    } else if (pendingDelete.kind === 'method') {
      setMethods((prev) => prev.filter((m) => m.id !== pendingDelete.id));
      if (selectedMethodId === pendingDelete.id) setSelectedMethodId(null);
      toast(`Method “${pendingDelete.name}” deleted`);
    } else {
      setSchedules((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      toast(`Schedule “${pendingDelete.name}” deleted`);
    }
    setPendingDelete(null);
  };

  const saveRegion = (form: RegionForm) => {
    if (!form.name.trim()) {
      toast('Region name is required');
      return false;
    }
    if (regionModal?.mode === 'edit' && regionModal.item) {
      setRegions((prev) =>
        prev.map((r) =>
          r.id === regionModal.item!.id
            ? {
                ...r,
                name: form.name.trim(),
                country: form.country,
                currency: form.currency,
                coveragePeriod: form.coveragePeriod,
                divisions: form.divisions,
                status: form.status,
              }
            : r,
        ),
      );
      toast('Region updated');
    } else {
      const next = {
        id: uid('r'),
        name: form.name.trim(),
        country: form.country,
        currency: form.currency,
        coveragePeriod: form.coveragePeriod,
        divisions: form.divisions,
        status: form.status,
      };
      setRegions((prev) => [next, ...prev]);
      setSelectedRegionId(next.id);
      toast('Region added');
    }
    setRegionModal(null);
    return true;
  };

  const toggleDivision = (division: string) => {
    if (!selectedRegion) return;
    setRegions((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRegion.id) return r;
        const has = r.divisions.includes(division);
        return {
          ...r,
          divisions: has ? r.divisions.filter((d) => d !== division) : [...r.divisions, division],
        };
      }),
    );
  };

  const saveMethod = (form: MethodForm) => {
    if (!form.name.trim()) {
      toast('Method name is required');
      return false;
    }
    if (methodModal?.mode === 'edit' && methodModal.item) {
      setMethods((prev) =>
        prev.map((m) =>
          m.id === methodModal.item!.id
            ? { ...m, name: form.name.trim(), basedOn: form.basedOn }
            : m,
        ),
      );
      toast('Method updated');
    } else {
      const next = { id: uid('m'), name: form.name.trim(), basedOn: form.basedOn };
      setMethods((prev) => [next, ...prev]);
      setSelectedMethodId(next.id);
      toast('Method added');
    }
    setMethodModal(null);
    setMethodDraft(null);
    return true;
  };

  const startMethodEdit = () => {
    if (!selectedMethod) return;
    setMethodDraft({ name: selectedMethod.name, basedOn: selectedMethod.basedOn });
  };

  const saveMethodInline = () => {
    if (!selectedMethod || !methodDraft) return;
    if (!methodDraft.name.trim()) {
      toast('Method name is required');
      return;
    }
    setMethods((prev) =>
      prev.map((m) =>
        m.id === selectedMethod.id
          ? { ...m, name: methodDraft.name.trim(), basedOn: methodDraft.basedOn }
          : m,
      ),
    );
    setMethodDraft(null);
    toast('Method updated');
  };

  const beginEditSchedule = (id?: string) => {
    if (id) setSelectedScheduleId(id);
    setIsNewSchedule(false);
    setScheduleEditing(true);
  };

  const cancelScheduleEdit = () => {
    if (isNewSchedule && selectedScheduleId) {
      setSchedules((prev) => prev.filter((s) => s.id !== selectedScheduleId));
      setIsNewSchedule(false);
      setSelectedScheduleId(SEED_SCHEDULES[0]?.id ?? null);
    }
    setScheduleEditing(false);
  };

  const saveScheduleInline = (next: PayrollSchedule) => {
    if (!next.name.trim()) {
      toast('Schedule name is required');
      return;
    }
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === next.id);
      return exists ? prev.map((s) => (s.id === next.id ? next : s)) : [next, ...prev];
    });
    setSelectedScheduleId(next.id);
    setIsNewSchedule(false);
    setScheduleEditing(false);
    toast(isNewSchedule ? 'Schedule added' : 'Schedule updated');
  };

  const selectScheduleRow = (id: string) => {
    if (scheduleEditing && id !== selectedScheduleId) {
      if (isNewSchedule && selectedScheduleId) {
        setSchedules((prev) => prev.filter((s) => s.id !== selectedScheduleId));
        setIsNewSchedule(false);
      }
      setScheduleEditing(false);
    }
    setSelectedScheduleId(id);
  };

  const selectMethodRow = (id: string) => {
    setSelectedMethodId(id);
    setMethodDraft(null);
  };

  const usedCount = selectedMethod ? methodUsage.counts.get(selectedMethod.id) ?? 0 : 0;
  const usedIn = selectedMethod ? methodUsage.schedules.get(selectedMethod.id) ?? [] : [];

  return (
    <div className="mod-page cfg-page">
      {pendingDelete && (
        <div className="cfg-confirm-strip">
          <span>
            Delete <strong>{pendingDelete.name}</strong>? This cannot be undone.
          </span>
          <div className="cfg-confirm-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm cfg-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </div>
        </div>
      )}

      {section === 'regions' && (
        <div className="cfg-split cfg-split-shell cfg-split-narrow">
          <aside className="cfg-split-list" aria-label="Regions">
            <div className="cfg-split-list-scroll">
              {filteredRegions.length === 0 ? (
                <div className="empty-state">No regions match this filter.</div>
              ) : (
                <ul className="cfg-nav-list">
                  {filteredRegions.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        className={`cfg-nav-item ${selectedRegionId === r.id ? 'active' : ''}`}
                        onClick={() => setSelectedRegionId(r.id)}
                      >
                        <span className={`cfg-nav-flag cfg-country-pill ${countryCode(r.country).toLowerCase()}`}>
                          {countryCode(r.country)}
                        </span>
                        <span className="cfg-nav-copy">
                          <strong>{regionLabel(r)}</strong>
                          <span>
                            {r.divisions.length} divisions · {r.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </span>
                      </button>
                      <div className="cfg-nav-actions">
                        <RowActionMenu
                          items={EDIT_DELETE}
                          onAction={(action) => {
                            if (action === 'edit') setRegionModal({ mode: 'edit', item: r });
                            if (action === 'delete')
                              setPendingDelete({ kind: 'region', id: r.id, name: regionLabel(r) });
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <section className="cfg-split-detail">
            {!selectedRegion ? (
              <div className="cfg-split-empty">
                <h3>Select a region</h3>
                <p>Choose Canada, United States, or Mexico to manage divisions.</p>
              </div>
            ) : (
              <>
                <div className="cfg-detail-head cfg-detail-head-simple">
                  <div>
                    <div className="cfg-detail-title-row">
                      <h2>{regionLabel(selectedRegion)}</h2>
                      <StatusPill status={selectedRegion.status} />
                    </div>
                    <p className="cfg-detail-sub">
                      {selectedRegion.currency} · {selectedRegion.coveragePeriod} ·{' '}
                      {selectedRegion.divisions.length} of {DIVISIONS.length} divisions
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setRegionModal({ mode: 'edit', item: selectedRegion })}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                </div>
                <div className="cfg-region-detail">
                  <div className="cfg-region-detail-head">
                    <h3>Divisions</h3>
                    <span className="cfg-tab-count">{selectedRegion.divisions.length}</span>
                  </div>
                  <ul className="cfg-division-list">
                    {DIVISIONS.map((d) => {
                      const on = selectedRegion.divisions.includes(d);
                      return (
                        <li key={d}>
                          <button
                            type="button"
                            className={`cfg-division-row ${on ? 'on' : ''}`}
                            onClick={() => toggleDivision(d)}
                          >
                            <span className="cfg-division-check">{on ? '✓' : ''}</span>
                            <span className="cfg-division-name">{d}</span>
                            <span className="cfg-division-state">{on ? 'Assigned' : 'Available'}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {section === 'methods' && (
        <div className="cfg-split cfg-split-shell cfg-split-narrow">
          <aside className="cfg-split-list" aria-label="Methods">
            <div className="cfg-split-list-scroll">
              {filteredMethods.length === 0 ? (
                <div className="empty-state">No methods match this search.</div>
              ) : (
                <ul className="cfg-nav-list">
                  {filteredMethods.map((m) => {
                    const used = methodUsage.counts.get(m.id) ?? 0;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          className={`cfg-nav-item ${selectedMethodId === m.id ? 'active' : ''}`}
                          onClick={() => selectMethodRow(m.id)}
                        >
                          <span className="cfg-nav-copy">
                            <strong>{m.name}</strong>
                            <span>
                              {m.basedOn} · {used} schedules
                            </span>
                          </span>
                        </button>
                        <div className="cfg-nav-actions" onClick={(e) => e.stopPropagation()}>
                          <RowActionMenu
                            items={EDIT_DELETE}
                            onAction={(action) => {
                              if (action === 'edit') {
                                setSelectedMethodId(m.id);
                                setMethodDraft({ name: m.name, basedOn: m.basedOn });
                              }
                              if (action === 'delete')
                                setPendingDelete({ kind: 'method', id: m.id, name: m.name });
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <section className="cfg-split-detail">
            {!selectedMethod ? (
              <div className="cfg-split-empty">
                <h3>Select a method</h3>
                <p>Choose a payment method on the left to review and edit details.</p>
              </div>
            ) : (
              <>
                <div className="cfg-detail-head cfg-detail-head-simple">
                  <div>
                    <div className="cfg-detail-title-row">
                      <h2>{selectedMethod.name}</h2>
                    </div>
                    <p className="cfg-detail-sub">
                      Based on {selectedMethod.basedOn} · Used in {usedCount} schedules
                    </p>
                  </div>
                  <div className="cfg-detail-actions">
                    {methodDraft ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setMethodDraft(null)}
                        >
                          Cancel
                        </button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={saveMethodInline}>
                          Save
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-primary btn-sm" onClick={startMethodEdit}>
                        <Pencil size={13} />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="cfg-method-detail">
                  <div className="cfg-method-fields">
                    <label className="field">
                      <span>Method name</span>
                      {methodDraft ? (
                        <input
                          value={methodDraft.name}
                          onChange={(e) =>
                            setMethodDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                          }
                        />
                      ) : (
                        <strong>{selectedMethod.name}</strong>
                      )}
                    </label>
                    <label className="field">
                      <span>Based on</span>
                      {methodDraft ? (
                        <select
                          value={methodDraft.basedOn}
                          onChange={(e) =>
                            setMethodDraft((prev) =>
                              prev ? { ...prev, basedOn: e.target.value } : prev,
                            )
                          }
                        >
                          {BASED_ON_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="cfg-based-on">{selectedMethod.basedOn}</span>
                      )}
                    </label>
                  </div>

                  <div className="cfg-method-usage">
                    <div className="cfg-region-detail-head">
                      <h3>Used in schedules</h3>
                      <span className="cfg-tab-count">{usedCount}</span>
                    </div>
                    {usedIn.length === 0 ? (
                      <div className="cfg-detail-empty">Not assigned to any schedule yet.</div>
                    ) : (
                      <ul className="cfg-usage-list">
                        {usedIn.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {section === 'schedules' && (
        <div className="cfg-split cfg-split-shell">
          <aside className="cfg-split-list" aria-label="Schedules">
            <div className="cfg-split-list-scroll">
              {filteredSchedules.length === 0 ? (
                <div className="empty-state">No schedules match this filter.</div>
              ) : (
                <table className="cfg-list-table cfg-sched-list">
                  <thead>
                    <tr>
                      <th className="mod-action-col">Action</th>
                      <th className="cfg-col-schedule">Schedule</th>
                      <th>Status</th>
                      <th>Cur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((s) => (
                      <tr
                        key={s.id}
                        className={`${selectedScheduleId === s.id ? 'active' : ''} ${
                          scheduleEditing && selectedScheduleId === s.id ? 'editing' : ''
                        }`}
                        onClick={() => selectScheduleRow(s.id)}
                      >
                        <td className="mod-action-col" onClick={(e) => e.stopPropagation()}>
                          <RowActionMenu
                            items={EDIT_DELETE}
                            onAction={(action) => {
                              if (action === 'edit') beginEditSchedule(s.id);
                              if (action === 'delete')
                                setPendingDelete({ kind: 'schedule', id: s.id, name: s.name });
                            }}
                          />
                        </td>
                        <td className="cfg-col-schedule">
                          <div className="cfg-list-name">{s.name || 'Untitled'}</div>
                          <div className="cfg-list-meta">
                            {s.taxCode} · {s.methods.length} methods · {s.drivers.length} drivers
                          </div>
                        </td>
                        <td>
                          <StatusPill status={s.status} />
                        </td>
                        <td>
                          <CurrencyBadge currency={s.currency} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </aside>

          {!selectedSchedule ? (
            <section className="cfg-split-detail">
              <div className="cfg-split-empty">
                <h3>Select a schedule</h3>
                <p>Choose a row on the left to review methods and drivers.</p>
              </div>
            </section>
          ) : (
            <ScheduleDetailPanel
              schedule={selectedSchedule}
              allMethods={methods}
              availableDrivers={AVAILABLE_DRIVERS}
              editing={scheduleEditing}
              onStartEdit={() => beginEditSchedule(selectedSchedule.id)}
              onCancelEdit={cancelScheduleEdit}
              onSave={saveScheduleInline}
            />
          )}
        </div>
      )}

      {regionModal && (
        <RegionModal
          mode={regionModal.mode}
          initial={regionModal.item}
          onClose={() => setRegionModal(null)}
          onSave={saveRegion}
        />
      )}
      {methodModal && (
        <MethodModal
          mode={methodModal.mode}
          initial={methodModal.item}
          onClose={() => setMethodModal(null)}
          onSave={saveMethod}
        />
      )}
    </div>
  );
}
