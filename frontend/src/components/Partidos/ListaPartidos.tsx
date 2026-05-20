import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Ghost, Calendar, Filter, X } from 'lucide-react';
import CardPartido from './CardPartido';
import { ModalNuevoPartido } from './ModalNuevoPartido';
import { ModalEditarPartido } from './ModalEditarPartido';

export interface Partido {
  id_partido: number;
  fecha: string;
  hora: string;
  ubicacion: string;
  liga: string;
  categoria: string;
  estado: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number;
  goles_visitante: number;
}

const ListaPartidos = () => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [isModalNuevoOpen, setIsModalNuevoOpen] = useState(false);
  const [partidoEdicion, setPartidoEdicion] = useState<Partido | null>(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const fetchPartidos = async () => {
    try {
      const res = await fetch('import.meta.env.VITE_API_URL/api/partidos');
      const data = await res.json();
      setPartidos(data);
    } catch (error) {
      console.error("Error al cargar partidos:", error);
    }
  };

  useEffect(() => { fetchPartidos(); }, []);

  // FUNCIÓN AUXILIAR: Formatear fecha sin desfase UTC
  const formatearFechaCabecera = (fechaStr: string) => {
    const [year, month, day] = fechaStr.split('-');
    const fechaObj = new Date(Number(year), Number(month) - 1, Number(day));
    return fechaObj.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const partidosFiltrados = useMemo(() => {
    const ahora = new Date();
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(ahora.getDate() - 7);

    return partidos.filter(p => {
      const pFechaSolo = p.fecha.split('T')[0];
      
      // 1. FILTRO DE BÚSQUEDA
      const matchBusqueda = 
        p.equipo_local.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.equipo_visitante.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.liga.toLowerCase().includes(busqueda.toLowerCase());
      if (!matchBusqueda) return false;

      // 2. FILTRO DE RANGO DE FECHAS (Prioridad alta)
      if (fechaInicio && fechaFin) {
        return pFechaSolo >= fechaInicio && pFechaSolo <= fechaFin;
      } else if (fechaInicio) {
        return pFechaSolo >= fechaInicio;
      }

      // 3. FILTRO POR ESTADO
      if (filtroEstado === 'Todos') {
        if (p.estado === 'Programado' || p.estado === 'En Curso') return true;
        // Solo mostrar finalizados recientes si no hay filtro de fecha activo
        const fechaP = new Date(pFechaSolo);
        return p.estado === 'Finalizado' && fechaP >= haceUnaSemana;
      }

      return p.estado === filtroEstado;
    });
  }, [partidos, busqueda, filtroEstado, fechaInicio, fechaFin]);

  const partidosAgrupados = useMemo(() => {
    const grupos = partidosFiltrados.reduce((acc: any, partido) => {
      const fecha = partido.fecha.split('T')[0];
      if (!acc[fecha]) acc[fecha] = [];
      acc[fecha].push(partido);
      return acc;
    }, {});
    return grupos;
  }, [partidosFiltrados]);

  // Validadores de fecha
  const handleFechaInicio = (val: string) => {
    setFechaInicio(val);
    if (fechaFin && val > fechaFin) setFechaFin(''); // Reset si es inconsistente
  };

  const handleFechaFin = (val: string) => {
    if (fechaInicio && val < fechaInicio) {
      alert("La fecha de fin no puede ser menor a la de inicio");
      return;
    }
    setFechaFin(val);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* BARRA DE HERRAMIENTAS RESPONSIVA */}
      <div className="bg-white p-4 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por liga o equipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Todos">Vista Actual</option>
              <option value="Programado">Solo Programados</option>
              <option value="Finalizado">Historial Finalizados</option>
            </select>

            <button 
              onClick={() => setIsModalNuevoOpen(true)}
              className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <Plus size={20} /> NUEVO PARTIDO
            </button>
          </div>
        </div>

        {/* RANGO DE FECHAS MEJORADO */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Filter size={14} /> Filtrar por Período:
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="date" 
              value={fechaInicio}
              onChange={(e) => handleFechaInicio(e.target.value)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-300 font-bold">a</span>
            <input 
              type="date" 
              value={fechaFin}
              onChange={(e) => handleFechaFin(e.target.value)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border-none focus:ring-2 focus:ring-indigo-500"
            />
            {(fechaInicio || fechaFin) && (
              <button 
                onClick={() => {setFechaInicio(''); setFechaFin('');}}
                className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                title="Limpiar filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LISTADO AGRUPADO */}
      <div className="space-y-12">
        {Object.keys(partidosAgrupados).length === 0 ? (
          <div className="py-24 text-center animate-in fade-in zoom-in duration-500">
            <Ghost className="mx-auto text-slate-200 mb-4" size={80} />
            <p className="text-slate-400 font-black text-xl uppercase tracking-tighter">
              No hay encuentros registrados
            </p>
            <p className="text-slate-300 text-sm mt-2 font-medium">Prueba ajustando los filtros de búsqueda</p>
          </div>
        ) : (
          Object.keys(partidosAgrupados).sort((a,b) => b.localeCompare(a)).map(fecha => (
            <div key={fecha} className="space-y-6">
              <div className="flex items-center gap-4 ml-4">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                  <Calendar size={18} className="text-indigo-500" />
                </div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-[0.15em]">
                  {formatearFechaCabecera(fecha)}
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
              </div>

              <div className="grid gap-5">
                {partidosAgrupados[fecha].map((p: Partido) => (
                  <CardPartido 
                    key={p.id_partido} 
                    partido={p} 
                    onRefresh={fetchPartidos}
                    onEdit={() => setPartidoEdicion(p)} 
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALES */}
      <ModalNuevoPartido 
        isOpen={isModalNuevoOpen} 
        onClose={() => setIsModalNuevoOpen(false)} 
        onRefresh={fetchPartidos} 
      />
      
      {partidoEdicion && (
        <ModalEditarPartido 
          isOpen={!!partidoEdicion}
          partido={partidoEdicion}
          onClose={() => setPartidoEdicion(null)}
          onRefresh={fetchPartidos}
        />
      )}
    </div>
  );
};

export default ListaPartidos;