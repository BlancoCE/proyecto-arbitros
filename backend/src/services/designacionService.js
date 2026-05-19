const designacionModel = require('../models/designacionModel');

const designacionService = {
    obtenerPartidosParaDesignar: async () => {
        return await designacionModel.listarPartidosParaGestion();
    },

    obtenerArbitrosAptos: async (id_partido) => {
        return await designacionModel.listarArbitrosDisponibles(id_partido);
    },

    registrarDesignacion: async (id_partido, terna) => {
        return await designacionModel.asignarTerna(id_partido, terna);
    },

    eliminarDesignacion: async (id_partido) => {
        return await designacionModel.borrarDesignacion(id_partido);
    },

    obtenerDesignacionesPorArbitro: async (id_usuario) => {
        return await designacionModel.listarDesignacionesPorArbitro(id_usuario);
    }
};

module.exports = designacionService;