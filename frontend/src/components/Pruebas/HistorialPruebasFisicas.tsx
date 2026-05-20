import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Eye, Calendar, FileText, 
  ExternalLink, Trash2, AlertCircle, Loader2
} from 'lucide-react';

interface HistorialProps {
  onBack: () => void;
}

const HistorialPruebasFisicas: React.FC<HistorialProps> = ({ onBack }) => {
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
      const res = await axios.get('import.meta.env.VITE_API_URL/api/pruebas-fisicas/historial');
      setListaCabecera(res.data);
    } catch (err) {
      console.error("Error al cargar historial", err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (prueba: any) => {
    const fechaLimpia = prueba.fecha.split('T')[0];
    try {
      const res = await axios.get(`import.meta.env.VITE_API_URL/api/pruebas-fisicas/detalle`, {
        params: { fecha: prueba.fecha, tipo: prueba.tipo_prueba }
      });
      setDetalleSeleccionado(res.data);
      setInfoPrueba(prueba);
    } catch (err) {
      alert("Error al obtener detalles.");
    }
  };

  const eliminarPrueba = async (fecha: string, tipo: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la prueba "${tipo}" del ${fecha}? Esta acción no se puede deshacer.`)) return;
    
    try {
      await axios.delete(`import.meta.env.VITE_API_URL/api/pruebas-fisicas/eliminar`, {
        params: { fecha, tipo }
      });
      alert("Registro eliminado correctamente.");
      if (detalleSeleccionado) setDetalleSeleccionado(null);
      fetchHistorial();
    } catch (err) {
      alert("Error al eliminar el registro.");
    }
  };

  const formatearFechaManual = (fechaStr: string) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split('-').map(Number);
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${day} de ${meses[month - 1]} de ${year}`;
  };

  return (
    <div className="p-2 md:p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
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
              {detalleSeleccionado ? 'Detalles de Evaluación' : 'Historial de Pruebas'}
            </h2>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-xs font-black uppercase">Cargando registros...</p>
        </div>
      ) : !detalleSeleccionado ? (
        /* LISTA DE PRUEBAS (RESPONSIVA) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listaCabecera.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calendar size={24} /></div>
                <button 
                  onClick={() => eliminarPrueba(item.fecha, item.tipo_prueba)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase mb-1">{item.tipo_prueba}</h3>
              <p className="text-sm font-bold text-slate-400 mb-6">{formatearFechaManual(item.fecha)}</p>
              
              <button 
                onClick={() => verDetalles(item)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase hover:bg-black transition-all"
              >
                <Eye size={16} /> Ver Resultados
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* DETALLES DE LA PRUEBA */
        <div className="space-y-6">
          {infoPrueba.url_informe && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm"><FileText size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-emerald-700 uppercase">Documento Oficial</p>
                  <p className="text-xs font-bold text-emerald-900">Informe_FBF_{infoPrueba.fecha}.pdf</p>
                </div>
              </div>
              <a 
                href={`import.meta.env.VITE_API_URL${infoPrueba.url_informe}`} target="_blank" rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100"
              >
                <ExternalLink size={14} /> Abrir PDF
              </a>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Árbitro</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-center">Agilidad</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-center">Velocidad</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-center">Resistencia</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {detalleSeleccionado.map((det, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-6">
                        <p className="text-xs font-black text-slate-800 uppercase">{det.nombre_completo}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{det.categoria}</p>
                      </td>
                      <td className={`p-6 text-center text-[10px] font-black uppercase ${det.agilidad === 'Reprobado' ? 'text-red-500' : 'text-slate-600'}`}>{det.agilidad}</td>
                      <td className={`p-6 text-center text-[10px] font-black uppercase ${det.velocidad === 'Reprobado' ? 'text-red-500' : 'text-slate-600'}`}>{det.velocidad}</td>
                      <td className={`p-6 text-center text-[10px] font-black uppercase ${det.resistencia === 'Reprobado' ? 'text-red-500' : 'text-slate-600'}`}>{det.resistencia}</td>
                      <td className="p-6 text-[10px] text-slate-400 italic">{det.observacion || 'Sin observaciones'}</td>
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

export default HistorialPruebasFisicas;