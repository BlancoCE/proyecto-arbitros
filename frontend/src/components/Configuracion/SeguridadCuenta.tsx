import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const SeguridadCuenta: React.FC = () => {
    const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    
    const [form, setForm] = useState({
        passActual: '',
        passNueva: '',
        confirmarPass: ''
    });

    // Lógica para medir la fortaleza (0 a 4)
    const calcularFortaleza = (pass: string) => {
        let score = 0;
        if (pass.length > 6) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const fortaleza = calcularFortaleza(form.passNueva);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.passNueva !== form.confirmarPass) {
            setMensaje({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden.' });
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            // Nota: Este endpoint lo crearemos en el backend a continuación
            await axios.put(`${import.meta.env.VITE_API_URL}/api/configuracion/cambiar-password`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje({ tipo: 'success', texto: 'Contraseña actualizada correctamente.' });
            setForm({ passActual: '', passNueva: '', confirmarPass: '' });
        } catch (error: any) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.error || 'Error al cambiar la contraseña.' });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full mt-2 p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-slate-700 text-sm pr-12";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2";

    return (
        <div className="max-w-2xl mx-auto py-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Seguridad de Acceso</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase">Actualiza tu clave periódicamente para proteger tu cuenta.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contraseña Actual */}
                <div className="relative">
                    <label className={labelStyle}><Lock size={12}/> Contraseña Actual</label>
                    <input 
                        type={showPass.actual ? "text" : "password"}
                        value={form.passActual}
                        onChange={(e) => setForm({...form, passActual: e.target.value})}
                        className={inputStyle}
                        placeholder="••••••••"
                        required
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPass({...showPass, actual: !showPass.actual})}
                        className="absolute right-4 bottom-4 text-slate-400 hover:text-indigo-600"
                    >
                        {showPass.actual ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>

                <hr className="border-slate-100 my-8" />

                {/* Nueva Contraseña */}
                <div className="relative">
                    <label className={labelStyle}><ShieldCheck size={12}/> Nueva Contraseña</label>
                    <input 
                        type={showPass.nueva ? "text" : "password"}
                        value={form.passNueva}
                        onChange={(e) => setForm({...form, passNueva: e.target.value})}
                        className={inputStyle}
                        placeholder="Mínimo 8 caracteres"
                        required
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPass({...showPass, nueva: !showPass.nueva})}
                        className="absolute right-4 bottom-4 text-slate-400 hover:text-indigo-600"
                    >
                        {showPass.nueva ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>

                {/* Indicador de Fortaleza */}
                {form.passNueva && (
                    <div className="px-2">
                        <div className="flex gap-1 h-1.5 mb-2">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className={`flex-1 rounded-full transition-all duration-500 ${
                                    fortaleza >= step 
                                    ? (fortaleza <= 2 ? 'bg-rose-500' : fortaleza === 3 ? 'bg-amber-500' : 'bg-emerald-500')
                                    : 'bg-slate-200'
                                }`}></div>
                            ))}
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                            Fortaleza: {fortaleza <= 2 ? 'Débil' : fortaleza === 3 ? 'Media' : 'Excelente'}
                        </p>
                    </div>
                )}

                {/* Confirmar Contraseña */}
                <div className="relative">
                    <label className={labelStyle}>Confirmar Nueva Contraseña</label>
                    <input 
                        type={showPass.confirm ? "text" : "password"}
                        value={form.confirmarPass}
                        onChange={(e) => setForm({...form, confirmarPass: e.target.value})}
                        className={`${inputStyle} ${form.confirmarPass && form.passNueva !== form.confirmarPass ? 'ring-rose-500' : ''}`}
                        placeholder="Repite tu nueva contraseña"
                        required
                    />
                </div>

                {/* Mensajes de Estado */}
                {mensaje.texto && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase animate-in zoom-in ${
                        mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                        {mensaje.tipo === 'success' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
                        {mensaje.texto}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || fortaleza < 2}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 mt-4"
                >
                    {loading ? <Loader2 size={18} className="animate-spin"/> : <Lock size={18}/>}
                    {loading ? 'Procesando...' : 'Actualizar Contraseña'}
                </button>
            </form>
        </div>
    );
};

export default SeguridadCuenta;