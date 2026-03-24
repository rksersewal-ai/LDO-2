import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthProvider } from './lib/auth';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DocumentHub from './pages/DocumentHub';
import DocumentDetail from './pages/DocumentDetail';
import BOMExplorer from './pages/BOMExplorer';
import PLKnowledgeHub from './pages/PLKnowledgeHub';
import PLDetail from './pages/PLDetail';
import WorkLedger from './pages/WorkLedger';
import LedgerReports from './pages/LedgerReports';
import Cases from './pages/Cases';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import AdminWorkspace from './pages/AdminWorkspace';
import OCRMonitor from './pages/OCRMonitor';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import BannerManagement from './pages/BannerManagement';
import RestrictedAccess from './pages/RestrictedAccess';
import DesignSystem from './pages/DesignSystem';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'documents', element: <DocumentHub /> },
      { path: 'documents/:id', element: <DocumentDetail /> },
      { path: 'bom', element: <BOMExplorer /> },
      { path: 'pl', element: <PLKnowledgeHub /> },
      { path: 'pl/:id', element: <PLDetail /> },
      { path: 'ledger', element: <WorkLedger /> },
      { path: 'ledger-reports', element: <LedgerReports /> },
      { path: 'cases', element: <Cases /> },
      { path: 'approvals', element: <Approvals /> },
      { path: 'reports', element: <Reports /> },
      { path: 'admin', element: <AdminWorkspace /> },
      { path: 'ocr', element: <OCRMonitor /> },
      { path: 'audit', element: <AuditLog /> },
      { path: 'settings', element: <Settings /> },
      { path: 'banners', element: <BannerManagement /> },
      { path: 'restricted', element: <RestrictedAccess /> },
      { path: 'design-system', element: <DesignSystem /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
