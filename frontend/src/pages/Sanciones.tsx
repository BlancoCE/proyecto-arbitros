import React, { useState } from 'react';
import { Gavel, Plus, X } from 'lucide-react';
import SeccionSanciones from '../components/Sancion/SeccionSanciones';
import FormularioSancion from '../components/Sancion/FormularioSancion';

const Sanciones: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [sancionAEditar, setSancionAEditar] = useState<any>(null);

    const handleSuccess = () => {
        setShowModal(false);
        setSancionAEditar(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleOpenModal = (sancion: any = null) => {
        setSancionAEditar(sancion);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">RÉGIMEN DISCIPLINARIO</h1>
                        <p className="text-gray-500 mt-2 font-medium">Administración de sanciones y suspensiones.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all transform hover:scale-[1.02]"
                    >
                        <Plus size={22} strokeWidth={3} />
                        APLICAR SANCIÓN
                    </button>
                </div>

                <SeccionSanciones 
                    key={refreshKey} 
                    refreshKey={refreshKey} // Añadimos esta línea
                    onEdit={handleOpenModal} 
                />

                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X size={24} /></button>
                            <div className="max-h-[85vh] overflow-y-auto">
                                <FormularioSancion 
                                    onBack={() => setShowModal(false)} 
                                    onSuccess={handleSuccess} 
                                    sancionParaEditar={sancionAEditar} 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sanciones;