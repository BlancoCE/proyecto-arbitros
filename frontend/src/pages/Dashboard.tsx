import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, AlertCircle, X, ShieldAlert, MapPin, Clock } from 'lucide-react';

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
  const [proximosPartidos, setProximosPartidos] = useState<Partido[]>([]);
  const [listaAlertas, setListaAlertas] = useState<AlertaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalAlertas, setShowModalAlertas] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Llamada a las estadísticas del dashboard
        const resStats = await fetch('import.meta.env.VITE_API_URL/api/dashboard/stats');
        const dataStats = await resStats.json();

        // Llamada a los partidos (reutilizando tu API de partidos existente)
        const resPartidos = await fetch('import.meta.env.VITE_API_URL/api/partidos');
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

        if (dataPartidos) {
          // Filtramos solo los programados y tomamos los 3 más cercanos
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
      
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl border border-white/20 shadow-xl">
        <h1 className="text-3xl font-bold text-white tracking-tight">Sistema AFLP</h1>
        <p className="text-blue-100 mt-2">Panel de Control de Arbitraje • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.action ? stat.action : undefined}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: PRÓXIMOS PARTIDOS */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-800 text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <Calendar className="text-purple-600" size={22} /> Próximos Partidos
            </h3>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full">TOP 3</span>
          </div>

          <div className="space-y-4">
            {proximosPartidos.length > 0 ? (
              proximosPartidos.map((partido) => (
                <div key={partido.id_partido} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-gray-800 text-sm uppercase truncate flex-1">
                      {partido.equipo_local} <span className="text-gray-400 mx-2 text-xs">VS</span> {partido.equipo_visitante}
                    </p>
                    <span className="text-[10px] font-black text-purple-600 ml-2">{partido.fecha.split('T')[0]}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <MapPin size={12} /> {partido.ubicacion}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <Clock size={12} /> {partido.hora.slice(0, 5)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <p className="italic text-sm">No hay partidos programados próximamente</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: DISTRIBUCIÓN POR CATEGORÍA */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-gray-800 text-lg font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <Users className="text-green-600" size={22} /> Distribución Arbitral
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {distribucion.length > 0 ? (
              [...distribucion]
                .sort((a, b) => {
                  const orden: { [key: string]: number } = {
                    'FIFA': 1,
                    'Primera': 2,
                    'Segunda': 3,
                    'Tercera': 4,
                    'Cuarta': 5
                  };
                  // Si la categoría no está en la lista, la mandamos al final (99)
                  const pesoA = orden[a.categoria] || 99;
                  const pesoB = orden[b.categoria] || 99;
                  return pesoA - pesoB;
                })
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                        item.genero === 'Masculino' 
                          ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                          : 'bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white'
                      }`}>
                        {item.genero === 'Masculino' ? 'M' : 'F'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight">
                          {item.categoria}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          Categoría {item.genero}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-gray-800">{item.cantidad}</span>
                      <span className="text-[9px] font-black text-gray-400 ml-1 uppercase">Miembros</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <p className="italic text-sm">No se encontraron datos de categorías</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE ALERTAS (Se mantiene igual a tu código anterior) */}
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