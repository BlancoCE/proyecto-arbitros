const sancionModel = require('../models/sancionModel');
const fs = require('fs');
const path = require('path');

const sancionService = {
    aplicarSancion: async (data) => {
        const ahora = new Date();
        const hoy = [
            ahora.getFullYear(),
            String(ahora.getMonth() + 1).padStart(2, '0'),
            String(ahora.getDate()).padStart(2, '0')
        ].join('-'); // Resultado: "2024-05-02"

        let estadoCalculado = 'Activa';
        const fechaFinLimpia = (data.fecha_fin === "" || !data.fecha_fin) ? null : data.fecha_fin;

        // 2. Comparación directa de strings (Segura y rápida)
        if (data.fecha_inicio > hoy) {
            estadoCalculado = 'A cumplir';
        } else if (fechaFinLimpia && fechaFinLimpia < hoy) {
            estadoCalculado = 'Cumplida';
        }

        const nuevaSancion = await sancionModel.crear({ 
            ...data, 
            fecha_fin: fechaFinLimpia, 
            estado: estadoCalculado 
        });

        // 3. Lógica de Impacto en el Árbitro (Incluye Inhabilitación)
        if (estadoCalculado === 'Activa') {
            let estadoArbitro = 'Activo';
            const tipo = data.tipo_sancion.trim();
            if (tipo === 'Suspensión Temporal') {
                estadoArbitro = 'Suspendido';
            } else if (tipo === 'Inhabilitación de Funciones' || tipo === 'Baja Definitiva') {
                estadoArbitro = 'Inactivo'; // Aquí se cubre tu duda sobre Inhabilitación
            }
            await sancionModel.actualizarEstadoArbitro(data.id_arbitro, estadoArbitro);
        }
        return nuevaSancion;
    },

    obtenerListadoSanciones: async () => {
        await sancionModel.restablecerEstadosArbitros();
        const todas = await sancionModel.listarSancionesCompleto();
        const hoy = new Date().toISOString().split('T')[0];

        const procesadas = todas.map(s => {
            const fIn = s.fecha_inicio.toISOString().split('T')[0];
            const fOut = s.fecha_fin ? s.fecha_fin.toISOString().split('T')[0] : null;

            let estadoReal = 'Activa';
            if (fIn > hoy) estadoReal = 'A cumplir';
            else if (fOut && fOut < hoy) estadoReal = 'Cumplida';
            else if (!fOut && fIn < hoy && !['Suspensión Temporal', 'Inhabilitación de Funciones'].includes(s.tipo_sancion)) {
                estadoReal = 'Cumplida';
            }

            return { ...s, estadoReal };
        });

        return {
            enCirculacion: procesadas.filter(s => s.estadoReal !== 'Cumplida'),
            pasadas: procesadas.filter(s => s.estadoReal === 'Cumplida')
        };
    },

    editarSancion: async (id, data) => {
        // Si viene un archivo nuevo, borramos el anterior del disco
        if (data.url_resolucion) {
            const urlAntigua = await sancionModel.obtenerUrlResolucion(id);
            if (urlAntigua) {
                const rutaAbsoluta = path.join(__dirname, '../../', urlAntigua);
                if (fs.existsSync(rutaAbsoluta)) fs.unlinkSync(rutaAbsoluta);
            }
        } else {
            // Si no se subió archivo nuevo, mantenemos el que ya tenía
            const actual = await sancionModel.obtenerUrlResolucion(id);
            data.url_resolucion = actual;
        }

        return await sancionModel.actualizar(id, data);
    },

    borrarSancion: async (id) => {
        // 1. Borrar archivo físico primero
        const url = await sancionModel.obtenerUrlResolucion(id);
        if (url) {
            const rutaAbsoluta = path.join(__dirname, '../../', url);
            if (fs.existsSync(rutaAbsoluta)) {
                try { fs.unlinkSync(rutaAbsoluta); } catch (e) { console.error(e); }
            }
        }
        // 2. Borrar de la DB
        const res = await sancionModel.eliminar(id);
        // 3. Limpiar estados residuales
        await sancionModel.restablecerEstadosArbitros();
        return res;
    },

    obtenerArbitrosParaSancion: async () => {
        return await sancionModel.listarArbitrosJerarquicos();
    },

    verificarSancionExistente: async (id_arbitro) => {
        return await sancionModel.verificarSancionActiva(id_arbitro);
    }
};

module.exports = sancionService;