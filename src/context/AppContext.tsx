import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { TRIPS } from '../data/seed';
import type { ConfigStatus, DetailTab, NotesSubTab, Trip, ViewId } from '../types';

export type PageHeaderAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
};

export type PageHeaderControls = {
  showStatus?: boolean;
  actions: PageHeaderAction[];
} | null;

export type ToastTone = 'default' | 'success' | 'info' | 'warn' | 'error';

interface AppState {
  view: ViewId;
  setView: (v: ViewId) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((c: boolean) => boolean)) => void;
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  selectedTripId: string | null;
  setSelectedTripId: (id: string | null) => void;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  detailTab: DetailTab;
  setDetailTab: (t: DetailTab) => void;
  notesSubTab: NotesSubTab;
  setNotesSubTab: (t: NotesSubTab) => void;
  search: string;
  setSearch: (s: string) => void;
  paymentFilters: string[];
  setPaymentFilters: React.Dispatch<React.SetStateAction<string[]>>;
  flagFilter: string;
  setFlagFilter: (s: string) => void;
  roleFilter: string;
  setRoleFilter: (s: string) => void;
  tagFilter: string;
  setTagFilter: (s: string) => void;
  page: number;
  setPage: (n: number) => void;
  perPage: number;
  setPerPage: (n: number) => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (v: boolean) => void;
  showExceptionModal: boolean;
  setShowExceptionModal: (v: boolean) => void;
  configStatusFilter: 'all' | ConfigStatus;
  setConfigStatusFilter: (s: 'all' | ConfigStatus) => void;
  pageHeader: PageHeaderControls;
  setPageHeader: (h: PageHeaderControls) => void;
  toast: (msg: string, tone?: ToastTone) => void;
  toastMsg: string;
  toastShow: boolean;
  toastTone: ToastTone;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewId>('trip-board');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [trips, setTrips] = useState<Trip[]>(() => TRIPS.map((t) => ({ ...t })));
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailTab, setDetailTab] = useState<DetailTab>('payment');
  const [notesSubTab, setNotesSubTab] = useState<NotesSubTab>('Driver');
  const [search, setSearch] = useState('');
  const [paymentFilters, setPaymentFilters] = useState<string[]>([]);
  const [flagFilter, setFlagFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [configStatusFilter, setConfigStatusFilter] = useState<'all' | ConfigStatus>('all');
  const [pageHeader, setPageHeader] = useState<PageHeaderControls>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [toastTone, setToastTone] = useState<ToastTone>('default');

  const toast = useCallback((msg: string, tone: ToastTone = 'default') => {
    setToastMsg(msg);
    setToastTone(tone);
    setToastShow(true);
    window.setTimeout(() => setToastShow(false), 2800);
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      sidebarCollapsed,
      setSidebarCollapsed,
      trips,
      setTrips,
      selectedTripId,
      setSelectedTripId,
      selectedIds,
      setSelectedIds,
      detailTab,
      setDetailTab,
      notesSubTab,
      setNotesSubTab,
      search,
      setSearch,
      paymentFilters,
      setPaymentFilters,
      flagFilter,
      setFlagFilter,
      roleFilter,
      setRoleFilter,
      tagFilter,
      setTagFilter,
      page,
      setPage,
      perPage,
      setPerPage,
      showPaymentModal,
      setShowPaymentModal,
      showExceptionModal,
      setShowExceptionModal,
      configStatusFilter,
      setConfigStatusFilter,
      pageHeader,
      setPageHeader,
      toast,
      toastMsg,
      toastShow,
      toastTone,
    }),
    [
      view,
      sidebarCollapsed,
      trips,
      selectedTripId,
      selectedIds,
      detailTab,
      notesSubTab,
      search,
      paymentFilters,
      flagFilter,
      roleFilter,
      tagFilter,
      page,
      perPage,
      showPaymentModal,
      showExceptionModal,
      configStatusFilter,
      pageHeader,
      toast,
      toastMsg,
      toastShow,
      toastTone,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
