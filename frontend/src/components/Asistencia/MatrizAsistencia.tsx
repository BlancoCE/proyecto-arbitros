import React, { useEffect, useState } from 'react';
import { Search, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

const MatrizAsistencia = () => {
    const [datos, setDatos] = useState<any[]>([]);
    const [actividades, setActividades] = useState<string[]>([]);
    
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
        try {
            const token = localStorage.getItem('token');
            // CORRECCIÓN DE RUTA: Apunta al endpoint real /api/asistencia/historial definido en tus rutas
            const res = await axios.get(`http://localhost:3001/api/asistencia/historial`, {
                params: { inicio: fechaInicio, fin: fechaFin },
                headers: { Authorization: `Bearer ${token}` }
            });

            // Tu backend devuelve la data directamente. Nos aseguramos que sea un arreglo.
            const historial = Array.isArray(res.data) ? res.data : [];

            // CORRECCIÓN SONARQUBE & TYPESCRIPT: Uso de string en el Set y localCompare para ordenamiento confiable en español
            const listaActividades = Array.from(
                new Set<string>(historial.map((h: any) => `${h.fecha.split('T')[0]} - ${h.tipo_actividad}`))
            ).sort((a, b) => b.localeCompare(a, 'es'));

            // Construimos la estructura relacional esperada por la tabla en base a tu respuesta plana del backend
            const mapaArbitros: { [key: number]: any } = {};

            historial.forEach((item: any) => {
                const id = item.id_arbitro;
                if (!mapaArbitros[id]) {
                    mapaArbitros[id] = {
                        id_arbitro: id,
                        nombre_completo: item.nombre_completo || `${item.nombre || ''} ${item.apellido_paterno || ''}`,
                        categoria: item.categoria || 'SIN CAT',
                        especialidad: item.especializacion || 'Central',
                        asistencias: {}
                    };
                }
                const claveActividad = `${item.fecha.split('T')[0]} - ${item.tipo_actividad}`;
                mapaArbitros[id].asistencias[claveActividad] = item.estado;
            });

            setActividades(listaActividades);
            setDatos(Object.values(mapaArbitros));
        } catch (error) {
            console.error("Error cargando matriz de asistencia:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [fechaInicio, fechaFin]);

    // Filtrado en el cliente
    const datosFiltrados = datos.filter((arb: any) => {
        const cumpleBusqueda = arb.nombre_completo.toLowerCase().includes(busqueda.toLowerCase());
        const cumpleCat = filtroCategoria === 'Todos' || arb.categoria === filtroCategoria;
        const cumpleEsp = filtroEspecialidad === 'Todos' || arb.especialidad === filtroEspecialidad;
        return cumpleBusqueda && cumpleCat && cumpleEsp;
    });

    const getBadgeStatus = (status: string) => {
        if (!status) return <span className="text-gray-300">-</span>;
        switch (status.toUpperCase()) {
            case 'PRESENTE': return <span className="text-emerald-600 font-bold">P</span>;
            case 'FALTA': return <span className="text-red-500 font-bold">F</span>;
            case 'LICENCIA': return <span className="text-blue-500 font-bold">L</span>;
            case 'RETRASO': return <span className="text-amber-500 font-bold">R</span>;
            default: return <span className="text-gray-400">-</span>;
        }
    };

    const exportarExcel = () => {
        // Implementación futura o actual para reportería en Excel
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Filtros */}
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center flex-1 min-w-[300px]">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar árbitro..."
                            className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <select
                        className="p-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none"
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                        <option value="Todos">Todas las Categorías</option>
                        <option value="FIFA">FIFA</option>
                        <option value="Primera">Primera</option>
                        <option value="Segunda">Segunda</option>
                        <option value="Tercera">Tercera</option>
                        <option value="Asistente de Primera">Asistente de Primera</option>
                        <option value="Asistente de Segunda">Asistente de Segunda</option>
                    </select>

                    <select
                        className="p-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none"
                        value={filtroEspecialidad}
                        onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    >
                        <option value="Todos">Todas las Especialidades</option>
                        <option value="Central">Árbitro Central</option>
                        <option value="Asistente">Árbitro Asistente</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="p-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                    />
                    <span className="text-gray-400 text-xs">a</span>
                    <input
                        type="date"
                        className="p-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                    />
                    <button
                        onClick={exportarExcel}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm ml-2"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Excel
                    </button>
                </div>
            </div>

            {/* Tabla Matriz */}
            <div className="p-4">
                <div className="overflow-x-auto max-h-[500px] border border-gray-100 rounded-lg">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-gray-100/70 text-gray-600 text-[9px] md:text-[10px] font-black uppercase tracking-wider sticky top-0 z-10">
                                <th className="py-2 px-3 border-b bg-gray-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px]">
                                    Árbitro / Datos
                                </th>
                                {actividades.map((act: string) => {
                                    const [fecha, tipo] = act.split(' - ');
                                    return (
                                        <th key={act} className="py-1 px-2 border-b border-l text-center min-w-[70px] bg-gray-100">
                                            <div className="text-gray-400 font-normal">{fecha.substring(5)}</div>
                                            <div className="text-emerald-800 font-black">{abreviarActividad(tipo)}</div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {datosFiltrados.map((arb: any) => (
                                // CORRECCIÓN SONARQUBE: Llave única basada en la clave primaria id_arbitro y no en el índice
                                <tr key={arb.id_arbitro} className="hover:bg-emerald-50/20 transition-colors">
                                    <td className="py-1.5 px-3 border-b text-xs font-medium text-gray-800 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <p className="truncate max-w-[170px]">{arb.nombre_completo}</p>
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