import { Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RowActionMenu } from '../components/ui/RowActionMenu';
import { useApp } from '../context/AppContext';
import { buildOpsRows, opsTitle } from '../data/opsSeed';
import type { OpsCatalogRow, ViewId } from '../types';
import './modules.css';

const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

const ACTIONS = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

export function OpsModuleView({ id }: { id: ViewId }) {
  const { search, toast } = useApp();
  const [rows, setRows] = useState<OpsCatalogRow[]>(() => buildOpsRows(id));
  const [status, setStatus] = useState('all');
  const [division, setDivision] = useState('all');

  useEffect(() => {
    setRows(buildOpsRows(id));
    setStatus('all');
    setDivision('all');
  }, [id]);

  const divisions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.division))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (division !== 'all' && r.division !== division) return false;
      if (q && !`${r.name} ${r.code} ${r.category} ${r.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, status, division, search]);

  const title = opsTitle(id);

  return (
    <div className="mod-page">
      <div className="mod-filters">
        <label className="mod-filter">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="mod-filter">
          <span>Division</span>
          <select value={division} onChange={(e) => setDivision(e.target.value)}>
            <option value="all">All</option>
            {divisions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <div className="mod-filters-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => toast(`Exported ${filtered.length} ${title} rows`)}
          >
            <Download size={13} />
            Export
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => toast(`Add ${title} entry`)}
          >
            <Plus size={13} />
            Add Entry
          </button>
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
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Effective</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="mod-action-col">
                    <RowActionMenu
                      items={ACTIONS}
                      onAction={(actionId) => {
                        if (actionId === 'delete') {
                          setRows((all) => all.filter((x) => x.id !== r.id));
                          toast('Row deleted');
                        } else toast(`Editing ${r.id}`);
                      }}
                    />
                  </td>
                  <td>
                    <button type="button" className="mod-link" onClick={() => toast(`Opening ${r.id}`)}>
                      {r.id}
                    </button>
                  </td>
                  <td>
                    <div className="driver-cell">
                      <span className="name">{r.name}</span>
                      <span className="uid">{r.code}</span>
                    </div>
                  </td>
                  <td>{r.division}</td>
                  <td>{r.category}</td>
                  <td className="mod-money">{money.format(r.amount)}</td>
                  <td>
                    <span
                      className={`mod-status ${
                        r.status === 'active' ? 'open' : r.status === 'pending' ? 'flagged' : 'none'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.effectiveDate}</td>
                  <td>
                    <div className="driver-cell">
                      <span className="name">{r.updatedBy}</span>
                      <span className="uid">{r.updatedAt}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mod-pager">
          <strong>Total Records: {filtered.length}</strong>
          <div className="mod-pager-nav">{title}</div>
        </div>
      </div>
    </div>
  );
}
