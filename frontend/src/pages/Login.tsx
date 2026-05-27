import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShieldCheck, RefreshCw, Eye, EyeOff, LogIn, Key } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ usuario: '', password: '', captchaInput: '' });
  const [captchaSistema, setCaptchaSistema] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generarCaptcha = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    
    // Creamos un array de enteros de 32 bits sin signo para la criptografía aleatoria
    const valoresAleatorios = new Uint32Array(4);
    window.crypto.getRandomValues(valoresAleatorios);

    for (let i = 0; i < 4; i++) {
      // Usamos el valor criptográfico en lugar de Math.random()
      const indice = valoresAleatorios[i] % caracteres.length;
      res += caracteres.charAt(indice);
    }
    
    setCaptchaSistema(res);
  };

  useEffect(() => {
    generarCaptcha();
    localStorage.removeItem('user_auth');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.captchaInput.toUpperCase() !== captchaSistema) {
        setError("El código de seguridad es incorrecto.");
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuario: formData.usuario, 
                password: formData.password 
            }),
        });

        const data = await response.json();

        if (response.ok) { // Cambiado de data.success a response.ok para ser más preciso
            // --- LAS DOS LÍNEAS CRÍTICAS ---
            sessionStorage.setItem('user_auth', JSON.stringify(data.user));
            sessionStorage.setItem('token', data.token); // ESTA ES LA QUE FALTABA
            // ------------------------------
            navigate('/dashboard');
        } else {
            setError(data.message || "Credenciales inválidas");
            generarCaptcha();
        }
    } catch (err) {
        setError("Error al conectar con el servidor");
    }
  };

  const handleForgotPassword = async () => {
    const email = window.prompt("Ingresa tu correo electrónico registrado:");
    if (!email) return;

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert("Error al conectar con el servidor");
    }
  };

  return (
    /* APLICAMOS LA CLASE ANIMADA AQUÍ */
    <div className="min-h-screen bg-gradient-aflp flex items-center justify-center p-4">
      
      {/* Contenedor Principal (Tarjeta de Login) */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        
        {/* Encabezado con Logo/Icono */}
        <div className="p-8 text-center bg-gray-50/50 border-b border-gray-100">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform -rotate-6">
            <ShieldCheck className="text-white w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-[#151960] tracking-tight">SISTEMA AFLP</h2>
          <p className="text-gray-500 text-sm font-medium">Gestión Profesional de Arbitraje</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 text-sm animate-bounce">
              {error}
            </div>
          )}

          {/* Campo Usuario */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase ml-1">Usuario</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                <User size={20} />
              </div>
              <input 
                type="text" required
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-700"
                placeholder="Nombre de usuario"
                onChange={(e) => setFormData({...formData, usuario: e.target.value})}
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase ml-1">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} required
                className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-700"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Captcha */}
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="flex-1 bg-indigo-50 text-indigo-700 font-mono text-2xl font-black tracking-[0.5em] py-3 rounded-2xl text-center border-2 border-dashed border-indigo-200 select-none">
                  {captchaSistema}
                </div>
                <button type="button" onClick={generarCaptcha} className="p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 text-gray-600 transition-colors active:scale-90">
                  <RefreshCw size={24} />
                </button>
             </div>
             <input 
                type="text" placeholder="Ingresa el código" required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold uppercase"
                onChange={(e) => setFormData({...formData, captchaInput: e.target.value})}
              />
          </div>

          {/* Botones de Acción */}
          <div className="space-y-3 pt-4">
            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center text-lg transition-all active:scale-[0.98]">
              INGRESAR <LogIn className="ml-2 w-5 h-5" />
            </button>
            
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="w-full py-4 text-indigo-600 font-bold hover:bg-indigo-50 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              OLVIDÉ MI CONTRASEÑA <Key size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;