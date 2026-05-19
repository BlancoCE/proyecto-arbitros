import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Save, User, Mail, Phone, ShieldCheck, Lock, UserCircle, Settings, Camera, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalNuevoAsesor: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const URL_BACKEND = "http://localhost:3001";
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string, tipo: 'error' | 'success' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setMensaje(null);

    const formData = new FormData(e.currentTarget);
    if (selectedImage) {
      formData.append('foto', selectedImage);
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${URL_BACKEND}/api/usuarios/asesores`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      setMensaje({ texto: "Asesor registrado con éxito", tipo: 'success' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      setMensaje({ 
        texto: error.response?.data?.message || "Error al registrar asesor", 
        tipo: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionStyle = "bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4";
  const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1";
  const inputStyle = "w-full p-3.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold text-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-4">
        
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-slate-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <UserCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic">Nuevo Asesor</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Registro administrativo del sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {mensaje && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase ${mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {mensaje.tipo === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
              {mensaje.texto}
            </div>
          )}

          {/* FOTO */}
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-500 transition-all group relative"
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <Camera className="text-slate-300 group-hover:text-indigo-500" size={32} />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[8px] text-white font-black uppercase">Cambiar</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SECCIÓN CUENTA */}
            <div className={sectionStyle}>
              <h3 className="text-xs font-black text-indigo-600 uppercase flex items-center gap-2"><Lock size={14}/> Credenciales</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelStyle}>Usuario *</label>
                  <input name="nombre_usuario" required className={inputStyle} placeholder="ej. jdoe" />
                </div>
                <div>
                  <label className={labelStyle}>Contraseña *</label>
                  <input name="password" type="password" required className={inputStyle} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Rol</label>
                    <select name="rol" className={inputStyle}>
                      <option value="Administrador">Administrador</option>
                      <option value="Secretaría General">Secretaría General</option>
                      <option value="Comisión Disciplinaria">Comisión Disciplinaria</option>
                      <option value="Gestor de Designaciones">Gestor de Designaciones</option>
                      <option value="Asesor Técnico">Asesor Técnico</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Estado</label>
                    <select name="estado" className={inputStyle}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN DATOS PERSONALES */}
            <div className={sectionStyle}>
              <h3 className="text-xs font-black text-indigo-600 uppercase flex items-center gap-2"><User size={14}/> Datos Personales</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Nombres *</label>
                    <input name="nombre" required className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>CI *</label>
                    <input name="ci" required className={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Ap. Paterno *</label>
                    <input name="apellido_paterno" required className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Ap. Materno</label>
                    <input name="apellido_materno" className={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>F. Nacimiento</label>
                    <input name="fecha_nacimiento" type="date" required className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Género</label>
                    <select name="genero" className={inputStyle}>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACTO */}
          <div className={`${sectionStyle} md:col-span-2`}>
            <h3 className="text-xs font-black text-indigo-600 uppercase flex items-center gap-2"><Mail size={14}/> Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Email</label>
                <input name="email" type="email" className={inputStyle} placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className={labelStyle}>Teléfono *</label>
                <input name="telefono" required className={inputStyle} placeholder="70000000" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
              {isSubmitting ? "Registrando..." : "Guardar Asesor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoAsesor;