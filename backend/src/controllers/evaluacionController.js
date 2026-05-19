const pool = require('../config/db');

const evaluacionController = {
    registrarEvaluacion: async (req, res) => {
        const { 
            criterio_tecnico, criterio_fisico, criterio_actitud, 
            observacion, recomendacion, id_asesor, id_arbitro, id_partido 
        } = req.body;

        try {
            // Lógica de Negocio: Calcular el promedio en el Backend
            // Usamos parseFloat para asegurar que la operación sea aritmética
            const vTecnico = parseFloat(criterio_tecnico) || 0;
            const vFisico = parseFloat(criterio_fisico) || 0;
            const vActitud = parseFloat(criterio_actitud) || 0;
            
            const notaCalculada = ((vTecnico + vFisico + vActitud) / 3).toFixed(2);

            const existe = await pool.query(
                'SELECT id_evaluacion FROM evaluacion_partido WHERE id_arbitro = $1 AND id_partido = $2',
                [id_arbitro, id_partido]
            );

            if (existe.rows.length > 0) {
                // ACTUALIZAR
                await pool.query(
                    `UPDATE evaluacion_partido SET 
                    nota = $1, criterio_tecnico = $2, criterio_fisico = $3, criterio_actitud = $4, 
                    observacion = $5, recomendacion = $6, fecha = CURRENT_DATE
                    WHERE id_arbitro = $7 AND id_partido = $8`,
                    [notaCalculada, vTecnico, vFisico, vActitud, observacion, recomendacion, id_arbitro, id_partido]
                );
                return res.json({ success: true, message: "Evaluación actualizada correctamente" });
            } else {
                // INSERTAR
                await pool.query(
                    `INSERT INTO evaluacion_partido 
                    (nota, criterio_tecnico, criterio_fisico, criterio_actitud, observacion, recomendacion, id_asesor, id_arbitro, id_partido, fecha) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)`,
                    [notaCalculada, vTecnico, vFisico, vActitud, observacion, recomendacion, id_asesor, id_arbitro, id_partido]
                );
                return res.json({ success: true, message: "Evaluación registrada correctamente" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al procesar la evaluación" });
        }
    },

    obtenerEvaluacionesPorPartido: async (req, res) => {
        try {
            const { id_partido } = req.params;
            const result = await pool.query(
                'SELECT * FROM evaluacion_partido WHERE id_partido = $1',
                [id_partido]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = evaluacionController;