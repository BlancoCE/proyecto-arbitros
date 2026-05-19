const asistenciaModel = require('../models/asistenciaModel');

const asistenciaService = {
    procesarLista: async (data) => {
        const { fecha, tipo_actividad, registros } = data;

        const listaProcesada = registros.map(reg => {
            let estadoFinal = reg.estado;
            
            // Lógica de tolerancia automática
            if (reg.estado === 'Presente' && reg.hora_entrada) {
                const [horas, minutos] = reg.hora_entrada.split(':').map(Number);
                const tiempoCorte = horas * 60 + minutos;

                if (tipo_actividad.includes('Lunes')) {
                    if (tiempoCorte > (19 * 60 + 40)) estadoFinal = 'Retraso';
                } else {
                    if (tiempoCorte > (6 * 60 + 30)) estadoFinal = 'Retraso';
                }
            }

            return { ...reg, fecha, tipo_actividad, estado: estadoFinal };
        });

        return await asistenciaModel.registrarLista(listaProcesada);
    }
};

module.exports = asistenciaService;