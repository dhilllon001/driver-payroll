import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Download,
  Flag,
  MessageCircle,
  MoreVertical,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

function RowMenu({
  trip,
  open,
  onToggle,
  onClose,
}: {
  trip: Trip;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const {
    setSelectedTripId,
    setShowPaymentModal,
    setShowExceptionModal,
    setTrips,
    setDetailTab,
    toast,
  } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose]);

  const openTrip = () => {
    setSelectedTripId(trip.id);
    setDetailTab('locations');
    onClose();
  };

  return (
    <div className="row-menu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={`btn-icon row-menu-trigger ${open ? 'open' : ''}`}
        aria-label={`Actions for ${trip.tripNo}`}
        aria-expanded={open}
        onClick={onToggle}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="row-menu-pop" role="menu">
          <button type="button" role="menuitem" onClick={openTrip}>
            Open trip
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setSelectedTripId(trip.id);
              setShowPaymentModal(true);
              onClose();
            }}
          >
            Add payment
          </button>
          {trip.exceptions.length > 0 && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setSelectedTripId(trip.id);
                setShowExceptionModal(true);
                onClose();
              }}
            >
              View exception
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTrips((prev) =>
                prev.map((t) => (t.id === trip.id ? { ...t, flagged: !t.flagged } : t)),
              );
              toast(trip.flagged ? 'Flag cleared' : 'Trip flagged');
              onClose();
            }}
          >
            {trip.flagged ? 'Clear flag' : 'Flag trip'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              toast(`Exported ${trip.tripNo}`);
              onClose();
            }}
          >
            Export trip
          </button>
        </div>
      )}
    </div>
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
    setDetailTab,
    page,
    setPage,
    perPage,
    setPerPage,
    toast,
  } = useApp();

  const [menuId, setMenuId] = useState<string | null>(null);

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
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((t) => t.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openTrip = (id: string) => {
    setSelectedTripId(id);
    setDetailTab('locations');
  };

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
              <th className="col-check">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
              </th>
              <th className="col-menu" aria-label="Actions" />
              <th>Trip No</th>
              <th>Sub</th>
              <th>Lead Driver</th>
              <th>Team Driver</th>
              <th>Drives For</th>
              <th>Category</th>
              <th>Miles</th>
              <th>Pay Date</th>
              <th>Date Out</th>
              <th>Date In</th>
              <th>Flag</th>
              <th>Pay</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className={`clickable ${selectedIds.has(t.id) ? 'selected' : ''}`}
                onClick={() => openTrip(t.id)}
              >
                <td className="col-check" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => toggleOne(t.id)}
                    aria-label={`Select ${t.tripNo}`}
                  />
                </td>
                <td className="col-menu">
                  <RowMenu
                    trip={t}
                    open={menuId === t.id}
                    onToggle={() => setMenuId((id) => (id === t.id ? null : t.id))}
                    onClose={() => setMenuId(null)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="trip-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTrip(t.id);
                    }}
                  >
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
                    <span className="muted">—</span>
                  )}
                </td>
                <td>{t.drivesFor || <span className="muted">—</span>}</td>
                <td>{t.tripCategory}</td>
                <td className="tnum">{t.payMiles.toFixed(1)}</td>
                <td>{t.payDate || <span className="muted">—</span>}</td>
                <td className="tnum nowrap">{t.dateOut}</td>
                <td className="tnum nowrap">{t.dateIn}</td>
                <td>
                  <span
                    className={`status-dot flag ${t.flagged ? 'on' : ''}`}
                    title={t.flagged ? 'Flagged' : 'Clear'}
                  >
                    <Flag size={12} fill={t.flagged ? 'currentColor' : 'none'} />
                  </span>
                </td>
                <td>
                  <PaymentIcon status={t.paymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="board-footer">
        <span className="meta">
          Total Filtered Records: <strong className="tnum">{TOTAL_FILTERED.toLocaleString()}</strong>
          <span className="muted-inline">(showing {filtered.length} demo rows)</span>
        </span>
        <label className="meta per-page">
          Per page
          <select
            className="filter-select"
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
