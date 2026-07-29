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
import { PlaceholderView } from './views/PlaceholderView';
import './styles/global.css';
import './components/ui/ui.css';
import './components/layout/layout.css';

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

  const mainView =
    showBoard ? (
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
    ) : view === 'config' ? (
      <PayrollConfigView />
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
