import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ArrowLeft, UserPlus, Search, Mail, Phone, Edit, Award, Calendar, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalNuevoArbitro from './ModalNuevoArbitro';
import ModalEditarArbitro from './ModalEditarArbitro';

export interface Arbitro {
  id_arbitro: number;
  id_usuario: number;
  nombre_usuario: string;
  ci: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email?: string;
  telefono: string;
  categoria: string;
  especializacion: string;
  estado: string;
  fecha_nacimiento: string;
  genero: string;
  foto: string | null;
}

const ArbitrosPage = () => {
  const navigate = useNavigate();
  const URL_BACKEND = `import.meta.env.VITE_API_URL}`;
  
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [arbitroParaEditar, setArbitroParaEditar] = useState<Arbitro | null>(null);

  const fetchArbitros = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${URL_BACKEND}/api/usuarios/arbitros`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArbitros(response.data);
    } catch (error) {
      console.error("Error al obtener árbitros:", error);
    }
  };

  useEffect(() => { fetchArbitros(); }, []);

  // 1. LÓGICA DE ORDEN JERÁRQUICO
  const jerarquiaCategorias: { [key: string]: number } = {
    'FIFA': 1,
    'Primera': 2,
    'Segunda': 3,
    'Tercera': 4,
    'Cuarta': 5,
    'Aspirante': 6
  };

  const arbitrosFiltradosYOrdenados = useMemo(() => {
    return arbitros
      .filter(a => {
        const matchesSearch = `${a.nombre} ${a.apellido_paterno} ${a.apellido_materno} ${a.ci}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = filterEstado === "Todos" || a.estado === filterEstado;
        return matchesSearch && matchesEstado;
      })
      .sort((a, b) => {
        // Primero por jerarquía de categoría
        const ordenA = jerarquiaCategorias[a.categoria] || 99;
        const ordenB = jerarquiaCategorias[b.categoria] || 99;
        if (ordenA !== ordenB) return ordenA - ordenB;
        
        // Segundo por especialización (Central antes que Asistente)
        if (a.especializacion !== b.especializacion) return a.especializacion === 'Central' ? -1 : 1;

        // Tercero por género (opcional, para agrupar)
        return a.genero === 'Femenino' ? 1 : -1;
      });
  }, [arbitros, searchTerm, filterEstado]);

  // Función para definir colores según estado (Compacta)
  const getEstadoEstilo = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Suspendido': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Inhabilitado': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'En Licencia': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-6">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-100 transition-all text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Panel de Árbitros</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{arbitrosFiltradosYOrdenados.length} Registros encontrados</p>
          </div>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
          <UserPlus size={18} /> Nuevo Árbitro
        </button>
      </div>

      {/* BARRA DE FILTROS (DISEÑO MEJORADO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="BUSCAR POR NOMBRE, CI O USUARIO..." 
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-black text-[10px] uppercase appearance-none cursor-pointer"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="Todos">TODOS LOS ESTADOS</option>
            <option value="Activo">ACTIVO</option>
            <option value="Suspendido">SUSPENDIDO</option>
            <option value="Inhabilitado">INHABILITADO</option>
            <option value="En Licencia">EN LICENCIA</option>
          </select>
        </div>
      </div>

      {/* GRILLA DE CARDS COMPACTAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {arbitrosFiltradosYOrdenados.map((arbitro) => (
          <div 
            key={arbitro.id_arbitro}
            className="bg-white rounded-[2rem] p-4 border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
          >
            {/* Badge de Categoría Jerárquica */}
            <div className="absolute top-0 right-0">
              <div className={`px-4 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-tighter shadow-sm ${
                arbitro.categoria === 'FIFA' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {arbitro.categoria}
              </div>
            </div>

            <div className="flex gap-4 items-start mb-4">
              {/* Foto más pequeña pero estilizada */}
              <div className="relative shrink-0">
                <img 
                  src={arbitro.foto ? `${URL_BACKEND}${arbitro.foto}` : '/default-avatar.png'} 
                  className="w-16 h-16 object-cover rounded-2xl border-2 border-slate-50 shadow-sm"
                  alt={arbitro.nombre}
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${
                  arbitro.estado === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </div>

              <div className="overflow-hidden">
                <h3 className="font-black text-slate-800 text-xs uppercase leading-tight truncate">
                  {arbitro.nombre}
                </h3><h3 className="font-black text-slate-800 text-xs uppercase leading-tight truncate">
                  {arbitro.apellido_paterno} {arbitro.apellido_materno}
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {arbitro.especializacion} • {arbitro.genero}
                </span>
                <div className={`mt-2 px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase inline-block ${getEstadoEstilo(arbitro.estado)}`}>
                  {arbitro.estado}
                </div>
              </div>
            </div>

            {/* Información de Contacto Compacta */}
            <div className="grid grid-cols-2 gap-2 mb-4 border-t border-slate-50 pt-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Phone size={12} className="text-slate-300" />
                <span className="text-[10px] font-bold">{arbitro.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={12} className="text-slate-300" />
                <span className="text-[10px] font-bold">{arbitro.ci}</span>
              </div>
            </div>

            {/* Botón Editar Compacto */}
            <button 
              onClick={() => { setArbitroParaEditar(arbitro); setIsEditModalOpen(true); }}
              className="w-full py-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
            >
              <Edit size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Gestionar Perfil</span>
            </button>
          </div>
        ))}
      </div>

      {/* MODALES */}
      <ModalNuevoArbitro 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchArbitros} 
      />

      <ModalEditarArbitro 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        arbitro={arbitroParaEditar} 
        onSuccess={fetchArbitros} 
      />
    </div>
  );
};

export default ArbitrosPage;