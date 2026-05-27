import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Mail, Trash2, NotebookPen, UserCircle, Camera, CheckCircle2, AlertCircle, Loader2, Phone, User } from 'lucide-react';

interface Arbitro {
  id_arbitro: number;
  id_usuario: number;
  nombre_usuario: string;
  ci: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email?: string;
  telefono: string;
  categoria: string;
  especializacion: string;
  estado: string;
  fecha_nacimiento: string;
  genero: string;
  foto: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  arbitro: Arbitro | null;
  onSuccess: () => void;
}

const ModalEditarArbitro: React.FC<Props> = ({ isOpen, onClose, arbitro, onSuccess }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (arbitro?.foto) {
      setSelectedImage(`${import.meta.env.VITE_API_URL}${arbitro.foto}`);
    } else {
      setSelectedImage(null);
    }
    // Limpiar status al cambiar de arbitro
    setStatus(null);
  }, [arbitro]);

  if (!isOpen || !arbitro) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    
    if (fileInputRef.current?.files?.[0]) {
      formData.set('foto', fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/arbitros/${arbitro.id_arbitro}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setStatus({ msg: "✅ Perfil actualizado con éxito", type: 'success' });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const err = await response.json();
        setStatus({ msg: `❌ ${err.message || "Error al actualizar"}`, type: 'error' });
      }
    } catch (error) {
      console.error("Error en la petición de actualización:", error);
      setStatus({ msg: "🚀 Error de conexión con el servidor", type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!arbitro) return;
    if (globalThis.confirm(`¿Estás seguro de eliminar permanentemente al árbitro ${arbitro.nombre} y su cuenta de usuario?`)) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/arbitros/${arbitro.id_arbitro}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          onSuccess();
          onClose();
        }
      } catch (error) {
        console.error("Error en la petición de actualización:", error);
        setStatus({ msg: "❌ Error al eliminar el registro", type: 'error' });
      }
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
            <h2 className="text-xl font-black text-slate-800 uppercase italic">Editar Perfil Arbitral</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID Registro: #00{arbitro.id_arbitro}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20}/>
          </button>
        </div>

        {/* NOTIFICACIÓN INTERNA */}
        {status && (
          <div className={`mx-8 mt-4 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
            <span className="text-xs font-black uppercase">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
          
          {/* FOTOGRAFÍA */}
          <div className="flex flex-col items-center gap-3">
            <div 
              className="relative w-28 h-28 cursor-pointer group" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105">
                <img 
                  src={selectedImage || '/default-avatar.png'} 
                  className="w-full h-full object-cover" 
                  alt="Perfil" 
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity text-white">
                <Camera size={24} />
              </div>
            </div>
            <input 
              ref={fileInputRef} 
              name="foto" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if(file) setSelectedImage(URL.createObjectURL(file));
              }} 
            />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Presiona para cambiar imagen</span>
          </div>

          {/* DATOS DE ACCESO */}
          <section>
            <h3 className={sectionTitle}><UserCircle size={14}/> Acceso al Sistema</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Nombre de Usuario (Login)</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input name="nombre_usuario" defaultValue={arbitro.nombre_usuario} className={`${inputStyle} pl-10`} required />
                </div>
              </div>
            </div>
          </section>

          {/* DATOS PERSONALES */}
          <section>
            <h3 className={sectionTitle}><User size={14}/> Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Cédula de Identidad</label>
                <input name="ci" defaultValue={arbitro.ci} className={inputStyle} required />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Nombres Completos</label>
                <input name="nombre" defaultValue={arbitro.nombre} className={inputStyle} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Ap. Paterno</label>
                <input name="apellido_paterno" defaultValue={arbitro.apellido_paterno} className={inputStyle} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Ap. Materno</label>
                <input name="apellido_materno" defaultValue={arbitro.apellido_materno} className={inputStyle} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Género</label>
                <select name="genero" defaultValue={arbitro.genero} className={inputStyle}>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" defaultValue={arbitro.fecha_nacimiento ? arbitro.fecha_nacimiento.split('T')[0] : ''} className={inputStyle} />
              </div>
            </div>
          </section>

          {/* CONTACTO */}
          <section>
            <h3 className={sectionTitle}><Phone size={14}/> Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input name="email" type="email" defaultValue={arbitro.email} className={`${inputStyle} pl-10`} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-slate-500 uppercase">Teléfono</label>
                <input name="telefono" defaultValue={arbitro.telefono} className={inputStyle} />
              </div>
            </div>
          </section>

          {/* INFORMACIÓN ARBITRAL */}
          <section>
            <h3 className={sectionTitle}><NotebookPen size={14}/> Clasificación y Estado</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-indigo-600 uppercase italic tracking-tighter">Categoría</label>
                <select name="categoria" defaultValue={arbitro.categoria} className={`${inputStyle} border-indigo-100 shadow-none`}>
                  <option value="FIFA">FIFA</option>
                  <option value="Primera">Primera</option>
                  <option value="Segunda">Segunda</option>
                  <option value="Tercera">Tercera</option>
                  <option value="Cuarta">Cuarta</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-indigo-600 uppercase italic tracking-tighter">Especialización</label>
                <select name="especializacion" defaultValue={arbitro.especializacion} className={`${inputStyle} border-indigo-100 shadow-none`}>
                  <option value="Ambas">Ambas</option>
                  <option value="Central">Central</option>
                  <option value="Asistente">Asistente</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold ml-1 text-indigo-600 uppercase italic tracking-tighter">Estado Administrativo</label>
                <select name="estado" defaultValue={arbitro.estado} className={`${inputStyle} border-indigo-100 shadow-none`}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="En Licencia">En Licencia</option>
                </select>
              </div>
            </div>
          </section>

          {/* ACCIONES */}
          <div className="flex flex-col gap-3 pt-4 pb-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
              {isSubmitting ? "Guardando Cambios..." : "Guardar Cambios"}
            </button>
            
            <button 
              type="button" 
              onClick={handleDelete}
              className="w-full py-4 bg-white text-rose-600 font-black uppercase text-[10px] tracking-widest border-2 border-rose-50 rounded-2xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Eliminar Registro Definitivamente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarArbitro;