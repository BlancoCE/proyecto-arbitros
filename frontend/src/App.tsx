import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ArbitrosPage from './pages/Arbitros';
import LoginPage from './pages/Login';
import React from 'react';

// COMPONENTE DE PROTECCIÓN
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('user_auth');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta base: Redirige según si hay sesión */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Login: Siempre accesible */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Privadas: Protegidas por ProtectedRoute */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-6"><h1>Bienvenido al Panel de Control</h1></div>} />
          <Route path="arbitros" element={<ArbitrosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;