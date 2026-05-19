const peModel = require('../models/pruebasEscritasModel');
const fs = require('fs');
const path = require('path');

const procesarRegistroEscrito = async (body, file) => {
    const { tema, fecha, datos } = body;
    const listaDatos = JSON.parse(datos);

    // 1. VALIDACIÓN DE DUPLICADOS
    const existe = await peModel.verificarDuplicadoEscrito(fecha, tema);
    if (existe) throw new Error('DUPLICADO');

    const url_informe = file ? `/uploads/informes/${file.filename}` : null;

    for (const item of listaDatos) {
        await peModel.insertarResultadoEscrito({
            fecha,
            tema,
            nota: item.nota,
            observacion: item.observacion,
            id_arbitro: item.id_arbitro,
            url_informe_prueba: url_informe
        });
    }
    return { success: true };
};

const eliminarRegistro = async (fecha, tema) => {
    // 1. Obtener URL del archivo antes de borrar datos
    const urlArchivo = await peModel.obtenerUrlInformeEscrito(fecha, tema);

    // 2. Borrar de la DB
    await peModel.eliminarPruebaEscritaCompleta(fecha, tema);

    // 3. Borrar archivo físico
    if (urlArchivo) {
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

module.exports = { 
    procesarRegistroEscrito,
    obtenerHistorial: peModel.listarCabecerasEscritas,
    obtenerDetalle: peModel.consultarDetalleEscrito,
    eliminarRegistro
};