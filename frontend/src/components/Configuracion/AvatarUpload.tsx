import React, { useRef, useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const AvatarUpload = ({ fotoActual, onImageChange }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Define la URL base de tu backend (Ajusta el puerto si es necesario)
    const URL_BACKEND = "import.meta.env.VITE_API_URL"; 

    // Estado para la previsualización
    const [preview, setPreview] = useState<string | null>(null);

    // Efecto para cargar la foto inicial cuando viene de la BD
    useEffect(() => {
        if (fotoActual) {
            // Si la foto es un string Base64 (nueva subida), la usamos directo
            if (fotoActual.startsWith('data:image')) {
                setPreview(fotoActual);
            } 
            // Si es una ruta del servidor, concatenamos la URL base
            else {
                setPreview(`${URL_BACKEND}${fotoActual}`);
            }
        } else {
            // Placeholder si no tiene foto
            setPreview('https://via.placeholder.com/150');
        }
    }, [fotoActual]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String); // Actualiza la vista previa local inmediatamente
                onImageChange(base64String); // Envía al padre (Configuracion.tsx) para el guardado
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 bg-slate-50">
                    <img 
                        src={preview || 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => {
                            // Si la imagen falla (ruta rota), ponemos el placeholder
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                        }}
                    />
                </div>
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-slate-900 transition-all active:scale-95"
                >
                    <Camera size={18} />
                </button>
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />

            <div className="text-center">
                <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">Foto de Perfil</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Formatos: JPG, PNG • Máx 2MB</p>
            </div>
        </div>
    );
};

export default AvatarUpload;