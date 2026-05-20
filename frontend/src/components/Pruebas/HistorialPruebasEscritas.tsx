import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Eye, Calendar, FileText, 
  ExternalLink, Trash2, Loader2, BookOpen
} from 'lucide-react';

interface HistorialProps {
  onBack: () => void;
}

const HistorialPruebasEscritas: React.FC<HistorialProps> = ({ onBack }) => {
  const [listaCabecera, setListaCabecera] = useState<any[]>([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<any[] | null>(null);
  const [infoPrueba, setInfoPrueba] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pruebas-escritas/historial`);
      setListaCabecera(res.data);
    } catch (err) {
      console.error("Error al cargar historial:", err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (prueba: any) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pruebas-escritas/detalle`, {
        params: { fecha: prueba.fecha, tema: prueba.tema }
      });
      setDetalleSeleccionado(res.data);
      setInfoPrueba(prueba);
    } catch (err) {
      alert("Error al obtener los detalles del examen.");
    }
  };

  const eliminarPrueba = async (fecha: string, tema: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el examen "${tema}" del ${fecha}? Se borrarán todas las notas asociadas.`)) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/pruebas-escritas/eliminar`, {
        params: { fecha, tema }
      });
      alert("Examen eliminado correctamente.");
      if (detalleSeleccionado) setDetalleSeleccionado(null);
      fetchHistorial();
    } catch (err) {
      alert("Error al intentar eliminar el registro.");
    }
  };

  // SOLUCIÓN AL RETRASO DE FECHA
  const formatearFechaManual = (fechaStr: string) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split('-').map(Number);
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${day} de ${meses[month - 1]} de ${year}`;
  };

  return (
    <div className="p-2 md:p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* HEADER DINÁMICO */}
      <div className="flex items-center justify-between bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={detalleSeleccionado ? () => setDetalleSeleccionado(null) : onBack}
            className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tighter">
              {detalleSeleccionado ? 'Resultados del Examen' : 'Historial de Pruebas Escritas'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {detalleSeleccionado ? `Tema: ${infoPrueba.tema}` : 'Registros de evaluaciones teóricas'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 text-slate-300">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-[10px] font-black uppercase">Sincronizando datos...</p>
        </div>
      ) : !detalleSeleccionado ? (
        /* VISTA DE TARJETAS (HISTORIAL) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listaCabecera.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <button 
                  onClick={() => eliminarPrueba(item.fecha, item.tema)}
                  className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase mb-1 truncate">{item.tema}</h3>
              <p className="text-sm font-bold text-slate-400 mb-6">{formatearFechaManual(item.fecha)}</p>
              
              <button 
                onClick={() => verDetalles(item)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase hover:bg-black transition-all"
              >
                <Eye size={16} /> Ver Calificaciones
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE DETALLES (TABLA) */
        <div className="space-y-6">
          {/* ACCESO AL PDF */}
          {infoPrueba.url_informe_prueba && (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Acta de Notas Digital</p>
                  <p className="text-xs font-bold text-indigo-900">Examen_{infoPrueba.fecha}.pdf</p>
                </div>
              </div>
              <a 
                href={`${import.meta.env.VITE_API_URL}${infoPrueba.url_informe_prueba}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <ExternalLink size={14} /> Ver Documento Original
              </a>
            </div>
          )}

          {/* TABLA DE RESULTADOS JERÁRQUICA */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Árbitro Evaluado</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Calificación</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {detalleSeleccionado.map((det, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-6">
                        <p className="text-xs font-black text-slate-800 uppercase">{det.nombre_completo}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                          {det.categoria} • {det.especializacion}
                        </p>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-2 rounded-lg font-black text-xs ${det.nota >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {det.nota} pts
                        </span>
                      </td>
                      <td className="p-6 text-[10px] text-slate-500 italic">
                        {det.observacion || 'Sin observaciones'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialPruebasEscritas;