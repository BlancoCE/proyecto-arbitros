const licenciaModel = require('../models/licenciaModel');
const sancionModel = require('../models/sancionModel');
const fs = require('fs');
const path = require('path');

const licenciaService = {
    registrarLicencia: async (data) => {
        const existeSolape = await licenciaModel.verificarSolapamiento(data.id_arbitro, data.fecha_inicio, data.fecha_fin);
        if (existeSolape) {
            throw new Error("El árbitro ya tiene una licencia registrada en esas fechas.");
        }
        // Obtenemos 'hoy' en formato local YYYY-MM-DD
        const ahora = new Date();
        const hoy = [
            ahora.getFullYear(),
            String(ahora.getMonth() + 1).padStart(2, '0'),
            String(ahora.getDate()).padStart(2, '0')
        ].join('-');

        const nueva = await licenciaModel.crear(data);

        // IMPACTO AUTOMÁTICO: Solo si la licencia empieza hoy o ya empezó
        if (data.fecha_inicio <= hoy && (!data.fecha_fin || data.fecha_fin >= hoy)) {
            await sancionModel.actualizarEstadoArbitro(data.id_arbitro, 'En Licencia');
        }
        
        return nueva;
    },

    getHistorial: async () => {
        const todas = await licenciaModel.listarTodo();
        
        // Generar fecha hoy local para comparar strings
        const ahora = new Date();
        const hoy = [
            ahora.getFullYear(),
            String(ahora.getMonth() + 1).padStart(2, '0'),
            String(ahora.getDate()).padStart(2, '0')
        ].join('-');

        const procesadas = todas.map(l => {
            // Extraer solo la parte YYYY-MM-DD de la base de datos
            const fInicio = l.fecha_inicio.toISOString().split('T')[0];
            const fFin = l.fecha_fin ? l.fecha_fin.toISOString().split('T')[0] : null;

            let estadoReal = 'Activa';

            if (fInicio > hoy) {
                estadoReal = 'Futura';
            } 
            else if (fFin && fFin < hoy) {
                estadoReal = 'Finalizada';
            }
            else {// Ya inició y no ha terminado (o es indefinida)
                estadoReal = 'Activa';
            }
            return { ...l, estadoReal, fecha_inicio: fInicio, fecha_fin: fFin };
        });
        return {
            actuales: procesadas.filter(l => l.estadoReal === 'Activa' || l.estadoReal === 'Futura'),
            pasadas: procesadas.filter(l => l.estadoReal === 'Finalizada')
        };
    },

    editarLicencia: async (id, data) => {
        // 1. Verificar solapamiento (excluyendo la licencia actual por ID)
        const existeSolape = await licenciaModel.verificarSolapamiento(data.id_arbitro, data.fecha_inicio, data.fecha_fin, id);
        
        if (existeSolape) {
            throw new Error("SOLAPE");
        }

        // 2. Si se está subiendo un nuevo archivo, eliminar el anterior del disco
        if (data.url_carta) {
            const urlAntigua = await licenciaModel.obtenerUrlCarta(id);
            if (urlAntigua) {
                const rutaAbsoluta = path.join(__dirname, '../../', urlAntigua);
                if (fs.existsSync(rutaAbsoluta)) {
                    try {
                        fs.unlinkSync(rutaAbsoluta);
                    } catch (err) {
                        console.error("Error al eliminar archivo antiguo en edición:", err);
                    }
                }
            }
        }
        // 3. Actualizar en la base de datos
        return await licenciaModel.actualizar(id, data);
    },

    borrarLicencia: async (id) => {
        const urlArchivo = await licenciaModel.obtenerUrlCarta(id);
        // 1. Borrar de la DB
        await licenciaModel.eliminar(id);
        // 2. Borrar archivo físico si existe
        if (urlArchivo) {
            const rutaAbsoluta = path.join(__dirname, '../../', urlArchivo);
            if (fs.existsSync(rutaAbsoluta)) fs.unlinkSync(rutaAbsoluta);
        }
    }
};

module.exports = licenciaService;