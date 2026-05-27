import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Mail, Trash2, UserCircle, Camera, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Asesor } from './Asesores';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asesor: Asesor | null;
  onSuccess: () => void;
}

const ModalEditarAsesor: React.FC<Props> = ({ isOpen, onClose, asesor, onSuccess }) => {
  const URL_BACKEND = `${import.meta.env.VITE_API_URL}`;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string, tipo: 'error' | 'success' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && asesor) {
      if (asesor.foto) {
        setPreviewUrl(`${URL_BACKEND}${asesor.foto}`);
      } else {
        setPreviewUrl(null);
      }
      setSelectedImage(null);
      setMensaje(null);
    }
  }, [asesor, isOpen]);

  if (!isOpen || !asesor) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje(null);

    const formData = new FormData(e.currentTarget);
    
    // Si el usuario seleccionó una imagen nueva, la adjuntamos
    if (selectedImage) {
      formData.append('foto', selectedImage);
    }

    try {
      const token = sessionStorage.getItem('token');
      // Usamos id_usuario porque el backend busca por el ID de la tabla principal USUARIO
      await axios.put(`${URL_BACKEND}/api/usuarios/asesores/${asesor.id_usuario}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      setMensaje({ texto: "✅ Datos actualizados con éxito", tipo: 'success' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      setMensaje({ 
        texto: error.response?.data?.message || "❌ Error al actualizar el asesor", 
        tipo: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsesor = async () => {
    if (window.confirm(`¿Estás seguro de eliminar permanentemente a ${asesor.nombre}?`)) {
      try {
        const token = sessionStorage.getItem('token');
        await axios.delete(`${URL_BACKEND}/api/usuarios/asesores/${asesor.id_usuario}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error al eliminar el asesor:", error);
        alert("Error al eliminar el registro.");
      }
    }
  };

  const labelStyle = "text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1";
  const inputStyle = "w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-50 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Editar Perfil Asesor</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Actualización de datos maestros</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          {mensaje && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase ${mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {mensaje.tipo === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
              {mensaje.texto}
            </div>
          )}

          {/* FOTO SECCIÓN */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              className="relative w-28 h-28 cursor-pointer group rounded-[2.5rem] p-0 bg-transparent border-0 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Actualizar fotografía de perfil"
            >
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Perfil" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <UserCircle size={48} />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if(file) {
                setSelectedImage(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actualizar Fotografía</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* 1. Nombre de Usuario */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className={labelStyle}>Nombre de Usuario (Login)</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="nombre_usuario" defaultValue={asesor.nombre_usuario} className={`${inputStyle} pl-10`} required />
              </div>
            </div>

            {/* 2. CI y 3. Nombres */}
            <div className="space-y-1">
              <label className={labelStyle}>Cédula de Identidad</label>
              <input name="ci" defaultValue={asesor.ci} className={inputStyle} required />
            </div>
            <div className="space-y-1">
              <label className={labelStyle}>Nombre(s)</label>
              <input name="nombre" defaultValue={asesor.nombre} className={inputStyle} required />
            </div>

            {/* 4. Apellido Paterno y 5. Apellido Materno */}
            <div className="space-y-1">
              <label className={labelStyle}>Apellido Paterno</label>
              <input name="apellido_paterno" defaultValue={asesor.apellido_paterno} className={inputStyle} required />
            </div>
            <div className="space-y-1">
              <label className={labelStyle}>Apellido Materno</label>
              <input name="apellido_materno" defaultValue={asesor.apellido_materno} className={inputStyle} />
            </div>
            
            {/* 6. Fecha de Nacimiento y 7. Género */}
            <div className="space-y-1">
              <label className={labelStyle}>Fecha de Nacimiento</label>
              <input 
                type="date" 
                name="fecha_nacimiento" 
                defaultValue={asesor.fecha_nacimiento ? asesor.fecha_nacimiento.split('T')[0] : ''} 
                className={inputStyle} 
              />
            </div>
            <div className="space-y-1">
              <label className={labelStyle}>Género</label>
              <select name="genero" defaultValue={asesor.genero} className={inputStyle}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            {/* 8. Email */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className={labelStyle}>Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="email" type="email" defaultValue={asesor.email} className={`${inputStyle} pl-10`} />
              </div>
            </div>

            {/* 9. Teléfono y 10. Estado */}
            <div className="space-y-1">
              <label className={labelStyle}>Teléfono</label>
              <input name="telefono" defaultValue={asesor.telefono} className={inputStyle} />
            </div>
            <div className="space-y-1">
              <label className={labelStyle}>Estado de Cuenta</label>
              <select name="estado" defaultValue={asesor.estado} className={inputStyle}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* 11. ROL DEL ASESOR (Roles específicos solicitados) */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className={labelStyle}>Rol Administrativo en el Sistema</label>
              <select name="rol" defaultValue={asesor.rol} className={`${inputStyle} bg-indigo-50/30 border-indigo-100 focus:ring-indigo-600`}>
                <option value="Administrador">Administrador</option>
                <option value="Secretaría General">Secretaría General</option>
                <option value="Comisión Disciplinaria">Comisión Disciplinaria</option>
                <option value="Gestor de Designaciones">Gestor de Designaciones</option>
                <option value="Asesor Técnico">Asesor Técnico</option>
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3 pt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
              {isSubmitting ? "Procesando..." : "Guardar Cambios"}
            </button>
            
            <button 
              type="button" 
              onClick={handleDeleteAsesor}
              className="w-full py-4 bg-white text-rose-500 font-black border-2 border-rose-50 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Eliminar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarAsesor;