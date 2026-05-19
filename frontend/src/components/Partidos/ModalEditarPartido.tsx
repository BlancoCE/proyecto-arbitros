import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, Trophy, Users, 
  CheckCircle2, Trash2, Save, Shield, AlertTriangle, Info 
} from 'lucide-react';

interface ModalEditarProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  partido: any; // Datos del partido seleccionado
}

const ESTRUCTURA_AFLP: Record<string, string[]> = {
  "División de Ascenso": ["Primera A", "Primera B", "1ra de Ascenso", "2da de Ascenso"],
  "Infanto-Juvenil": ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-19"],
  "Fútbol Femenino": ["Primera A Femenina", "Ascenso Femenino", "Sub-17 Femenina"],
  "Provincial": ["Interprovincial", "Selección de Provincias"],
  "División Profesional": ["Primera División de Bolivia"]
};

export const ModalEditarPartido: React.FC<ModalEditarProps> = ({ isOpen, onClose, onRefresh, partido }) => {
  const [ligaSel, setLigaSel] = useState("");
  const [estadoSel, setEstadoSel] = useState("");

  // Sincronizar estado local con el partido seleccionado al abrir
  useEffect(() => {
    if (partido) {
      setLigaSel(partido.liga || "");
      setEstadoSel(partido.estado || "Programado");
    }
  }, [partido, isOpen]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      fecha: formData.get('fecha'),
      hora: formData.get('hora'),
      ubicacion: formData.get('ubicacion'),
      liga: ligaSel,
      categoria: formData.get('categoria'),
      estado: estadoSel,
      // Mantenemos consistencia con los nombres que espera el Service
      equipo_local_nombre: partido.equipo_local, 
      equipo_visitante_nombre: partido.equipo_visitante,
      goles_local: parseInt(formData.get('goles_local') as string) || 0,
      goles_visitante: parseInt(formData.get('goles_visitante') as string) || 0
    };

    try {
      const res = await fetch(`http://localhost:3001/api/partidos/${partido.id_partido}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar el encuentro entre ${partido.equipo_local} vs ${partido.equipo_visitante}? Esta acción borrará también las planillas y sanciones asociadas.`)) {
      try {
        const res = await fetch(`http://localhost:3001/api/partidos/${partido.id_partido}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          onRefresh();
          onClose();
        }
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  if (!isOpen || !partido) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header con estilo de "Edición" */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Save size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Editar Encuentro</h2>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                ID Partido: <span className="text-indigo-400">#{partido.id_partido}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* SECCIÓN 1: DATOS LOGÍSTICOS */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Info size={14} /> Logística del Partido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-4 text-slate-400" size={18} />
                <input required name="fecha" type="date" defaultValue={partido.fecha?.split('T')[0]} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700" />
              </div>
              <div className="relative">
                <Clock className="absolute left-4 top-4 text-slate-400" size={18} />
                <input required name="hora" type="time" defaultValue={partido.hora} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700" />
              </div>
              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <input required name="ubicacion" defaultValue={partido.ubicacion} placeholder="Ubicación" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CATEGORIZACIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-2">TORNEO</label>
              <select 
                required value={ligaSel} onChange={(e) => setLigaSel(e.target.value)}
                className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(ESTRUCTURA_AFLP).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-2">CATEGORÍA</label>
              <select 
                required name="categoria" defaultValue={partido.categoria}
                className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ligaSel && ESTRUCTURA_AFLP[ligaSel].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* SECCIÓN 3: MARCADOR Y ESTADO (Visualmente destacado) */}
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Trophy size={14} /> Resultado y Estado
              </h3>
              <select 
                value={estadoSel} onChange={(e) => setEstadoSel(e.target.value)}
                className={`text-[10px] font-black px-4 py-1.5 rounded-full border-none outline-none shadow-sm ${
                  estadoSel === 'Finalizado' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                <option value="Programado">📅 Programado</option>
                <option value="En Curso">⏱️ En Curso</option>
                <option value="Finalizado">🏁 Finalizado</option>
              </select>
            </div>

            <div className="flex items-center gap-4 justify-center">
              <div className="flex-1 text-center space-y-2">
                <Shield className="mx-auto text-indigo-500" size={24} />
                <span className="block text-sm font-black text-slate-700 truncate">{partido.equipo_local}</span>
                <input 
                  name="goles_local" type="number" min="0" defaultValue={partido.goles_local}
                  className="w-20 mx-auto p-4 bg-white rounded-2xl shadow-inner text-center text-2xl font-black text-indigo-600 border-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div className="text-slate-300 font-black text-xl">VS</div>

              <div className="flex-1 text-center space-y-2">
                <Shield className="mx-auto text-rose-500" size={24} />
                <span className="block text-sm font-black text-slate-700 truncate">{partido.equipo_visitante}</span>
                <input 
                  name="goles_visitante" type="number" min="0" defaultValue={partido.goles_visitante}
                  className="w-20 mx-auto p-4 bg-white rounded-2xl shadow-inner text-center text-2xl font-black text-rose-600 border-none focus:ring-2 focus:ring-rose-500" 
                />
              </div>
            </div>
            
            {estadoSel === 'Finalizado' && (
              <div className="flex items-center gap-2 justify-center text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-100">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-black uppercase">El resultado se guardará en el historial oficial</span>
              </div>
            )}
          </div>

          {/* BOTONERA DE ACCIONES */}
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              type="button" 
              onClick={handleDelete}
              className="flex-1 py-5 bg-rose-50 text-rose-600 rounded-[1.8rem] font-black text-md hover:bg-rose-100 transition-all flex items-center justify-center gap-2 group"
            >
              <Trash2 size={20} className="group-hover:shake" /> 
              ELIMINAR
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-[1.8rem] font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Save size={24} /> 
              GUARDAR CAMBIOS
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};