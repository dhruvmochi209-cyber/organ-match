import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorForm from './pages/donor/DonorForm';
import RecipientDashboard from './pages/recipient/RecipientDashboard';
import RecipientForm from './pages/recipient/RecipientForm';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PaymentHistory from './pages/hospital/PaymentHistory';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/donor" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
      <Route path="/donor/register" element={<ProtectedRoute allowedRoles={['donor']}><DonorForm /></ProtectedRoute>} />
      <Route path="/donor/reports" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
      <Route path="/donor/matches" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />

      <Route path="/recipient" element={<ProtectedRoute allowedRoles={['recipient']}><RecipientDashboard /></ProtectedRoute>} />
      <Route path="/recipient/register" element={<ProtectedRoute allowedRoles={['recipient']}><RecipientForm /></ProtectedRoute>} />
      <Route path="/recipient/reports" element={<ProtectedRoute allowedRoles={['recipient']}><RecipientDashboard /></ProtectedRoute>} />
      <Route path="/recipient/matches" element={<ProtectedRoute allowedRoles={['recipient']}><RecipientDashboard /></ProtectedRoute>} />

      <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/patients" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/verify-donors" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/verify-recipients" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/reports" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/matches" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/transplants" element={<ProtectedRoute allowedRoles={['hospital_admin']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/payments" element={<ProtectedRoute allowedRoles={['hospital_admin', 'donor', 'recipient']}><PaymentHistory /></ProtectedRoute>} />


      <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/transplants" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import Chatbot from './components/Chatbot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Chatbot />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </AuthProvider>
    </BrowserRouter>
  );
}

