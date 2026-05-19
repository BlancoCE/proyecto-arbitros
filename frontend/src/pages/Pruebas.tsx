import React, { useState } from 'react';
import { Activity, BookOpen, ChevronRight, FileCheck } from 'lucide-react';
import RegistroPruebasFisicas from '../components/Pruebas/RegistroPruebasFisicas';
import RegistroPruebasEscritas from '../components/Pruebas/RegistroPruebasEscritas';

const PruebasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fisicas' | 'escritas'>('fisicas');

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen">
      {/* HEADER PROFESIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] shadow-xl shadow-indigo-200">
            <FileCheck className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Centro de Evaluaciones
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              Gestión Oficial FBF <ChevronRight size={12} /> {activeTab === 'fisicas' ? 'Rendimiento Físico' : 'Capacitación Técnica'}
            </p>
          </div>
        </div>

        {/* SWITCHER DE MÓDULOS (Segmented Control) */}
        <div className="bg-slate-200/50 p-1.5 rounded-[2rem] flex items-center gap-1 w-full md:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab('fisicas')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'fisicas' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity size={16} /> Físicas
          </button>
          <button
            onClick={() => setActiveTab('escritas')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'escritas' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen size={16} /> Escritas
          </button>
        </div>
      </div>

      {/* CONTENEDOR DINÁMICO CON ANIMACIÓN */}
      <div className="animate-in fade-in zoom-in-95 duration-500">
        {activeTab === 'fisicas' ? <RegistroPruebasFisicas /> : <RegistroPruebasEscritas />}
      </div>
    </div>
  );
};

export default PruebasPage;