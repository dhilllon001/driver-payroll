import { Plus, Pencil, Trash2, Users, Wallet } from 'lucide-react';
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
  ScheduleModal,
  type MethodForm,
  type RegionForm,
  type ScheduleForm,
} from '../components/modals/ConfigModals';
import { RowActionMenu, type RowActionItem } from '../components/ui/RowActionMenu';
import './modules.css';
import './config.css';

type ConfigTab = 'regions' | 'methods' | 'schedules';
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

export function PayrollConfigView() {
  const { toast, search } = useApp();
  const [tab, setTab] = useState<ConfigTab>('regions');
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
  const [scheduleModal, setScheduleModal] = useState<{
    mode: 'add' | 'edit';
    item?: PayrollSchedule;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    SEED_SCHEDULES[0]?.id ?? null,
  );

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
    if (tab !== 'schedules') return;
    if (filteredSchedules.length === 0) {
      setSelectedScheduleId(null);
      return;
    }
    if (!selectedScheduleId || !filteredSchedules.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(filteredSchedules[0].id);
    }
  }, [tab, filteredSchedules, selectedScheduleId]);

  const selectedSchedule =
    filteredSchedules.find((s) => s.id === selectedScheduleId) ??
    schedules.find((s) => s.id === selectedScheduleId) ??
    null;

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

  const saveSchedule = (form: ScheduleForm) => {
    if (!form.name.trim()) {
      toast('Schedule name is required');
      return false;
    }
    const next: PayrollSchedule = {
      id: scheduleModal?.item?.id ?? uid('s'),
      name: form.name.trim(),
      taxCode: form.taxCode,
      currency: form.currency,
      status: form.status,
      methods: form.methods,
      drivers: form.drivers,
    };
    if (scheduleModal?.mode === 'edit' && scheduleModal.item) {
      setSchedules((prev) => prev.map((s) => (s.id === next.id ? next : s)));
      setSelectedScheduleId(next.id);
      toast('Schedule updated');
    } else {
      setSchedules((prev) => [next, ...prev]);
      setSelectedScheduleId(next.id);
      toast('Schedule added');
    }
    setScheduleModal(null);
    return true;
  };

  const switchTab = (next: ConfigTab) => {
    setTab(next);
    setLocalQ('');
    setStatusFilter('all');
    if (next !== 'regions') setCountryFilter('all');
  };

  const addLabel =
    tab === 'regions' ? 'Add Region' : tab === 'methods' ? 'Add Method' : 'Add Schedule';
  const onAdd =
    tab === 'regions'
      ? () => setRegionModal({ mode: 'add' })
      : tab === 'methods'
        ? () => setMethodModal({ mode: 'add' })
        : () => setScheduleModal({ mode: 'add' });

  const rowsCount =
    tab === 'regions'
      ? filteredRegions.length
      : tab === 'methods'
        ? filteredMethods.length
        : filteredSchedules.length;

  return (
    <div className="mod-page cfg-page">
      <div className="cfg-tabs-row">
        <div className="tabs cfg-page-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`tab ${tab === 'regions' ? 'active' : ''}`}
            aria-selected={tab === 'regions'}
            onClick={() => switchTab('regions')}
          >
            Regions
            <span className="cfg-tab-count">{regions.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            className={`tab ${tab === 'methods' ? 'active' : ''}`}
            aria-selected={tab === 'methods'}
            onClick={() => switchTab('methods')}
          >
            Methods
            <span className="cfg-tab-count">{methods.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            className={`tab ${tab === 'schedules' ? 'active' : ''}`}
            aria-selected={tab === 'schedules'}
            onClick={() => switchTab('schedules')}
          >
            Schedules
            <span className="cfg-tab-count">{schedules.length}</span>
          </button>
        </div>
        <p className="cfg-sub">
          {tab === 'regions'
            ? 'Country and region coverage for Canada, Mexico, and USA.'
            : tab === 'methods'
              ? 'Pay methods used when building schedules and trip pay.'
              : 'Payroll schedules with currency, drivers, and linked methods.'}
        </p>
      </div>

      {tab === 'regions' && (
        <div className="cfg-country-chips" role="tablist" aria-label="Filter by country">
          {COUNTRY_CHIPS.map((chip) => {
            const count =
              chip.id === 'all'
                ? regions.length
                : countryCounts[chip.id];
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

      <div className="mod-filters">
        <label className="mod-filter grow">
          <span>Search</span>
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder={
              tab === 'regions'
                ? 'Search region, division…'
                : tab === 'methods'
                  ? 'Search method…'
                  : 'Search schedule…'
            }
          />
        </label>
        {(tab === 'regions' || tab === 'schedules') && (
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

      {tab === 'schedules' ? (
        <div className="cfg-split">
          <aside className="cfg-split-list" aria-label="Schedules">
            <div className="cfg-split-list-head">
              <strong>{filteredSchedules.length}</strong>
              <span>schedules</span>
            </div>
            <div className="cfg-split-list-scroll">
              {filteredSchedules.length === 0 ? (
                <div className="empty-state">No schedules match this filter.</div>
              ) : (
                filteredSchedules.map((s) => (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    className={`cfg-sched-card ${selectedScheduleId === s.id ? 'active' : ''}`}
                    onClick={() => setSelectedScheduleId(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedScheduleId(s.id);
                      }
                    }}
                  >
                    <div className="cfg-sched-card-top">
                      <span className="cfg-sched-card-name">{s.name}</span>
                      <span
                        className="cfg-sched-card-menu"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <RowActionMenu
                          items={EDIT_DELETE}
                          onAction={(action) => {
                            if (action === 'edit') setScheduleModal({ mode: 'edit', item: s });
                            if (action === 'delete')
                              setPendingDelete({ kind: 'schedule', id: s.id, name: s.name });
                          }}
                        />
                      </span>
                    </div>
                    <div className="cfg-sched-card-meta">
                      <StatusPill status={s.status} />
                      <CurrencyBadge currency={s.currency} />
                    </div>
                    <div className="cfg-sched-card-stats">
                      <span>
                        <Wallet size={12} /> {s.methods.length} methods
                      </span>
                      <span>
                        <Users size={12} /> {s.drivers.length} drivers
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <section className="cfg-split-detail" aria-live="polite">
            {!selectedSchedule ? (
              <div className="cfg-split-empty">
                <h3>Select a schedule</h3>
                <p>Choose a card on the left to review methods, drivers, and settings.</p>
              </div>
            ) : (
              <>
                <div className="cfg-detail-head">
                  <div>
                    <div className="cfg-detail-title-row">
                      <h2>{selectedSchedule.name}</h2>
                      <StatusPill status={selectedSchedule.status} />
                    </div>
                    <p className="cfg-detail-sub">
                      Tax {selectedSchedule.taxCode} · {selectedSchedule.currency}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setScheduleModal({ mode: 'edit', item: selectedSchedule })}
                  >
                    <Pencil size={13} />
                    Edit Schedule
                  </button>
                </div>

                <div className="cfg-detail-kpis">
                  <div className="cfg-detail-kpi">
                    <span className="cfg-detail-kpi-l">Tax code</span>
                    <span className="cfg-tax-code">{selectedSchedule.taxCode}</span>
                  </div>
                  <div className="cfg-detail-kpi">
                    <span className="cfg-detail-kpi-l">Currency</span>
                    <CurrencyBadge currency={selectedSchedule.currency} />
                  </div>
                  <div className="cfg-detail-kpi">
                    <span className="cfg-detail-kpi-l">Methods</span>
                    <strong>{selectedSchedule.methods.length}</strong>
                  </div>
                  <div className="cfg-detail-kpi">
                    <span className="cfg-detail-kpi-l">Drivers</span>
                    <strong>{selectedSchedule.drivers.length}</strong>
                  </div>
                </div>

                <div className="cfg-detail-panels">
                  <div className="cfg-detail-panel">
                    <div className="cfg-detail-panel-head">
                      <h3>Payroll methods</h3>
                      <span className="cfg-tab-count">{selectedSchedule.methods.length}</span>
                    </div>
                    {selectedSchedule.methods.length === 0 ? (
                      <div className="cfg-detail-empty">No methods linked to this schedule.</div>
                    ) : (
                      <div className="cfg-detail-table-wrap">
                        <table className="data-table cfg-detail-table">
                          <thead>
                            <tr>
                              <th>Method</th>
                              <th>Based on</th>
                              <th>Single</th>
                              <th>Team</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSchedule.methods.map((m) => (
                              <tr key={m.id}>
                                <td className="cfg-strong">{m.methodName}</td>
                                <td>
                                  <span className="cfg-based-on">{m.basedOn}</span>
                                </td>
                                <td>{m.singleRate}</td>
                                <td>{m.teamRate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="cfg-detail-panel">
                    <div className="cfg-detail-panel-head">
                      <h3>Assigned drivers</h3>
                      <span className="cfg-tab-count">{selectedSchedule.drivers.length}</span>
                    </div>
                    {selectedSchedule.drivers.length === 0 ? (
                      <div className="cfg-detail-empty">No drivers assigned.</div>
                    ) : (
                      <div className="cfg-detail-table-wrap">
                        <table className="data-table cfg-detail-table">
                          <thead>
                            <tr>
                              <th>Driver</th>
                              <th>Category</th>
                              <th>Division</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSchedule.drivers.map((d) => (
                              <tr key={d.id}>
                                <td>
                                  <div className="driver-cell">
                                    <span className="name">{d.name}</span>
                                    <span className="uid">{d.code}</span>
                                  </div>
                                </td>
                                <td>{d.category}</td>
                                <td>{d.division}</td>
                                <td>
                                  <StatusPill status={d.active ? 'active' : 'inactive'} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      ) : (
        <div className="mod-table-shell">
          <div className="mod-table-scroll">
            {tab === 'regions' && (
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

            {tab === 'methods' && (
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
      {scheduleModal && (
        <ScheduleModal
          mode={scheduleModal.mode}
          initial={scheduleModal.item}
          allMethods={methods}
          availableDrivers={AVAILABLE_DRIVERS}
          onClose={() => setScheduleModal(null)}
          onSave={saveSchedule}
        />
      )}
    </div>
  );
}
