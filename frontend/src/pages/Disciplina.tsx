import React, { useState } from 'react';
import { Gavel, FileText, Plus, X } from 'lucide-react';
import SeccionLicencias from '../components/Licencia/SeccionLicencias';
import SeccionSanciones from '../components/Sancion/SeccionSanciones';
import FormularioLicencia from '../components/Licencia/FormularioLicencia';
import FormularioSancion from '../components/Sancion/FormularioSancion';

const Disciplina: React.FC = () => {
    // 1. ESTADOS
    const [tab, setTab] = useState<'LICENCIAS' | 'SANCIONES'>('LICENCIAS');
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Estado para almacenar la sanción que se quiere editar (null si es creación nueva)
    const [sancionAEditar, setSancionAEditar] = useState<any>(null);
    const [licenciaAEditar, setLicenciaAEditar] = useState<any>(null);

    // 2. MANEJADORES
    const handleSuccess = () => {
        setShowModal(false);
        setSancionAEditar(null); // Limpiar después de guardar
        setRefreshKey(prev => prev + 1);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setLicenciaAEditar(null);
        setSancionAEditar(null);
    };

    // Función que llamará SeccionSanciones cuando se pulse el icono de lápiz
    const handleEditLicencia = (licencia: any) => {
        setLicenciaAEditar(licencia);
        setTab('LICENCIAS'); // Asegurar que estamos en la pestaña correcta
        setShowModal(true);
    };
    const handleEditSancion = (sancion: any) => {
        setSancionAEditar(sancion);
        setTab('SANCIONES'); // Asegurar que estamos en la pestaña correcta
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Título de la Sección Superior */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Gestión Disciplinaria
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Administración de licencias y régimen de sanciones del Colegio de Árbitros.
                    </p>
                </div>

                {/* Barra de Acciones */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    
                    {/* Selector de Pestañas */}
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm w-full md:w-auto">
                        <button
                            onClick={() => setTab('LICENCIAS')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all ${
                                tab === 'LICENCIAS' 
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <FileText size={18} />
                            Licencias
                        </button>
                        <button
                            onClick={() => setTab('SANCIONES')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all ${
                                tab === 'SANCIONES' 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Gavel size={18} />
                            Sanciones
                        </button>
                    </div>

                    {/* Botón Principal de Acción */}
                    <button
                        onClick={() => {
                            setSancionAEditar(null);
                            setLicenciaAEditar(null); // Asegurar que es creación limpia
                            setShowModal(true);
                        }}
                        className={`w-full md:w-auto flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                            tab === 'LICENCIAS' 
                            ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' 
                            : 'bg-red-600 shadow-red-100 hover:bg-red-700'
                        }`}
                    >
                        <Plus size={22} strokeWidth={3} />
                        {tab === 'LICENCIAS' ? 'REGISTRAR LICENCIA' : 'APLICAR SANCIÓN'}
                    </button>
                </div>

                {/* Área de Listados */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {tab === 'LICENCIAS' ? (
                        <SeccionLicencias  
                            key={`lic-${refreshKey}`} 
                            refreshKey={refreshKey} 
                            onEdit={handleEditLicencia}
                        />
                    ) : (
                        <SeccionSanciones 
                            key={`san-${refreshKey}`} 
                            refreshKey={refreshKey} 
                            onEdit={handleEditSancion} 
                        />
                    )}
                </div>

                {/* MODAL POPUP */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
                            onClick={handleCloseModal} 
                        />
                        
                        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                            
                            <button 
                                onClick={handleCloseModal}
                                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors z-10"
                            >
                                <X size={24} />
                            </button>
                            
                            <div className="max-h-[85vh] overflow-y-auto">
                                {tab === 'LICENCIAS' ? (
                                    <FormularioLicencia 
                                        onBack={handleCloseModal} 
                                        onSuccess={handleSuccess} 
                                        licenciaParaEditar={licenciaAEditar}
                                    />
                                ) : (
                                    <FormularioSancion 
                                        onBack={handleCloseModal} 
                                        onSuccess={handleSuccess}
                                        sancionParaEditar={sancionAEditar} // Prop clave para edición
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Disciplina;