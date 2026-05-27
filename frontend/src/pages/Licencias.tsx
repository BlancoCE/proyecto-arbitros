import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import SeccionLicencias from '../components/Licencia/SeccionLicencias';
import FormularioLicencia from '../components/Licencia/FormularioLicencia';

const Licencias: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [licenciaAEditar, setLicenciaAEditar] = useState<any>(null);

    const handleSuccess = () => {
        setShowModal(false);
        setLicenciaAEditar(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleOpenModal = (licencia: any = null) => {
        setLicenciaAEditar(licencia);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                
                {/* CABECERA ULTRA RESPONSIVA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-10">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-gray-900 tracking-tight italic uppercase break-words">
                            Gestión de Licencias
                        </h1>
                        <p className="text-gray-500 mt-1 sm:mt-2 font-medium text-sm sm:text-base">
                            Control de permisos y ausencias justificadas.
                        </p>
                    </div>
                    
                    {/* Botón adaptado a anchos móviles (Color Azul consistente) */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95 sm:hover:scale-[1.02]"
                    >
                        <Plus size={20} strokeWidth={3} className="sm:w-[22px] sm:h-[22px]" />
                        REGISTRAR LICENCIA
                    </button>
                </div>

                {/* CONTENEDOR DE TABLAS / TARJETAS */}
                <div className="overflow-x-auto rounded-2xl">
                    <SeccionLicencias 
                        key={refreshKey} 
                        refreshKey={refreshKey}
                        onEdit={handleOpenModal} 
                    />
                </div>

                {/* MODAL OPTIMIZADO PARA INTERFACES TÁCTILES */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
                        
                        {/* Backdrop (Fondo opacado y desenfocado) */}
                        <button
                            type="button"
                            className="fixed inset-0 w-full h-full bg-gray-950/80 backdrop-blur-sm cursor-default transition-opacity animate-fade-in"
                            onClick={() => setShowModal(false)}
                            tabIndex={-1}
                            aria-hidden="true"
                        />
                        
                        {/* Tarjeta del modal: Caja flotante perfecta en celulares y escritorio */}
                        <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden transition-all transform scale-100 z-10 my-auto">
                            
                            {/* Botón de cierre flotante ergonómico */}
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full z-20 transition-colors bg-white/80 backdrop-blur-sm shadow-sm"
                                aria-label="Cerrar modal"
                            >
                                <X size={20} className="sm:w-5 sm:h-5" />
                            </button>
                            
                            {/* Área con scroll interno optimizado para el formulario */}
                            <div className="max-h-[85vh] overflow-y-auto p-2 sm:p-4">
                                <FormularioLicencia 
                                    onBack={() => setShowModal(false)} 
                                    onSuccess={handleSuccess}
                                    licenciaParaEditar={licenciaAEditar}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Licencias;