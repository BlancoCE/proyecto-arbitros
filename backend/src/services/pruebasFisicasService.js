const pfModel = require('../models/pruebasFisicasModel');
const fs = require('fs');
const path = require('path');

const obtenerListaArbitros = async () => {
    return await pfModel.listarArbitrosParaPrueba();
};

const procesarRegistroFisico = async (payload) => {
    const { tipo_prueba, fecha, url_informe, datos } = payload;

    // 1. VALIDACIÓN DE DUPLICADOS
    const existe = await pfModel.verificarDuplicadoFisico(fecha, tipo_prueba);
    if (existe) {
        // Si existe, lanzamos error para que el controlador lo capture y no guarde el archivo
        throw new Error('DUPLICADO');
    }

    for (const fila of datos) {
        let ag = fila.agilidad;
        let vel = fila.velocidad;
        let res = fila.resistencia;

        if (ag === 'No Asistió' || ag === 'Reprobado') {
            vel = ag; res = ag;
        } else if (vel === 'No Asistió' || vel === 'Reprobado') {
            res = vel;
        }

        await pfModel.insertarResultadoFisico({
            id_arbitro: fila.id_arbitro,
            tipo_prueba, fecha, url_informe,
            agilidad: ag, velocidad: vel, resistencia: res,
            observacion: fila.observacion
        });
    }
};

const obtenerHistorial = async () => {
    return await pfModel.listarCabecerasFisicas();
};

const obtenerDetalleCompleto = async (fecha, tipo) => {
    return await pfModel.consultarDetallePorPrueba(fecha, tipo);
};

const borrarRegistroFisico = async (fecha, tipo) => {
    // 1. Obtener la ruta del archivo antes de borrar de la DB
    const urlInforme = await pfModel.obtenerUrlInformeFisico(fecha, tipo);

    // 2. Borrar de la base de datos
    await pfModel.eliminarPruebaCompleta(fecha, tipo);

    // 3. Borrar el archivo físico si existe
    if (urlInforme) {
        const rutaAbsoluta = path.join(__dirname, '../../', urlArchivo);

        if (fs.existsSync(rutaAbsoluta)) {
            try {
                fs.unlinkSync(rutaAbsoluta);
                console.log("Archivo eliminado físicamente con éxito");
            } catch (err) {
                console.error("Error al intentar borrar el archivo del disco:", err);
            }
        } else {
            console.log("El archivo no existe en la ruta:", rutaAbsoluta);
        }
    }
};

module.exports = { obtenerListaArbitros, procesarRegistroFisico, obtenerHistorial, obtenerDetalleCompleto, borrarRegistroFisico };