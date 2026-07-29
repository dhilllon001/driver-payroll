import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Download,
  Flag,
  Info,
  MessageCircle,
  MoreVertical,
  FilePlus2,
  Plus,
  Search,
  Tag,
} from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TOTAL_FILTERED } from '../data/seed';
import type { Trip } from '../types';
import './views.css';

function PaymentIcon({ status }: { status: Trip['paymentStatus'] }) {
  const cls =
    status === 'paid'
      ? 'status-dot paid'
      : status === 'pending' || status === 'exception'
        ? 'status-dot active'
        : 'status-dot';
  return (
    <span className={cls} title={status}>
      <span style={{ fontSize: 11, fontWeight: 700 }}>$</span>
    </span>
  );
}

export function TripBoardView() {
  const {
    trips,
    search,
    paymentFilter,
    setPaymentFilter,
    flagFilter,
    setFlagFilter,
    roleFilter,
    setRoleFilter,
    tagFilter,
    setTagFilter,
    selectedIds,
    setSelectedIds,
    setSelectedTripId,
    setShowExceptionModal,
    setShowPaymentModal,
    page,
    setPage,
    perPage,
    setPerPage,
    toast,
  } = useApp();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trips.filter((t) => {
      if (paymentFilter !== 'all' && t.paymentStatus !== paymentFilter) return false;
      if (flagFilter === 'flagged' && !t.flagged) return false;
      if (flagFilter === 'clear' && t.flagged) return false;
      if (roleFilter !== 'all' && t.tripRole !== roleFilter) return false;
      if (tagFilter && !t.tags.some((tag) => tag.includes(tagFilter.toLowerCase()))) return false;
      if (!q) return true;
      return (
        t.tripNo.toLowerCase().includes(q) ||
        t.leadDriver.toLowerCase().includes(q) ||
        t.leadDriverId.toLowerCase().includes(q) ||
        t.tripCategory.toLowerCase().includes(q) ||
        t.teamDriver.toLowerCase().includes(q)
      );
    });
  }, [trips, search, paymentFilter, flagFilter, roleFilter, tagFilter]);

  const allSelected = filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openTrip = (id: string) => setSelectedTripId(id);

  const totalPages = Math.max(1, Math.ceil(TOTAL_FILTERED / perPage));

  return (
    <div className="board">
      <div className="board-toolbar">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast('Advanced search')}>
          <Search size={13} />
          Advanced Search
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => toast(`Exported ${filtered.length} trip exceptions`)}
        >
          <Download size={13} />
          Export Trip Exceptions
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast('Upload Pay')}>
          Upload Pay
        </button>

        <div className="filters">
          <span className="filter-label">Filter By:</span>
          <select
            className="filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Payment Status"
          >
            <option value="all">Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="exception">Exception</option>
          </select>
          <select
            className="filter-select"
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            aria-label="Flag Status"
          >
            <option value="all">Flag Status</option>
            <option value="flagged">Flagged</option>
            <option value="clear">Not Flagged</option>
          </select>
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Trip Role"
          >
            <option value="all">Trip Role</option>
            <option value="Local">Local</option>
            <option value="Team">Team</option>
            <option value="Owner Operator">Owner Operator</option>
            <option value="Company">Company</option>
          </select>
          <input
            className="filter-input"
            placeholder="Tags"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            aria-label="Tags"
          />
        </div>
      </div>

      <div className="board-table-wrap">
        <table className="data-table board-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
              </th>
              <th style={{ width: 36 }} />
              <th style={{ width: 36 }} />
              <th>Trip No</th>
              <th>Sub Trip</th>
              <th>Lead Driver Name</th>
              <th>Team Driver Name</th>
              <th>Drives For</th>
              <th>Trip Category</th>
              <th>Pay Miles</th>
              <th>Pay Date</th>
              <th>Date Out</th>
              <th>Date In</th>
              <th>Flagged</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className={`clickable ${selectedIds.has(t.id) ? 'selected' : ''}`}
                onDoubleClick={() => openTrip(t.id)}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => toggleOne(t.id)}
                    aria-label={`Select ${t.tripNo}`}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label="Expand"
                    onClick={() => openTrip(t.id)}
                  >
                    <Plus size={14} />
                  </button>
                </td>
                <td>
                  <Tag size={14} color={t.tags.length ? 'var(--action)' : 'var(--fg-4)'} />
                </td>
                <td>
                  <button type="button" className="trip-link" onClick={() => openTrip(t.id)}>
                    {t.tripNo}
                  </button>
                </td>
                <td className="tnum">{t.subTrip}</td>
                <td>
                  <div className="driver-cell">
                    <span className="name">{t.leadDriver}</span>
                    <span className="uid">({t.leadDriverId})</span>
                  </div>
                </td>
                <td>
                  {t.teamDriver ? (
                    <div className="driver-cell">
                      <span className="name">{t.teamDriver}</span>
                      <span className="uid">({t.teamDriverId})</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--fg-4)' }}>—</span>
                  )}
                </td>
                <td>{t.drivesFor || <span style={{ color: 'var(--fg-4)' }}>—</span>}</td>
                <td>{t.tripCategory}</td>
                <td className="tnum">{t.payMiles.toFixed(1)}</td>
                <td>{t.payDate || <span style={{ color: 'var(--fg-4)' }}>—</span>}</td>
                <td className="tnum" style={{ whiteSpace: 'nowrap' }}>
                  {t.dateOut}
                </td>
                <td className="tnum" style={{ whiteSpace: 'nowrap' }}>
                  {t.dateIn}
                </td>
                <td>
                  <span className={`status-dot flag ${t.flagged ? 'on' : ''}`} title={t.flagged ? 'Flagged' : 'Clear'}>
                    <Flag size={12} fill={t.flagged ? 'currentColor' : 'none'} />
                  </span>
                </td>
                <td>
                  <PaymentIcon status={t.paymentStatus} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="actions">
                    <button
                      type="button"
                      className="btn-icon"
                      title="Add payment"
                      onClick={() => {
                        setSelectedTripId(t.id);
                        setShowPaymentModal(true);
                      }}
                    >
                      <FilePlus2 size={15} />
                    </button>
                    <button type="button" className="btn-icon" title="More">
                      <MoreVertical size={15} />
                    </button>
                    {t.exceptions.length > 0 && (
                      <button
                        type="button"
                        className="btn-icon danger"
                        title="Trip exception"
                        onClick={() => {
                          setSelectedTripId(t.id);
                          setShowExceptionModal(true);
                        }}
                      >
                        <Info size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="board-footer">
        <span className="meta">
          Total Filtered Records: <strong className="tnum">{TOTAL_FILTERED.toLocaleString()}</strong>
          <span style={{ marginLeft: 12, color: 'var(--fg-4)' }}>
            (showing {filtered.length} demo rows)
          </span>
        </span>
        <label className="meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Per page
          <select
            className="filter-select"
            style={{ minWidth: 72 }}
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </label>
        <div className="pager">
          <button type="button" className="pager-btn" disabled={page <= 1} onClick={() => setPage(1)}>
            <ChevronFirst size={14} />
          </button>
          <button
            type="button"
            className="pager-btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="tnum">
            {page} of {totalPages}
          </span>
          <button
            type="button"
            className="pager-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            className="pager-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            <ChevronLast size={14} />
          </button>
        </div>
      </div>

      <button type="button" className="help-fab" aria-label="Help" onClick={() => toast('Help center')}>
        <MessageCircle size={20} />
      </button>
    </div>
  );
}
