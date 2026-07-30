import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AVAILABLE_DRIVERS,
  METHODS as SEED_METHODS,
  REGIONS as SEED_REGIONS,
  SCHEDULES as SEED_SCHEDULES,
} from '../data/configSeed';
import type {
  ConfigStatus,
  PayrollCountry,
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
type CountryFilter = 'all' | PayrollCountry;
type PendingDelete =
  | { kind: 'region'; id: string; name: string }
  | { kind: 'method'; id: string; name: string }
  | { kind: 'schedule'; id: string; name: string }
  | null;

const EDIT_DELETE: RowActionItem[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

const COUNTRY_CHIPS: { id: CountryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Canada', label: 'Canada' },
  { id: 'Mexico', label: 'Mexico' },
  { id: 'USA', label: 'USA' },
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

function CountryBadge({ country }: { country: PayrollCountry }) {
  const tone = country === 'Canada' ? 'ca' : country === 'Mexico' ? 'mx' : 'us';
  return <span className={`cfg-country-pill ${tone}`}>{country}</span>;
}

export function PayrollConfigView({ section }: { section: ConfigSection }) {
  const { toast, search } = useApp();
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');
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
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    SEED_SCHEDULES[0]?.id ?? null,
  );
  const [scheduleEditing, setScheduleEditing] = useState(false);
  const [isNewSchedule, setIsNewSchedule] = useState(false);

  useEffect(() => {
    setLocalQ('');
    setStatusFilter('all');
    setCountryFilter('all');
    setScheduleEditing(false);
    setIsNewSchedule(false);
  }, [section]);

  const globalQ = search.trim().toLowerCase();
  const q = `${globalQ} ${localQ}`.trim().toLowerCase();

  const countryCounts = useMemo(() => {
    const base = { Canada: 0, Mexico: 0, USA: 0 };
    for (const r of regions) base[r.country] += 1;
    return base;
  }, [regions]);

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (countryFilter !== 'all' && r.country !== countryFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.coveragePeriod.toLowerCase().includes(q) ||
        r.currency.toLowerCase().includes(q) ||
        r.divisions.some((d) => d.toLowerCase().includes(q))
      );
    });
  }, [regions, countryFilter, statusFilter, q]);

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
      setRegions((prev) => [
        {
          id: uid('r'),
          name: form.name.trim(),
          country: form.country,
          currency: form.currency,
          coveragePeriod: form.coveragePeriod,
          divisions: form.divisions,
          status: form.status,
        },
        ...prev,
      ]);
      toast('Region added');
    }
    setRegionModal(null);
    return true;
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

  const selectScheduleCard = (id: string) => {
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

  const rowsCount =
    section === 'regions'
      ? filteredRegions.length
      : section === 'methods'
        ? filteredMethods.length
        : filteredSchedules.length;

  return (
    <div className="mod-page cfg-page">
      <div className="cfg-toolbar-clean">
        <div>
          <p className="cfg-eyebrow">Payroll Configuration</p>
          <h2 className="cfg-page-title">
            {section === 'regions' ? 'Regions' : section === 'methods' ? 'Methods' : 'Schedules'}
          </h2>
        </div>
        <p className="cfg-sub">
          {section === 'regions'
            ? 'Country coverage for Canada, Mexico, and USA.'
            : section === 'methods'
              ? 'Pay methods used when building schedules and trip pay.'
              : 'Select a schedule to review methods, drivers, and rates.'}
        </p>
      </div>

      {section === 'regions' && (
        <div className="cfg-country-chips" role="tablist" aria-label="Filter by country">
          {COUNTRY_CHIPS.map((chip) => {
            const count = chip.id === 'all' ? regions.length : countryCounts[chip.id];
            return (
              <button
                key={chip.id}
                type="button"
                className={`cfg-country-chip ${countryFilter === chip.id ? 'active' : ''}`}
                onClick={() => setCountryFilter(chip.id)}
              >
                <span>{chip.label}</span>
                <span className="cfg-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mod-filters cfg-filters">
        <label className="mod-filter grow">
          <span>Search</span>
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder={
              section === 'regions'
                ? 'Search region, division…'
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

      {section === 'schedules' ? (
        <div className="cfg-split cfg-split-shell">
          <aside className="cfg-split-list" aria-label="Schedules">
            <div className="cfg-split-list-head">
              <strong>{filteredSchedules.length}</strong>
              <span> schedules</span>
            </div>
            <div className="cfg-split-list-scroll">
              {filteredSchedules.length === 0 ? (
                <div className="empty-state">No schedules match this filter.</div>
              ) : (
                <table className="cfg-list-table">
                  <thead>
                    <tr>
                      <th className="mod-action-col">Action</th>
                      <th>Schedule</th>
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
                        onClick={() => selectScheduleCard(s.id)}
                      >
                        <td
                          className="mod-action-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RowActionMenu
                            items={EDIT_DELETE}
                            onAction={(action) => {
                              if (action === 'edit') beginEditSchedule(s.id);
                              if (action === 'delete')
                                setPendingDelete({ kind: 'schedule', id: s.id, name: s.name });
                            }}
                          />
                        </td>
                        <td>
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
                <p>Choose a row on the left to review methods, drivers, and settings.</p>
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
      ) : (
        <div className="mod-table-shell">
          <div className="mod-table-scroll">
            {section === 'regions' && (
              <table className="data-table mod-table cfg-table">
                <thead>
                  <tr>
                    <th className="mod-action-col">Action</th>
                    <th>Country</th>
                    <th>Region</th>
                    <th>Currency</th>
                    <th>Divisions</th>
                    <th>Coverage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegions.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">No regions match this filter.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredRegions.map((r) => (
                      <tr key={r.id}>
                        <td className="mod-action-col">
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
                          <CountryBadge country={r.country} />
                        </td>
                        <td className="cfg-strong">{r.name}</td>
                        <td>
                          <CurrencyBadge currency={r.currency} />
                        </td>
                        <td>
                          <span className="cfg-count-badge" title={r.divisions.join(', ')}>
                            {r.divisions.length}
                          </span>
                          <span className="cfg-muted cfg-divisions-preview">
                            {r.divisions.slice(0, 2).join(', ')}
                            {r.divisions.length > 2 ? '…' : ''}
                          </span>
                        </td>
                        <td>{r.coveragePeriod}</td>
                        <td>
                          <StatusPill status={r.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {section === 'methods' && (
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
                          <td>
                            <span className="cfg-based-on">{m.basedOn}</span>
                          </td>
                          <td>
                            <span className={`cfg-count-badge ${used === 0 ? 'is-muted' : ''}`}>
                              {used}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
          <div className="mod-pager">
            <strong>Total Records: {rowsCount}</strong>
          </div>
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
