import React from 'react';
import { Clock, MapPin, Trophy, Lock, Edit2, ShieldCheck, Timer, Calendar } from 'lucide-react';

interface PartidoProps {
  partido: any;
  onRefresh: () => void;
  onEdit: () => void;
}

const CardPartido: React.FC<PartidoProps> = ({ partido, onEdit }) => {
  const esFinalizado = partido.estado === 'Finalizado';
  const esEnCurso = partido.estado === 'En Curso';

  // FUNCIÓN PARA CORREGIR EL RETRASO DE FECHA
  const formatearFechaLocal = (fechaISO: string) => {
    if (!fechaISO) return '--/--/--';
    // Dividimos por 'T' para ignorar la parte de la hora y evitar ajustes de zona horaria
    const soloFecha = fechaISO.split('T')[0];
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`group relative flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-[2.5rem] shadow-sm border-2 transition-all duration-300 ${
      esFinalizado 
        ? 'border-slate-100 bg-slate-50/50 opacity-95' 
        : 'border-transparent hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5'
    }`}>
      
      {/* CORRECCIÓN VISUAL: Botón de Edición movido y con z-index alto */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute top-4 right-4 p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl shadow-md border border-slate-100 transition-all hover:scale-110 active:scale-95 z-30"
        title="Gestionar Partido"
      >
        <Edit2 size={16} />
      </button>

      {/* INDICADOR LATERAL DINÁMICO */}
      <div className={`absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full transition-colors ${
        esFinalizado ? 'bg-emerald-400' : esEnCurso ? 'bg-amber-400 animate-pulse' : 'bg-indigo-500'
      }`} />

      {/* IZQUIERDA: LOGÍSTICA (FECHA Y HORA) */}
      <div className="flex flex-col gap-2 w-full md:w-44 mb-4 md:mb-0 ml-4">
        <div className={`flex items-center gap-2 font-black text-sm ${esFinalizado ? 'text-slate-400' : 'text-indigo-600'}`}>
          <Clock size={16} /> 
          <span className="tracking-tight">{partido.hora ? partido.hora.slice(0, 5) : '--:--'}</span>
          {esEnCurso && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
        </div>
        
        {/* CORRECCIÓN: Fecha sin retraso */}
        <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
          <Calendar size={14} className="shrink-0 text-slate-400" />
          <span>{formatearFechaLocal(partido.fecha)}</span>
        </div>

        <div className="flex items-start gap-2 text-slate-600 font-bold text-xs">
          <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" /> 
          <span className="leading-tight">{partido.ubicacion}</span>
        </div>
      </div>

      {/* CENTRO: ENFRENTAMIENTO Y MARCADOR */}
      <div className="flex-1 flex items-center justify-center gap-4 md:gap-8 w-full my-4 md:my-0">
        <div className="text-right flex-1 min-w-0">
          <span className="block font-black text-slate-800 text-base md:text-lg leading-tight truncate">
            {partido.equipo_local}
          </span>
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Local</span>
        </div>
        
        <div className={`flex items-center gap-4 px-6 py-3 rounded-[1.5rem] font-black text-3xl transition-all ${
          esFinalizado 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
            : 'bg-slate-900 text-white shadow-xl shadow-slate-200 group-hover:bg-indigo-600'
        }`}>
          <span>{partido.goles_local ?? 0}</span>
          <span className="text-sm opacity-40">VS</span>
          <span>{partido.goles_visitante ?? 0}</span>
        </div>

        <div className="text-left flex-1 min-w-0">
          <span className="block font-black text-slate-800 text-base md:text-lg leading-tight truncate">
            {partido.equipo_visitante}
          </span>
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Visitante</span>
        </div>
      </div>

      {/* DERECHA: ESTADO Y LIGA (CORRECCIÓN DE ESPACIADO) */}
      <div className="flex flex-col items-end justify-center gap-2 w-full md:w-56 pr-12 mt-4 md:mt-0 relative">
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none break-words">
            {partido.liga}
          </p>
          <p className="text-[9px] font-bold text-indigo-500/70 uppercase leading-none mt-1">
            {partido.categoria}
          </p>
        </div>

        {esFinalizado ? (
          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
            <ShieldCheck size={14} /> Finalizado <Lock size={12} className="ml-1 opacity-50" />
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all ${
            esEnCurso 
              ? 'bg-amber-500 text-white animate-pulse' 
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {esEnCurso ? <Timer size={14} /> : <Trophy size={14} />}
            {esEnCurso ? 'En Vivo' : 'Programado'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPartido;