import React, { useState, useEffect } from 'react';
import { Trophy, CalendarDays } from 'lucide-react';
import ListaPartidos from '../components/Partidos/ListaPartidos';

const PartidosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header del Módulo */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Trophy className="text-indigo-600" size={32} />
              GESTIÓN DE PARTIDOS
            </h1>
            <p className="text-slate-500 font-medium">
              Administra la programación, resultados y designaciones de la AFLP.
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <CalendarDays className="text-indigo-500" />
            <span className="font-bold text-slate-700">Temporada 2026</span>
          </div>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto">
        <ListaPartidos />
      </div>
    </div>
  );
};

export default PartidosPage;