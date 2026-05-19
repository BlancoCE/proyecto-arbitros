import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ClipboardCheck, Save, User, Star, Activity, Brain, Eye, MessageSquare, Target, CheckCircle2, RotateCcw } from 'lucide-react';

const FormularioEvaluacion: React.FC<any> = ({ partido, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [evaluacionesExistentes, setEvaluacionesExistentes] = useState<any[]>([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    const [form, setForm] = useState({
        id_arbitro: '',
        nota: '',
        criterio_tecnico: '',
        criterio_fisico: '',
        criterio_actitud: '',
        observacion: '',
        recomendacion: ''
    });

    const ordenOficial = ["Central", "Asistente 1", "Asistente 2", "Cuarto Árbitro"];
    const terna = partido.terna_nombres || {};
    const ternaIds = partido.terna_ids || {};

    // Cargar evaluaciones ya realizadas en este partido al abrir el modal
    useEffect(() => {
        fetchEvaluaciones();
    }, [partido.id_partido]);

    const fetchEvaluaciones = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/evaluaciones/detalles/${partido.id_partido}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setEvaluacionesExistentes(res.data);
        } catch (err) {
            console.error("Error cargando evaluaciones existentes");
        }
    };

    // Al seleccionar un árbitro, verificar si ya fue evaluado para cargar sus datos
    const handleSelectArbitro = (id: string) => {
        const evalPrevia = evaluacionesExistentes.find(e => String(e.id_arbitro) === String(id));
        
        if (evalPrevia) {
            setForm({
                id_arbitro: id,
                nota: evalPrevia.nota,
                criterio_tecnico: evalPrevia.criterio_tecnico,
                criterio_fisico: evalPrevia.criterio_fisico,
                criterio_actitud: evalPrevia.criterio_actitud,
                observacion: evalPrevia.observacion,
                recomendacion: evalPrevia.recomendacion
            });
            setModoEdicion(true);
        } else {
            setForm({
                id_arbitro: id,
                nota: '',
                criterio_tecnico: '',
                criterio_fisico: '',
                criterio_actitud: '',
                observacion: '',
                recomendacion: ''
            });
            setModoEdicion(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const auth = JSON.parse(sessionStorage.getItem('user_auth') || '{}');
        const token = sessionStorage.getItem('token');

        const payload = {
            ...form,
            id_asesor: auth.id_especifico,
            id_partido: partido.id_partido
        };

        try {
            const res = await axios.post('http://localhost:3001/api/evaluaciones', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setStatusMessage({ type: 'success', text: modoEdicion ? "¡Cambios guardados con éxito!" : "¡Evaluación enviada correctamente!" });
                setTimeout(() => {
                    onSuccess();
                }, 2500); // El mensaje dura 2.5 segundos antes de cerrar
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: "Error al procesar la solicitud" });
            setTimeout(() => setStatusMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
                
                {/* MENSAJE DE ÉXITO FLOTANTE */}
                {statusMessage && (
                    <div className={`absolute top-10 left-1/2 -translate-x-1/2 z-[130] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-500 ${statusMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        <CheckCircle2 size={24} />
                        <span className="font-black uppercase tracking-widest text-sm">{statusMessage.text}</span>
                    </div>
                )}

                {/* Header */}
                <div className="bg-slate-900 p-8 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl text-white shadow-lg transition-colors ${modoEdicion ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                            <ClipboardCheck size={28}/>
                        </div>
                        <div>
                            <h2 className="text-white text-xl font-black uppercase tracking-tighter">
                                {modoEdicion ? 'Editar Evaluación' : 'Nueva Evaluación'}
                            </h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{partido.equipo_local} vs {partido.equipo_visitante}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-all"><X size={32}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8">
                    
                    {/* Selector con Colores de Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <User size={12}/> Árbitro de la Terna
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {ordenOficial.map(rol => {
                                    const id = ternaIds[rol];
                                    if(!terna[rol]) return null;
                                    const yaEvaluado = evaluacionesExistentes.some(e => String(e.id_arbitro) === String(id));
                                    const estaSeleccionado = String(form.id_arbitro) === String(id);

                                    return (
                                        <button
                                            key={rol}
                                            type="button"
                                            onClick={() => handleSelectArbitro(String(id))}
                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 border-2 
                                                ${estaSeleccionado ? 'bg-slate-900 text-white border-slate-900 scale-105' : 
                                                  yaEvaluado ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                                  'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                        >
                                            {yaEvaluado && <CheckCircle2 size={12} />}
                                            {rol}: {terna[rol]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    <Star size={12}/> Promedio de Evaluación
                                </label>
                                <p className="text-[10px] text-slate-400 font-medium">La nota se calcula automáticamente promediando los criterios técnicos, físicos y de actitud.</p>
                            </div>
                            <div className="flex justify-end items-center gap-4">
                                <div className={`px-8 py-4 rounded-2xl font-black text-3xl shadow-sm transition-all ${
                                    ((Number(form.criterio_tecnico) + Number(form.criterio_fisico) + Number(form.criterio_actitud)) / 3) >= 90 ? 'bg-emerald-500 text-white' :
                                    ((Number(form.criterio_tecnico) + Number(form.criterio_fisico) + Number(form.criterio_actitud)) / 3) >= 75 ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                    {((Number(form.criterio_tecnico) + Number(form.criterio_fisico) + Number(form.criterio_actitud)) / 3).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Criterios */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { id: 'criterio_tecnico', label: 'Criterio Técnico', icon: <Brain size={16}/> },
                            { id: 'criterio_fisico', label: 'Criterio Físico', icon: <Activity size={16}/> },
                            { id: 'criterio_actitud', label: 'Criterio Actitud', icon: <Target size={16}/> }
                        ].map((item) => (
                            <div key={item.id} className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {item.icon} {item.label}
                                </label>
                                <input 
                                    type="number" 
                                    required 
                                    min="0" 
                                    max="100" 
                                    step="0.1"
                                    placeholder="0-100"
                                    className="w-full p-5 bg-white rounded-2xl ring-2 ring-slate-100 focus:ring-slate-900 outline-none font-black text-2xl text-center text-slate-800 transition-all"
                                    value={(form as any)[item.id]}
                                    onChange={(e) => setForm({...form, [item.id]: e.target.value})}
                                />
                                <div className="flex justify-between px-2">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Min: 0</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Max: 100</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <Eye size={12}/> Observaciones
                            </label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 rounded-2xl ring-2 ring-slate-100 focus:ring-slate-900 outline-none min-h-[100px] text-sm font-medium"
                                value={form.observacion}
                                onChange={(e) => setForm({...form, [ 'observacion' ]: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <MessageSquare size={12}/> Recomendaciones
                            </label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 rounded-2xl ring-2 ring-slate-100 focus:ring-slate-900 outline-none min-h-[100px] text-sm font-medium"
                                value={form.recomendacion}
                                onChange={(e) => setForm({...form, [ 'recomendacion' ]: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* BOTONES DINÁMICOS */}
                    <div className="flex gap-4">
                        {modoEdicion && (
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                            >
                                <RotateCcw size={20} /> Cancelar
                            </button>
                        )}
                        <button 
                            type="submit" disabled={loading || !form.id_arbitro}
                            className={`flex-[2] py-6 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group disabled:opacity-50
                                ${modoEdicion ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-amber-500'}`}
                        >
                            <Save className="group-hover:scale-125 transition-transform" />
                            {loading ? 'Procesando...' : modoEdicion ? 'Guardar Cambios' : 'Finalizar y Guardar Evaluación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioEvaluacion;