const reporteModel = require('../models/reporteModel');

const reporteService = {
    // Informe para un Árbitro
    generarInformeDetallado: async (id_arbitro) => {
        const [metricas, historial] = await Promise.all([
            reporteModel.obtenerMetricasCualitativas(id_arbitro),
            reporteModel.obtenerEvolucionTemporal(id_arbitro)
        ]);

        return {
            resumen: metricas,
            graficoLineal: historial,
            graficoRadar: [
                { sujeto: 'Técnico', valor: parseFloat(metricas.avg_tecnico) || 0, fullMark: 100 },
                { sujeto: 'Físico', valor: parseFloat(metricas.avg_fisico) || 0, fullMark: 100 },
                { sujeto: 'Actitud', valor: parseFloat(metricas.avg_actitud) || 0, fullMark: 100 },
            ]
        };
    },

    // NUEVO: Informe de promedios de la Liga (Para Asesores/Admin)
    generarInformeGlobalLiga: async () => {
        const [metricas, historial] = await Promise.all([
            reporteModel.obtenerMetricasGlobalesLiga(),
            reporteModel.obtenerEvolucionGlobalLiga()
        ]);

        return {
            resumen: { ...metricas, ultima_nota: 'PROMEDIO LIGA' },
            graficoLineal: historial,
            graficoRadar: [
                { sujeto: 'Técnico', valor: parseFloat(metricas.avg_tecnico) || 0, fullMark: 100 },
                { sujeto: 'Físico', valor: parseFloat(metricas.avg_fisico) || 0, fullMark: 100 },
                { sujeto: 'Actitud', valor: parseFloat(metricas.avg_actitud) || 0, fullMark: 100 },
            ]
        };
    },

    obtenerEstadisticasLiga: async () => {
        return await reporteModel.obtenerRankingGlobal();
    }
};

module.exports = reporteService;