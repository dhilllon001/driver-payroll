import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageCircle,
  MoreVertical,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Trip } from '../types';
import './views.css';

function PaymentIcon({ status }: { status: Trip['paymentStatus'] }) {
  return (
    <span className={`pay-status-pill ${status}`} title={status}>
      {status}
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
    setDetailTab('payment');
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
    setSearch,
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
    setTrips,
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter, flagFilter, roleFilter, tagFilter, setPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const rangeEnd = Math.min(safePage * perPage, filtered.length);

  const counts = useMemo(
    () => ({
      all: trips.length,
      unpaid: trips.filter((t) => t.paymentStatus === 'unpaid').length,
      pending: trips.filter((t) => t.paymentStatus === 'pending').length,
      paid: trips.filter((t) => t.paymentStatus === 'paid').length,
      exception: trips.filter((t) => t.paymentStatus === 'exception').length,
      flagged: trips.filter((t) => t.flagged).length,
    }),
    [trips],
  );

  const pageSelected = pageRows.length > 0 && pageRows.every((t) => selectedIds.has(t.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (pageSelected) {
        pageRows.forEach((t) => next.delete(t.id));
      } else {
        pageRows.forEach((t) => next.add(t.id));
      }
      return next;
    });
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
    setDetailTab('payment');
  };

  const pageButtons = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    const buttons: number[] = [];
    for (let p = start; p <= end; p++) buttons.push(p);
    return buttons;
  }, [safePage, totalPages]);

  const appliedFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (search.trim()) {
      chips.push({
        key: 'search',
        label: `Search: ${search.trim()}`,
        clear: () => setSearch(''),
      });
    }
    if (paymentFilter !== 'all') {
      chips.push({
        key: 'payment',
        label: `Status: ${paymentFilter}`,
        clear: () => setPaymentFilter('all'),
      });
    }
    if (flagFilter === 'flagged') {
      chips.push({
        key: 'flag',
        label: 'Flagged only',
        clear: () => setFlagFilter('all'),
      });
    } else if (flagFilter === 'clear') {
      chips.push({
        key: 'flag',
        label: 'Not flagged',
        clear: () => setFlagFilter('all'),
      });
    }
    if (roleFilter !== 'all') {
      chips.push({
        key: 'role',
        label: `Role: ${roleFilter}`,
        clear: () => setRoleFilter('all'),
      });
    }
    if (tagFilter.trim()) {
      chips.push({
        key: 'tag',
        label: `Tag: ${tagFilter.trim()}`,
        clear: () => setTagFilter(''),
      });
    }
    return chips;
  }, [
    search,
    paymentFilter,
    flagFilter,
    roleFilter,
    tagFilter,
    setPaymentFilter,
    setFlagFilter,
    setRoleFilter,
    setTagFilter,
    setSearch,
  ]);

  const clearAllFilters = () => {
    setSearch('');
    setPaymentFilter('all');
    setFlagFilter('all');
    setRoleFilter('all');
    setTagFilter('');
    setPage(1);
  };

  const applyPaymentFilter = (value: string) => {
    setPaymentFilter(paymentFilter === value ? 'all' : value);
    if (value !== 'all') setFlagFilter('all');
  };

  const applyFlaggedFilter = () => {
    setFlagFilter(flagFilter === 'flagged' ? 'all' : 'flagged');
    setPaymentFilter('all');
  };

  return (
    <div className="board">
      {selectedIds.size > 0 && (
        <div className="board-selection-bar" role="status" aria-live="polite">
          <div className="board-selection-left">
            <span className="board-selection-count tnum">{selectedIds.size}</span>
            <div className="board-selection-copy">
              <strong>
                {selectedIds.size === 1 ? '1 trip selected' : `${selectedIds.size} trips selected`}
              </strong>
              <span>Ready to generate payroll for the selected trips</span>
            </div>
          </div>
          <div className="board-selection-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm board-selection-clear"
              onClick={() => setSelectedIds(new Set())}
            >
              <X size={14} />
              Clear
            </button>
            <button
              type="button"
              className="btn board-generate-pay"
              onClick={() => {
                toast(`Generate Pay started for ${selectedIds.size} trip${selectedIds.size === 1 ? '' : 's'}`);
                setSelectedIds(new Set());
              }}
            >
              <Wallet size={15} />
              Generate Pay
            </button>
          </div>
        </div>
      )}

      <div className="board-summary">
        <button
          type="button"
          className={`board-sum-card all ${paymentFilter === 'all' && flagFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setPaymentFilter('all');
            setFlagFilter('all');
          }}
        >
          <span>All trips</span>
          <strong className="tnum">{counts.all}</strong>
        </button>
        <button
          type="button"
          className={`board-sum-card unpaid ${paymentFilter === 'unpaid' ? 'active' : ''}`}
          onClick={() => applyPaymentFilter('unpaid')}
        >
          <span>Unpaid</span>
          <strong className="tnum">{counts.unpaid}</strong>
        </button>
        <button
          type="button"
          className={`board-sum-card pending ${paymentFilter === 'pending' ? 'active' : ''}`}
          onClick={() => applyPaymentFilter('pending')}
        >
          <span>Pending</span>
          <strong className="tnum">{counts.pending}</strong>
        </button>
        <button
          type="button"
          className={`board-sum-card paid ${paymentFilter === 'paid' ? 'active' : ''}`}
          onClick={() => applyPaymentFilter('paid')}
        >
          <span>Paid</span>
          <strong className="tnum">{counts.paid}</strong>
        </button>
        <button
          type="button"
          className={`board-sum-card exception ${paymentFilter === 'exception' ? 'active' : ''}`}
          onClick={() => applyPaymentFilter('exception')}
        >
          <span>Exception</span>
          <strong className="tnum">{counts.exception}</strong>
        </button>
        <button
          type="button"
          className={`board-sum-card flagged ${flagFilter === 'flagged' ? 'active' : ''}`}
          onClick={applyFlaggedFilter}
        >
          <span>Flagged</span>
          <strong className="tnum">{counts.flagged}</strong>
        </button>
      </div>

      {appliedFilters.length > 0 && (
        <div className="board-applied-filters">
          <span className="board-applied-label">Filters applied</span>
          <div className="board-applied-chips">
            {appliedFilters.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="board-filter-chip"
                onClick={chip.clear}
                title={`Clear ${chip.label}`}
              >
                {chip.label}
                <X size={12} />
              </button>
            ))}
          </div>
          <button type="button" className="board-clear-filters" onClick={clearAllFilters}>
            Clear all
          </button>
        </div>
      )}

      <div className="board-table-wrap">
        <table className="data-table board-table">
          <thead>
            <tr>
              <th className="col-check">
                <input type="checkbox" checked={pageSelected} onChange={toggleAll} aria-label="Select page" />
              </th>
              <th className="col-menu">Action</th>
              <th className="col-status">Status</th>
              <th className="col-flag">Flag</th>
              <th>Trip No</th>
              <th>Sub</th>
              <th>Lead Driver</th>
              <th>Team Driver</th>
              <th>Drives For</th>
              <th>Category</th>
              <th>Role</th>
              <th>Miles</th>
              <th>Pay Date</th>
              <th>Date Out</th>
              <th>Date In</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr className="board-empty-row">
                <td colSpan={15}>No trips match the current filters.</td>
              </tr>
            ) : (
              pageRows.map((t) => (
                <tr
                  key={t.id}
                  className={`clickable ${selectedIds.has(t.id) ? 'selected' : ''} ${t.flagged ? 'is-flagged' : ''}`}
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
                  <td className="col-status">
                    <PaymentIcon status={t.paymentStatus} />
                  </td>
                  <td className="col-flag" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`flag-icon-btn ${t.flagged ? 'on' : ''}`}
                      title={t.flagged ? 'Clear flag' : 'Flag trip'}
                      aria-label={t.flagged ? 'Clear flag' : 'Flag trip'}
                      onClick={() => {
                        setTrips((prev) =>
                          prev.map((row) =>
                            row.id === t.id ? { ...row, flagged: !row.flagged } : row,
                          ),
                        );
                        toast(t.flagged ? 'Flag cleared' : 'Trip flagged');
                      }}
                    >
                      <Flag size={14} fill={t.flagged ? 'currentColor' : 'none'} />
                    </button>
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
                  <td>
                    <span className="cat-cell">{t.tripCategory}</span>
                  </td>
                  <td>
                    <span className="role-pill">{t.tripRole}</span>
                  </td>
                  <td className="tnum miles-cell">{t.payMiles.toFixed(1)}</td>
                  <td>{t.payDate || <span className="muted">—</span>}</td>
                  <td className="tnum nowrap">{t.dateOut}</td>
                  <td className="tnum nowrap">{t.dateIn}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="board-footer">
        <span className="meta">
          Showing <strong className="tnum">{rangeStart}</strong>–
          <strong className="tnum">{rangeEnd}</strong> of{' '}
          <strong className="tnum">{filtered.length.toLocaleString()}</strong>
          {selectedIds.size > 0 && (
            <span className="muted-inline">{selectedIds.size} selected</span>
          )}
        </span>
        <label className="meta per-page">
          Rows
          <select
            className="filter-select"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <div className="pager">
          <button
            type="button"
            className="pager-btn"
            disabled={safePage <= 1}
            onClick={() => setPage(1)}
            aria-label="First page"
          >
            <ChevronFirst size={14} />
          </button>
          <button
            type="button"
            className="pager-btn"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {pageButtons.map((p) => (
            <button
              key={p}
              type="button"
              className={`pager-btn page-num ${p === safePage ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="pager-btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            className="pager-btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage(totalPages)}
            aria-label="Last page"
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
