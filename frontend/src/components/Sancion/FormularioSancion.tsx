import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Save, User, Calendar, Info, AlertCircle, RefreshCw, FileText, UploadCloud, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Arbitro {
    id_arbitro: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    categoria: string;
    especializacion: string;
}

interface FormularioProps {
    onSuccess: () => void;
    onBack: () => void;
    sancionParaEditar?: any; 
}

const FormularioSancion: React.FC<FormularioProps> = ({ onSuccess, onBack, sancionParaEditar }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [arbitros, setArbitros] = useState<Arbitro[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorFecha, setErrorFecha] = useState("");
    
    // --- ESTADOS PARA ARCHIVOS ---
    const [archivo, setArchivo] = useState<File | null>(null);
    const [previewNombre, setPreviewNombre] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        id_arbitro: '',
        tipo_sancion: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        motivo: '',
    });

    useEffect(() => {
        const cargarArbitros = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/sancion/arbitros-jerarquia');
                setArbitros(res.data);
            } catch (err) {
                console.error("Error cargando árbitros:", err);
            } finally {
                setLoading(false);
            }
        };
        cargarArbitros();
    }, []);

    useEffect(() => {
        if (sancionParaEditar) {
            setFormData({
                id_arbitro: sancionParaEditar.id_arbitro.toString(),
                tipo_sancion: sancionParaEditar.tipo_sancion,
                fecha_inicio: sancionParaEditar.fecha_inicio ? sancionParaEditar.fecha_inicio.split('T')[0] : '',
                fecha_fin: sancionParaEditar.fecha_fin ? sancionParaEditar.fecha_fin.split('T')[0] : '',
                motivo: sancionParaEditar.motivo || '',
            });
            if (sancionParaEditar.url_resolucion) {
                setPreviewNombre("Resolución cargada anteriormente");
            }
        }
    }, [sancionParaEditar]);

    useEffect(() => {
        const requiereRango = formData.tipo_sancion.includes('Suspensión') || 
                             formData.tipo_sancion.includes('Inhabilitación');

        if (requiereRango && formData.fecha_inicio && formData.fecha_fin) {
            if (formData.fecha_fin < formData.fecha_inicio) {
                setErrorFecha("La fecha de fin no puede ser anterior al inicio.");
            } else {
                setErrorFecha("");
            }
        } else {
            setErrorFecha("");
        }
    }, [formData.fecha_inicio, formData.fecha_fin, formData.tipo_sancion]);

    // --- GESTIÓN DE ARCHIVOS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setArchivo(selectedFile);
            setPreviewNombre(selectedFile.name);
        }
    };

    const removeFile = () => {
        setArchivo(null);
        setPreviewNombre(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (errorFecha) return;

        setIsSubmitting(true);
        const data = new FormData(); // Usamos FormData para el archivo

        const authData = sessionStorage.getItem('user_auth');
        const user = authData ? JSON.parse(authData) : null;
        const requiereRango = formData.tipo_sancion.includes('Suspensión') || 
                             formData.tipo_sancion.includes('Inhabilitación');

        // Append de campos normales
        data.append('id_arbitro', formData.id_arbitro);
        data.append('tipo_sancion', formData.tipo_sancion);
        data.append('fecha_inicio', formData.fecha_inicio);
        data.append('fecha_fin', requiereRango ? formData.fecha_fin : '');
        data.append('motivo', formData.motivo);
        data.append('id_asesor', user?.id_usuario || '');

        // Append del archivo (Multer lo recibirá como url_sancion)
        if (archivo) {
            data.append('url_sancion', archivo);
        }

        try {
            if (sancionParaEditar) {
                await axios.put(`http://localhost:3001/api/sancion/${sancionParaEditar.id_sancion}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('http://localhost:3001/api/sancion', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
        } catch (error: any) {
            const msg = error.response?.data?.error || "Error al guardar la sanción";
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const mostrarFechaFin = formData.tipo_sancion.includes('Suspensión') || 
                           formData.tipo_sancion.includes('Inhabilitación');

    return (
        <div className="p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-100">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                            {sancionParaEditar ? 'Editar Sanción' : 'Aplicar Sanción'}
                        </h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Régimen Disciplinario</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Árbitro Involucrado</label>
                        <select 
                            required
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 outline-none font-bold text-gray-700 transition-all"
                            value={formData.id_arbitro}
                            onChange={(e) => setFormData({...formData, id_arbitro: e.target.value})}
                            disabled={!!sancionParaEditar}
                        >
                            <option value="">Seleccionar colegiado...</option>
                            {arbitros.map((a) => (
                                <option key={a.id_arbitro} value={a.id_arbitro}>
                                    [{a.categoria}] {a.apellido_paterno} {a.apellido_materno} {a.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Infracción Cometida</label>
                        <select 
                            required
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 outline-none font-bold text-gray-700 transition-all"
                            value={formData.tipo_sancion}
                            onChange={(e) => setFormData({...formData, tipo_sancion: e.target.value})}
                        >
                            <option value="">Seleccione tipo...</option>
                            <option value="Amonestación Escrita">Amonestación Escrita</option>
                            <option value="Multa Económica">Multa Económica</option>
                            <option value="Suspensión Temporal">Suspensión Temporal</option>
                            <option value="Inhabilitación de Funciones">Inhabilitación de Funciones</option>
                            <option value="Baja Definitiva">Baja Definitiva (Expulsión)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Fecha de Inicio</label>
                        <input 
                            type="date"
                            required
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 outline-none font-bold text-gray-700"
                            value={formData.fecha_inicio}
                            onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                        />
                    </div>

                    {mostrarFechaFin ? (
                        <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
                            <label className="text-[10px] font-black text-red-500 uppercase ml-1">Fecha de Finalización</label>
                            <input 
                                type="date"
                                required
                                className={`w-full p-4 bg-red-50 border-2 rounded-2xl outline-none font-bold text-red-700 transition-all ${errorFecha ? 'border-red-500' : 'border-red-100 focus:border-red-500'}`}
                                value={formData.fecha_fin}
                                onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                            />
                            {errorFecha && (
                                <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 ml-1">
                                    <AlertCircle size={12} /> {errorFecha}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 self-end">
                            <Info className="text-blue-500" size={20} />
                            <p className="text-[10px] text-blue-700 font-bold uppercase leading-tight">
                                Esta sanción no requiere <br /> fecha de término.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Descripción del Informe Disciplinario</label>
                    <textarea 
                        required
                        rows={3}
                        placeholder="Detalle la falta cometida según el informe arbitral..."
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 outline-none font-medium text-gray-700 resize-none transition-all"
                        value={formData.motivo}
                        onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                    />
                </div>

                {/* --- SECCIÓN DE CARGA DE DOCUMENTO (EL FALLO) --- */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Fallo del Tribunal de Penas (PDF / Imagen)</label>
                    {!previewNombre ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-red-400 hover:bg-red-50/30 cursor-pointer transition-all group"
                        >
                            <div className="p-3 bg-gray-50 rounded-full text-gray-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
                                <UploadCloud size={24} />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Click para subir resolución</p>
                            <p className="text-[9px] text-gray-400 font-medium">Formatos permitidos: PDF, JPG, PNG (Máx. 10MB)</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-100 rounded-2xl animate-in zoom-in duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm">
                                    <FileText size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-black text-red-700 truncate max-w-[200px] leading-none mb-1">{previewNombre}</p>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Documento Listo</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={removeFile}
                                className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                                title="Eliminar archivo"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        type="button"
                        onClick={onBack}
                        className="flex-1 p-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all uppercase text-xs tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting || !!errorFecha}
                        className={`flex-[2] p-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest ${
                            (isSubmitting || errorFecha) 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                            : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
                        }`}
                    >
                        {isSubmitting ? (
                            <RefreshCw className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Save size={18} />
                                {sancionParaEditar ? 'Guardar Cambios' : 'Confirmar Sanción'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioSancion;