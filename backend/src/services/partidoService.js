const partidoModel = require('../models/partidoModel');
const pool = require('../config/db');

const partidoService = {
  crearPartido: async (datos) => {
    // 1. Validar disponibilidad de sede
    const disponible = await partidoModel.validarSedeDisponible(datos.fecha, datos.hora, datos.ubicacion);
    if (!disponible) {
      throw new Error(`La sede "${datos.ubicacion}" ya tiene un partido programado para el día ${datos.fecha} a las ${datos.hora}.`);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const idLocal = await partidoModel.getOrCreateEquipo(datos.equipo_local_nombre);
      const idVisitante = await partidoModel.getOrCreateEquipo(datos.equipo_visitante_nombre);
      const idPartido = await partidoModel.insertPartido(client, datos);
      
      await partidoModel.insertPlanilla(client, idPartido, idLocal, datos.goles_local || 0, false);
      await partidoModel.insertPlanilla(client, idPartido, idVisitante, datos.goles_visitante || 0, true);
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  listarPartidos: async () => {
    return await partidoModel.getAllPartidos();
  },

  actualizarPartido: async (id, datos) => {
    // 1. Validar disponibilidad de sede excluyendo el partido actual
    const disponible = await partidoModel.validarSedeDisponible(datos.fecha, datos.hora, datos.ubicacion, id);
    if (!disponible) {
      throw new Error(`Conflicto de sede: La ubicación ya está ocupada en ese horario.`);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await partidoModel.updatePartidoBase(client, id, datos);
      await partidoModel.updatePlanillaGoles(client, id, false, datos.goles_local);
      await partidoModel.updatePlanillaGoles(client, id, true, datos.goles_visitante);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  eliminarPartido: async (id) => {
    return await partidoModel.deletePartido(id);
  }
};

module.exports = partidoService;