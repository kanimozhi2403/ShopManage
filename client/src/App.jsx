import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DateRangeProvider } from './context/DateRangeContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Sales from './pages/admin/Sales';
import Employees from './pages/admin/Employees';
import Expenses from './pages/admin/Expenses';
import Tasks from './pages/admin/Tasks';
import Reports from './pages/admin/Reports';
import EmployeePortal from './pages/employee/Portal';
import EmployeeSales from './pages/employee/EmployeeSales';
import EmployeeTasks from './pages/employee/EmployeeTasks';

// Protected Route Shield
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/employee" replace />;

  return children;
}

// Global App Layout
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page">
          {children}
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Administrative Access */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute adminOnly><AppLayout><Products /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/sales" element={<ProtectedRoute adminOnly><AppLayout><Sales /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute adminOnly><AppLayout><Employees /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/expenses" element={<ProtectedRoute adminOnly><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/tasks" element={<ProtectedRoute adminOnly><AppLayout><Tasks /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AppLayout><Reports /></AppLayout></ProtectedRoute>} />

      {/* Staff Access */}
      <Route path="/employee" element={<ProtectedRoute><AppLayout><EmployeePortal /></AppLayout></ProtectedRoute>} />
      <Route path="/employee/sales" element={<ProtectedRoute><AppLayout><EmployeeSales /></AppLayout></ProtectedRoute>} />
      <Route path="/employee/tasks" element={<ProtectedRoute><AppLayout><EmployeeTasks /></AppLayout></ProtectedRoute>} />

      {/* Navigation Guard */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/employee') : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DateRangeProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600
            }
          }} 
        />
        <AppRoutes />
        </DateRangeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
