import React, { useState } from 'react';
import ModuloAsistencia from '../components/Asistencia/ModuloAsistencia';
import ModuloPruebas from '../components/Pruebas/ModuloPruebas';

const Desempenio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'asistencia' | 'pruebas'>('asistencia');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Control de Desempeño</h1>
      
      {/* Sistema de Pestañas */}
      <div className="flex space-x-4 border-b mb-6">
        <button 
          className={`pb-2 px-4 transition-all ${activeTab === 'asistencia' ? 'border-b-4 border-blue-600 font-bold text-blue-600' : 'text-gray-700'}`} 
          onClick={() => setActiveTab('asistencia')}
        >
          Asistencia
        </button>
        <button 
          className={`pb-2 px-4 transition-all ${activeTab === 'pruebas' ? 'border-b-4 border-blue-600 font-bold text-blue-600' : 'text-gray-700'}`} 
          onClick={() => setActiveTab('pruebas')}
        >
          Pruebas Técnicas/Físicas
        </button>
      </div>

      {/* Renderizado Condicional */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'asistencia' ? <ModuloAsistencia/> : <ModuloPruebas />}
      </div>
    </div>
  );
};

export default Desempenio;