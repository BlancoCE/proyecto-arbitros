import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, User, Calendar, CheckCircle, X, ShieldCheck, Search, Filter } from 'lucide-react';
import axios from 'axios';
import MatrizAsistencia from './MatrizAsistencia';

const HistorialAsistencia = () => {
    const [resumen, setResumen] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [faltasDetalle, setFaltasDetalle] = useState([]);
    const [arbitroSeleccionado, setArbitroSeleccionado] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Estados para Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('Todos');

    const cargarResumen = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/asistencia/resumen-faltas');
            
            // Lógica de Orden Jerárquico (FIFA -> 1ra -> 2da -> 3ra -> 4ta)
            const ordenCat: any = { 
                'FIFA': 1, 
                'PRIMERA': 2, '1RA': 2, 
                'SEGUNDA': 3, '2DA': 3, 
                'TERCERA': 4, '3RA': 4, 
                'CUARTA': 5, '4TA': 5 
            };

            const datosOrdenados = res.data.sort((a: any, b: any) => {
                const catA = ordenCat[a.categoria?.toUpperCase().trim()] || 99;
                const catB = ordenCat[b.categoria?.toUpperCase().trim()] || 99;
                
                if (catA !== catB) return catA - catB;
                return a.apellido_paterno.localeCompare(b.apellido_paterno);
            });

            setResumen(datosOrdenados);
        } catch (err) {
            console.error("Error al cargar resumen:", err);
        }
    };

    useEffect(() => {
        cargarResumen();
    }, []);

    // Lógica de filtrado corregida
    const arbitrosFiltrados = resumen.filter((r: any) => {
        const matchesNombre = r.nombre_completo.toLowerCase().includes(busqueda.toLowerCase());
        
        // Normalización para que el filtro de categoría funcione siempre
        const catArbitro = r.categoria?.toUpperCase().trim();
        const matchesCat = filtroCategoria === 'Todos' || 
                          (filtroCategoria === 'FIFA' && catArbitro === 'FIFA') ||
                          (filtroCategoria === 'Primera' && (catArbitro === 'PRIMERA' || catArbitro === '1RA')) ||
                          (filtroCategoria === 'Segunda' && (catArbitro === 'SEGUNDA' || catArbitro === '2DA')) ||
                          (filtroCategoria === 'Tercera' && (catArbitro === 'TERCERA' || catArbitro === '3RA')) ||
                          (filtroCategoria === 'Cuarta' && (catArbitro === 'CUARTA' || catArbitro === '4TA'));

        const matchesEsp = filtroEspecialidad === 'Todos' || r.especializacion === filtroEspecialidad;

        return matchesNombre && matchesCat && matchesEsp;
    });

    const abrirJustificador = async (arbitro: any) => {
        setArbitroSeleccionado(arbitro);
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3001/api/asistencia/detalle-faltas/${arbitro.id_arbitro}`);
            setFaltasDetalle(res.data);
            setModalOpen(true);
        } catch (err) {
            alert("Error al obtener detalle de faltas");
        } finally {
            setLoading(false);
        }
    };

    const aplicarJustificacion = async (idAsistencia: number) => {
        if (!window.confirm("¿Desea justificar esta falta? Esto la eliminará del conteo del Art. 7")) return;
        try {
            await axios.put('http://localhost:3001/api/asistencia/justificar', { id_asistencia: idAsistencia });
            setFaltasDetalle(faltasDetalle.filter((f: any) => f.id_asistencia !== idAsistencia));
            cargarResumen(); // Recargar datos para actualizar contadores
        } catch (err) {
            alert("No se pudo procesar la justificación");
        }
    };

    return (
        <div className="p-6 space-y-10">
            {/* SECCIÓN 1: SEGUIMIENTO ART 7 (TARJETAS) */}
            <section>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-800 uppercase text-sm tracking-tighter">Seguimiento Art. 7</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Control de Faltas Injustificadas</p>
                        </div>
                    </div>

                    {/* Barra de Filtros */}
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold outline-none cursor-pointer"
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                        >
                            <option value="Todos">Todas las Categorías</option>
                            <option value="FIFA">FIFA</option>
                            <option value="Primera">1ra Categoría</option>
                            <option value="Segunda">2da Categoría</option>
                            <option value="Tercera">3ra Categoría</option>
                            <option value="Cuarta">4ta Categoría</option>
                        </select>
                        <select 
                            className="px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold outline-none cursor-pointer"
                            value={filtroEspecialidad}
                            onChange={(e) => setFiltroEspecialidad(e.target.value)}
                        >
                            <option value="Todos">Especialidad</option>
                            <option value="Central">Central</option>
                            <option value="Asistente">Asistente</option>
                            <option value="Ambas">Ambas</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {arbitrosFiltrados.map((r: any, i) => (
                        <div key={i} className={`p-5 rounded-3xl border-2 transition-all hover:shadow-xl hover:shadow-gray-100 ${r.total_faltas >= 7 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${r.total_faltas >= 7 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <User size={20} />
                                </div>
                                {r.total_faltas >= 7 && (
                                    <span className="flex items-center gap-1 text-[9px] font-black bg-red-600 text-white px-3 py-1.5 rounded-full animate-pulse uppercase">
                                        <AlertCircle size={12} /> Riesgo Sanción
                                    </span>
                                )}
                            </div>
                            
                            <h4 className="font-black text-gray-800 text-sm uppercase leading-tight">
                                {r.nombre_completo}
                            </h4>
                            <div className="flex gap-2 mt-1">
                                <span className="inline-block text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-black uppercase">
                                    {r.categoria}
                                </span>
                                <span className="inline-block text-[9px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded font-black uppercase">
                                    {r.especializacion}
                                </span>
                            </div>
                            
                            <div className="flex gap-6 mt-6">
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Faltas Acum.</p>
                                    <p className={`text-2xl font-black ${r.total_faltas >= 7 ? 'text-red-600' : 'text-gray-800'}`}>
                                        {r.total_faltas}<span className="text-xs text-gray-300 font-bold ml-1">/10</span>
                                    </p>
                                </div>
                                <div className="flex-1 border-l border-gray-100 pl-6">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Retrasos</p>
                                    <p className="text-2xl font-black text-amber-500">{r.total_retrasos}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => abrirJustificador(r)}
                                className="mt-6 w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl text-[10px] font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all uppercase tracking-widest"
                            >
                                Gestionar Faltas
                            </button>
                        </div>
                    ))}
                </div>

                {arbitrosFiltrados.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                        <Filter className="mx-auto text-gray-300 mb-4" size={40} />
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-tighter">No hay resultados para esta búsqueda</p>
                    </div>
                )}
            </section>

            {/* SECCIÓN 2: MATRIZ TIPO EXCEL */}
            <hr className="border-gray-100" />
            <section>
                <MatrizAsistencia />
            </section>

            {/* MODAL DE JUSTIFICACIÓN */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-blue-50">
                            <div>
                                <h3 className="font-black text-blue-900 uppercase text-lg leading-none">Justificar Faltas</h3>
                                <p className="text-blue-600 text-[10px] font-bold mt-2 uppercase tracking-widest">
                                    {arbitroSeleccionado?.nombre} {arbitroSeleccionado?.apellido_paterno}
                                </p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                                <X className="text-blue-900" size={24} />
                            </button>
                        </div>
                        
                        <div className="p-8 max-h-[400px] overflow-y-auto">
                            {faltasDetalle.length > 0 ? (
                                <div className="space-y-3">
                                    {faltasDetalle.map((f: any) => (
                                        <div key={f.id_asistencia} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-800">
                                                        {new Date(f.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{f.tipo_actividad}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => aplicarJustificacion(f.id_asistencia)}
                                                className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <ShieldCheck size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <CheckCircle className="mx-auto mb-2 text-emerald-500" size={32} />
                                    <p className="font-bold text-sm">Sin faltas pendientes.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-8 bg-gray-50">
                            <button onClick={() => setModalOpen(false)} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialAsistencia;