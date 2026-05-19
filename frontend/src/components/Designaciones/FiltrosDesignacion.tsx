import React from 'react';
import { Search, CalendarDays } from 'lucide-react';

interface FiltrosProps {
    filtros: any;
    setFiltros: (f: any) => void;
}

const FiltrosDesignacion: React.FC<FiltrosProps> = ({ filtros, setFiltros }) => {
    return (
        <div className="bg-white p-8 rounded-[3rem] shadow-sm mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Filtro por Liga */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Liga / Torneo</label>
                    <select 
                        className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 outline-none font-bold text-gray-700"
                        value={filtros.liga}
                        onChange={(e) => setFiltros({...filtros, liga: e.target.value})}
                    >
                        <option value="">Todas las Ligas</option>
                        <option value="División Profesional">División Profesional</option>
                        <option value="División de Ascenso">División de Ascenso</option>
                        <option value="Infanto-Juvenil">Infanto-Juvenil</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>

                {/* Buscador de Categoría */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Categoría (Sub-7, Primera A...)</label>
                    <div className="relative mt-2">
                        <Search className="absolute left-4 top-4 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar categoría..."
                            className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 outline-none font-bold"
                            value={filtros.categoria}
                            onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                        />
                    </div>
                </div>

                {/* Rango de Fechas */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 text-indigo-500">Rango de Fechas</label>
                    <div className="flex items-center gap-2 mt-2">
                        <input 
                            type="date" 
                            className="flex-1 p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-100 text-xs font-bold"
                            value={filtros.fechaInicio}
                            onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                        />
                        <span className="text-gray-300">—</span>
                        <input 
                            type="date" 
                            className="flex-1 p-3 bg-gray-50 rounded-xl border-none ring-1 ring-gray-100 text-xs font-bold"
                            value={filtros.fechaFin}
                            onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FiltrosDesignacion;