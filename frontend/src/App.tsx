import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/Login';
import DashboardHome from './pages/Dashboard'; 
import UsuariosPage from './pages/Usuarios';
import ArbitrosPage from './components/Usuarios/Arbitros';
import AsesoresPage from './components/Usuarios/Asesores';
import Partidos from './pages/Partidos';
//import Desempenio from './pages/Desempenio';
import Asistencia from './pages/Asistencia';
import Pruebas from './pages/Pruebas';
//import Disciplina from './pages/Disciplina';
import Licencias from './pages/Licencias';
import Sanciones from './pages/Sanciones';
import Designacion from './pages/Designaciones';
import Configuracion from './pages/Configuracion';
import ResetPasswordPage from './pages/ResetPassword';
import Reportes from './pages/Reportes';
import React from 'react';

// COMPONENTE DE PROTECCIÓNACTUALIZADO
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Ahora validamos contra sessionStorage
  const isAuthenticated = sessionStorage.getItem('user_auth'); 
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Redirección inicial */}        
        <Route path="/login" element={<LoginPage />} /> {/* Login: Público */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* Rutas Privadas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* La ruta index carga la vista de las tarjetas (imagen 1 del doc) */}
          <Route index element={<DashboardHome />} />
          
          {/* GRUPO DE USUARIOS */}
          <Route path="usuarios">
            <Route index element={<UsuariosPage />} /> {/* El selector de tarjetas */}
            <Route path="arbitros" element={<ArbitrosPage />} /> {/* Tu gestión actual */}
            <Route path="asesores" element={<AsesoresPage />} />
          </Route>
          
          {/* Espacios para futuros módulos */}
          <Route path="partidos" element={<Partidos/>} />
          <Route path="designaciones" element={<Designacion/>} />
          {/*<Route path="desempenio" element={<Desempenio/>}/>*/}
          <Route path="asistencia" element={<Asistencia/>}/>
          <Route path="pruebas" element={<Pruebas/>}/>
          {/*<Route path="disciplina" element={<Disciplina/>}/>*/}
          <Route path="licencias" element={<Licencias/>}/>
          <Route path="sanciones" element={<Sanciones/>}/>
          <Route path="reportes" element={<Reportes/>}/>
          <Route path="configuracion" element={<Configuracion/>}/>
        </Route>

        {/* Captura de rutas no encontradas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;