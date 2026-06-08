import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, AlertCircle, X, ShieldAlert, MapPin, Clock, BarChart3, PieChart } from 'lucide-react';

interface AlertaItem {
  id_usuario: number;
  nombre_completo: string;
  categoria: string;
  total_faltas: number;
  nivel_alerta: 'SANCION' | 'ADVERTENCIA';
}

interface DistribucionItem {
  categoria: string;
  genero: string;
  cantidad: string;
}

interface Partido {
  id_partido: number;
  fecha: string;
  hora: string;
  equipo_local: string;
  equipo_visitante: string;
  ubicacion: string;
  estado: string;
}

const Dashboard = () => {
  const [counts, setCounts] = useState({ arbitros: 0, asesores: 0, alertas: 0, partidos: 0 });
  const [distribucion, setDistribucion] = useState<DistribucionItem[]>([]);
  const [todosLosPartidos, setTodosLosPartidos] = useState<Partido[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<Partido[]>([]);
  const [listaAlertas, setListaAlertas] = useState<AlertaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalAlertas, setShowModalAlertas] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Obtener estadísticas generales
        const resStats = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`);
        const dataStats = await resStats.json();

        // 2. Obtener lista completa de partidos
        const resPartidos = await fetch(`${import.meta.env.VITE_API_URL}/api/partidos`);
        const dataPartidos = await resPartidos.json();

        if (dataStats) {
          setCounts(prev => ({
            ...prev,
            arbitros: dataStats.totales?.arbitros_activos || 0,
            asesores: dataStats.totales?.asesores_activos || 0,
            alertas: dataStats.alertas?.length || 0
          }));
          setDistribucion(dataStats.distribucion || []);
          setListaAlertas(dataStats.alertas || []);
        }

        if (dataPartidos && Array.isArray(dataPartidos)) {
          setTodosLosPartidos(dataPartidos);
          
          // Filtrar los top 3 partidos próximos en estado 'Programado'
          const futuros = dataPartidos
            .filter((p: Partido) => p.estado === 'Programado')
            .slice(0, 3);
          setProximosPartidos(futuros);
          
          setCounts(prev => ({ ...prev, partidos: dataPartidos.length }));
        }

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==========================================
  // LÓGICA 1: PROCESAMIENTO DE ÁRBITROS (CATEGORÍAS Y GÉNERO)
  // ==========================================
  
  // Agrupar cantidades totales exclusivamente por categoría (sumando varones y damas)
  const categoriasAgrupadas = distribucion.reduce((acc: { [key: string]: number }, item) => {
    const cantidadNum = parseInt(item.cantidad, 10) || 0;
    acc[item.categoria] = (acc[item.categoria] || 0) + cantidadNum;
    return acc;
  }, {});

  // Orden de jerarquía oficial del Colegio de Árbitros
  const ordenCategorias = ['FIFA', 'Primera', 'Segunda', 'Tercera', 'Cuarta'];
  const infoCategoriasGrafica = ordenCategorias
    .map(cat => ({
      categoria: cat,
      total: categoriasAgrupadas[cat] || 0
    }))
    .filter(item => item.total > 0 || distribucion.some(d => d.categoria === item.categoria));

  const maxCategoriaValue = Math.max(...infoCategoriasGrafica.map(c => c.total), 1);

  // Agrupar cantidades por género/especialización
  const generosAgrupados = distribucion.reduce((acc: { masculino: number; femenino: number }, item) => {
    const cantidadNum = parseInt(item.cantidad, 10) || 0;
    if (item.genero === 'Masculino') acc.masculino += cantidadNum;
    if (item.genero === 'Femenino') acc.femenino += cantidadNum;
    return acc;
  }, { masculino: 0, femenino: 0 });

  const totalArbitrosGenero = generosAgrupados.masculino + generosAgrupados.femenino || 1;


  // ==========================================
  // LÓGICA 2: GRÁFICA DE DISTRIBUCIÓN DE PARTIDOS DEL MES
  // ==========================================
  
  const fechaActual = new Date();
  const mesActualNum = fechaActual.getMonth(); 
  const anioActualNum = fechaActual.getFullYear();

  const partidosSemanales = { semana1: 0, semana2: 0, semana3: 0, semana4: 0 };

  // Recorrer el pool de la base de datos para agrupar cronológicamente por semanas del mes activo
  todosLosPartidos.forEach(partido => {
    const fechaPart = new Date(partido.fecha);
    if (fechaPart.getMonth() === mesActualNum && fechaPart.getFullYear() === anioActualNum) {
      const diaMes = fechaPart.getDate();
      if (diaMes <= 7) partidosSemanales.semana1++;
      else if (diaMes <= 14) partidosSemanales.semana2++;
      else if (diaMes <= 21) partidosSemanales.semana3++;
      else partidosSemanales.semana4++;
    }
  });

  const infoSemanasGrafica = [
    { etiqueta: 'Semana 1 (Días 1-7)', cantidad: partidosSemanales.semana1 },
    { etiqueta: 'Semana 2 (Días 8-14)', cantidad: partidosSemanales.semana2 },
    { etiqueta: 'Semana 3 (Días 15-21)', cantidad: partidosSemanales.semana3 },
    { etiqueta: 'Semana 4 (Días 22+)', cantidad: partidosSemanales.semana4 }
  ];

  const maxPartidosSemana = Math.max(...infoSemanasGrafica.map(s => s.cantidad), 1);


  // ==========================================
  // CONFIGURACIÓN DE TARJETAS SUPERIORES
  // ==========================================
  const stats = [
    { label: 'Árbitros Activos', value: counts.arbitros.toString(), icon: Users, color: 'bg-green-500', action: null },
    { label: 'Asesores Activos', value: counts.asesores.toString(), icon: CheckCircle, color: 'bg-blue-500', action: null },
    { label: 'Total Partidos', value: counts.partidos.toString(), icon: Calendar, color: 'bg-purple-500', action: null },
    { 
      label: 'Alertas Art. 7', 
      value: counts.alertas.toString(), 
      icon: AlertCircle, 
      color: counts.alertas > 0 ? 'bg-red-500 animate-pulse' : 'bg-orange-500',
      action: () => setShowModalAlertas(true) 
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 relative">
      
      {/* Banner Institucional de Bienvenida */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl border border-white/20 shadow-xl">
        <h1 className="text-3xl font-bold text-white tracking-tight">Sistema AFLP</h1>
        <p className="text-blue-100 mt-2">Panel de Control de Arbitraje • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Tarjetas Analíticas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            onClick={stat.action ?? undefined}
            onKeyDown={(e) => {
              if (stat.action && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                stat.action();
              }
            }}
            role={stat.action ? "button" : undefined}
            tabIndex={stat.action ? 0 : undefined}
            aria-label={stat.action ? `Ver detalles de ${stat.label}` : undefined}
            className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between border border-gray-100 ${stat.action ? 'cursor-pointer border-red-100' : ''}`}
          >
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-gray-800">{loading ? '...' : stat.value}</p>
            </div>
            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Bloque Central del Dashboard de Dos Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: GRÁFICA DE AGENDA MENSUAL Y PRÓXIMOS ENCUENTROS */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-gray-800 text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <Calendar className="text-purple-600" size={22} /> Agenda Mensual
            </h3>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full uppercase">
              {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Gráfica de distribución de barras horizontales */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span>•</span> Distribución de Partidos por Semana
            </p>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {infoSemanasGrafica.map((semana, index) => {
                const anchoPorcentaje = (semana.cantidad / maxPartidosSemana) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-black text-gray-600 uppercase">{semana.etiqueta}</span>
                      <span className="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {semana.cantidad} {semana.cantidad === 1 ? 'Partido' : 'Partidos'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${anchoPorcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Listado resumido de partidos inmediatos */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              • Próximos Encuentros en Agenda (Vista Rápida)
            </p>
            <div className="space-y-3">
              {proximosPartidos.length > 0 ? (
                proximosPartidos.slice(0, 2).map((partido) => (
                  <div key={partido.id_partido} className="p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 shadow-sm transition-all flex justify-between items-center">
                    <div className="truncate pr-2">
                      <p className="font-black text-gray-800 text-xs uppercase truncate">
                        {partido.equipo_local} <span className="text-purple-500 font-normal">vs</span> {partido.equipo_visitante}
                      </p>
                      <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold mt-1">
                        <span className="flex items-center gap-0.5"><MapPin size={10} /> {partido.ubicacion}</span>
                        <span className="flex items-center gap-0.5"><Clock size={10} /> {partido.hora.slice(0, 5)}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                      {partido.fecha.split('T')[0]}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 italic text-xs">
                  No hay partidos programados en este mes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SECCIÓN GRÁFICA DE DISTRIBUCIÓN ARBITRAL */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-gray-800 text-lg font-black uppercase tracking-tight flex items-center gap-3 border-b border-gray-100 pb-3">
            <BarChart3 className="text-green-600" size={22} /> Estadísticas del Personal
          </h3>

          {distribucion.length > 0 ? (
            <div className="space-y-6">
              
              {/* Gráfica de Barras por Categoría */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span>•</span> Cantidad por Categoría de Árbitro
                </p>
                <div className="space-y-3">
                  {infoCategoriasGrafica.map((item) => {
                    const porcentajeAncho = (item.total / maxCategoriaValue) * 100;
                    return (
                      <div key={item.categoria} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-gray-700 uppercase">{item.categoria}</span>
                          <span className="font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.total} {item.total === 1 ? 'Miembro' : 'Miembros'}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${porcentajeAncho}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distribución por Género */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <PieChart size={14} className="text-blue-500" /> Especialización por Género
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-black text-gray-600 uppercase">
                      <span>Varones</span>
                      <span>{Math.round((generosAgrupados.masculino / totalArbitrosGenero) * 100)}%</span>
                    </div>
                    <p className="text-xl font-black text-blue-600">{generosAgrupados.masculino}</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(generosAgrupados.masculino / totalArbitrosGenero) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-black text-gray-600 uppercase">
                      <span>Damas</span>
                      <span>{Math.round((generosAgrupados.femenino / totalArbitrosGenero) * 100)}%</span>
                    </div>
                    <p className="text-xl font-black text-pink-500">{generosAgrupados.femenino}</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500" 
                        style={{ width: `${(generosAgrupados.femenino / totalArbitrosGenero) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <p className="italic text-sm">No se encontraron datos de categorías</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE ALERTAS (ARTÍCULO 7) */}
      {showModalAlertas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-red-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldAlert size={24} />
                <h3 className="font-black uppercase tracking-tight text-sm">Alertas de Asistencia (Art. 7)</h3>
              </div>
              <button onClick={() => setShowModalAlertas(false)} className="hover:bg-red-700 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-3 bg-gray-50/50">
              {listaAlertas.map((alerta, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex justify-between items-center shadow-sm ${alerta.nivel_alerta === 'SANCION' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div>
                    <p className="font-black text-gray-800 text-xs uppercase">{alerta.nombre_completo}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{alerta.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${alerta.nivel_alerta === 'SANCION' ? 'text-red-600' : 'text-amber-600'}`}>
                      {alerta.total_faltas} <span className="text-[10px]">FALTAS</span>
                    </p>
                    <p className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full text-white inline-block ${alerta.nivel_alerta === 'SANCION' ? 'bg-red-600' : 'bg-amber-500'}`}>
                      {alerta.nivel_alerta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 text-center">
              <button onClick={() => setShowModalAlertas(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] font-black text-gray-600 uppercase transition-colors">Cerrar Panel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;