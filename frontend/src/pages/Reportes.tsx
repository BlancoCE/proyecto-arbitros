import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Award, Activity, UserSearch } from 'lucide-react';
import GraficoRadar from '../components/Reportes/GraficoRadar';
import GraficoEvolucion from '../components/Reportes/GraficoEvolucion';

const Reportes: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [listaArbitros, setListaArbitros] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState('');

    // Recuperamos info del usuario para manejo de roles
    const auth = JSON.parse(sessionStorage.getItem('user_auth') || '{}');
    const isAdmin = auth.rol !== 'arbitro';

    // 1. Cargar lista de árbitros si el usuario es Admin/Asesor
    useEffect(() => {
        if (isAdmin) {
            const fetchLista = async () => {
                try {
                    const token = sessionStorage.getItem('token');
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reportes/lista-arbitros`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setListaArbitros(res.data);
                } catch (err) {
                    console.error("Error al cargar lista de árbitros", err);
                }
            };
            fetchLista();
        }
    }, [isAdmin]);

    // 2. Cargar datos del reporte (se dispara al iniciar o al cambiar el árbitro seleccionado)
    useEffect(() => {
        const fetchReportes = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            
            // Ajustamos la URL para que coincida con el cambio del backend
            const url = idSeleccionado 
                ? `${import.meta.env.VITE_API_URL}/api/reportes/desempeno/${idSeleccionado}` // <--- 'desempeno'
                : `${import.meta.env.VITE_API_URL}/api/reportes/desempeno`;                // <--- 'desempeno'
                
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error("Error al cargar métricas", err);
        } finally {
            setLoading(false);
        }
    };
        fetchReportes();
    }, [idSeleccionado]);

    if (loading && !data) return (
        <div className="p-10 h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Procesando Estadísticas...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-700">
            
            {/* HEADER DINÁMICO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        Análisis de <span className="text-amber-500">Rendimiento</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">
                        {idSeleccionado ? 'Visualizando perfil seleccionado' : 'Tu evolución técnica y física'}
                    </p>
                </div>

                {/* SELECTOR PREMIUM PARA ADMINS */}
                {isAdmin && (
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                            <UserSearch size={12} /> Seleccionar Árbitro
                        </label>
                        <select 
                            value={idSeleccionado}
                            onChange={(e) => setIdSeleccionado(e.target.value)}
                            className="bg-white border-2 border-slate-100 p-4 rounded-[1.5rem] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm min-w-[280px] appearance-none"
                        >
                            <option value="">Mi Reporte Personal</option>
                            {listaArbitros.map((arb: any) => (
                                <option key={arb.id_usuario} value={arb.id_usuario}>
                                    {arb.apellido_paterno} {arb.apellido_materno}, {arb.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* GRID DE CARDS KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Promedio General" 
                    value={data?.resumen?.promedio_general || '0.0'} 
                    icon={<Award className="text-amber-500" />}
                    color="bg-slate-900"
                />
                <KPICard 
                    title="Partidos Evaluados" 
                    value={data?.resumen?.partidos_evaluados || '0'} 
                    icon={<BarChart3 className="text-indigo-500" />}
                    color="bg-white"
                />
                <KPICard 
                    title="Rendimiento Físico" 
                    value={`${data?.resumen?.avg_fisico || '0'}%`} 
                    icon={<Activity className="text-rose-500" />}
                    color="bg-white"
                />
                <KPICard 
                    title="Tendencia (Última)" 
                    value={data?.resumen?.ultima_nota || 'N/A'} 
                    icon={<TrendingUp className="text-emerald-500" />}
                    color="bg-white"
                />
            </div>

            {/* SECCIÓN DE VISUALIZACIÓN GRÁFICA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Radar Chart (33%) */}
                <div className="lg:col-span-1">
                    <GraficoRadar data={data?.graficoRadar || []} />
                </div>
                
                {/* Evolution Chart (66%) */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col">
                    <div className="flex justify-between items-center mb-10 px-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Evolución Temporal de Notas
                        </h3>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1 bg-amber-500 rounded-full"></div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Nota Final</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1 bg-indigo-400 opacity-40 rounded-full border-t border-dashed"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Promedio Técnico</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[350px] h-[350px] w-full"> 
                        <GraficoEvolucion data={data?.graficoLineal || []} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-componente interno para consistencia visual
const KPICard = ({ title, value, icon, color }: any) => (
    <div className={`${color === 'bg-slate-900' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 flex flex-col gap-6 border border-slate-50 hover:scale-[1.02] transition-transform duration-300`}>
        <div className={`p-3 w-fit rounded-2xl shadow-inner ${color === 'bg-slate-900' ? 'bg-slate-800' : 'bg-slate-50'}`}>
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
            <p className="text-4xl font-black tracking-tighter mt-1">{value}</p>
        </div>
    </div>
);

export default Reportes;