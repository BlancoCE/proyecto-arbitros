import React, { useState, useEffect } from 'react';
import { Save, Calendar, User, Info, Snowflake, RefreshCw, AlertCircle, UploadCloud, Trash2, FileText } from 'lucide-react';
import axios from 'axios';

interface Props { onBack: () => void; onSuccess: () => void; licenciaParaEditar?: any; }

const FormularioLicencia: React.FC<Props> = ({ onBack, onSuccess, licenciaParaEditar }) => {
    const [arbitros, setArbitros] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorFecha, setErrorFecha] = useState("");
    const [sancionAlerta, setSancionAlerta] = useState<any>(null);
    const [cargandoSancion, setCargandoSancion] = useState(false);
    
    // --- NUEVO ESTADO PARA EL ARCHIVO ---
    const [archivo, setArchivo] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        id_arbitro: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        tipo: 'Temporal',
        motivo: '',
        congelo_sancion: false
    });

    useEffect(() => {
        const cargarData = async () => {
            try {
                const res = await axios.get('import.meta.env.VITE_API_URL/api/licencias/arbitros-habilitados');
                setArbitros(res.data);
                
                if (licenciaParaEditar) {
                    setFormData({
                        id_arbitro: licenciaParaEditar.id_arbitro.toString(),
                        fecha_inicio: licenciaParaEditar.fecha_inicio ? licenciaParaEditar.fecha_inicio.split('T')[0] : '',
                        fecha_fin: licenciaParaEditar.fecha_fin ? licenciaParaEditar.fecha_fin.split('T')[0] : '',
                        tipo: licenciaParaEditar.tipo || 'Temporal',
                        motivo: licenciaParaEditar.motivo || '',
                        congelo_sancion: !!licenciaParaEditar.congelo_sancion
                    });
                }
            } catch (err) {
                console.error("Error cargando datos del formulario", err);
            }
        };
        cargarData();
    }, [licenciaParaEditar]);

    useEffect(() => {
        if (formData.tipo === 'Temporal' && formData.fecha_inicio && formData.fecha_fin) {
            if (formData.fecha_fin < formData.fecha_inicio) {
                setErrorFecha("La fecha de finalización no puede ser anterior al inicio.");
            } else {
                setErrorFecha("");
            }
        } else {
            setErrorFecha("");
        }
    }, [formData.fecha_inicio, formData.fecha_fin, formData.tipo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (errorFecha) return;

        setIsSubmitting(true);
        try {
            // --- CAMBIO A FORMDATA PARA SOPORTAR ARCHIVOS ---
            const data = new FormData();
            data.append('id_arbitro', formData.id_arbitro);
            data.append('fecha_inicio', formData.fecha_inicio);
            data.append('tipo', formData.tipo);
            data.append('motivo', formData.motivo);
            data.append('congelo_sancion', String(formData.congelo_sancion));
            
            // Lógica de fecha fin
            const fFin = formData.tipo === 'Especial (1 día)' ? formData.fecha_inicio : 
                         formData.tipo === 'Indefinida' ? '' : formData.fecha_fin;
            data.append('fecha_fin', fFin);

            // Adjuntar archivo si existe
            if (archivo) {
                data.append('url_carta', archivo);
            }

            if (licenciaParaEditar) {
                await axios.put(`import.meta.env.VITE_API_URL/api/licencias/${licenciaParaEditar.id_licencia}`, data);
            } else {
                await axios.post('import.meta.env.VITE_API_URL/api/licencias/registrar', data);
            }
            onSuccess();
        } catch (error: any) { 
            const msg = error.response?.data?.error || "Error al guardar la licencia";
            alert(msg); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const verificarSancionArbitro = async (id: string) => {
        if (!id) {
            setSancionAlerta(null);
            return;
        }
        setCargandoSancion(true);
        try {
            const res = await axios.get(`import.meta.env.VITE_API_URL/api/sancion/verificar/${id}`);
            if (res.data && res.data.tipo_sancion) {
                setSancionAlerta(res.data);
            } else {
                setSancionAlerta(null);
            }
        } catch (err) {
            console.error("Error al verificar sanción");
            setSancionAlerta(null);
        } finally {
            setCargandoSancion(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200">
                    <Calendar className="text-white" size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                        {licenciaParaEditar ? 'Editar Licencia' : 'Nueva Licencia'}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">Gestión de permisos y ausencias</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Árbitro */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Seleccionar Árbitro</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select 
                                required
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-700 appearance-none"
                                value={formData.id_arbitro}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setFormData({...formData, id_arbitro: id});
                                    verificarSancionArbitro(id);
                                }}
                                disabled={!!licenciaParaEditar}
                            >
                                <option value="">Seleccione un colegiado...</option>
                                {arbitros.map((a: any) => (
                                    <option key={a.id_arbitro} value={a.id_arbitro}>{a.apellido_paterno} {a.apellido_materno} {a.nombre} - {a.categoria}</option>
                                ))}
                            </select>
                        </div>
                        {cargandoSancion && (
                            <div className="mt-2 ml-2 flex items-center gap-2 text-[10px] text-blue-500 font-bold animate-pulse">
                                <RefreshCw size={12} className="animate-spin" /> VERIFICANDO HISTORIAL...
                            </div>
                        )}
                        {sancionAlerta && !cargandoSancion && (
                            <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl animate-in fade-in slide-in-from-top-2 shadow-sm">
                                <div className="flex gap-3">
                                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                    <div>
                                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-tighter">Atención: Árbitro con Sanción Vigente</h4>
                                        <p className="text-[11px] text-amber-700 font-medium leading-tight mt-1">
                                            Este colegiado posee una <span className="font-bold underline">{sancionAlerta.tipo_sancion}</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tipo Licencia */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tipo de Licencia</label>
                        <select 
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-700"
                            value={formData.tipo}
                            onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                        >
                            <option value="Temporal">Temporal (Rango de fechas)</option>
                            <option value="Especial (1 día)">Especial (Solo 1 día)</option>
                            <option value="Indefinida">Indefinida (Sin fecha fin)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Fecha de Inicio</label>
                        <input 
                            type="date" required
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-700"
                            value={formData.fecha_inicio}
                            onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                        />
                    </div>

                    {formData.tipo === 'Temporal' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Fecha de Finalización</label>
                            <input 
                                type="date" required
                                className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none font-bold text-gray-700 ${errorFecha ? 'border-red-500 focus:border-red-500' : 'border-gray-100 focus:border-blue-500'}`}
                                value={formData.fecha_fin}
                                onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                            />
                        </div>
                    )}
                </div>

                {/* --- NUEVA SECCIÓN: CARGA DE DOCUMENTO --- */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Carta de Solicitud / Certificado (PDF o Imagen)</label>
                    <div className="flex items-center gap-3">
                        <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${archivo ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-blue-400'}`}>
                            <div className={`p-2 rounded-xl ${archivo ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {archivo ? <FileText size={20}/> : <UploadCloud size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold truncate ${archivo ? 'text-emerald-700' : 'text-gray-500'}`}>
                                    {archivo ? archivo.name : 'Seleccionar documento de respaldo...'}
                                </p>
                                {!archivo && <p className="text-[9px] text-gray-400 font-medium">Click para buscar archivo</p>}
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*,.pdf" 
                                onChange={(e) => setArchivo(e.target.files?.[0] || null)} 
                            />
                        </label>
                        {archivo && (
                            <button 
                                type="button"
                                onClick={() => setArchivo(null)}
                                className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Motivo / Descripción</label>
                    <textarea 
                        required rows={3}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-medium text-gray-600"
                        placeholder="Especifique el motivo de la licencia..."
                        value={formData.motivo}
                        onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onBack} className="flex-1 p-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 uppercase text-xs">Cancelar</button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !!errorFecha} 
                        className={`flex-[2] p-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all ${
                            (isSubmitting || errorFecha) ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
                        }`}
                    >
                        {isSubmitting ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>}
                        {licenciaParaEditar ? 'Actualizar Licencia' : 'Confirmar Registro'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioLicencia;