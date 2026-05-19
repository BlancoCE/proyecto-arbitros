import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, Trophy, Users, 
  CheckCircle2, AlertCircle, Shield, Info 
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const ESTRUCTURA_AFLP: Record<string, string[]> = {
  "División de Ascenso": ["Primera A", "Primera B", "1ra de Ascenso", "2da de Ascenso"],
  "Infanto-Juvenil": ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-19"],
  "Fútbol Femenino": ["Primera A Femenina", "Ascenso Femenino", "Sub-17 Femenina"],
  "Provincial": ["Interprovincial", "Selección de Provincias"],
  "División Profesional": ["Primera División de Bolivia"]
};

export const ModalNuevoPartido: React.FC<ModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const [ligaSel, setLigaSel] = useState("");
  const [estadoSel, setEstadoSel] = useState("Programado");
  const [equiposSugeridos, setEquiposSugeridos] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3001/api/equipos-sugeridos')
        .then(res => res.json())
        .then(data => setEquiposSugeridos(data))
        .catch(err => console.error("Error cargando equipos:", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // IMPORTANTE: Los nombres coinciden con lo que espera el Backend transaccional
    const payload = {
      fecha: formData.get('fecha'),
      hora: formData.get('hora'),
      ubicacion: formData.get('ubicacion'),
      liga: ligaSel,
      categoria: formData.get('categoria'),
      estado: estadoSel,
      equipo_local_nombre: formData.get('equipo_local'),
      equipo_visitante_nombre: formData.get('equipo_visitante'),
      goles_local: parseInt(formData.get('goles_local') as string) || 0,
      goles_visitante: parseInt(formData.get('goles_visitante') as string) || 0
    };

    try {
      const res = await fetch('http://localhost:3001/api/partidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        const error = await res.json();
        alert("Error: " + error.message);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header con Gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Trophy size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">NUEVO PARTIDO</h2>
              <p className="text-indigo-100 text-sm font-medium">Programación y Apertura de Planilla</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* SECCIÓN 1: DATOS DEL ENCUENTRO */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Info size={14} /> Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <Calendar className="absolute left-4 top-4 text-indigo-500 group-focus-within:scale-110 transition-transform" size={18} />
                <input required name="fecha" type="date" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
              </div>
              <div className="relative group">
                <Clock className="absolute left-4 top-4 text-indigo-500 group-focus-within:scale-110 transition-transform" size={18} />
                <input required name="hora" type="time" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
              </div>
              <div className="md:col-span-2 relative group">
                <MapPin className="absolute left-4 top-4 text-indigo-500 group-focus-within:scale-110 transition-transform" size={18} />
                <input required name="ubicacion" placeholder="Estadio / Sede del encuentro" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: COMPETICIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 ml-2">TORNEO / LIGA</label>
              <select 
                required 
                value={ligaSel} 
                onChange={(e) => setLigaSel(e.target.value)}
                className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar...</option>
                {Object.keys(ESTRUCTURA_AFLP).map(liga => <option key={liga} value={liga}>{liga}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 ml-2">CATEGORÍA</label>
              <select 
                required 
                name="categoria"
                disabled={!ligaSel}
                className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                {ligaSel && ESTRUCTURA_AFLP[ligaSel].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* SECCIÓN 3: ENFRENTAMIENTO (Datalist para sugerencias) */}
          <div className="bg-indigo-50 p-6 rounded-[2rem] space-y-4 border border-indigo-100">
            <h3 className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest">
              <Users size={14} /> Duelo de Equipos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Local</span>
                </div>
                <input 
                  required 
                  name="equipo_local" 
                  list="equipos-list"
                  placeholder="Nombre del club"
                  className="w-full p-4 bg-white rounded-2xl shadow-sm border-none font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-rose-600" />
                  <span className="text-[10px] font-black text-rose-600 uppercase">Visitante</span>
                </div>
                <input 
                  required 
                  name="equipo_visitante" 
                  list="equipos-list"
                  placeholder="Nombre del club"
                  className="w-full p-4 bg-white rounded-2xl shadow-sm border-none font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>

            <datalist id="equipos-list">
              {equiposSugeridos.map(e => <option key={e} value={e} />)}
            </datalist>

            {/* MARCADOR INICIAL (Solo si ya se jugó) */}
            <div className="pt-4 border-t border-indigo-200/50">
               <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-500">¿El partido ya se disputó?</label>
                  <select 
                    value={estadoSel} 
                    onChange={(e) => setEstadoSel(e.target.value)}
                    className="text-xs font-black bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full border-none outline-none"
                  >
                    <option value="Programado">Programado</option>
                    <option value="Finalizado">Ya finalizado</option>
                  </select>
               </div>
               
               {estadoSel === 'Finalizado' && (
                 <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                   <input name="goles_local" type="number" placeholder="Goles Local" min="0" className="p-3 rounded-xl bg-white text-center font-black text-xl border-none focus:ring-2 focus:ring-emerald-500" />
                   <input name="goles_visitante" type="number" placeholder="Goles Vis." min="0" className="p-3 rounded-xl bg-white text-center font-black text-xl border-none focus:ring-2 focus:ring-emerald-500" />
                 </div>
               )}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-[1.8rem] font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <CheckCircle2 size={24} /> 
            CREAR Y PUBLICAR PARTIDO
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            Al crear el partido se habilitará automáticamente la planilla de árbitros y jugadores.
          </p>

        </form>
      </div>
    </div>
  );
};