import React, { useState } from 'react';
import { X, ShieldCheck, ClipboardCheck, Calendar, MapPin, Trophy } from 'lucide-react';
import FormularioEvaluacion from './FormularioEvaluacion';

interface ModalDetalleProps {
    partido: any;
    onClose: () => void;
}

const ModalDetalleHistorial: React.FC<ModalDetalleProps> = ({ partido, onClose }) => {
    const [mostrarEvaluacion, setMostrarEvaluacion] = useState(false);
    const terna = partido.terna_nombres || {};
    
    const auth = JSON.parse(sessionStorage.getItem('user_auth') || '{}');
    const rolesAutorizados = ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones', 'Asesor Técnico'];
    const puedeEvaluar = rolesAutorizados.includes(auth.rol);

    const ordenRoles = ["Central", "Asistente 1", "Asistente 2", "Cuarto Árbitro"];

    if (mostrarEvaluacion) {
        return (
            <FormularioEvaluacion 
                partido={partido} 
                onClose={() => setMostrarEvaluacion(false)} 
                onSuccess={() => {
                    setMostrarEvaluacion(false);
                    onClose();
                }} 
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            {/* Contenedor Principal con altura máxima y scroll */}
            <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden border border-white/20">
                
                {/* Botón de cerrar fijo para que siempre sea visible */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-10 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* Zona con Scroll */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-8 pt-12 text-center">
                        <div className="inline-flex p-4 bg-white rounded-[2rem] text-indigo-600 shadow-xl shadow-indigo-100/50 mb-6">
                            <ShieldCheck size={40} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            Detalles
                        </h2>
                        <p className="text-slate-500 font-bold text-[10px] mt-2 tracking-widest uppercase opacity-70">
                            Registro Oficial de Designación
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Info del Partido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                                <Calendar className="text-indigo-500" size={18} />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Fecha y Hora</p>
                                    <p className="text-sm font-bold text-slate-700">{partido.fecha?.split('T')[0]} - {partido.hora?.substring(0,5)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                                <MapPin className="text-rose-500" size={18} />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Ubicación</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">{partido.ubicacion || 'No asignada'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Equipos */}
                        <div className="flex items-center justify-between px-6 py-5 bg-indigo-600 rounded-[2rem] text-white shadow-lg shadow-indigo-200">
                            <div className="text-center flex-1">
                                <p className="text-xs font-black uppercase leading-tight">{partido.equipo_local}</p>
                            </div>
                            <div className="px-4 text-indigo-300 font-black italic text-xs">VS</div>
                            <div className="text-center flex-1">
                                <p className="text-xs font-black uppercase leading-tight">{partido.equipo_visitante}</p>
                            </div>
                        </div>

                        {/* Terna Arbitral */}
                        <div>
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Cuerpo Arbitral</h3>
                            <div className="space-y-3">
                                {ordenRoles.map(rol => {
                                    const nombre = terna[rol];
                                    if (!nombre) return null;
                                    return (
                                        <div key={rol} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                            <span className="text-[9px] font-black text-indigo-500 uppercase px-3 py-1 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                {rol}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800 uppercase italic">
                                                {nombre}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Acción de Evaluación */}
                        {puedeEvaluar && (
                            <button 
                                onClick={() => setMostrarEvaluacion(true)}
                                className="w-full py-5 bg-amber-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-amber-200 flex items-center justify-center gap-3"
                            >
                                <ClipboardCheck size={20} />
                                Evaluar Desempeño
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Fijo */}
                <div className="bg-slate-900 p-4 text-center shrink-0">
                    <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">
                        AFLP • {partido.torneo}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleHistorial;