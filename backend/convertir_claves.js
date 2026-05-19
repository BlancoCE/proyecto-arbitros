const pool = require('./src/config/db'); 
const bcrypt = require('bcryptjs');

async function hashearContrasenas() {
    try {
        // 1. CAMBIO: Seleccionamos la columna correcta 'password_hash'
        const res = await pool.query('SELECT id_usuario, password_hash FROM USUARIO');
        const usuarios = res.rows;

        console.log(`Iniciando conversión de ${usuarios.length} usuarios...`);

        for (let user of usuarios) {
            // 2. CAMBIO: Usamos user.password_hash
            // Verificamos si es nulo o si ya está hasheada
            if (!user.password_hash || user.password_hash.startsWith('$2a$')) {
                console.log(`Usuario ${user.id_usuario} saltado (ya protegido o vacío).`);
                continue;
            }

            // 3. Creamos el hash
            const salt = await bcrypt.genSalt(10);
            const nuevoHash = await bcrypt.hash(user.password_hash, salt);

            // 4. CAMBIO: Actualizamos la columna correcta 'password_hash'
            await pool.query('UPDATE USUARIO SET password_hash = $1 WHERE id_usuario = $2', [nuevoHash, user.id_usuario]);
            console.log(`Contraseña de usuario ${user.id_usuario} actualizada.`);
        }

        console.log("¡Proceso completado con éxito!");
        process.exit();
    } catch (err) {
        console.error("Error en la transición:", err);
        process.exit(1);
    }
}

hashearContrasenas();