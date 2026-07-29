import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { AddPaymentModal, ExceptionModal } from './components/modals/Modals';
import { TripBoardView } from './views/TripBoardView';
import { TripDetailView } from './views/TripDetailView';
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

  return (
    <>
      <div className={`app-shell ${showDetail ? 'is-detail' : ''}`}>
        <Sidebar />
        <div className="main-col">
          {!showDetail && <Topbar />}
          <div className="view-area">
            {showBoard && <TripBoardView />}
            {showDetail && <TripDetailView />}
            {!showBoard && !showDetail && <PlaceholderView id={view} />}
          </div>
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
