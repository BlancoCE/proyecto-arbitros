import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Importación correcta desde la librería axios
import { 
    BarChart3, 
    TrendingUp, 
    Award, 
    Activity, 
    FileText, 
    ClipboardCheck, 
    Download, 
    Layers,
    Calendar,
    Users
} from 'lucide-react';
import GraficoRadar from '../components/Reportes/GraficoRadar';
import GraficoEvolucion from '../components/Reportes/GraficoEvolucion';
import { ReportePdfService } from '../utils/ReportePdfService';

const Reportes: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [listaArbitros, setListaArbitros] = useState<any[]>([]);
    const [idSeleccionado, setIdSeleccionado] = useState<string>('');
    const [anioFiltro, setAnioFiltro] = useState<string>('2026');
    const [tabActiva, setTabActiva] = useState<'campo' | 'fisicas' | 'escritas'>('campo');
    const [isExporting, setIsExporting] = useState(false);
    
    const auth = JSON.parse(sessionStorage.getItem('user_auth') || '{}');
    const isAdmin = auth.rol !== 'arbitro';

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
                    console.error("Error al cargar lista de árbitros:", err);
                }
            };
            fetchLista();
        }
    }, [isAdmin]);

    useEffect(() => {
        const fetchReportes = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const url = idSeleccionado 
                    ? `${import.meta.env.VITE_API_URL}/api/reportes/desempeno/${idSeleccionado}?anio=${anioFiltro}`
                    : `${import.meta.env.VITE_API_URL}/api/reportes/desempeno?anio=${anioFiltro}`;
                    
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error("Error al cargar métricas de reportes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportes();
    }, [idSeleccionado, anioFiltro]);

    const handleExportPDF = async () => {
        if (!data) return;
        setIsExporting(true);
        try {
            if (data.tipo === 'global') {
                ReportePdfService.exportarGlobalLiga(data.dataset, anioFiltro);
            } else {
                let nombreArbitro = `${auth.apellido_paterno || ''} ${auth.nombre || ''}`;
                if (isAdmin && idSeleccionado) {
                    const arbEncontrado = listaArbitros.find((a: any) => String(a.id_usuario) === String(idSeleccionado));
                    if (arbEncontrado) {
                        nombreArbitro = `${arbEncontrado.apellido_paterno} ${arbEncontrado.apellido_materno || ''}, ${arbEncontrado.nombre}`;
                    }
                }
                ReportePdfService.exportarIndividual(data, nombreArbitro);
            }
        } catch (error) {
            console.error("Error generando PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (loading && !data) return (
        <div className="p-4 md:p-10 h-screen flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs px-4">Sincronizando registros analíticos institucionales...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
            
            {/* ENCABEZADO PREMIUM ESTILO DASHBOARD */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Módulo <span className="text-indigo-600">Analítico Estadístico</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-1 leading-relaxed">
                        Consolidado multidimensional de rendimiento físico, teórico y de campo - AFLP
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:min-w-[140px] sm:flex-1 lg:flex-none">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                            <Calendar size={10} /> Gestión Fiscal
                        </span>
                        <select
                            value={anioFiltro}
                            onChange={(e) => setAnioFiltro(e.target.value)}
                            className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none text-xs cursor-pointer focus:border-indigo-500 transition-all w-full"
                        >
                            <option value="2026">Gestión 2026</option>
                            <option value="2025">Gestión 2025</option>
                            <option value="2024">Gestión 2024</option>
                        </select>
                    </div>

                    {isAdmin && (
                        <div className="flex flex-col gap-1 w-full sm:min-w-[260px] sm:flex-[2] lg:flex-none">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">Selección de Personal</span>
                            <select 
                                value={idSeleccionado}
                                onChange={(e) => setIdSeleccionado(e.target.value)}
                                className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none text-xs cursor-pointer focus:border-indigo-500 transition-all w-full"
                            >
                                <option value="">Estadísticas Generales (Vista Global)</option>
                                {listaArbitros.map((arb: any) => (
                                    <option key={arb.id_usuario} value={arb.id_usuario}>
                                        {arb.apellido_paterno} {arb.apellido_materno || ''}, {arb.nombre} ({arb.categoria})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-[46px] shadow-sm w-full sm:w-auto sm:self-end"
                    >
                        {isExporting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Download size={14} />
                        )}
                        {isExporting ? 'Procesando...' : (data?.tipo === 'global' ? 'Exportar Escalafón' : 'Exportar Ficha PDF')}
                    </button>
                </div>
            </div>

            {/* MANEJO DE VISTA INDIVIDUAL (ÁRBITRO SELECCIONADO) */}
            {data?.tipo !== 'global' ? (
                <>
                    {/* Contenedor con scroll horizontal en móviles para que las pestañas no se amontonen */}
                    <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5">
                        <button 
                            onClick={() => setTabActiva('campo')} 
                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-t-xl sm:rounded-t-2xl font-black text-xs uppercase border-b-2 transition-all whitespace-nowrap ${tabActiva === 'campo' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <Layers size={14} /> Rendimiento en Campo
                        </button>
                        <button 
                            onClick={() => setTabActiva('fisicas')} 
                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-t-xl sm:rounded-t-2xl font-black text-xs uppercase border-b-2 transition-all whitespace-nowrap ${tabActiva === 'fisicas' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <Activity size={14} /> Pruebas Físicas Anuales
                        </button>
                        <button 
                            onClick={() => setTabActiva('escritas')} 
                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-t-xl sm:rounded-t-2xl font-black text-xs uppercase border-b-2 transition-all whitespace-nowrap ${tabActiva === 'escritas' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <FileText size={14} /> Evaluaciones Escritas
                        </button>
                    </div>

                    {tabActiva === 'campo' && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                <KPICard title="Promedio Calificaciones" value={`${data?.resumen?.promedio_general || '0.00'} pts`} icon={<Award size={20} className="text-indigo-600" />} color="bg-slate-900" />
                                <KPICard title="Partidos Evaluados" value={`${data?.resumen?.partidos_evaluados || '0'}`} icon={<BarChart3 size={20} className="text-indigo-500" />} color="bg-white" />
                                <KPICard title="Criterio Físico Promedio" value={`${data?.resumen?.avg_fisico || '0.00'} pts`} icon={<Activity size={20} className="text-emerald-500" />} color="bg-white" />
                                <KPICard title="Nota Técnica Campo" value={`${data?.resumen?.avg_tecnico || '0.00'} pts`} icon={<TrendingUp size={20} className="text-sky-500" />} color="bg-white" />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:grid-cols-1 sm:gap-8">
                                <div className="lg:col-span-1 h-fit">
                                    <GraficoRadar data={data?.graficoRadar || []} />
                                </div>
                                <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl border border-slate-100 flex flex-col justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Curva de Evolución Temporal</h3>
                                    <div className="flex-1 min-h-[280px] sm:min-h-[320px] w-full">
                                        <GraficoEvolucion data={data?.graficoLineal || []} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tabActiva === 'fisicas' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                                <KPICard title="Total Tests Rendidos" value={`${data?.resumen?.pruebas_fisicas_hechas || '0'}`} icon={<Activity size={20} className="text-emerald-500" />} color="bg-slate-900" />
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <h4 className="text-xs font-black uppercase text-slate-800 mb-2">Protocolos de Carga Física</h4>
                                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase">
                                        Las disciplines exigidas (Coda, YoYo, Ariet) se evalúan conforme a la Especialización (Central o Asistente) del colegiado.
                                    </p>
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-6 shadow-xl border border-slate-100 overflow-hidden">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Historial de Exámenes de Aptitud Física</h3>
                                <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
                                    <table className="w-full text-left text-xs font-bold text-slate-600 min-w-[500px]">
                                        <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 border-b">
                                            <tr>
                                                <th className="p-3">Fecha</th>
                                                <th className="p-3">Tipo de Test</th>
                                                <th className="p-3">Agilidad</th>
                                                <th className="p-3">Velocidad</th>
                                                <th className="p-3">Resistencia</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {data?.historialFisico?.length > 0 ? (
                                                data.historialFisico.map((f: any, i: number) => (
                                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="p-3 text-slate-900 font-black">{new Date(f.fecha).toLocaleDateString('es-ES')}</td>
                                                        <td className="p-3 uppercase text-indigo-600">{f.tipo_prueba}</td>
                                                        <td className="p-3 font-mono text-slate-500">{f.agilidad || 'N/A'}</td>
                                                        <td className="p-3 font-mono text-slate-500">{f.velocidad || 'N/A'}</td>
                                                        <td className="p-3 font-mono text-slate-500">{f.resistencia || 'N/A'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sin pruebas registradas.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {tabActiva === 'escritas' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                                <KPICard title="Promedio de Exámenes" value={`${data?.resumen?.avg_pruebas_escritas || '0.00'} pts`} icon={<ClipboardCheck size={20} className="text-indigo-500" />} color="bg-slate-900" />
                                <KPICard title="Evaluaciones Hechas" value={`${data?.resumen?.examenes_rendidos || '0'}`} icon={<FileText size={20} className="text-slate-400" />} color="bg-white" />
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-6 shadow-xl border border-slate-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Notas de Reglamento de Juego</h3>
                                <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
                                    <table className="w-full text-left text-xs font-bold text-slate-600 min-w-[450px]">
                                        <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 border-b">
                                            <tr>
                                                <th className="p-3">Fecha</th>
                                                <th className="p-3">Temario Evaluado</th>
                                                <th className="p-3 text-right">Calificación</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-slate-700">
                                            {data?.historialEscrito?.length > 0 ? (
                                                data.historialEscrito.map((e: any, i: number) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-3">{new Date(e.fecha).toLocaleDateString('es-ES')}</td>
                                                        <td className="p-3 font-black uppercase text-slate-900">{e.tema}</td>
                                                        <td className="p-3 text-right font-black text-indigo-600">{e.nota} / 100</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sin exámenes registrados.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* VISTA GLOBAL COMPLETA */
                <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                    
                    {/* PARTE A: TARJETAS DE PROMEDIOS GENERALES DEL COLEGIO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <KPICard title="Promedio General Colegio" value={`${data?.resumen?.promedio_general || '0.00'} pts`} icon={<Award size={20} className="text-indigo-600" />} color="bg-slate-900" />
                        <KPICard title="Total Partidos Evaluados" value={`${data?.resumen?.partidos_evaluados || '0'}`} icon={<BarChart3 size={20} className="text-indigo-500" />} color="bg-white" />
                        <KPICard title="Criterio Físico General" value={`${data?.resumen?.avg_fisico || '0.00'} pts`} icon={<Activity size={20} className="text-emerald-500" />} color="bg-white" />
                        <KPICard title="Nota Técnica Campo" value={`${data?.resumen?.avg_tecnico || '0.00'} pts`} icon={<TrendingUp size={20} className="text-sky-500" />} color="bg-white" />
                    </div>

                    {/* PARTE B: ANÁLISIS Y GRÁFICO DE RENDIMIENTO GENERAL DE CAMPO */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="lg:col-span-1 h-fit">
                            <GraficoRadar data={data?.graficoRadar || []} />
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl border border-slate-100 flex flex-col justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Gráfico de Rendimiento de Campo General (Evolución Institucional)</h3>
                            <div className="flex-1 min-h-[280px] sm:min-h-[320px] w-full">
                                <GraficoEvolucion data={data?.graficoLineal || []} />
                            </div>
                        </div>
                    </div>

                    {/* PARTE C: TABLA DEL ESCALAFÓN DE TODOS LOS ÁRBITROS */}
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl border border-slate-100">
                        <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-base font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
                                    <Users size={18} className="text-indigo-600"/> Escalafón Institucional AFLP ({anioFiltro})
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ordenamiento en Base a Categorías y Rangos Oficiales</p>
                            </div>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2 rounded-full uppercase tracking-wider w-fit">
                                {data?.dataset?.length || 0} Árbitros en Sistema
                            </span>
                        </div>
                        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
                            <table className="w-full text-left text-xs font-bold text-slate-600 min-w-[700px]">
                                <thead className="bg-slate-900 text-[10px] uppercase text-white rounded-xl">
                                    <tr>
                                        <th className="p-4 rounded-l-xl">N°</th>
                                        <th className="p-4">Apellidos y Nombres</th>
                                        <th className="p-4">Categoría / Rango</th>
                                        <th className="p-4 text-center">Prom. Campo</th>
                                        <th className="p-4 text-center">Prom. Escrito</th>
                                        <th className="p-4 text-center rounded-r-xl">Tests Físicos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {data?.dataset?.map((arb: any, idx: number) => (
                                        <tr key={arb.id_usuario} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 text-slate-400 font-mono">{idx + 1}</td>
                                            <td className="p-4 text-slate-900 font-black uppercase">{arb.apellido_paterno} {arb.apellido_materno || ''}, {arb.nombre}</td>
                                            <td className="p-4">
                                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[9px] font-black uppercase border border-slate-200/60 inline-block">
                                                    {arb.categoria} — {arb.tipo_arbitro || 'Sin Especialidad'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-indigo-600 font-black">{arb.prom_campo} pts</td>
                                            <td className="p-4 text-center text-emerald-600 font-black">{arb.prom_escrito} pts</td>
                                            <td className="p-4 text-center font-mono text-slate-500">{arb.fisicos_hechos}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

// Subcomponente encapsulado con responsividad interna optimizada
const KPICard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
    <div className={`${color === 'bg-slate-900' ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-white text-slate-900 border border-slate-100'} p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl flex flex-col gap-4 transition-all hover:scale-[1.01]`}>
        <div className={`p-2.5 w-fit rounded-xl ${color === 'bg-slate-900' ? 'bg-slate-800' : 'bg-slate-50'}`}>
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
            <p className="text-xl sm:text-2xl font-black tracking-tighter mt-1">{value}</p>
        </div>
    </div>
);

export default Reportes;