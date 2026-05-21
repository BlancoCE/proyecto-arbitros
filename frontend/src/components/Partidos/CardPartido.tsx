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
    const soloFecha = fechaISO.split('T')[0];
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`group relative flex flex-col lg:flex-row items-center justify-between p-5 sm:p-6 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border-2 transition-all duration-300 gap-4 lg:gap-0 ${
      esFinalizado 
        ? 'border-slate-100 bg-slate-50/50 opacity-95' 
        : 'border-transparent hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5'
    }`}>
      
      {/* BOTÓN DE EDICIÓN RESPONSIVO Y ACCESIBLE */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute top-4 right-4 p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl sm:rounded-2xl shadow-md border border-slate-100 transition-all hover:scale-110 active:scale-95 z-30"
        title="Gestionar Partido"
      >
        <Edit2 size={15} />
      </button>

      {/* INDICADOR LATERAL DINÁMICO */}
      <div className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full transition-colors ${
        esFinalizado ? 'bg-emerald-400' : esEnCurso ? 'bg-amber-400 animate-pulse' : 'bg-indigo-500'
      }`} />

      {/* IZQUIERDA: LOGÍSTICA (FECHA Y HORA) */}
      <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-2 w-full lg:w-44 pl-2 pr-10 lg:pr-0 border-b lg:border-b-0 pb-3 lg:pb-0 border-slate-100">
        <div className="space-y-1">
          <div className={`flex items-center gap-2 font-black text-sm ${esFinalizado ? 'text-slate-400' : 'text-indigo-600'}`}>
            <Clock size={16} /> 
            <span className="tracking-tight">{partido.hora ? partido.hora.slice(0, 5) : '--:--'}</span>
            {esEnCurso && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
            <Calendar size={14} className="shrink-0 text-slate-400" />
            <span>{formatearFechaLocal(partido.fecha)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-600 font-bold text-xs max-w-[60%] lg:max-w-none text-right lg:text-left">
          <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400 hidden lg:block" /> 
          <span className="leading-tight truncate lg:whitespace-normal">{partido.ubicacion}</span>
        </div>
      </div>

      {/* CENTRO: ENFRENTAMIENTO Y MARCADOR EXTREMADAMENTE FLUIDO */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full lg:flex-1 my-2 lg:my-0 px-2 sm:px-4">
        {/* Local */}
        <div className="text-center sm:text-right flex-1 min-w-0">
          <span className="block font-black text-slate-800 text-sm sm:text-base md:text-lg leading-tight truncate">
            {partido.equipo_local}
          </span>
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block mt-0.5">Local</span>
        </div>
        
        {/* Marcador */}
        <div className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-[1.5rem] font-black text-xl sm:text-3xl transition-all shrink-0 ${
          esFinalizado 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
            : 'bg-slate-900 text-white shadow-xl shadow-slate-200 group-hover:bg-indigo-600'
        }`}>
          <span>{partido.goles_local ?? 0}</span>
          <span className="text-xs sm:text-sm opacity-40 font-bold">VS</span>
          <span>{partido.goles_visitante ?? 0}</span>
        </div>

        {/* Visitante */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <span className="block font-black text-slate-800 text-sm sm:text-base md:text-lg leading-tight truncate">
            {partido.equipo_visitante}
          </span>
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block mt-0.5">Visitante</span>
        </div>
      </div>

      {/* DERECHA: ESTADO Y LIGA */}
      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 w-full lg:w-52 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:pl-4">
        <div className="text-left lg:text-right max-w-[60%] lg:max-w-none">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight truncate sm:whitespace-normal">
            {partido.liga}
          </p>
          <p className="text-[9px] font-bold text-indigo-500/70 uppercase leading-none mt-1">
            {partido.categoria}
          </p>
        </div>

        {esFinalizado ? (
          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] sm:text-[10px] uppercase bg-emerald-50 px-3 sm:px-4 py-2 rounded-xl border border-emerald-100 shadow-sm shrink-0">
            <ShieldCheck size={13} /> Finalizado <Lock size={11} className="ml-0.5 opacity-50" />
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm transition-all shrink-0 ${
            esEnCurso 
              ? 'bg-amber-500 text-white animate-pulse' 
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {esEnCurso ? <Timer size={13} /> : <Trophy size={13} />}
            {esEnCurso ? 'En Vivo' : 'Programado'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPartido;