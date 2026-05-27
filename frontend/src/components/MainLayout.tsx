import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, LogOut, Home, Users, Calendar, 
  ClipboardList, ClipboardCheck, Activity, Gavel, X, FileCheck, Settings, BarChart3  
} from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{ nombre: string; rol: string } | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('user_auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      setUserData({
        nombre: parsed.nombre_usuario || "Usuario",
        rol: parsed.rol || "Administrador"
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('user_auth');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  // 1. DEFINICIÓN DE TODOS LOS ITEMS
  const allNavigationItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones', 'Asesor Técnico', 'arbitro'] },
    { label: "Usuarios", icon: Users, href: "/dashboard/usuarios", roles: ['Administrador', 'Secretaría General'] },
    { label: "Partidos", icon: Calendar, href: "/dashboard/partidos", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones', 'Asesor Técnico'] },
    { label: "Designaciones", icon: ClipboardList, href: "/dashboard/designaciones", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones', 'arbitro'] },
    { label: "Asistencia", icon: ClipboardCheck, href: "/dashboard/asistencia", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones'] },
    { label: "Pruebas", icon: Activity, href: "/dashboard/pruebas", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria'] },
    { label: "Licencias", icon: FileCheck, href: "/dashboard/licencias", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones'] },
    { label: "Sanciones", icon: Gavel, href: "/dashboard/sanciones", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria'] },
    { label: "Reportes", icon: BarChart3, href: "/dashboard/reportes", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones', 'Asesor Técnico', 'arbitro'] },
    { label: "Configuración", icon: Settings, href: "/dashboard/configuracion", roles: ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones', 'Asesor Técnico', 'arbitro'] },
  ];

  // 2. FILTRADO LÓGICO SEGÚN EL ROL DEL USUARIO
  const navigationItems = allNavigationItems.filter(item => 
    userData && item.roles.includes(userData.rol)
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => {
            // Permite cerrar el menú lateral al presionar Enter o la barra espaciadora
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setMobileMenuOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú de navegación"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-aflp text-white transition-transform duration-300 transform 
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 ${sidebarOpen ? "w-64" : "w-20"} 
          flex flex-col shadow-2xl md:shadow-none`}
      >
        <div className="p-6 flex items-center justify-between">
          {(sidebarOpen || mobileMenuOpen) && (
            <span className="text-2xl font-black tracking-tighter">AFLP</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block p-2 hover:bg-white/10 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link 
                key={item.href} 
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                  ${isActive ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={22} className={`${isActive ? "scale-110" : ""}`} />
                {(sidebarOpen || mobileMenuOpen) && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-black/10 group-data-[collapsible=icon]:p-2">
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="mb-4 px-2">
              <p className="text-sm font-bold truncate uppercase">{userData?.nombre}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{userData?.rol}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/30 p-2 rounded-lg text-sm transition-all border border-white/20"
          >
            <LogOut size={20} />
            {(sidebarOpen || mobileMenuOpen) && "Cerrar Sesión"}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Superior Móvil */}
        <header className="h-20 md:h-24 bg-gradient-aflp flex items-center px-4 md:px-8 text-white shadow-lg shrink-0 sticky top-0 z-20">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 mr-3 text-indigo-900 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={28} />
            </button>
            <div className="flex flex-col justify-center overflow-hidden">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                Sistema de Gestión de Árbitros
              </h1>
              <p className="text-[10px] md:text-sm opacity-90 truncate">
                Colegio de Árbitros de Fútbol de La Paz
              </p>
            </div>
          </div>
        </header>

        {/* Zona de scroll para las páginas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
             <Outlet /> {/* Aquí se renderizan tus páginas */}
          </div>
        </div>
      </main>
    </div>
  );
}