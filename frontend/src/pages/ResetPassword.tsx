import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams(); // Obtenemos el token de la URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{msg: string, type: 'error'|'success'|null}>({msg: '', type: null});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ msg: 'Las contraseñas no coinciden', type: 'error' });
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ msg: '¡Contraseña actualizada! Redirigiendo al login...', type: 'success' });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus({ msg: data.message, type: 'error' });
      }
    } catch (err) {
      setStatus({ msg: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-4 font-sans\">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100\">
        <div className="text-center mb-8\">
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4\">
            <Lock className="text-indigo-600\" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800\">Nueva Contraseña</h2>
          <p className="text-gray-500 text-sm\">Ingresa tu nueva clave de acceso al sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2 ml-1">Contraseña Nueva</label>
            <input 
              type="password\" required minLength={6}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all\"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2 ml-1\">Confirmar Contraseña</label>
            <input 
              type="password\" required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all\"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {status.type && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
              {status.msg}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-[#151960] text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95\"
          >
            <Save size={20} />
            {loading ? 'Procesando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;