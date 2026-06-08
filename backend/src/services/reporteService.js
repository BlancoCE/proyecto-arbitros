const reporteModel = require('../models/reporteModel');

const reporteService = {
    generarInformeDetallado: async (id_arbitro, anio) => {
        const [metricas, lineal, escrito, fisico] = await Promise.all([
            reporteModel.obtenerMetricasCualitativas(id_arbitro, anio),
            reporteModel.obtenerEvolucionTemporal(id_arbitro, anio),
            reporteModel.obtenerHistorialEscrito(id_arbitro, anio),
            reporteModel.obtenerHistorialFisico(id_arbitro, anio)
        ]);

        return {
            tipo: 'individual',
            año: anio,
            resumen: metricas,
            graficoLineal: lineal,
            historialEscrito: escrito,
            historialFisico: fisico,
            graficoRadar: [
                { sujeto: 'Técnico Campo', valor: parseFloat(metricas.avg_tecnico) || 0, fullMark: 100 },
                { sujeto: 'Físico Campo', valor: parseFloat(metricas.avg_fisico) || 0, fullMark: 100 },
                { sujeto: 'Prueba Escrita', valor: parseFloat(metricas.avg_pruebas_escritas) || 0, fullMark: 100 },
                { sujeto: 'Actitud', valor: parseFloat(metricas.avg_actitud) || 0, fullMark: 100 }
            ]
        };
    },

    // Combina métricas resumidas de la liga + gráfico lineal de la liga + la lista de los 28 árbitros
    generarInformeGlobalLiga: async (anio) => {
        const [metricasGlobales, historialGlobal, datasetGlobal] = await Promise.all([
            reporteModel.obtenerMetricasGlobalesLiga(anio),
            reporteModel.obtenerEvolucionGlobalLiga(anio),
            reporteModel.obtenerTodosLosArbitrosParaReporteGlobal(anio)
        ]);

        return {
            tipo: 'global',
            año: anio,
            resumen: metricasGlobales,
            graficoLineal: historialGlobal,
            dataset: datasetGlobal,
            graficoRadar: [
                { sujeto: 'Técnico Campo', valor: parseFloat(metricasGlobales.avg_tecnico) || 0, fullMark: 100 },
                { sujeto: 'Físico Campo', valor: parseFloat(metricasGlobales.avg_fisico) || 0, fullMark: 100 },
                { sujeto: 'Prueba Escrita', valor: parseFloat(metricasGlobales.avg_pruebas_escritas) || 0, fullMark: 100 },
                { sujeto: 'Actitud', valor: parseFloat(metricasGlobales.avg_actitud) || 0, fullMark: 100 }
            ]
        };
    }
};

module.exports = reporteService;