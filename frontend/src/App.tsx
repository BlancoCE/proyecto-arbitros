import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import React, { useEffect } from 'react';

// COMPONENTE DE PROTECCIÓN ACTUALIZADO
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Ahora validamos contra sessionStorage
  const isAuthenticated = sessionStorage.getItem('user_auth'); 
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// COMPONENTE INTERNO PARA EL CIERRE DE SESIÓN AUTOMÁTICO
const InactivityGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  
  // Tiempo límite establecido: 15 minutos (15 * 60 * 1000 ms)
  const TIMEOUT_IN_MS = 15 * 60 * 1000; 

  useEffect(() => {
    // Si no hay un token activo, no encendemos los contadores
    if (!sessionStorage.getItem('token')) return;

    let timeoutId: number;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutUser, TIMEOUT_IN_MS);
    };

    const logoutUser = () => {
      sessionStorage.removeItem('user_auth');
      sessionStorage.removeItem('token');
      alert("Tu sesión ha expirado por inactividad. Por motivos de seguridad, vuelve a ingresar.");
      navigate('/login');
    };

    // Eventos del usuario para considerar que sigue interactuando
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Arrancar el temporizador de forma inicial
    resetTimer();

    // Limpieza de eventos al cambiar de estado o destruir el componente
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <InactivityGuard>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Redirección inicial */}        
          <Route path="/login" element={<LoginPage />} /> {/* Login: Público */}
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          {/* Rutas Privadas */}
          <Route 
            path="/dashboard" 
            element = {
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
      </InactivityGuard>
    </Router>
  );
}

export default App;