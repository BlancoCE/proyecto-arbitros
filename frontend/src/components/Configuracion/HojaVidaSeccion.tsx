import React from 'react';
import { Award, Target, BookOpen, Star, Download, Shield } from 'lucide-react';

const HojaVidaSeccion = ({ datos }: any) => {
    
    const infoCardStyle = "bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-2";

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic">Hoja de Vida Profesional</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase">Resumen de tu trayectoria y credenciales en el arbitraje.</p>
                </div>
                {/*<button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100">
                    <Download size={14} /> Exportar CV (PDF)
                </button>*/}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Categoría */}
                <div className={infoCardStyle}>
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-2">
                        <Award size={20} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría Actual</span>
                    <span className="text-lg font-black text-slate-700 uppercase italic">{datos?.categoria || 'Sin definir'}</span>
                </div>

                {/* Especialidad */}
                <div className={infoCardStyle}>
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-2">
                        <Shield size={20} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidad</span>
                    <span className="text-lg font-black text-slate-700 uppercase italic">{datos?.especializacion || 'General'}</span>
                </div>

                {/* Estado Colegiado */}
                <div className={infoCardStyle}>
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
                        <Target size={20} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado en Colegio</span>
                    <span className="text-lg font-black text-emerald-600 uppercase italic">{datos?.estado_arbitro || 'Activo'}</span>
                </div>
            </div>

            {/* Timeline o Información Adicional Proyectada */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Star size={120} />
                </div>
                
                <div className="relative z-10">
                    <h3 className="text-xl font-black uppercase italic mb-4">Trayectoria Destacada</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full"></div>
                            <div>
                                <p className="text-sm font-bold">Inscrito en el Colegio de Árbitros de La Paz</p>
                                <p className="text-[10px] text-slate-400 uppercase">Miembro desde: {new Date(datos?.fecha_registro).getFullYear() || '2024'}</p>
                            </div>
                        </div>
                        {/* Aquí podrías mapear experiencia real si tuvieras una tabla de historial_arbitro */}
                        <div className="flex gap-4 items-start opacity-50">
                            <div className="w-2 h-2 mt-2 bg-slate-500 rounded-full"></div>
                            <div>
                                <p className="text-sm font-bold">Módulo de Experiencia en Partidos (Próximamente)</p>
                                <p className="text-[10px] text-slate-400 uppercase">Sincronización automática con planilla de juego</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="mt-8 text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Certificado oficial generado por la Comisión de Arbitraje
            </p>
        </div>
    );
};

export default HojaVidaSeccion;