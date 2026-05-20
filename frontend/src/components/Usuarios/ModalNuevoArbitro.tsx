import React, { useState, useRef } from 'react';
import { X, Upload, Save, User, Mail, Phone, ShieldCheck, NotebookPen, Key, UserCircle, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalNuevoArbitro: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const URL_BACKEND = `${import.meta.env.VITE_API_URL}`;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    
    // Validación manual de campos requeridos
    const requiredFields = ['nombre_usuario', 'password', 'ci', 'nombre', 'apellido_paterno'];
    for (let field of requiredFields) {
        if (!formData.get(field)) {
            setStatus({ msg: `⚠️ Complete los campos obligatorios (*)`, type: 'error' });
            setIsSubmitting(false);
            return;
        }
    }

    try {
      const token = sessionStorage.getItem('token');
      // Usamos axios para mantener consistencia con el backend
      await axios.post(`${URL_BACKEND}/api/usuarios/arbitros`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      setStatus({ msg: "✅ Árbitro registrado con éxito", type: 'success' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      setStatus({ 
        msg: error.response?.data?.message || "❌ Error al registrar árbitro", 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionTitle = "text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-indigo-50 pb-2";
  const inputStyle = "w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-50 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Nuevo Registro Arbitral</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gestión de Talento Humano - CPA La Paz</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20}/>
          </button>
        </div>

        {/* NOTIFICACIÓN INTERNA (Reemplaza al Toast con error) */}
        {status && (
          <div className={`mx-8 mt-4 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
            <span className="text-xs font-black uppercase">{status.msg}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
          
          {/* 1. FOTOGRAFÍA (Ubicación central superior) */}
          <div className="flex flex-col items-center gap-3">
            <div 
              className="relative w-28 h-28 cursor-pointer group" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Vista previa" />
                ) : (
                  <Camera className="text-slate-300" size={32} />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity text-white text-[9px] font-black uppercase">
                Cambiar Foto
              </div>
            </div>
            <input ref={fileInputRef} type="file" name="foto" className="hidden" accept="image/*" onChange={handleFileChange} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Foto de perfil oficial</span>
          </div>

          {/* 2. CREDENCIALES DE ACCESO */}
          <section>
            <h3 className={sectionTitle}><Key size={14}/> Credenciales de Acceso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Nombre de Usuario *</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input name="nombre_usuario" placeholder="ej. j.perez" className={`${inputStyle} pl-10`} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Contraseña de Sistema *</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input name="password" type="password" placeholder="••••••••" className={`${inputStyle} pl-10`} required />
                </div>
              </div>
            </div>
          </section>

          {/* 3. DATOS PERSONALES */}
          <section>
            <h3 className={sectionTitle}><User size={14}/> Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Cédula de Identidad *</label>
                <input name="ci" placeholder="1234567 LP" className={inputStyle} required />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Nombres Completos *</label>
                <input name="nombre" placeholder="Nombres" className={inputStyle} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Apellido Paterno *</label>
                <input name="apellido_paterno" placeholder="Paterno" className={inputStyle} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Apellido Materno</label>
                <input name="apellido_materno" placeholder="Materno" className={inputStyle} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Género</label>
                <select name="genero" className={inputStyle}>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" className={inputStyle} required />
              </div>
            </div>
          </section>

          {/* 4. INFORMACIÓN DE CONTACTO */}
          <section>
            <h3 className={sectionTitle}><Phone size={14}/> Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input name="email" type="email" placeholder="correo@ejemplo.com" className={`${inputStyle} pl-10`} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Número de Celular</label>
                <input name="telefono" placeholder="70000000" className={inputStyle} />
              </div>
            </div>
          </section>

          {/* 5. INFORMACIÓN ARBITRAL (CATEGORÍA, ESPECIALIZACIÓN Y ESTADO) */}
          <section>
            <h3 className={sectionTitle}><NotebookPen size={14}/> Información Arbitral</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-indigo-600 uppercase italic tracking-tighter">Categoría Jerárquica *</label>
                <select name="categoria" className={`${inputStyle} border-indigo-100 shadow-none`}>
                  <option value="FIFA">FIFA</option>
                  <option value="Primera">Primera</option>
                  <option value="Segunda">Segunda</option>
                  <option value="Tercera">Tercera</option>
                  <option value="Cuarta">Cuarta</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-indigo-600 uppercase italic tracking-tighter">Especialización *</label>
                <select name="especializacion" className={`${inputStyle} border-indigo-100 shadow-none`}>
                  <option value="Central">Árbitro Central</option>
                  <option value="Asistente">Árbitro Asistente</option>
                  <option value="Ambas">Ambas (Polifuncional)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-indigo-600 uppercase italic tracking-tighter">Estado Inicial *</label>
                <select name="estado" className={`${inputStyle} border-indigo-100 shadow-none`}>
                  <option value="Activo">Activo</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="En Licencia">En Licencia</option>
                </select>
              </div>
            </div>
          </section>

          {/* ACCIONES */}
          <div className="flex gap-4 pt-4 pb-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
            >
              Descartar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 py-4 rounded-2xl bg-slate-900 font-black uppercase text-[10px] tracking-widest text-white hover:bg-indigo-600 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
              {isSubmitting ? "Procesando..." : "Registrar Árbitro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoArbitro;