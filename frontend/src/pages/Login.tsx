import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShieldCheck, RefreshCw, Eye, EyeOff, LogIn, Key } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ usuario: '', password: '', captchaInput: '' });
  const [captchaSistema, setCaptchaSistema] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Generar código de seguridad aleatorio
  const generarCaptcha = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 4; i++) res += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    setCaptchaSistema(res);
  };

  useEffect(() => {
    generarCaptcha();
    // Limpiar cualquier sesión anterior al cargar el login
    localStorage.removeItem('user_auth');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    // 1. VALIDACIÓN DEL CÓDIGO DE SEGURIDAD (CAPTCHA)
    if (formData.captchaInput.toUpperCase() !== captchaSistema) {
        setError("El código de seguridad es incorrecto."); // Error específico
        generarCaptcha();
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usuario: formData.usuario,
            password: formData.password
        })
        });

        const data = await response.json();

        if (response.ok) {
        localStorage.setItem('user_auth', JSON.stringify(data.user));
        navigate('/dashboard');
        } else {
        // 2. ERROR DE USUARIO O CONTRASEÑA
        // El backend enviará "Usuario o contraseña incorrectos"
        setError(data.message); 
        generarCaptcha();
        }
    } catch (err) {
        // 3. ERROR DE CONEXIÓN (SERVIDOR APAGADO)
        setError("Error: No se pudo conectar con el servidor (Backend)");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a8a] p-4 font-sans">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden border border-white/30">
        
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="w-24 h-24 bg-[#151960] rounded-full flex items-center justify-center mb-2 shadow-inner border border-white/10">
            <User className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-[#151960] font-bold text-xl">Iniciar Sesión</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-4">
          {error && <div className="bg-red-500/80 text-white p-3 rounded text-sm text-center">{error}</div>}

          <div className="flex border-2 border-gray-300 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-200 p-3 border-r border-gray-300">
              <User className="text-[#001f3f] w-5 h-5" />
            </div>
            <input 
              type="text" placeholder="Nombre de Usuario" required
              className="flex-1 p-3 outline-none text-gray-700"
              onChange={(e) => setFormData({...formData, usuario: e.target.value})}
            />
          </div>

          <div className="flex border-2 border-gray-300 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-200 p-3 border-r border-gray-300">
              <Lock className="text-[#001f3f] w-5 h-5" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} placeholder="Contraseña" required
              className="flex-1 p-3 outline-none text-gray-700"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-3 bg-gray-100">
              {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
            </button>
          </div>

          <div className="flex justify-center items-center rounded-md overflow-hidden border-2 border-gray-300">
            <div className="bg-[#5bc0de] text-[#001f3f] font-mono text-2xl font-bold py-2 px-6 flex-1 text-center select-none italic tracking-widest border-r-2 border-gray-300">
              {captchaSistema}
            </div>
            <button type="button" onClick={generarCaptcha} className="bg-white p-4 hover:bg-gray-50">
              <RefreshCw className="text-gray-600 w-6 h-6" />
            </button>
          </div>

          <div className="flex border-2 border-gray-300 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-200 p-3 border-r border-gray-300">
              <ShieldCheck className="text-[#001f3f] w-5 h-5" />
            </div>
            <input 
              type="text" placeholder="Ingresa el Código de Seguridad" required
              className="flex-1 p-3 outline-none text-gray-700 uppercase"
              onChange={(e) => setFormData({...formData, captchaInput: e.target.value})}
            />
          </div>

          <div className="space-y-3 pt-4">
            <button type="submit" className="w-full bg-[#337ab7] hover:bg-[#286090] text-white font-bold py-3 rounded flex items-center justify-center text-lg uppercase shadow-md transition-all">
              INGRESAR <LogIn className="ml-2 w-5 h-5" />
            </button>
            <button type="button" className="w-full bg-[#151960] hover:bg-[#545AD9] text-white font-bold py-3 rounded flex items-center justify-center text-lg uppercase shadow-md transition-all">
              Recuperar Contraseña <Key className="ml-2 w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;