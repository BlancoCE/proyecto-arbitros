import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  History, Save, UploadCloud, Filter, 
  Trash2, AlertCircle, CheckCircle2
} from 'lucide-react';
import HistorialPruebasFisicas from './HistorialPruebasFisicas';

const RegistroPruebasFisicas: React.FC = () => {
  const [view, setView] = useState<'edicion' | 'historial'>('edicion');
  const [arbitros, setArbitros] = useState<any[]>([]);
  const [tipoPrueba, setTipoPrueba] = useState('Intermitente');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultados, setResultados] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtroRol, setFiltroRol] = useState('Todos'); 
  const [filtroCat, setFiltroCat] = useState('todas'); 
  const [filtroGenero, setFiltroGenero] = useState('todos');

  useEffect(() => { 
    fetchArbitrosHabilitados(); 
  }, []);

  const fetchArbitrosHabilitados = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/pruebas-fisicas/arbitros-habilitados');
      setArbitros(res.data);
    } catch (err) {
      console.error("Error al cargar árbitros", err);
    }
  };

  const arbitrosFiltrados = arbitros.filter(arb => {
    const cat = arb.categoria?.toLowerCase() || '';
    const esp = arb.especializacion?.toLowerCase() || '';
    const gen = arb.genero?.toLowerCase() || '';

    const cumpleGenero = filtroGenero === 'todos' || gen === filtroGenero.toLowerCase();
    
    const matchCategoria = filtroCat === 'todas' || cat === filtroCat.toLowerCase() ||
                          (filtroCat === 'Primera' && cat === '1ra') ||
                          (filtroCat === 'Segunda' && cat === '2da');

    let cumpleRol = false;
    if (filtroRol === 'Todos') cumpleRol = true;
    else if (filtroRol === 'Tercera') cumpleRol = cat.includes('3ra') || cat.includes('tercera');
    else if (filtroRol === 'Cuarta') cumpleRol = cat.includes('4ta') || cat.includes('cuarta');
    else cumpleRol = esp === filtroRol.toLowerCase() || esp === 'ambas';

    return cumpleGenero && cumpleRol && matchCategoria;
  });

  const handleInputChange = (id: number, campo: string, valor: string) => {
    setResultados(prev => {
      const actual = { ...prev[id], [campo]: valor };
      if (valor === 'No Asistió') {
        actual.agilidad = 'No Asistió';
        actual.velocidad = 'No Asistió';
        actual.resistencia = 'No Asistió';
      } else if (campo === 'agilidad' && valor === 'Reprobado') {
        actual.velocidad = 'Reprobado';
        actual.resistencia = 'Reprobado';
      } else if (campo === 'velocidad' && valor === 'Reprobado') {
        actual.resistencia = 'Reprobado';
      }
      return { ...prev, [id]: actual };
    });
  };

  // REGLA DE COMPARACIÓN SOLICITADA
  const getAgilidadInfo = (arb: any) => {
    const { especializacion: esp, categoria: cat } = arb;
    if (esp === 'Asistente' && ['FIFA', 'Primera', 'Segunda'].includes(cat)) return 'CODA';
    
    // Comparación corregida según tu solicitud
    if ((esp === 'Central' || cat === 'Tercera' || cat === 'Cuarta') && tipoPrueba === 'YoYo-Ariet') {
      return '7x7';
    }
    return null;
  };

  const handleGuardar = async () => {
    if (!archivo) return alert("Debe subir el informe PDF de la FBF.");

    const evaluados = arbitros.filter(arb => {
      const res = resultados[arb.id_arbitro];
      return res && (res.velocidad || res.resistencia);
    });

    if (evaluados.length === 0) return alert("No ha seleccionado resultados para ningún árbitro.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('tipo_prueba', tipoPrueba);
      formData.append('fecha', fecha);
      formData.append('url_informe', archivo);

      const datosFinales = evaluados.map(arb => ({
        id_arbitro: arb.id_arbitro,
        agilidad: arb.estado === 'En Licencia' ? 'En Licencia' : (resultados[arb.id_arbitro]?.agilidad || 'N/A'),
        velocidad: arb.estado === 'En Licencia' ? 'En Licencia' : (resultados[arb.id_arbitro]?.velocidad || ''),
        resistencia: arb.estado === 'En Licencia' ? 'En Licencia' : (resultados[arb.id_arbitro]?.resistencia || ''),
        observacion: resultados[arb.id_arbitro]?.observacion || ''
      }));

      formData.append('datos', JSON.stringify(datosFinales));
      await axios.post('http://localhost:3001/api/pruebas-fisicas/registrar', formData);
      alert("Éxito: Solo se registraron los árbitros con datos modificados.");
      setView('historial');
    } catch (err) { alert("Error al guardar."); }
    finally { setLoading(false); }
  };

  if (view === 'historial') return <HistorialPruebasFisicas onBack={() => setView('edicion')} />;

  return (
    <div className="p-2 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* HEADER RESPONSIVO */}
      <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* TIPO DE PRUEBA */}
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Protocolo</p>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {['Intermitente', 'YoYo-Ariet'].map(t => (
                <button 
                  key={t} onClick={() => { setTipoPrueba(t); setResultados({}); }}
                  className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${tipoPrueba === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* FECHA */}
          <div className="w-full lg:w-44">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Fecha</p>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-3 bg-slate-50 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-indigo-300" />
          </div>

          {/* UPLOAD CON BOTÓN TRASH CORREGIDO */}
          <div className="flex-1 relative">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Informe PDF</p>
            <div className="relative flex items-center">
              <label className={`flex-1 flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${archivo ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-400'}`}>
                <UploadCloud size={18} className={archivo ? 'text-emerald-500' : 'text-slate-400'} />
                <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px] md:max-w-none">
                  {archivo ? archivo.name : 'Subir archivo (Límite de 5MB)'}
                </span>
                <input type="file" className="hidden" accept=".pdf" onChange={e => setArchivo(e.target.files?.[0] || null)} />
              </label>
              
              {archivo && (
                <button 
                  onClick={() => setArchivo(null)}
                  className="ml-2 p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <button onClick={() => setView('historial')} className="mt-5 p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">
            <History size={20} />
          </button>
        </div>

        {/* FILTROS RESPONSIVOS */}
        <div className="bg-slate-50/50 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block ml-1">1. Seleccionar Rol o Grupo</label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {['Todos', 'Central', 'Asistente', 'Tercera', 'Cuarta'].map(rol => (
                <button 
                  key={rol} 
                  onClick={() => { setFiltroRol(rol); if (rol === 'Tercera' || rol === 'Cuarta') setFiltroCat('todas'); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filtroRol === rol ? 'bg-blue-700 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  {rol === 'Tercera' || rol === 'Cuarta' ? `Árb. ${rol}` : rol}
                </button>
              ))}
            </div>
          </div>

          {filtroRol !== 'Tercera' && filtroRol !== 'Cuarta' && (
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block ml-1">2. Filtrar por Categoría</label>
              <div className="grid grid-cols-2 sm:flex gap-2">
                {['todas', 'FIFA', 'Primera', 'Segunda'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setFiltroCat(cat)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${filtroCat === cat ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-white text-slate-400 border border-slate-100'}`}
                  >
                    {cat === 'todas' ? 'Todas' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABLA RESPONSIVA (Scroll horizontal en móviles) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Árbitro</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Agilidad</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Velocidad</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Resistencia</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {arbitrosFiltrados.map(arb => {
                const agilidadNome = getAgilidadInfo(arb);
                const enLicencia = arb.estado === 'En Licencia';
                const res = resultados[arb.id_arbitro] || {};

                return (
                  <tr key={arb.id_arbitro} className={`transition-all ${enLicencia ? 'bg-amber-50/40' : 'hover:bg-slate-50/30'}`}>
                    <td className="p-5">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-xs font-black text-slate-800 uppercase">
                                    {arb.apellido_paterno} {arb.apellido_materno} {arb.nombre}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                                    {arb.categoria} • {arb.especializacion} 
                                    {enLicencia && <span className="ml-2 text-amber-600 font-black">[ CON LICENCIA ]</span>}
                                </p>
                            </div>
                        </div>
                    </td>

                    <td className="p-5 text-center">
                      {enLicencia ? <span className="text-[10px] font-black text-gray-300 uppercase">N/A</span> : 
                        agilidadNome ? (
                          <div className="inline-flex flex-col gap-1">
                            <span className="text-[8px] font-black text-indigo-400">{agilidadNome}</span>
                            <select value={res.agilidad || ''} onChange={(e) => handleInputChange(arb.id_arbitro, 'agilidad', e.target.value)} className="p-2 border rounded-xl text-[10px] font-bold outline-none">
                              <option value="">-</option>
                              <option value="Aprobado">Aprobado</option>
                              <option value="Reprobado">Reprobado</option>
                              <option value="No Asistió">N/A</option>
                            </select>
                          </div>
                        ) : <span className="text-slate-300 font-black text-[10px]">N/A</span>
                      }
                    </td>

                    <td className="p-5">
                      <select disabled={enLicencia} value={res.velocidad || ''} onChange={(e) => handleInputChange(arb.id_arbitro, 'velocidad', e.target.value)} className="w-full p-2 bg-slate-50 rounded-xl text-[10px] font-bold outline-none disabled:opacity-30">
                        <option value="">Resultado</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Reprobado">Reprobado</option>
                        <option value="No Asistió">No Asistió</option>
                      </select>
                    </td>

                    <td className="p-5">
                      <select disabled={enLicencia} value={res.resistencia || ''} onChange={(e) => handleInputChange(arb.id_arbitro, 'resistencia', e.target.value)} className="w-full p-2 bg-slate-50 rounded-xl text-[10px] font-bold outline-none disabled:opacity-30">
                        <option value="">Resultado</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Reprobado">Reprobado</option>
                        <option value="No Asistió">No Asistió</option>
                      </select>
                    </td>

                    <td className="p-5">
                      
                        <input 
                            type="text" 
                            disabled={enLicencia}
                            placeholder={enLicencia ? "Árbitro en periodo de licencia" : "Observaciones..."}
                            
                            onChange={(e) => handleInputChange(arb.id_arbitro, 'observacion', e.target.value)}
                            className={`w-full p-3 rounded-xl text-xs outline-none border-none ${enLicencia ? 'bg-transparent text-amber-500 italic' : 'bg-slate-50 text-slate-500'}`}
                        />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTÓN GUARDAR RESPONSIVO */}
      <div className="flex justify-center md:justify-end pb-10">
        <button 
          onClick={handleGuardar}
          disabled={loading}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 transition-all"
        >
          {loading ? 'Guardando...' : <><Save size={18} /> Registrar Evaluados</>}
        </button>
      </div>
    </div>
  );
};

export default RegistroPruebasFisicas;