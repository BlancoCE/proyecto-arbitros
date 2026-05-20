import React, { useEffect, useState } from 'react';
import { Gavel, Archive, ShieldAlert, CheckCircle2, Edit3, Trash2, Search, Eye, FileWarning } from 'lucide-react';
import axios from 'axios';

interface SeccionProps {
    refreshKey: number;
    onEdit: (sancion: any) => void;
}

const SeccionSanciones: React.FC<SeccionProps> = ({ refreshKey, onEdit }) => {
    const [data, setData] = useState({ enCirculacion: [], pasadas: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        // Creamos una función interna asíncrona
        const cargarSanciones = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch('import.meta.env.VITE_API_URL/api/sancion', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                // setSanciones(data); ... resto de tu lógica
            } catch (error) {
                console.error("Error cargando sanciones:", error);
            }
        };

        cargarSanciones();
    }, []);

    // --- FUNCIÓN DE CORRECCIÓN DE FECHA ---
    const formatearFechaSinDesfase = (fechaISO: string) => {
        if (!fechaISO) return "---";
        const [year, month, day] = fechaISO.substring(0, 10).split('-');
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const fetchSanciones = async () => {
            try {
                const res = await axios.get('import.meta.env.VITE_API_URL/api/sancion');
                setData(res.data);
            } catch (err) {
                console.error("Error al cargar sanciones", err);
            } finally { setLoading(false); }
        };
        fetchSanciones();
    }, [refreshKey]);

    const filtrarLista = (lista: any[]) => {
        return lista.filter(s => 
            s.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.tipo_sancion.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleEliminar = async (id: number, nombre: string) => {
        if (window.confirm(`¿Está seguro de eliminar la sanción de ${nombre}? Esta acción borrará el archivo físico de la resolución y restaurará el estado del árbitro.`)) {
            try {
                await axios.delete(`import.meta.env.VITE_API_URL/api/sancion/${id}`);
                // Usamos refreshKey para recargar sin recargar toda la página si es posible, 
                // pero por consistencia con tu código original:
                window.location.reload();
            } catch (err) {
                alert("Error al eliminar la sanción");
            }
        }
    };

    // Función para ver el documento
    const verResolucion = (url: string) => {
        if (!url) {
            alert("No hay un documento cargado para esta sanción.");
            return;
        }
        const urlCompleta = `import.meta.env.VITE_API_URL${url}`;
        window.open(urlCompleta, '_blank');
    };

    const TablaSanciones = ({ lista, titulo, color, icono: Icono, esPasada }: any) => {
        const listaFiltrada = filtrarLista(lista);

        return (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-4 ml-1">
                    <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                        <Icono size={18} className={color.replace('bg-', 'text-')} />
                    </div>
                    <h3 className="font-black text-gray-700 uppercase tracking-tighter">
                        {titulo} ({listaFiltrada.length})
                    </h3>
                </div>
                
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase">Árbitro Sancionado</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase">Vigencia</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase text-center">Infracción</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase text-center">Resolución</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase text-center">Acciones</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {listaFiltrada.length === 0 ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 font-medium">No se encontraron registros.</td></tr>
                                ) : listaFiltrada.map((s: any) => (
                                    <tr key={s.id_sancion} className={`hover:bg-gray-50/50 transition-colors ${esPasada ? 'opacity-70' : ''}`}>
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900">{s.nombre_completo}</div>
                                            <div className="text-[11px] text-gray-400 font-medium italic mt-1 line-clamp-1" title={s.motivo}>
                                                {s.motivo}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-sm font-mono font-bold text-gray-600">
                                                <span>{formatearFechaSinDesfase(s.fecha_inicio)}</span>
                                                <span className="text-gray-300">/</span>
                                                {s.fecha_fin ? (
                                                    <span>{formatearFechaSinDesfase(s.fecha_fin)}</span>
                                                ) : (
                                                    <span className="text-indigo-500 text-[10px] font-black uppercase tracking-tighter">
                                                        Indefinido
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                s.tipo_sancion.includes('Suspensión') ? 'bg-red-100 text-red-600' : 
                                                s.tipo_sancion.includes('Baja') ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {s.tipo_sancion}
                                            </span>
                                        </td>

                                        {/* NUEVA COLUMNA: VER RESOLUCIÓN */}
                                        <td className="p-5 text-center">
                                            {s.url_resolucion ? (
                                                <button 
                                                    onClick={() => verResolucion(s.url_resolucion)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 bg-gray-900 text-white rounded-xl hover:bg-red-600 transition-all shadow-md shadow-gray-200"
                                                    title="Ver Fallo del Tribunal"
                                                >
                                                    <Eye size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Expandir</span>
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-center text-gray-300" title="Sin documento adjunto">
                                                    <FileWarning size={16} />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Sin archivo</span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {!esPasada && (
                                                    <button 
                                                        onClick={() => onEdit(s)}
                                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                                                        title="Editar sanción"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleEliminar(s.id_sancion, s.nombre_completo)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                                                    title="Eliminar sanción"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                esPasada ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                            }`}>
                                                {esPasada ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                                                {esPasada ? 'CUMPLIDA' : s.estadoReal.toUpperCase()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 animate-pulse">Sincronizando registros disciplinarios...</div>;

    return (
        <div className="space-y-6">
            <div className="relative group max-w-md mx-auto md:mx-0">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                    <Search size={20} />
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar por apellido de árbitro o tipo..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[2rem] outline-none focus:border-red-500 shadow-sm transition-all font-medium text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <TablaSanciones lista={data.enCirculacion} titulo="Sanciones Vigentes" color="bg-red-600" icono={Gavel} esPasada={false} />
            <TablaSanciones lista={data.pasadas} titulo="Historial de Penas" color="bg-gray-500" icono={Archive} esPasada={true} />
        </div>
    );
};

export default SeccionSanciones;