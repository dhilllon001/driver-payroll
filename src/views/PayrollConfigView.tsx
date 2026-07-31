import { Pencil, Plus, Trash2 } from 'lucide-react';
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
  CoveragePeriod,
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

const COVERAGE_OPTIONS: CoveragePeriod[] = ['Weekly', 'BiWeekly', 'SemiMonthly', 'Monthly'];
const CURRENCY_OPTIONS: PayrollCurrency[] = ['CAD', 'USD', 'Peso'];

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
    setPageHeader,
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
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(SEED_METHODS[0]?.id ?? null);
  const [selectedUsage, setSelectedUsage] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    SEED_SCHEDULES[0]?.id ?? null,
  );
  const [scheduleEditing, setScheduleEditing] = useState(false);
  const [isNewSchedule, setIsNewSchedule] = useState(false);
  const [methodDraft, setMethodDraft] = useState<{ name: string; basedOn: string } | null>(null);
  const [regionDraft, setRegionDraft] = useState<{
    name: string;
    currency: PayrollCurrency;
    coveragePeriod: CoveragePeriod;
    status: ConfigStatus;
  } | null>(null);

  useEffect(() => {
    setConfigStatusFilter('all');
    setScheduleEditing(false);
    setIsNewSchedule(false);
    setMethodDraft(null);
    setRegionDraft(null);
    setSelectedDivision(null);
    setSelectedUsage(null);
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
      setSelectedDivision(null);
      setRegionDraft(null);
      return;
    }
    if (!selectedRegionId || !filteredRegions.some((r) => r.id === selectedRegionId)) {
      setSelectedRegionId(filteredRegions[0].id);
      setSelectedDivision(null);
      setRegionDraft(null);
    }
  }, [section, filteredRegions, selectedRegionId]);

  useEffect(() => {
    if (section !== 'methods') return;
    if (filteredMethods.length === 0) {
      setSelectedMethodId(null);
      setMethodDraft(null);
      setSelectedUsage(null);
      return;
    }
    if (!selectedMethodId || !filteredMethods.some((m) => m.id === selectedMethodId)) {
      setSelectedMethodId(filteredMethods[0].id);
      setMethodDraft(null);
      setSelectedUsage(null);
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

  useEffect(() => {
    if (!selectedRegion) {
      setRegionDraft(null);
      return;
    }
    setRegionDraft({
      name: selectedRegion.name,
      currency: selectedRegion.currency,
      coveragePeriod: selectedRegion.coveragePeriod,
      status: selectedRegion.status,
    });
  }, [selectedRegionId]); // eslint-disable-line react-hooks/exhaustive-deps -- sync draft when region changes

  useEffect(() => {
    if (!selectedMethod) {
      setMethodDraft(null);
      return;
    }
    setMethodDraft({ name: selectedMethod.name, basedOn: selectedMethod.basedOn });
    setSelectedUsage(null);
  }, [selectedMethodId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setPageHeader({
      showStatus: section === 'regions' || section === 'schedules',
      actions: [
        {
          id: 'add',
          label:
            section === 'regions' ? 'Add Region' : section === 'methods' ? 'Add Method' : 'Add Schedule',
          icon: Plus,
          primary: true,
          onClick: onAdd,
        },
      ],
    });
    return () => setPageHeader(null);
  }, [section, onAdd, setPageHeader]);

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

  const selectRegion = (id: string) => {
    setSelectedRegionId(id);
    setSelectedDivision(null);
  };

  const saveRegionInline = () => {
    if (!selectedRegion || !regionDraft) return;
    if (!regionDraft.name.trim()) {
      toast('Region name is required');
      return;
    }
    setRegions((prev) =>
      prev.map((r) =>
        r.id === selectedRegion.id
          ? {
              ...r,
              name: regionDraft.name.trim(),
              currency: regionDraft.currency,
              coveragePeriod: regionDraft.coveragePeriod,
              status: regionDraft.status,
            }
          : r,
      ),
    );
    toast('Region updated');
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
    return true;
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
    setSelectedUsage(null);
  };

  const usedCount = selectedMethod ? methodUsage.counts.get(selectedMethod.id) ?? 0 : 0;
  const usedIn = selectedMethod ? methodUsage.schedules.get(selectedMethod.id) ?? [] : [];
  const divisionAssigned =
    !!selectedRegion && !!selectedDivision && selectedRegion.divisions.includes(selectedDivision);

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
        <div className="cfg-split cfg-split-shell cfg-split-triple">
          <aside className="cfg-split-list cfg-col-regions" aria-label="Regions">
            <div className="cfg-pane-head">
              <strong>Regions</strong>
              <span className="cfg-tab-count">{filteredRegions.length}</span>
            </div>
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
                        onClick={() => selectRegion(r.id)}
                      >
                        <span
                          className={`cfg-nav-flag cfg-country-pill ${countryCode(r.country).toLowerCase()}`}
                        >
                          {countryCode(r.country)}
                        </span>
                        <span className="cfg-nav-copy">
                          <strong>{regionLabel(r)}</strong>
                          <span>{r.divisions.length} divisions</span>
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

          <aside className="cfg-split-list cfg-col-mid" aria-label="Divisions">
            <div className="cfg-pane-head">
              <strong>Divisions</strong>
              <span className="cfg-tab-count">
                {selectedRegion ? selectedRegion.divisions.length : 0}
              </span>
            </div>
            <div className="cfg-split-list-scroll">
              {!selectedRegion ? (
                <div className="cfg-pane-empty">Select a region</div>
              ) : (
                <ul className="cfg-mid-list">
                  {DIVISIONS.map((d) => {
                    const on = selectedRegion.divisions.includes(d);
                    return (
                      <li key={d}>
                        <button
                          type="button"
                          className={`cfg-mid-item ${selectedDivision === d ? 'active' : ''} ${on ? 'assigned' : ''}`}
                          onClick={() => setSelectedDivision(d)}
                        >
                          <span className="cfg-division-check">{on ? '✓' : ''}</span>
                          <span className="cfg-mid-copy">
                            <strong>{d}</strong>
                            <span>{on ? 'Assigned' : 'Available'}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <section className="cfg-split-detail cfg-col-edit">
            {!selectedRegion || !regionDraft ? (
              <div className="cfg-split-empty">
                <h3>Select a region</h3>
                <p>Choose Canada, United States, or Mexico, then pick a division to edit.</p>
              </div>
            ) : (
              <>
                <div className="cfg-detail-head cfg-detail-head-simple">
                  <div>
                    <div className="cfg-detail-title-row">
                      <h2>{regionLabel(selectedRegion)}</h2>
                      <StatusPill status={regionDraft.status} />
                    </div>
                    <p className="cfg-detail-sub">
                      {selectedDivision
                        ? `Editing division · ${selectedDivision}`
                        : 'Select a division in the middle list to manage assignment'}
                    </p>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={saveRegionInline}>
                    Save
                  </button>
                </div>

                <div className="cfg-edit-pane">
                  <div className="cfg-edit-grid">
                    <label className="field">
                      <span>Region name</span>
                      <input
                        value={regionDraft.name}
                        onChange={(e) =>
                          setRegionDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Country</span>
                      <input value={regionLabel(selectedRegion)} disabled />
                    </label>
                    <label className="field">
                      <span>Currency</span>
                      <select
                        value={regionDraft.currency}
                        onChange={(e) =>
                          setRegionDraft((prev) =>
                            prev
                              ? { ...prev, currency: e.target.value as PayrollCurrency }
                              : prev,
                          )
                        }
                      >
                        {CURRENCY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Coverage period</span>
                      <select
                        value={regionDraft.coveragePeriod}
                        onChange={(e) =>
                          setRegionDraft((prev) =>
                            prev
                              ? { ...prev, coveragePeriod: e.target.value as CoveragePeriod }
                              : prev,
                          )
                        }
                      >
                        {COVERAGE_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Status</span>
                      <select
                        value={regionDraft.status}
                        onChange={(e) =>
                          setRegionDraft((prev) =>
                            prev ? { ...prev, status: e.target.value as ConfigStatus } : prev,
                          )
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                  </div>

                  <div className={`cfg-edit-unit ${selectedDivision ? 'has-unit' : ''}`}>
                    <div className="cfg-region-detail-head">
                      <h3>Division</h3>
                      {selectedDivision && (
                        <span className={`cfg-status ${divisionAssigned ? 'is-active' : 'is-inactive'}`}>
                          {divisionAssigned ? 'Assigned' : 'Available'}
                        </span>
                      )}
                    </div>
                    {!selectedDivision ? (
                      <div className="cfg-pane-empty soft">
                        Click a division in the middle list to assign or review it here.
                      </div>
                    ) : (
                      <div className="cfg-unit-card">
                        <strong>{selectedDivision}</strong>
                        <p>
                          {divisionAssigned
                            ? `Assigned to ${regionLabel(selectedRegion)}.`
                            : `Not assigned to ${regionLabel(selectedRegion)} yet.`}
                        </p>
                        <button
                          type="button"
                          className={`btn btn-sm ${divisionAssigned ? 'btn-ghost' : 'btn-primary'}`}
                          onClick={() => toggleDivision(selectedDivision)}
                        >
                          {divisionAssigned ? 'Remove from region' : 'Assign to region'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {section === 'methods' && (
        <div className="cfg-split cfg-split-shell cfg-split-triple">
          <aside className="cfg-split-list cfg-col-regions" aria-label="Methods">
            <div className="cfg-pane-head">
              <strong>Methods</strong>
              <span className="cfg-tab-count">{filteredMethods.length}</span>
            </div>
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
                              {m.basedOn} · {used}
                            </span>
                          </span>
                        </button>
                        <div className="cfg-nav-actions">
                          <RowActionMenu
                            items={EDIT_DELETE}
                            onAction={(action) => {
                              if (action === 'edit') setSelectedMethodId(m.id);
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

          <aside className="cfg-split-list cfg-col-mid" aria-label="Schedules using method">
            <div className="cfg-pane-head">
              <strong>Schedules</strong>
              <span className="cfg-tab-count">{usedCount}</span>
            </div>
            <div className="cfg-split-list-scroll">
              {!selectedMethod ? (
                <div className="cfg-pane-empty">Select a method</div>
              ) : usedIn.length === 0 ? (
                <div className="cfg-pane-empty">Not used in any schedule</div>
              ) : (
                <ul className="cfg-mid-list">
                  {usedIn.map((name) => (
                    <li key={name}>
                      <button
                        type="button"
                        className={`cfg-mid-item ${selectedUsage === name ? 'active' : ''}`}
                        onClick={() => setSelectedUsage(name)}
                      >
                        <span className="cfg-mid-copy">
                          <strong>{name}</strong>
                          <span>Linked schedule</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <section className="cfg-split-detail cfg-col-edit">
            {!selectedMethod || !methodDraft ? (
              <div className="cfg-split-empty">
                <h3>Select a method</h3>
                <p>Choose a method, review linked schedules, then edit details on the right.</p>
              </div>
            ) : (
              <>
                <div className="cfg-detail-head cfg-detail-head-simple">
                  <div>
                    <div className="cfg-detail-title-row">
                      <h2>{selectedMethod.name}</h2>
                    </div>
                    <p className="cfg-detail-sub">
                      {selectedUsage
                        ? `Linked to · ${selectedUsage}`
                        : `Used in ${usedCount} schedules`}
                    </p>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={saveMethodInline}>
                    Save
                  </button>
                </div>

                <div className="cfg-edit-pane">
                  <div className="cfg-edit-grid">
                    <label className="field">
                      <span>Method name</span>
                      <input
                        value={methodDraft.name}
                        onChange={(e) =>
                          setMethodDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Based on</span>
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
                    </label>
                    <label className="field">
                      <span>Schedule usage</span>
                      <input value={`${usedCount} schedule${usedCount === 1 ? '' : 's'}`} disabled />
                    </label>
                  </div>

                  <div className={`cfg-edit-unit ${selectedUsage ? 'has-unit' : ''}`}>
                    <div className="cfg-region-detail-head">
                      <h3>Schedule link</h3>
                    </div>
                    {!selectedUsage ? (
                      <div className="cfg-pane-empty soft">
                        Click a schedule in the middle list to inspect the link here.
                      </div>
                    ) : (
                      <div className="cfg-unit-card">
                        <strong>{selectedUsage}</strong>
                        <p>
                          This method is assigned to {selectedUsage} and can be managed from
                          Schedules.
                        </p>
                      </div>
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
