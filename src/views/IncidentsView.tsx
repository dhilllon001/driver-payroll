import { Download, FileArchive, MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { HeaderFilters } from '../components/layout/HeaderFilters';
import { IncidentFormModal, NotesModal } from '../components/modals/ModuleModals';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import { INCIDENT_ROWS, INCIDENT_STATUSES } from '../data/modulesSeed';
import { usePageHeader } from '../hooks/usePageHeader';
import type { IncidentRow, IncidentStatus } from '../types';
import './modules.css';

const actions = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
  { id: 'export', label: 'Export Folder', icon: FileArchive },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

export function IncidentsView() {
  const { search, toast } = useApp();
  const [rows, setRows] = useState<IncidentRow[]>(INCIDENT_ROWS.map((r) => ({ ...r, notes: [...r.notes] })));
  const [status, setStatus] = useState<'all' | IncidentStatus>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [form, setForm] = useState<{ mode: 'add' | 'edit'; row?: IncidentRow } | null>(null);
  const [notesId, setNotesId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (status === 'all' || r.status === status) &&
        (!q || `${r.driverCode} ${r.driverName} ${r.id}`.toLowerCase().includes(q)) &&
        (!from || r.from >= from) &&
        (!to || r.to <= to),
    );
  }, [rows, status, search, from, to]);

  usePageHeader([
    {
      id: 'add-incident',
      label: 'Add Incident',
      icon: Plus,
      primary: true,
      onClick: () => setForm({ mode: 'add' }),
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: () => toast(`Exported ${filtered.length} incidents`),
    },
  ]);

  const action = (id: string, row: IncidentRow) => {
    if (id === 'edit') setForm({ mode: 'edit', row });
    else if (id === 'notes') setNotesId(row.id);
    else if (id === 'delete') {
      setRows((all) => all.filter((x) => x.id !== row.id));
      toast('Incident deleted');
    } else toast(`Exported folder for ${row.id}`);
  };
  const notesRow = rows.find((r) => r.id === notesId);

  return (
    <div className="mod-page">
      <HeaderFilters>
        <div className="topbar-date-range" role="group" aria-label="Incident date range">
          <span className="label">Date</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
          />
          <span className="sep">–</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="To date"
          />
        </div>
      </HeaderFilters>
      <div className="mod-filters">
        <div className="mod-chip-row">
          {(['all', ...INCIDENT_STATUSES] as const).map((x) => (
            <button
              key={x}
              className={`mod-chip ${status === x ? 'active' : ''}`}
              onClick={() => setStatus(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="mod-table-shell">
        <div className="mod-table-scroll">
          <table className="data-table mod-table">
            <thead>
              <tr>
                <th className="mod-action-col">Action</th>
                <th>ID</th>
                <th>Driver</th>
                <th>Division</th>
                <th>Type</th>
                <th>From – To</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="mod-action-col">
                    <RowActionMenu items={actions} onAction={(id) => action(id, r)} />
                  </td>
                  <td>
                    <button className="mod-link" onClick={() => setForm({ mode: 'edit', row: r })}>
                      {r.id}
                    </button>
                  </td>
                  <td>
                    <div className="driver-cell">
                      <span className="name">{r.driverName}</span>
                      <span className="uid">{r.driverCode}</span>
                    </div>
                  </td>
                  <td>{r.division}</td>
                  <td>{r.incidentType}</td>
                  <td>
                    {r.from} <span className="mod-muted">–</span> {r.to || 'Ongoing'}
                  </td>
                  <td>
                    <span className={`mod-status ${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    <div className="driver-cell">
                      <span className="name">{r.createdBy}</span>
                      <span className="uid">{r.createdOn}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mod-pager">
          <strong>Total Records: {filtered.length}</strong>
          <div className="mod-pager-nav">Page 1 of 1</div>
        </div>
      </div>
      {form && (
        <IncidentFormModal
          mode={form.mode}
          initial={form.row}
          onClose={() => setForm(null)}
          onSave={(saved) => {
            setRows((all) =>
              form.mode === 'add' ? [saved, ...all] : all.map((x) => (x.id === saved.id ? saved : x)),
            );
            setForm(null);
            toast(`Incident ${form.mode === 'add' ? 'added' : 'updated'}`);
          }}
        />
      )}
      {notesRow && (
        <NotesModal
          title={`Notes · ${notesRow.id}`}
          notes={notesRow.notes}
          onClose={() => setNotesId(null)}
          onAdd={(text) => {
            setRows((all) =>
              all.map((x) =>
                x.id === notesRow.id
                  ? {
                      ...x,
                      notes: [
                        ...x.notes,
                        { id: `NOTE-${Date.now()}`, text, at: 'Just now', by: 'You' },
                      ],
                    }
                  : x,
              ),
            );
            toast('Note added');
          }}
        />
      )}
    </div>
  );
}
