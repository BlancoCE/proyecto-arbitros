import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Search, Mail, Phone, Edit, UserCog, Hash, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalNuevoAsesor from './ModalNuevoAsesor';
import ModalEditarAsesor from './ModalEditarAsesor';

// 1. Exportamos la interfaz para que los modales puedan usarla sin errores
export interface Asesor {
  id_asesor: number;
  id_usuario: number;
  nombre_usuario: string; 
  ci: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email?: string;
  telefono: string;
  estado: string;
  fecha_nacimiento: string;
  genero: string;
  foto: string | null;
  rol: string;
}

const AsesoresPage = () => {
  const navigate = useNavigate();
  const URL_BACKEND = "import.meta.env.VITE_API_URL";
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [asesorParaEditar, setAsesorParaEditar] = useState<Asesor | null>(null);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAsesores = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${URL_BACKEND}/api/usuarios/asesores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAsesores(response.data);
    } catch (error) {
      console.error("Error al obtener asesores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsesores();
  }, []);

  const filteredAsesores = asesores.filter(a => 
    `${a.nombre} ${a.apellido_paterno} ${a.ci}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (asesor: Asesor) => {
    setAsesorParaEditar(asesor);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/usuarios')}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Gestión de Asesores</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Panel de Control de Personal Administrativo</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <UserPlus size={18} /> Nuevo Asesor
        </button>
      </div>

      {/* Buscador */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, apellido o CI..."
          className="w-full pl-12 pr-6 py-5 bg-white border-none rounded-[2rem] shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Asesores */}
      {loading ? (
        <div className="flex justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest animate-pulse">Cargando Personal...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAsesores.map((asesor) => (
            <div key={asesor.id_asesor} className="group bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
              
              {/* Badge de Estado */}
              <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${
                asesor.estado === 'Activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {asesor.estado === 'Activo' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                {asesor.estado}
              </div>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-[2rem] overflow-hidden ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all">
                    {asesor.foto ? (
                      <img src={`${URL_BACKEND}${asesor.foto}`} alt={asesor.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <UserCog size={40} />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-800 leading-tight uppercase italic">
                  {asesor.nombre} <br/>
                  <span className="text-indigo-600">{asesor.apellido_paterno} {asesor.apellido_materno}</span>
                </h3>
                
                <div className="mt-2 px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {asesor.rol}
                </div>
              </div>

              <div className="mt-8 space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-50">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate text-xs">{asesor.email || 'No asignado'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-xs">{asesor.telefono}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Hash size={16} className="text-slate-400" />
                  <span className="text-xs italic tracking-tighter">CI: {asesor.ci}</span>
                </div>
              </div>

              <button 
                onClick={() => handleEditClick(asesor)}
                className="w-full mt-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2"
              >
                <Edit size={14} /> Editar Perfil
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <ModalNuevoAsesor 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAsesores} 
      />

      <ModalEditarAsesor 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        asesor={asesorParaEditar} 
        onSuccess={fetchAsesores} 
      />
    </div>
  );
};

export default AsesoresPage;