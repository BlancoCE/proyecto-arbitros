import React, { useState } from 'react';
import axios from 'axios';
import { X, Users, AlertCircle, ShieldCheck } from 'lucide-react';

const ModalDesignacion = ({ partido, arbitros, onClose, onSuccess }: any) => {
    // 1. Lógica de Reglas de Negocio
    const cat = partido.categoria.toLowerCase();
    const liga = partido.torneo.toLowerCase();

    const esInfantoBajo = ["sub-7", "sub-9", "sub-11"].includes(cat);
    const requiere4to = liga.includes("profesional") || 
                       (liga.includes("ascenso") && ["primera a", "primera b"].includes(cat));

    // 2. ESTADO INICIAL
    const [terna, setTerna] = useState({
        central: partido.terna_ids?.['Central']?.toString() || '',
        as1: partido.terna_ids?.['Asistente 1']?.toString() || '',
        as2: partido.terna_ids?.['Asistente 2']?.toString() || '',
        cuarto: partido.terna_ids?.['Cuarto Árbitro']?.toString() || ''
    });

    const [loading, setLoading] = useState(false);

    // --- LÓGICA DE FILTRADO Y JERARQUÍA ---
    
    // Lista de categorías para el ordenamiento visual
    const categoriasOrdenadas = ["FIFA", "Primera", "Segunda", "Tercera", "Cuarta"];
    const [isDeleting, setIsDeleting] = useState(false);

    // Función para obtener árbitros disponibles para un rol específico (Exclusión mutua)
    const getArbitrosDisponiblesParaRol = (rolActual: string) => {
        const otrosSeleccionados = Object.entries(terna)
            .filter(([rol, id]) => rol !== rolActual && id !== '')
            .map(([_, id]) => id);

        return arbitros.filter((a: any) => !otrosSeleccionados.includes(a.id_arbitro.toString()));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Recuperar el token de la sesión
        const token = sessionStorage.getItem('token');

        try {
            // 2. Incluir el token en la configuración de Axios
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/partidos/asignar/${partido.id_partido}`, 
                terna,
                {
                    headers: {
                        'Authorization': `Bearer ${token}` // <--- ESTO ES LO QUE FALTA
                    }
                }
            );
            onSuccess();
            onClose();
        } catch (err: any) {
            // Mejoramos la captura del mensaje para ver qué dice el backend exactamente
            const mensajeError = err.response?.data?.error || err.response?.data?.message || "Error desconocido";
            alert("CONFLICTO DE DESIGNACIÓN:\n\n" + mensajeError);
        } finally {
            setLoading(false);
        }
    };

    const handleDeshacer = async () => {
        if (!window.confirm("¿Estás seguro de quitar la designación? El partido volverá a estar pendiente.")) return;
        
        setIsDeleting(true);

        // 1. Recuperar el token de la sesión
        const token = sessionStorage.getItem('token');

        try {
            // 2. Incluir el token en la configuración de Axios
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/partidos/deshacer/${partido.id_partido}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            onSuccess();
            onClose();
        } catch (err: any) {
            // Mostramos el error real que viene del backend si lo hay
            const mensaje = err.response?.data?.message || "Error al deshacer la designación";
            alert(mensaje);
            console.error("Error en Delete:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    // Sub-componente para renderizar los SELECT con agrupamiento
    const SelectArbitro = ({ label, rol, valor, obligatorio = true }: any) => {
        const disponibles = getArbitrosDisponiblesParaRol(rol);
        
        return (
            <div className="w-full">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">{label}</label>
                <select 
                    required={obligatorio}
                    className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-200 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={valor}
                    onChange={e => setTerna({...terna, [rol]: e.target.value})}
                >
                    <option value="">Seleccionar...</option>
                    {categoriasOrdenadas.map(catNom => {
                        const arbitrosEnCat = disponibles.filter((a: any) => a.categoria === catNom);
                        if (arbitrosEnCat.length === 0) return null;
                        return (
                            <optgroup key={catNom} label={`CATEGORÍA ${catNom.toUpperCase()}`}>
                                {arbitrosEnCat.map((a: any) => (
                                    <option key={a.id_arbitro} value={a.id_arbitro.toString()}>
                                        {a.nombre_completo} {a.especializacion ? `— ${a.especializacion}` : ''}
                                    </option>
                                ))}
                            </optgroup>
                        );
                    })}
                </select>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                
                <div className="p-10 pb-6 relative">
                    <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
                        <X size={24} />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase italic">
                                {partido.tiene_designacion ? 'Editar Designación' : 'Nueva Designación'}
                            </h2>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                {partido.torneo} — {partido.categoria}
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-2xl text-center font-black text-white uppercase text-sm tracking-tighter flex items-center justify-center gap-4 shadow-lg shadow-slate-200">
                        <span className="opacity-60">{partido.equipo_local}</span>
                        <span className="text-indigo-400 text-xs italic">VS</span>
                        <span className="opacity-60">{partido.equipo_visitante}</span>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-10 pt-0 space-y-5">
                    {/* ÁRBITRO CENTRAL */}
                    <SelectArbitro label="Árbitro Central" rol="central" valor={terna.central} />

                    {/* ASISTENTES */}
                    {!esInfantoBajo && (
                        <div className="grid grid-cols-2 gap-4">
                            <SelectArbitro label="Asistente 1" rol="as1" valor={terna.as1} />
                            <SelectArbitro label="Asistente 2" rol="as2" valor={terna.as2} />
                        </div>
                    )}

                    {/* CUARTO ÁRBITRO */}
                    {requiere4to && (
                        <div className="p-6 bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-100">
                            <SelectArbitro label="Cuarto Árbitro (Protocolar)" rol="cuarto" valor={terna.cuarto} />
                            <div className="mt-3 flex items-center gap-2 text-[9px] text-indigo-400 font-bold uppercase tracking-tight">
                                <ShieldCheck size={12} /> Requerido por reglamento de {partido.torneo}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 pt-6">
                        {/* Botón Lateral Izquierdo: Cancelar */}
                        <button type="button" onClick={onClose} className="px-6 py-4 font-black text-gray-400 uppercase text-xs tracking-widest hover:text-gray-600 transition-colors">
                            Cancelar
                        </button>

                        <div className="flex-1 flex gap-3">
                            {/* BOTÓN DESHACER (Solo aparece si ya tiene designación) */}
                            {partido.tiene_designacion && (
                                <button 
                                    type="button"
                                    onClick={handleDeshacer}
                                    disabled={isDeleting}
                                    className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all border-2 border-red-100"
                                >
                                    {isDeleting ? 'Quitando...' : 'Deshacer'}
                                </button>
                            )}

                            {/* BOTÓN GUARDAR / CONFIRMAR */}
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : partido.tiene_designacion ? 'Guardar Cambios' : 'Confirmar Designación'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalDesignacion;