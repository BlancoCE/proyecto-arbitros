import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, UploadCloud, Trash2, 
  FileText, History, Search, UserCheck 
} from 'lucide-react';
import HistorialPruebasEscritas from './HistorialPruebasEscritas';

const RegistroPruebaEscrita: React.FC = () => {
  const [view, setView] = useState<'edicion' | 'historial'>('edicion');
  const [arbitros, setArbitros] = useState<any[]>([]);
  const [tema, setTema] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultados, setResultados] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);

  // Estados para Filtros
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [filtroCat, setFiltroCat] = useState('todas');
  const [filtroGenero, setFiltroGenero] = useState('todos');

  useEffect(() => {
    fetchArbitrosParaPrueba();
  }, []);

  const fetchArbitrosParaPrueba = async () => {
    try {
      // Usamos el mismo endpoint optimizado que devuelve la jerarquía
      const res = await axios.get('import.meta.env.VITE_API_URL/api/pruebas-fisicas/arbitros-habilitados');
      setArbitros(res.data);
    } catch (err) {
      console.error("Error al cargar árbitros:", err);
    }
  };

  // Lógica de filtrado solicitada
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

  const handleInputChange = (id: number, campo: 'valor1' | 'valor2', valor: string) => {
    setResultados(prev => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor }
    }));
  };

  const handleGuardar = async () => {
    if (!tema) return alert("Debe ingresar el tema del examen.");
    if (!archivo) return alert("Debe subir el acta de notas (PDF).");

    const evaluados = arbitros.filter(arb => 
        resultados[arb.id_arbitro]?.valor1 || arb.estado === 'En Licencia'
    );

    if (evaluados.length === 0) return alert("No hay notas ingresadas para guardar.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('tema', tema);
      formData.append('fecha', fecha);
      formData.append('url_informe_prueba', archivo); // Nombre solicitado

      const datosFinales = evaluados.map(arb => ({
        id_arbitro: arb.id_arbitro,
        // Si está en licencia, mandamos 0 o un flag, y en la observación aclaramos
        nota: arb.estado === 'En Licencia' ? 0 : parseFloat(resultados[arb.id_arbitro].valor1),
        observacion: arb.estado === 'En Licencia' 
            ? 'ÁRBITRO CON LICENCIA' 
            : (resultados[arb.id_arbitro].valor2 || '')
      }));

      formData.append('datos', JSON.stringify(datosFinales));

      await axios.post('import.meta.env.VITE_API_URL/api/pruebas-escritas/registrar', formData);
      alert("Prueba escrita registrada exitosamente.");
      setView('historial');
    } catch (err) {
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'historial') return <HistorialPruebasEscritas onBack={() => setView('edicion')} />;

  return (
    <div className="p-2 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* PANEL DE CONFIGURACIÓN */}
      <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tema del Examen</p>
            <input 
              type="text" 
              value={tema} 
              onChange={e => setTema(e.target.value)}
              placeholder="Ej: Modificaciones Reglas 2024..."
              className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all"
            />
          </div>

          <div className="w-full lg:w-44">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Fecha</p>
            <input 
              type="date" 
              value={fecha} 
              onChange={e => setFecha(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all"
            />
          </div>

          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Acta de Notas (PDF)</p>
            <div className="relative flex items-center">
              <label className={`flex-1 flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${archivo ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-400'}`}>
                <UploadCloud size={18} className={archivo ? 'text-emerald-500' : 'text-slate-400'} />
                <span className="text-[10px] font-bold text-slate-600 truncate">{archivo ? archivo.name : 'Subir archivo (Límite de 5MB)'}</span>
                <input type="file" className="hidden" accept=".pdf" onChange={e => setArchivo(e.target.files?.[0] || null)} />
              </label>
              {archivo && (
                <button onClick={() => setArchivo(null)} className="ml-2 p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <button onClick={() => setView('historial')} className="mt-5 p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">
            <History size={20} />
          </button>
        </div>

        {/* FILTROS (DISEÑO SOLICITADO) */}
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

      {/* TABLA DE NOTAS */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Árbitro / Info</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nota Final</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {arbitrosFiltrados.map(arb => {
                    const enLicencia = arb.estado === 'En Licencia';
                    
                    return (
                    <tr key={arb.id_arbitro} className={`transition-all ${enLicencia ? 'bg-amber-50/50' : 'hover:bg-slate-50/30'}`}>
                        <td className="p-6">
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

                        <td className="p-6 text-center">
                        {enLicencia ? (
                            <div className="text-[10px] font-black text-amber-600 bg-white border border-amber-200 py-2 rounded-xl uppercase">
                            Inhabilitado
                            </div>
                        ) : (
                            <input 
                            type="number" 
                            placeholder="0.00"
                            value={resultados[arb.id_arbitro]?.valor1 || ''}
                            onChange={(e) => handleInputChange(arb.id_arbitro, 'valor1', e.target.value)}
                            className="w-24 p-3 bg-slate-50 rounded-xl text-center text-xs font-black text-indigo-600 outline-none border-2 border-transparent focus:border-indigo-400"
                            />
                        )}
                        </td>

                        <td className="p-6">
                        <input 
                            type="text" 
                            disabled={enLicencia}
                            placeholder={enLicencia ? "Árbitro en periodo de licencia" : "Ej: Segunda oportunidad..."}
                            value={enLicencia ? '' : (resultados[arb.id_arbitro]?.valor2 || '')}
                            onChange={(e) => handleInputChange(arb.id_arbitro, 'valor2', e.target.value)}
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

      {/* ACCIÓN FINAL */}
      <div className="flex justify-center md:justify-end pb-10">
        <button 
          onClick={handleGuardar}
          disabled={loading}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95"
        >
          {loading ? 'Guardando...' : <><Save size={18} /> Registrar Calificaciones</>}
        </button>
      </div>
    </div>
  );
};

export default RegistroPruebaEscrita;