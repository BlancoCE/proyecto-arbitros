import React, { useEffect, useState } from 'react';
import { Clock, History, Search, Edit3, Trash2, User, CheckCircle2, AlertCircle, Calendar, Eye, FileText } from 'lucide-react';
import axios from 'axios';

interface Props { refreshKey: number; onEdit: (l: any) => void; }

const SeccionLicencias: React.FC<Props> = ({ refreshKey, onEdit }) => {
    const [data, setData] = useState({ actuales: [], pasadas: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const formatearFechaSinDesfase = (fechaISO: string) => {
        if (!fechaISO) return "---";
        const [year, month, day] = fechaISO.substring(0, 10).split('-');
        return `${day}/${month}/${year}`;
    };

    const fetchLicencias = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/licencias/licencias-lista');
            setData(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchLicencias(); }, [refreshKey]);

    const handleEliminar = async (id: number, nombre: string) => {
        if (window.confirm(`¿Está seguro de eliminar la licencia de ${nombre}?`)) {
            try {
                await axios.delete(`http://localhost:3001/api/licencias/eliminar/${id}`);
                fetchLicencias();
            } catch (err) { alert("Error al eliminar"); }
        }
    };

    const verDocumento = (url: string) => {
        // Abrir el documento en una pestaña nueva
        window.open(`http://localhost:3001${url}`, '_blank');
    };

    const filtrar = (lista: any[]) => {
        return lista.filter(l => 
            l.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.tipo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const TablaLicencias = ({ lista, titulo, icono: Icono, color, esPasada }: any) => (
        <div className="mb-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4 ml-1">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                    <Icono size={18} className={color.replace('bg-', 'text-')} />
                </div>
                <h3 className="font-black text-gray-700 uppercase tracking-tighter">{titulo} ({lista.length})</h3>
            </div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase">Árbitro</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase">Tipo / Motivo</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase">Vigencia</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase text-center">Estado</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrar(lista).map((l: any) => (
                            <tr key={l.id_licencia} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500"><User size={18} /></div>
                                        <div>
                                            <p className="font-bold text-gray-800 leading-none mb-1">{l.nombre_completo}</p>
                                            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase">{l.categoria}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <p className="font-bold text-gray-700 text-sm">{l.tipo}</p>
                                    <p className="text-xs text-gray-400 italic truncate max-w-[180px]">{l.motivo}</p>
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-col text-[11px] font-bold text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12}/> {formatearFechaSinDesfase(l.fecha_inicio)}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400"> 
                                            al {l.fecha_fin ? formatearFechaSinDesfase(l.fecha_fin) : 'Indefinido'}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                        l.estadoReal === 'Finalizada' ? 'text-gray-400 bg-gray-50' : 
                                        l.estadoReal === 'Futura' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'
                                    }`}>
                                        {l.estadoReal === 'Finalizada' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                        {l.estadoReal}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-end gap-2">
                                        {/* NUEVO BOTÓN: VISTA PREVIA DOCUMENTO */}
                                        {l.url_carta && (
                                            <button 
                                                onClick={() => verDocumento(l.url_carta)} 
                                                title="Ver Documento"
                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        )}
                                        
                                        {l.estadoReal !== 'Finalizada' && (
                                            <button onClick={() => onEdit(l)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"><Edit3 size={18} /></button>
                                        )}
                                        <button onClick={() => handleEliminar(l.id_licencia, l.nombre_completo)} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"><Trash2 size={18} /></button>
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

    if (loading) return <div className="p-20 text-center font-bold text-gray-400">Cargando licencias...</div>;

    return (
        <div className="space-y-6">
            <div className="relative group max-w-md">
                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Search size={20} />
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar árbitro o tipo..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[2rem] outline-none focus:border-blue-500 shadow-sm transition-all font-medium text-gray-700" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
            <TablaLicencias lista={data.actuales} titulo="Licencias en Curso / Futuras" icono={Clock} color="bg-blue-600" esPasada={false} />
            <TablaLicencias lista={data.pasadas} titulo="Historial de Licencias" icono={History} color="bg-gray-600" esPasada={true} />
        </div>
    );
};

export default SeccionLicencias;