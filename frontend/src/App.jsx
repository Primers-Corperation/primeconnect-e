import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Placeholder } from './pages/Placeholder.jsx';

function Root() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rent-number" element={<ProtectedRoute><Placeholder title="Rent number" /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Placeholder title="Marketplace" /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Placeholder title="Wallet" /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><Placeholder title="History" /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
