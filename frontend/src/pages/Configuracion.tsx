import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, ShieldCheck, FileText, Camera, 
    Save, Loader2, CheckCircle2 
} from 'lucide-react';

// Importación de sub-componentes (los crearemos a continuación)
import PerfilGeneral from '../components/Configuracion/PerfilGeneral';
import SeguridadCuenta from '../components/Configuracion/SeguridadCuenta';
import HojaVidaSeccion from '../components/Configuracion/HojaVidaSeccion';
import AvatarUpload from '../components/Configuracion/AvatarUpload';

const Configuracion: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad' | 'cv'>('perfil');
    const [perfil, setPerfil] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        fetchPerfil();
    }, []);

    const fetchPerfil = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/configuracion/perfil`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPerfil(res.data);
        } catch (error) {
            console.error("Error al cargar perfil", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (datosActualizados: any) => {
        setSaving(true);
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/configuracion/actualizar`, datosActualizados, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje({ tipo: 'success', texto: '¡Perfil actualizado con éxito!' });
            setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
            fetchPerfil(); // Recargar datos
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al actualizar los datos.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
    );

    const tabs = [
        { id: 'perfil', label: 'Mi Perfil', icon: <User size={18}/> },
        { id: 'seguridad', label: 'Seguridad', icon: <ShieldCheck size={18}/> },
        ...(perfil?.rol === 'arbitro' ? [{ id: 'cv', label: 'Hoja de Vida', icon: <FileText size={18}/> }] : []),
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                    Ajustes de <span className="text-indigo-600">Cuenta</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium">Gestiona tu identidad y seguridad en el sistema.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navegación Lateral */}
                <aside className="lg:col-span-3 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                                activeTab === tab.id 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Contenido Principal */}
                <main className="lg:col-span-9">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        
                        {/* Notificación Flotante */}
                        {mensaje.texto && (
                            <div className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right ${
                                mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                                <CheckCircle2 size={14}/> {mensaje.texto}
                            </div>
                        )}

                        {/* Renderizado Dinámico */}
                        {activeTab === 'perfil' && (
                            <div className="space-y-8">
                                <AvatarUpload 
                                    fotoActual={perfil?.foto} 
                                    onImageChange={(base64: string) => setPerfil({...perfil, foto: base64})}
                                />
                                <PerfilGeneral 
                                    datos={perfil} 
                                    onSave={handleUpdate} 
                                    loading={saving} 
                                />
                            </div>
                        )}

                        {activeTab === 'seguridad' && (
                            <SeguridadCuenta />
                        )}

                        {activeTab === 'cv' && (
                            <HojaVidaSeccion datos={perfil} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Configuracion;