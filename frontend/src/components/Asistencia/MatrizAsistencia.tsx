import React, { useEffect, useState } from 'react';
import { Search, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

const MatrizAsistencia = () => {
    const [datos, setDatos] = useState<any[]>([]);
    const [actividades, setActividades] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('Todos');
    
    const [fechaInicio, setFechaInicio] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

    // Función para abreviar tipos de actividad y ahorrar espacio
    const abreviarActividad = (nombre: string) => {
        return nombre
            .toUpperCase()
            .replace('ENTRENAMIENTO', 'ENTR.')
            .replace('REUNIÓN', 'REU.')
            .replace('PRUEBAS', 'PRU.')
            .replace('TEÓRICA', 'TEO.')
            .replace('FÍSICO', 'FÍS.')
            .replace('ACADEMIA', 'ACAD.');
    };

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3001/api/asistencia/historial?inicio=${fechaInicio}&fin=${fechaFin}`);
            const historial: any[] = res.data;

            const listaActividades = Array.from(
                new Set(historial.map((h: any) => `${h.fecha.split('T')[0]} - ${h.tipo_actividad}`))
            ).sort().reverse() as string[];
            
            setActividades(listaActividades);

            const arbitrosMap = historial.reduce((acc: any, curr: any) => {
                if (!acc[curr.id_arbitro]) {
                    acc[curr.id_arbitro] = {
                        nombre_completo: curr.nombre_completo || `${curr.nombre} ${curr.apellido_paterno}`,
                        categoria: curr.categoria,
                        especializacion: curr.especializacion,
                        asistencias: {}
                    };
                }
                const keyActividad = `${curr.fecha.split('T')[0]} - ${curr.tipo_actividad}`;
                acc[curr.id_arbitro].asistencias[keyActividad] = curr.estado;
                return acc;
            }, {});

            const ordenCat: any = { 'FIFA': 1, 'PRIMERA': 2, '1RA': 2, 'SEGUNDA': 3, '2DA': 3, 'TERCERA': 4, '3RA': 4, 'CUARTA': 5, '4TA': 5 };
            
            const listaOrdenada = Object.values(arbitrosMap).sort((a: any, b: any) => {
                const catA = ordenCat[a.categoria?.toUpperCase().trim()] || 99;
                const catB = ordenCat[b.categoria?.toUpperCase().trim()] || 99;
                if (catA !== catB) return catA - catB;
                return a.nombre_completo.localeCompare(b.nombre_completo);
            });

            setDatos(listaOrdenada);
        } catch (err) {
            console.error("Error al cargar matriz", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, [fechaInicio, fechaFin]);

    const filtrados = datos.filter((a: any) => {
        const matchesNombre = a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase());
        const catArbitro = a.categoria?.toUpperCase().trim();
        const matchesCat = filtroCategoria === 'Todos' || 
                          (filtroCategoria === 'FIFA' && catArbitro === 'FIFA') ||
                          (filtroCategoria === 'Primera' && (catArbitro === 'PRIMERA' || catArbitro === '1RA')) ||
                          (filtroCategoria === 'Segunda' && (catArbitro === 'SEGUNDA' || catArbitro === '2DA')) ||
                          (filtroCategoria === 'Tercera' && (catArbitro === 'TERCERA' || catArbitro === '3RA'));
        
        const matchesEsp = filtroEspecialidad === 'Todos' || a.especializacion === filtroEspecialidad;
        return matchesNombre && matchesCat && matchesEsp;
    });

    const getBadgeStatus = (estado: string) => {
        switch (estado) {
            case 'Presente': return <span className="text-emerald-600 font-black">P</span>;
            case 'Falta': return <span className="text-red-500 font-black">F</span>;
            case 'Licencia': return <span className="text-blue-500 font-black">L</span>;
            case 'Retraso': return <span className="text-amber-500 font-black">R</span>;
            default: return <span className="text-gray-200">-</span>;
        }
    };

    return (
        <div className="bg-white rounded-[25px] md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-10">
            <div className="p-4 md:p-6">
                {/* Header Compacto */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg">
                            <FileSpreadsheet size={16} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-800 uppercase text-[11px] md:text-xs tracking-tighter">Matriz Consolidada</h3>
                            <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase">Reporte General</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="flex-1 sm:flex-none text-[10px] font-bold border border-gray-100 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-500" />
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="flex-1 sm:flex-none text-[10px] font-bold border border-gray-100 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 bg-gray-50 border-none rounded-xl text-[10px] font-bold outline-none"
                        />
                    </div>
                    <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="bg-gray-50 border-none rounded-xl text-[10px] font-bold p-2 outline-none">
                        <option value="Todos">Categorías</option>
                        <option value="FIFA">FIFA</option>
                        <option value="Primera">1ra</option>
                        <option value="Segunda">2da</option>
                        <option value="Tercera">3ra</option>
                    </select>
                    <select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)} className="bg-gray-50 border-none rounded-xl text-[10px] font-bold p-2 outline-none">
                        <option value="Todos">Especialidad</option>
                        <option value="Central">Central</option>
                        <option value="Asistente">Asistente</option>
                    </select>
                </div>

                {/* Tabla Responsiva */}
                <div className="overflow-x-auto rounded-2xl border border-gray-100 max-h-[500px]">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50 sticky top-0 z-30">
                                {/* Sticky solo en desktop (md:sticky) */}
                                <th className="py-2 px-3 text-[8px] md:text-[9px] font-black uppercase text-gray-400 border-b md:sticky left-0 bg-gray-50 z-40 min-w-[140px] md:min-w-[180px]">Árbitro</th>
                                {actividades.map((act: string) => (
                                    <th key={act} className="py-2 px-1 text-[7px] md:text-[8px] font-black uppercase text-gray-400 border-b border-l text-center min-w-[60px] md:min-w-[80px]">
                                        <div className="leading-none text-[6px] md:text-[7px]">{act.split(' - ')[0]}</div>
                                        <div className="text-emerald-600 mt-0.5 break-words">
                                            {abreviarActividad(act.split(' - ')[1])}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((arb: any, idx) => (
                                <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                                    <td className="py-1 px-3 border-b md:sticky left-0 bg-white z-20 border-r border-gray-50">
                                        <p className="text-[9px] md:text-[10px] font-black text-gray-800 uppercase truncate max-w-[130px] md:max-w-[170px]">{arb.nombre_completo}</p>
                                        <p className="text-[7px] md:text-[8px] text-gray-400 font-bold uppercase">{arb.categoria}</p>
                                    </td>
                                    {actividades.map((act: string) => (
                                        <td key={act} className="py-1 px-1 border-b border-l text-center text-[9px] md:text-[10px]">
                                            {getBadgeStatus(arb.asistencias[act])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Leyenda */}
                <div className="mt-4 flex flex-wrap gap-3 md:gap-4 text-[8px] md:text-[9px] font-black uppercase text-gray-400">
                    <div className="flex items-center gap-1"><span className="text-emerald-600">P:</span> PRESENTE</div>
                    <div className="flex items-center gap-1"><span className="text-red-500">F:</span> FALTA</div>
                    <div className="flex items-center gap-1"><span className="text-blue-500">L:</span> LICENCIA</div>
                    <div className="flex items-center gap-1"><span className="text-amber-500">R:</span> RETRASO</div>
                </div>
            </div>
        </div>
    );
};

export default MatrizAsistencia;