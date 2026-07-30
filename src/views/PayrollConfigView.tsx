import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AVAILABLE_DRIVERS,
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

export function PayrollConfigView({ section }: { section: ConfigSection }) {
  const { toast, search } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | ConfigStatus>('all');
  const [localQ, setLocalQ] = useState('');

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
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    SEED_SCHEDULES[0]?.id ?? null,
  );
  const [scheduleEditing, setScheduleEditing] = useState(false);
  const [isNewSchedule, setIsNewSchedule] = useState(false);

  useEffect(() => {
    setLocalQ('');
    setStatusFilter('all');
    setScheduleEditing(false);
    setIsNewSchedule(false);
  }, [section]);

  const globalQ = search.trim().toLowerCase();
  const q = `${globalQ} ${localQ}`.trim().toLowerCase();

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
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId) ?? null;

  const methodUsage = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of schedules) {
      for (const line of s.methods) {
        map.set(line.methodId, (map.get(line.methodId) ?? 0) + 1);
      }
    }
    return map;
  }, [schedules]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'region') {
      setRegions((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      toast(`Region “${pendingDelete.name}” deleted`);
    } else if (pendingDelete.kind === 'method') {
      setMethods((prev) => prev.filter((m) => m.id !== pendingDelete.id));
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
      setMethods((prev) => [
        { id: uid('m'), name: form.name.trim(), basedOn: form.basedOn },
        ...prev,
      ]);
      toast('Method added');
    }
    setMethodModal(null);
    return true;
  };

  const beginEditSchedule = (id?: string) => {
    if (id) setSelectedScheduleId(id);
    setIsNewSchedule(false);
    setScheduleEditing(true);
  };

  const beginAddSchedule = () => {
    const draft = createEmptySchedule();
    draft.name = 'New Payroll Schedule';
    setSchedules((prev) => [draft, ...prev]);
    setSelectedScheduleId(draft.id);
    setIsNewSchedule(true);
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

  const addLabel =
    section === 'regions' ? 'Add Region' : section === 'methods' ? 'Add Method' : 'Add Schedule';
  const onAdd =
    section === 'regions'
      ? () => setRegionModal({ mode: 'add' })
      : section === 'methods'
        ? () => setMethodModal({ mode: 'add' })
        : beginAddSchedule;

  return (
    <div className="mod-page cfg-page">
      <div className="mod-filters cfg-filters">
        <label className="mod-filter grow">
          <span>Search</span>
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder={
              section === 'regions'
                ? 'Search region or division…'
                : section === 'methods'
                  ? 'Search method…'
                  : 'Search schedule…'
            }
          />
        </label>
        {(section === 'regions' || section === 'schedules') && (
          <label className="mod-filter">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ConfigStatus)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        )}
        <div className="mod-filters-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
            <Plus size={13} />
            {addLabel}
          </button>
        </div>
      </div>

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
        <div className="cfg-split cfg-split-shell">
          <aside className="cfg-split-list" aria-label="Regions">
            <div className="cfg-split-list-scroll">
              {filteredRegions.length === 0 ? (
                <div className="empty-state">No regions match this filter.</div>
              ) : (
                <table className="cfg-list-table cfg-region-list">
                  <thead>
                    <tr>
                      <th className="mod-action-col">Action</th>
                      <th>Region</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegions.map((r) => (
                      <tr
                        key={r.id}
                        className={selectedRegionId === r.id ? 'active' : ''}
                        onClick={() => setSelectedRegionId(r.id)}
                      >
                        <td className="mod-action-col" onClick={(e) => e.stopPropagation()}>
                          <RowActionMenu
                            items={EDIT_DELETE}
                            onAction={(action) => {
                              if (action === 'edit') setRegionModal({ mode: 'edit', item: r });
                              if (action === 'delete')
                                setPendingDelete({ kind: 'region', id: r.id, name: r.name });
                            }}
                          />
                        </td>
                        <td>
                          <div className="cfg-list-name">
                            {r.country === 'USA' ? 'United States' : r.country}
                          </div>
                          <div className="cfg-list-meta">
                            {r.currency} · {r.coveragePeriod} · {r.divisions.length} divisions
                          </div>
                        </td>
                        <td>
                          <StatusPill status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </aside>

          <section className="cfg-split-detail">
            {!selectedRegion ? (
              <div className="cfg-split-empty">
                <h3>Select a region</h3>
                <p>Choose Canada or United States to manage divisions.</p>
              </div>
            ) : (
              <>
                <div className="cfg-detail-head cfg-detail-head-simple">
                  <div>
                    <div className="cfg-detail-title-row">
                      <h2>
                        {selectedRegion.country === 'USA' ? 'United States' : selectedRegion.country}
                      </h2>
                      <StatusPill status={selectedRegion.status} />
                    </div>
                    <p className="cfg-detail-sub">
                      {selectedRegion.currency} · {selectedRegion.coveragePeriod} ·{' '}
                      {selectedRegion.divisions.length} divisions
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
                  <div className="cfg-division-grid">
                    {DIVISIONS.map((d) => {
                      const on = selectedRegion.divisions.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          className={`cfg-division-item ${on ? 'on' : ''}`}
                          onClick={() => toggleDivision(d)}
                        >
                          <span className="cfg-division-check">{on ? '✓' : ''}</span>
                          <span>{d}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {section === 'methods' && (
        <div className="mod-table-shell">
          <div className="mod-table-scroll">
            <table className="data-table mod-table cfg-table">
              <thead>
                <tr>
                  <th className="mod-action-col">Action</th>
                  <th>Method name</th>
                  <th>Based on</th>
                  <th>Used in schedules</th>
                </tr>
              </thead>
              <tbody>
                {filteredMethods.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">No methods match this search.</div>
                    </td>
                  </tr>
                ) : (
                  filteredMethods.map((m) => {
                    const used = methodUsage.get(m.id) ?? 0;
                    return (
                      <tr key={m.id}>
                        <td className="mod-action-col">
                          <RowActionMenu
                            items={EDIT_DELETE}
                            onAction={(action) => {
                              if (action === 'edit') setMethodModal({ mode: 'edit', item: m });
                              if (action === 'delete')
                                setPendingDelete({ kind: 'method', id: m.id, name: m.name });
                            }}
                          />
                        </td>
                        <td className="cfg-strong">{m.name}</td>
                        <td>{m.basedOn}</td>
                        <td>{used}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mod-pager">
            <strong>Total Records: {filteredMethods.length}</strong>
          </div>
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
