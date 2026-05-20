import React, { useState, useEffect } from 'react';
import { Save, ClipboardList, Search, Clock, CheckCircle, XCircle, FileText, Calendar, ShieldAlert } from 'lucide-react';
import axios from 'axios';

interface RegistroAsistencia {
    [key: number]: {
        estado: string;
        hora: string;
    };
}

interface Arbitro {
    id_arbitro: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    categoria: string;
    especializacion: string;
    licencia_activa: string | null;
}

const ModuloAsistencia: React.FC = () => {
    const [arbitros, setArbitros] = useState<Arbitro[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEspecializacion, setFiltroEspecializacion] = useState('Todos');
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const [asistencias, setAsistencias] = useState<RegistroAsistencia>({});
    const [tipo, setTipo] = useState('Preparación Física Martes');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fecha] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const cargarArbitros = async () => {
            try {
                // RUTA ACTUALIZADA A LA FUNCIÓN JERÁRQUICA
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/asistencia/arbitros-asistencia`);
                setArbitros(res.data);
                
                const inicial: RegistroAsistencia = {};
                res.data.forEach((a: Arbitro) => {
                    // Si tiene licencia activa, el estado inicial es 'Licencia'
                    const tieneLicencia = a.licencia_activa !== null;
                    inicial[a.id_arbitro] = { 
                        estado: tieneLicencia ? 'Licencia' : 'Falta', 
                        hora: '' 
                    };
                });
                setAsistencias(inicial);
            } catch (err) {
                console.error("Error cargando árbitros:", err);
            }
        };
        cargarArbitros();
    }, []);

    const toggleAsistencia = (id: number, nuevoEstado: string, bloqueado: boolean) => {
        if (bloqueado) return; // No permite cambios si tiene licencia activa
        const horaActual = new Date().toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        setAsistencias(prev => ({
            ...prev,
            [id]: { 
                estado: nuevoEstado, 
                hora: nuevoEstado === 'Presente' ? horaActual : '' 
            }
        }));
    };

    const guardarLista = async () => {
        if (!window.confirm("¿Confirmar el registro de asistencia para todos los árbitros en la lista?")) return;
        setIsSubmitting(true);
        const registros = Object.entries(asistencias).map(([id, info]) => ({
            id_arbitro: parseInt(id),
            estado: info.estado,
            hora_entrada: info.hora,
        }));

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/asistencia/registrar`, {
                fecha,
                tipo_actividad: tipo,
                registros
            });
            alert("Asistencia guardada exitosamente.");
        } catch (error) {
            alert("Error al guardar la asistencia.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // LÓGICA DE FILTRADO COMBINADO
    const arbitrosFiltrados = arbitros.filter(a => {
        const matchesNombre = `${a.nombre} ${a.apellido_paterno}`.toLowerCase().includes(busqueda.toLowerCase());
        const matchesEsp = filtroEspecializacion === 'Todos' || a.especializacion === filtroEspecializacion;
        const matchesCat = filtroCategoria === 'Todos' || a.categoria === filtroCategoria;
        return matchesNombre && matchesEsp && matchesCat;
    });

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
            {/* Encabezado y Configuración */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex gap-6 items-center">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad de Hoy</label>
                        <select 
                            className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer focus:text-blue-600 transition-colors"
                            value={tipo} 
                            onChange={e => setTipo(e.target.value)}
                        >
                            <option value="Reunión Académica Lunes">Reunión Académica (Lunes 19:30)</option>
                            <option value="Preparación Física Martes">Preparación Física (Martes 06:30)</option>
                            <option value="Preparación Física Jueves">Preparación Física (Jueves 06:30)</option>
                        </select>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200"></div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</label>
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Calendar size={14} className="text-blue-500" />
                            {fecha}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={guardarLista}
                    disabled={isSubmitting || arbitros.length === 0}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:bg-slate-300 disabled:shadow-none"
                >
                    <Save size={18} /> {isSubmitting ? 'PROCESANDO...' : 'GUARDAR LISTA COMPLETA'}
                </button>
            </div>

            {/* FILTROS (Equilibrados con el diseño original) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-500 font-medium text-slate-600 transition-all text-sm"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-slate-600 text-xs"
                    value={filtroEspecializacion} onChange={e => setFiltroEspecializacion(e.target.value)}
                >
                    <option value="Todos">Especialidad: Todas</option>
                    <option value="Central">Árbitro Central</option>
                    <option value="Asistente">Árbitro Asistente</option>
                    <option value="Ambas">Ambos</option>
                </select>
                <select 
                    className="bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-slate-600 text-xs"
                    value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
                >
                    <option value="Todos">Categoría: Todas</option>
                    <option value="FIFA">FIFA</option>
                    <option value="Primera">1ra Categoría</option>
                    <option value="Segunda">2da Categoría</option>
                    <option value="Tercera">3ra Categoría</option>
                    <option value="Cuarta">4ta Categoría</option>
                </select>
            </div>

            {/* Lista de Árbitros */}
            <div className="space-y-3">
                {arbitrosFiltrados.length > 0 ? (
                    arbitrosFiltrados.map((a) => {
                        const bloqueado = a.licencia_activa !== null;
                        return (
                            <div key={a.id_arbitro} className={`flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100 transition-all group ${bloqueado ? 'opacity-80' : ''}`}>
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-colors ${bloqueado ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                        {a.apellido_paterno[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{a.apellido_paterno} {a.apellido_materno} {a.nombre}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                                                {a.categoria}
                                            </span>
                                            <span className="text-[10px] text-slate-300 font-bold uppercase">{a.especializacion}</span>
                                            {bloqueado && (
                                                <span className="text-[10px] text-amber-600 font-black flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded">
                                                    <ShieldAlert size={10} /> LICENCIA ACTIVA
                                                </span>
                                            )}
                                            {asistencias[a.id_arbitro]?.hora && (
                                                <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                                                    <Clock size={10} /> {asistencias[a.id_arbitro].hora}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex bg-slate-50 p-1.5 rounded-xl gap-1">
                                    {[
                                        { id: 'Presente', icon: CheckCircle, color: 'bg-green-500', text: 'text-green-600' },
                                        { id: 'Falta', icon: XCircle, color: 'bg-red-500', text: 'text-red-600' },
                                        { id: 'Licencia', icon: FileText, color: 'bg-amber-500', text: 'text-amber-600' }
                                    ].map((btn) => (
                                        <button
                                            key={btn.id}
                                            disabled={bloqueado}
                                            onClick={() => toggleAsistencia(a.id_arbitro, btn.id, bloqueado)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                                asistencias[a.id_arbitro]?.estado === btn.id 
                                                ? `${btn.color} text-white shadow-md`
                                                : `hover:bg-white ${btn.text} opacity-40 hover:opacity-100`
                                            } ${bloqueado && btn.id !== 'Licencia' ? 'hidden' : ''}`}
                                        >
                                            <btn.icon size={14} />
                                            <span className="hidden md:inline">{btn.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-400 font-bold">No se encontraron árbitros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuloAsistencia;