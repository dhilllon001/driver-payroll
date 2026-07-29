import { Plus, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AVAILABLE_DRIVERS,
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
  ScheduleModal,
  type MethodForm,
  type RegionForm,
  type ScheduleForm,
} from '../components/modals/ConfigModals';
import './views.css';
import './config.css';

type PendingDelete =
  | { kind: 'region'; id: string; name: string }
  | { kind: 'method'; id: string; name: string }
  | { kind: 'schedule'; id: string; name: string }
  | null;

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
  const flag = currency === 'CAD' ? '🇨🇦' : currency === 'USD' ? '🇺🇸' : '🇲🇽';
  return (
    <span className="cfg-currency">
      <span aria-hidden>{flag}</span> {currency}
    </span>
  );
}

export function PayrollConfigView() {
  const { toast, search } = useApp();
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

  const [regionQ, setRegionQ] = useState('');
  const [methodQ, setMethodQ] = useState('');
  const [scheduleQ, setScheduleQ] = useState('');

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

  const inactiveSchedules = schedules.filter((s) => s.status === 'inactive').length;
  const unusedMethods = methods.filter(
    (m) => !schedules.some((s) => s.methods.some((l) => l.methodId === m.id)),
  ).length;
  const inactiveRegions = regions.filter((r) => r.status === 'inactive').length;
  const globalQ = search.trim().toLowerCase();

  const filteredRegions = useMemo(() => {
    const q = `${globalQ} ${regionQ}`.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.coveragePeriod.toLowerCase().includes(q) ||
        r.divisions.some((d) => d.toLowerCase().includes(q)) ||
        r.status.includes(q),
    );
  }, [regions, globalQ, regionQ]);

  const filteredMethods = useMemo(() => {
    const q = `${globalQ} ${methodQ}`.trim().toLowerCase();
    if (!q) return methods;
    return methods.filter(
      (m) => m.name.toLowerCase().includes(q) || m.basedOn.toLowerCase().includes(q),
    );
  }, [methods, globalQ, methodQ]);

  const filteredSchedules = useMemo(() => {
    const q = `${globalQ} ${scheduleQ}`.trim().toLowerCase();
    if (!q) return schedules;
    return schedules.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.currency.toLowerCase().includes(q) ||
        s.taxCode.toLowerCase().includes(q) ||
        s.status.includes(q),
    );
  }, [schedules, globalQ, scheduleQ]);

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
      toast('Schedule updated');
    } else {
      setSchedules((prev) => [next, ...prev]);
      toast('Schedule added');
    }
    setScheduleModal(null);
    return true;
  };

  return (
    <div className="cfg-page">
      <div className="cfg-toolbar">
        <p className="cfg-sub">
          Manage regions, pay methods, and schedules used across trip processing.
        </p>
        <div className="cfg-stats">
          <div className="cfg-stat">
            <span className="cfg-stat-n">{regions.length}</span>
            <span className="cfg-stat-l">Regions</span>
          </div>
          <div className="cfg-stat">
            <span className="cfg-stat-n">{methods.length}</span>
            <span className="cfg-stat-l">Methods</span>
          </div>
          <div className="cfg-stat">
            <span className="cfg-stat-n">{schedules.length}</span>
            <span className="cfg-stat-l">Schedules</span>
          </div>
        </div>
      </div>

      {(inactiveSchedules > 0 || unusedMethods > 0 || inactiveRegions > 0) && (
        <div className="cfg-alerts">
          {inactiveSchedules > 0 && (
            <span className="cfg-alert-chip warn">
              <AlertTriangle size={12} /> {inactiveSchedules} inactive schedule
              {inactiveSchedules === 1 ? '' : 's'}
            </span>
          )}
          {unusedMethods > 0 && (
            <span className="cfg-alert-chip muted">
              {unusedMethods} method{unusedMethods === 1 ? '' : 's'} unused
            </span>
          )}
          {inactiveRegions > 0 && (
            <span className="cfg-alert-chip warn">
              <AlertTriangle size={12} /> {inactiveRegions} inactive region
              {inactiveRegions === 1 ? '' : 's'}
            </span>
          )}
        </div>
      )}

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

      <div className="cfg-grid">
        <div className="cfg-stack">
          <ConfigPanel
            title="Regions"
            count={filteredRegions.length}
            total={regions.length}
            search={regionQ}
            onSearch={setRegionQ}
            addLabel="Add Region"
            onAdd={() => setRegionModal({ mode: 'add' })}
            empty={filteredRegions.length === 0}
          >
            <table className="data-table cfg-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Divisions</th>
                  <th>Status</th>
                  <th>Coverage</th>
                  <th className="cfg-col-actions" />
                </tr>
              </thead>
              <tbody>
                {filteredRegions.map((r) => (
                  <tr key={r.id}>
                    <td className="cfg-strong">{r.name}</td>
                    <td>
                      <span className="cfg-count-badge" title={r.divisions.join(', ')}>
                        {r.divisions.length}
                      </span>
                      <span className="cfg-muted cfg-divisions-preview">
                        {r.divisions.slice(0, 2).join(', ')}
                        {r.divisions.length > 2 ? '…' : ''}
                      </span>
                    </td>
                    <td>
                      <StatusPill status={r.status} />
                    </td>
                    <td>{r.coveragePeriod}</td>
                    <td className="cfg-col-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label="Edit region"
                        onClick={() => setRegionModal({ mode: 'edit', item: r })}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon danger"
                        aria-label="Delete region"
                        onClick={() => setPendingDelete({ kind: 'region', id: r.id, name: r.name })}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ConfigPanel>

          <ConfigPanel
            title="Methods"
            count={filteredMethods.length}
            total={methods.length}
            search={methodQ}
            onSearch={setMethodQ}
            addLabel="Add Method"
            onAdd={() => setMethodModal({ mode: 'add' })}
            empty={filteredMethods.length === 0}
            taller
          >
            <table className="data-table cfg-table">
              <thead>
                <tr>
                  <th>Method name</th>
                  <th>Based on</th>
                  <th className="cfg-col-actions" />
                </tr>
              </thead>
              <tbody>
                {filteredMethods.map((m) => (
                  <tr key={m.id}>
                    <td className="cfg-strong">{m.name}</td>
                    <td>
                      <span className="cfg-based-on">{m.basedOn}</span>
                    </td>
                    <td className="cfg-col-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label="Edit method"
                        onClick={() => setMethodModal({ mode: 'edit', item: m })}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon danger"
                        aria-label="Delete method"
                        onClick={() => setPendingDelete({ kind: 'method', id: m.id, name: m.name })}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ConfigPanel>
        </div>

        <ConfigPanel
          title="Schedules"
          count={filteredSchedules.length}
          total={schedules.length}
          search={scheduleQ}
          onSearch={setScheduleQ}
          addLabel="Add Schedule"
          onAdd={() => setScheduleModal({ mode: 'add' })}
          empty={filteredSchedules.length === 0}
          fill
        >
          <table className="data-table cfg-table">
            <thead>
              <tr>
                <th>Schedule name</th>
                <th>Drivers</th>
                <th>Status</th>
                <th>Currency</th>
                <th className="cfg-col-actions" />
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((s) => (
                <tr key={s.id}>
                  <td className="cfg-strong">{s.name}</td>
                  <td>
                    <span className="cfg-count-badge">{s.drivers.length}</span>
                  </td>
                  <td>
                    <StatusPill status={s.status} />
                  </td>
                  <td>
                    <CurrencyBadge currency={s.currency} />
                  </td>
                  <td className="cfg-col-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      aria-label="Edit schedule"
                      onClick={() => setScheduleModal({ mode: 'edit', item: s })}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon danger"
                      aria-label="Delete schedule"
                      onClick={() => setPendingDelete({ kind: 'schedule', id: s.id, name: s.name })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ConfigPanel>
      </div>

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

function ConfigPanel({
  title,
  count,
  total,
  search,
  onSearch,
  addLabel,
  onAdd,
  children,
  empty,
  taller,
  fill,
}: {
  title: string;
  count: number;
  total: number;
  search: string;
  onSearch: (v: string) => void;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
  empty?: boolean;
  taller?: boolean;
  fill?: boolean;
}) {
  return (
    <section className={`cfg-panel ${taller ? 'is-taller' : ''} ${fill ? 'is-fill' : ''}`}>
      <div className="cfg-panel-head">
        <div className="cfg-panel-title">
          <h2>{title}</h2>
          <span className="cfg-panel-count">
            {count}
            {count !== total ? ` / ${total}` : ''}
          </span>
        </div>
        <div className="cfg-panel-tools">
          <div className="cfg-panel-search">
            <Search size={13} />
            <input
              type="search"
              placeholder={`Filter ${title.toLowerCase()}…`}
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}>
            <Plus size={13} />
            {addLabel}
          </button>
        </div>
      </div>
      <div className="cfg-panel-body">
        {empty ? <div className="empty-state">No matching {title.toLowerCase()}.</div> : children}
      </div>
    </section>
  );
}
