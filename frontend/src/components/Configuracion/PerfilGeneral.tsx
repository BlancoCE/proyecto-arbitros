import React, { useState, useEffect } from 'react'; 
import { Save, User, Mail, Phone, Fingerprint, Calendar, MapPin, Briefcase, Loader } from 'lucide-react';

interface PerfilProps {
    datos: any;
    onSave: (datos: any) => void;
    loading: boolean;
}

const PerfilGeneral: React.FC<PerfilProps> = ({ datos, onSave, loading }) => {
    // Inicializamos el form, pero estará vacío al principio si la API no ha respondido
    const [form, setForm] = useState({ ...datos });

    // ESTE ES EL BLOQUE QUE SOLUCIONA EL PROBLEMA DE LOS CAMPOS VACÍOS
    useEffect(() => {
        if (datos) {
            setForm({ ...datos });
        }
    }, [datos]); // Cada vez que 'datos' cambie (cuando llegue la respuesta de la API), se actualiza el form

    console.log("Estado del Formulario actual:", form);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    const inputStyle = "w-full mt-2 p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-slate-700 text-sm";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2";
    
    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* SECCIÓN 1: IDENTIDAD PERSONAL */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <User size={20} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 uppercase italic">Identidad Personal</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className={labelStyle}><Fingerprint size={12}/> Carnet de Identidad</label>
                        <input name="ci" value={form.ci} onChange={handleChange} className={inputStyle} placeholder="Ej. 1234567 LP" required />
                    </div>
                    <div>
                        <label className={labelStyle}>Nombre de Usuario</label>
                        <input name="nombre_usuario" value={form.nombre_usuario} onChange={handleChange} className={inputStyle} placeholder="usuario123" required />
                    </div>
                    <div>
                        <label className={labelStyle}><Calendar size={12}/> Fecha de Nacimiento</label>
                        <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento?.split('T')[0]} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>Nombre(s)</label>
                        <input name="nombre" value={form.nombre} onChange={handleChange} className={inputStyle} placeholder="Nombres" required />
                    </div>
                    <div>
                        <label className={labelStyle}>Apellido Paterno</label>
                        <input name="apellido_paterno" value={form.apellido_paterno} onChange={handleChange} className={inputStyle} placeholder="Paterno" required />
                    </div>
                    <div>
                        <label className={labelStyle}>Apellido Materno</label>
                        <input name="apellido_materno" value={form.apellido_materno || ''} onChange={handleChange} className={inputStyle} placeholder="Materno" />
                    </div>
                </div>
            </section>

            {/* SECCIÓN 2: CONTACTO */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Mail size={20} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 uppercase italic">Contacto</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelStyle}><Mail size={12}/> Correo Electrónico</label>
                        <input type="email" name="email" value={form.email || ''} onChange={handleChange} className={inputStyle} placeholder="correo@ejemplo.com" />
                    </div>
                    <div>
                        <label className={labelStyle}><Phone size={12}/> Teléfono / WhatsApp</label>
                        <input name="telefono" value={form.telefono || ''} onChange={handleChange} className={inputStyle} placeholder="Ej. 70000000" />
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3: INFORMACIÓN PROFESIONAL (Solo Lectura o especialización) */}
            <section className="bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                        <Briefcase size={20} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 uppercase italic">Información Colegiada</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelStyle}>Rol en Sistema</label>
                        <div className="mt-2 p-4 bg-white/50 rounded-2xl text-sm font-bold text-indigo-600 uppercase border border-white">
                            {form.rol}
                        </div>
                    </div>
                    {form.rol === 'arbitro' && (
                        <>
                            <div>
                                <label className={labelStyle}>Categoría Actual</label>
                                <div className="mt-2 p-4 bg-white/50 rounded-2xl text-sm font-bold text-slate-700 uppercase border border-white">
                                    {form.categoria || 'Sin Categoría'}
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Especialización</label>
                                <select 
                                    name="especializacion" 
                                    value={form.especializacion || ''} 
                                    onChange={handleChange} 
                                    className={inputStyle}
                                >
                                    <option value="Arbitro Central">Árbitro Central</option>
                                    <option value="Asistente">Asistente</option>
                                    <option value="Ambos">Ambos</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
                <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase leading-tight italic">
                    * Los campos de Rol y Categoría son gestionados por la directiva. Si hay un error, contacta a Secretaría.
                </p>
            </section>

            {/* BOTÓN GUARDAR */}
            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                    {loading ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>}
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};

const Loader2 = ({ size, className }: any) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default PerfilGeneral;