import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FiltrosDesignacion from '../components/Designaciones/FiltrosDesignacion';
import ModalDesignacion from '../components/Designaciones/ModalDesignacion';
import ModalDetalleHistorial from '../components/Designaciones/ModalDetalleHistorial';
import { exportarDesignacionesPDF } from '../utils/reporteGenerator';
import { Calendar, CheckCircle2, AlertCircle, History, Star, Eye, Download } from 'lucide-react';

const Designaciones: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [partidos, setPartidos] = useState<any[]>([]);
    const [arbitros, setArbitros] = useState<any[]>([]);
    const [selectedPartido, setSelectedPartido] = useState<any>(null);
    const [verHistorial, setVerHistorial] = useState<any>(null);
    const [loadingArbitros, setLoadingArbitros] = useState(false);
    const [filtros, setFiltros] = useState({ 
        liga: '', 
        categoria: '', 
        fechaInicio: '', 
        fechaFin: '' 
    });
    const [rangoExport, setRangoExport] = useState({
        inicio: new Date().toISOString().split('T')[0],
        fin: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const auth = JSON.parse(sessionStorage.getItem('user_auth') || '{}');
        setUser(auth);
        fetchPartidos(auth);
    }, []);

    const fetchPartidos = async (currentUser: any) => {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            // Normalizamos el rol a minúsculas para evitar errores de 'Arbitro' vs 'arbitro'
            const rol = currentUser.rol?.toLowerCase();
            
            // El árbitro ve sus asignaciones, los demás (Asesores, Admins, etc.) ven todo lo gestionable
            const endpoint = rol === 'arbitro' 
                ? `${import.meta.env.VITE_API_URL}/api/mis-designaciones` 
                : `${import.meta.env.VITE_API_URL}/api/partidos/pendientes`;
            
            const res = await axios.get(endpoint, config);
            
            // Si es para gestión, podrías querer filtrar solo los que ya tienen designación 
            // para la sección "VIGENTES" o manejarlo con un filter en el render.
            setPartidos(res.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.error("Sesión expirada");
                // Opcional: window.location.href = '/login';
            }
            console.error("Error al cargar partidos:", error);
        }
    };

    // 2. NUEVA FUNCIÓN: Cargar árbitros específicos para un partido
    const abrirModalDesignacion = async (partido: any) => {
        setLoadingArbitros(true);
        setSelectedPartido(partido); // Primero seteamos el partido para abrir el modal
        try {
            // Llamamos a la nueva ruta que creamos en el backend
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/arbitros-disponibles/${partido.id_partido}`);
            setArbitros(res.data);
        } catch (error) {
            console.error("Error al obtener árbitros aptos:", error);
            alert("No se pudo cargar la lista de árbitros disponibles");
        } finally {
            setLoadingArbitros(false);
        }
    };

    // --- LÓGICA DE FILTRADO (Se mantiene igual que tu código) ---
    const hoyStr = new Date().toISOString().split('T')[0];
    const haceSieteDias = new Date();
    haceSieteDias.setDate(haceSieteDias.getDate() - 7);
    const haceSieteDiasStr = haceSieteDias.toISOString().split('T')[0];

    const partidosFiltrados = partidos.filter(p => {
        const pFecha = p.fecha.split('T')[0];
        const matchLiga = filtros.liga === '' || p.torneo.includes(filtros.liga);
        const matchCat = filtros.categoria === '' || p.categoria.toLowerCase().includes(filtros.categoria.toLowerCase());
        
        let matchFecha = true;
        if (filtros.fechaInicio && filtros.fechaFin) {
            matchFecha = pFecha >= filtros.fechaInicio && pFecha <= filtros.fechaFin;
        } else if (filtros.fechaInicio) {
            matchFecha = pFecha === filtros.fechaInicio;
        }
        return matchLiga && matchCat && matchFecha;
    });

    // 1. PENDIENTES: No tiene designación Y el estado sigue siendo 'Pendiente' o 'Programado' (futuro)
    const pendientes = partidosFiltrados.filter(p => 
        !p.tiene_designacion && 
        p.estado !== 'Finalizado'
    );

    // 2. VIGENTES: Tiene designación Y el estado NO es 'Finalizado'
    const designados = partidosFiltrados.filter(p => {
        const esVigente = p.estado !== 'Finalizado';
        // Si es árbitro, mostramos lo que llegó (que ya tiene designación por defecto)
        if (user?.rol?.toLowerCase() === 'arbitro') {
            return esVigente;
        }
        // Para gestores, verificamos explícitamente el flag
        return p.tiene_designacion && esVigente;
    });

    // 3. HISTORIAL: El estado es 'Finalizado'
    const historial = partidosFiltrados.filter(p => {
        const esFinalizado = p.estado === 'Finalizado';
        if (!filtros.fechaInicio && !filtros.fechaFin) {
            return esFinalizado && p.fecha >= haceSieteDiasStr;
        }
        return esFinalizado;
    });

    const handleInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nuevaFechaInicio = e.target.value;
        setRangoExport(prev => ({
            ...prev,
            inicio: nuevaFechaInicio,
            // Si la nueva fecha de inicio es mayor que la de fin actual, 
            // actualizamos la de fin para que no sea menor.
            fin: nuevaFechaInicio > prev.fin ? nuevaFechaInicio : prev.fin
        }));
    };

    // Lógica de Permisos para la UI
    const puedeGestionar = ['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones'].includes(user?.rol);
    const puedeEvaluar = [...['Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones'], 'Asesor Técnico'].includes(user?.rol);

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Designaciones</h1>
                <p className="text-slate-500 font-medium">
                    {user?.rol === 'arbitro' ? 'Consulta tu agenda de partidos programados.' : 'Gestión y control de ternas arbitrales.'}
                </p>
            </header>

            <FiltrosDesignacion filtros={filtros} setFiltros={setFiltros} />

            {/* SECCIÓN ADAPTATIVA: Si es árbitro, ocultamos los "Pendientes por Designar" */}
            {puedeGestionar && (
                <section className="mb-12">
                    <h2 className="flex items-center gap-2 text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 bg-indigo-50 w-fit px-4 py-2 rounded-full">
                        <AlertCircle size={14}/> Por Designar
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendientes.map(p => (
                            <TarjetaPartido 
                                key={p.id_partido} 
                                partido={p} 
                                onClick={abrirModalDesignacion} 
                                icon={<Calendar className="text-indigo-500" />}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <h2 className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 w-fit px-4 py-2 rounded-full">
                        <CheckCircle2 size={14}/> {user?.rol === 'arbitro' ? 'Mis Partidos' : 'Vigentes'}
                    </h2>

                    {puedeGestionar && (
                        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Desde:</span>
                                <input 
                                    type="date" 
                                    className="text-[10px] font-bold p-1 border-b border-slate-200 outline-none text-indigo-600"
                                    value={rangoExport.inicio}
                                    onChange={handleInicioChange}
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Hasta:</span>
                                <input 
                                    type="date" 
                                    // VALIDACIÓN CRUCIAL: El 'min' impide seleccionar una fecha anterior en el calendario del navegador
                                    min={rangoExport.inicio} 
                                    className="text-[10px] font-bold p-1 border-b border-slate-200 outline-none text-indigo-600"
                                    value={rangoExport.fin}
                                    onChange={(e) => setRangoExport({...rangoExport, fin: e.target.value})}
                                />
                            </div>

                            <button 
                                onClick={() => {
                                    // Validación de seguridad antes de exportar
                                    if (rangoExport.fin < rangoExport.inicio) {
                                        alert("La fecha de fin no puede ser menor a la fecha de inicio.");
                                        return;
                                    }

                                    const filtrados = designados.filter(p => {
                                        const f = p.fecha.split('T')[0];
                                        return f >= rangoExport.inicio && f <= rangoExport.fin;
                                    });

                                    if (filtrados.length === 0) {
                                        return alert(`No hay partidos designados entre el ${rangoExport.inicio} y el ${rangoExport.fin}`);
                                    }
                                    exportarDesignacionesPDF(filtrados, rangoExport);
                                }}
                                className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all flex items-center gap-2"
                            >
                                <Download size={14}/> Exportar PDF
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {designados.map(p => (
                        <TarjetaPartido 
                            key={p.id_partido} 
                            partido={p} 
                            onClick={puedeGestionar ? abrirModalDesignacion : () => setVerHistorial(p)}
                            esEdicion={puedeGestionar}
                            icon={puedeEvaluar ? <Star className="text-amber-500" /> : <Eye className="text-emerald-500" />}
                        />
                    ))}
                </div>
            </section>

            <section className="opacity-75">
                <h2 className="flex items-center gap-2 text-sm font-black text-gray-500 uppercase tracking-widest mb-6">
                    <History size={18}/> Historial de Designaciones
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {historial.map(p => (
                        <div 
                            key={p.id_partido}
                            // --- CORRECCIÓN DE ACCESIBILIDAD PARA SONARQUBE ---
                            onClick={() => setVerHistorial(p)} // Abrir modal de solo lectura
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setVerHistorial(p);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Ver detalles del partido ${p.equipo_local} contra ${p.equipo_visitante}`}
                            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:border-indigo-300 transition-all cursor-pointer group"
                        >
                            <div className="text-[10px] font-black text-gray-400 uppercase mb-2">{p.torneo}</div>
                            <div className="font-bold text-gray-800 uppercase">{p.equipo_local} VS {p.equipo_visitante}</div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold">VER DETALLES</span>
                                <span className="text-[10px] font-bold text-gray-400">{p.fecha.split('T')[0]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODAL PARA EDITAR */}
            {selectedPartido && (
                <ModalDesignacion 
                    partido={selectedPartido} 
                    arbitros={arbitros} // Estos ya vienen filtrados por el backend
                    onClose={() => {
                        setSelectedPartido(null);
                        setArbitros([]); // Limpiamos la lista al cerrar
                    }} 
                    onSuccess={fetchPartidos}
                    isLoading={loadingArbitros} // Opcional: mostrar un spinner dentro del modal
                />
            )}

            {/* MODAL PARA VER DETALLES DEL HISTORIAL (Solo lectura) */}
            {verHistorial && (
                <ModalDetalleHistorial 
                    partido={verHistorial} 
                    onClose={() => setVerHistorial(null)} 
                />
            )}
        </div>
    );
};

// Componente Tarjeta Interno para agilidad
const TarjetaPartido = ({ partido, onClick, esEdicion, icon }: any) => {
    const miRol = partido.mi_rol_en_partido;
    const conConflicto = partido.tiene_conflicto_horario; // Nuevo campo del SQL

    return (
        <div 
            onClick={() => onClick(partido)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(partido);
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Gestionar designación de ${partido.equipo_local} contra ${partido.equipo_visitante}`}
            className={`bg-white p-6 rounded-[2.5rem] shadow-sm border ${
                conConflicto ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'
            } hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden`}
        >
            {/* INDICADOR VISUAL (Punto de Conflicto) */}
            {conConflicto && !partido.tiene_designacion && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 animate-bounce">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                    <span className="text-[8px] font-black text-amber-600 uppercase">Posible Choque</span>
                </div>
            )}

            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>

            <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {partido.torneo}
                </div>
                {miRol && (
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">
                        Tu Rol: {miRol}
                    </span>
                )}
            </div>
            
            <div className="text-xs font-bold text-indigo-600 mb-3">{partido.categoria}</div>
            
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex-1 font-black text-slate-800 uppercase text-sm leading-tight">
                    {partido.equipo_local}
                </div>
                <div className="text-[10px] font-black text-slate-300 italic px-2">VS</div>
                <div className="flex-1 font-black text-slate-800 uppercase text-sm leading-tight text-right">
                    {partido.equipo_visitante}
                </div>
            </div>

            {/* Ubicación con cambio de color si hay conflicto */}
            <div className={`flex items-center gap-2 mb-4 p-2 rounded-xl ${conConflicto ? 'bg-amber-100/50' : 'bg-slate-50'}`}>
                <div className={`p-1.5 rounded-lg shadow-sm ${conConflicto ? 'bg-amber-500' : 'bg-white'}`}>
                    <svg className={`w-3 h-3 ${conConflicto ? 'text-white' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                </div>
                <span className={`text-[10px] font-bold truncate uppercase ${conConflicto ? 'text-amber-700' : 'text-slate-600'}`}>
                    {partido.ubicacion} {conConflicto && "(Revisar Horario)"}
                </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Fecha</span>
                    <span className="text-xs font-bold text-slate-700">{partido.fecha.split('T')[0]}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Hora</span>
                    <span className={`text-xs font-bold ${conConflicto ? 'text-amber-600' : 'text-slate-700'}`}>
                        {partido.hora.substring(0, 5)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Designaciones;