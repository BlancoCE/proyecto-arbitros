import React, { useState } from 'react';
import ModuloAsistencia from '../components/Asistencia/ModuloAsistencia';
import HistorialAsistencia from '../components/Asistencia/HistorialAsistencia';
import { ClipboardCheck, History } from 'lucide-react';

const AsistenciaPage: React.FC = () => {
  const [tab, setTab] = useState<'lista' | 'historial'>('lista');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-600 rounded-3xl shadow-lg">
                <ClipboardCheck className="text-white" size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Asistencia</h1>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Panel de Control</p>
            </div>
        </div>

        {/* Switcher de Pestañas */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button 
                onClick={() => setTab('lista')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${tab === 'lista' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <ClipboardCheck size={16} /> PASAR LISTA
            </button>
            <button 
                onClick={() => setTab('historial')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${tab === 'historial' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <History size={16} /> HISTORIAL Y ART. 7
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {tab === 'lista' ? <ModuloAsistencia /> : <HistorialAsistencia />}
      </div>
    </div>
  );
};

export default AsistenciaPage;