import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { AddPaymentModal, ExceptionModal } from './components/modals/Modals';
import { TripBoardView } from './views/TripBoardView';
import { TripDetailView } from './views/TripDetailView';
import { PayrollConfigView } from './views/PayrollConfigView';
import { PayrollManagementView } from './views/PayrollManagementView';
import { SettlementView } from './views/SettlementView';
import { AuditView } from './views/AuditView';
import { DriverLedgerView } from './views/DriverLedgerView';
import { FuelView } from './views/FuelView';
import { IncidentsView } from './views/IncidentsView';
import { DeductionsView } from './views/DeductionsView';
import { OpsModuleView } from './views/OpsModuleView';
import { DataEntrySuite } from './views/DataEntrySuite';
import { PlaceholderView } from './views/PlaceholderView';
import type { ViewId } from './types';
import './styles/global.css';
import './components/ui/ui.css';
import './components/layout/layout.css';

const OPS_VIEWS = new Set<ViewId>([
  'ifta',
  'ifta-tax-rate',
  'ifta-reports',
  'data-entry',
  'de-driver-reduced-rate',
  'de-california-pay',
  'de-montreal-bonus',
  'de-usa-loyalty',
  'de-usa-loyalty-rate',
  'de-us-otr-bonus',
  'de-canada-loyalty',
  'de-manage-miles',
  'de-mx-base-pay',
  'trip-expense',
  'te-assigned',
  'te-unassigned',
  'te-reimbursements',
  'te-history',
  'te-bulk-uploads',
  'cash-advance',
  'nomilinea',
  'nomilinea-payroll',
  'nomilinea-concepts',
]);

function resolveOpsView(view: ViewId): ViewId {
  if (view === 'ifta') return 'ifta-tax-rate';
  if (view === 'data-entry') return 'de-driver-reduced-rate';
  if (view === 'trip-expense') return 'te-assigned';
  if (view === 'nomilinea') return 'nomilinea-concepts';
  return view;
}

function Shell() {
  const {
    view,
    selectedTripId,
    showPaymentModal,
    showExceptionModal,
    toastMsg,
    toastShow,
  } = useApp();

  const showBoard = view === 'trip-board' && !selectedTripId;
  const showDetail = view === 'trip-board' && !!selectedTripId;
  const opsId = OPS_VIEWS.has(view) ? resolveOpsView(view) : null;

  const mainView = showBoard ? (
    <TripBoardView />
  ) : showDetail ? (
    <TripDetailView />
  ) : view === 'payroll' ? (
    <PayrollManagementView />
  ) : view === 'settlement' ? (
    <SettlementView />
  ) : view === 'audit' ? (
    <AuditView />
  ) : view === 'driver-ledger' ? (
    <DriverLedgerView />
  ) : view === 'fuel' ? (
    <FuelView />
  ) : view === 'incidents' ? (
    <IncidentsView />
  ) : view === 'deductions' ? (
    <DeductionsView />
  ) : view === 'config' ? (
    <PayrollConfigView />
  ) : opsId && (opsId.startsWith('ifta') || opsId.startsWith('de-')) ? (
    <DataEntrySuite id={opsId} />
  ) : opsId ? (
    <OpsModuleView id={opsId} />
  ) : (
    <PlaceholderView id={view} />
  );

  return (
    <>
      <div className={`app-shell ${showDetail ? 'is-detail' : ''}`}>
        <Sidebar />
        <div className="main-col">
          {!showDetail && <Topbar />}
          <div className="view-area">{mainView}</div>
        </div>
      </div>
      {showPaymentModal && <AddPaymentModal />}
      {showExceptionModal && <ExceptionModal />}
      <div className={`toast ${toastShow ? 'show' : ''}`}>{toastMsg}</div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
