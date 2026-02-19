import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/dashboard' },
    { icon: Users, label: 'Árbitros', path: '/dashboard/arbitros' },
    { icon: Calendar, label: 'Designaciones', path: '/dashboard/designaciones' },
    { icon: FileText, label: 'Informes', path: '/dashboard/informes' },
    { icon: Settings, label: 'Configuración', path: '/dashboard/config' },
  ];

  const handleLogout = () => {
    // Por ahora solo redirigimos, luego limpiaremos el Token
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Fijo */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-blue-400 tracking-tight">COLEGIO ÁRBITROS</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Sistema de Gestión</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blue-400'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-400 hover:text-red-400 w-full p-3 rounded-lg hover:bg-red-400/10 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="bg-white border-b border-gray-200 h-16 min-h-[64px] flex items-center px-8 sticky top-0 z-10">
          <div className="flex items-center text-gray-500 text-sm">
            <span>Panel</span>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-blue-600 font-semibold capitalize">
              {location.pathname.split('/').pop() || 'Inicio'}
            </span>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900 leading-none">Admin - Usuario</p>
              <p className="text-[10px] text-gray-500 mt-1">Administrador General</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;