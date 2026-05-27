const userModel = require('../models/userModel');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('node:crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const userService = {
  // 1. LOGIN ACTUALIZADO (Para comparar hashes)
  login: async (usuario, password) => {
    // Buscamos al usuario solo por su nombre_usuario
    const dbUser = await userModel.findUserByUsername(usuario);
    
    if (!dbUser) throw new Error("Usuario o contraseña incorrectos");
    if (!dbUser.activo) throw new Error("Su cuenta está desactivada.");

    // COMPARACIÓN SEGURA
    const isMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!isMatch) throw new Error("Usuario o contraseña incorrectos");

    userModel.updateLastLogin(dbUser.id_usuario).catch(e => console.log("Error login update"));

    return {
      id_usuario: dbUser.id_usuario,
      nombre_usuario: dbUser.nombre_usuario,
      nombre_completo: `${dbUser.nombre} ${dbUser.apellido_paterno}`,
      rol: dbUser.rol,
      id_especifico: dbUser.id_asesor || dbUser.id_arbitro || null
    };
  },

  // 2. REGISTRO CON ENCRIPTACIÓN
  registerAsesor: async (userData) => {
    const existing = await userModel.checkExistingUser(userData.ci, userData.nombre_usuario);
    if (existing) throw new Error("El CI o Nombre de Usuario ya existe.");

    // ENCRIPTAR CONTRASEÑA
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(userData.password, salt);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const newUserId = await userModel.insertUser(client, { 
          ...userData, 
          password: hashedPass, // <--- Enviamos el hash, no el texto plano
          rol: 'asesor', 
          activo: true 
      });
      await client.query('INSERT INTO asesor (id_asesor, estado) VALUES ($1, $2)', 
        [newUserId, userData.estado || 'Activo']
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  // Repetir la lógica de hash en registerArbitro...
  registerArbitro: async (userData) => {
    const existing = await userModel.checkExistingUser(userData.ci, userData.nombre_usuario);
    if (existing) throw new Error("El CI o Usuario ya existe.");

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(userData.password, salt);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const newUserId = await userModel.insertUser(client, { 
          ...userData, 
          password: hashedPass, 
          rol: 'arbitro', 
          activo: true 
      });
      await client.query(
        'INSERT INTO arbitro (id_arbitro, categoria, especializacion, estado) VALUES ($1, $2, $3, $4)', 
        [newUserId, userData.categoria, userData.especializacion, userData.estado || 'Activo']
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  // FILTRO DE ASESORES (Excluir al que consulta)
  getAsesores: async (id_usuario_actual) => {
    await userModel.limpiarEstadosGlobales();
    return await userModel.findAllAsesores(id_usuario_actual);
  },

  getArbitros: async () => {
    await userModel.limpiarEstadosGlobales();
    return await userModel.findAllArbitros();
  },

  updateAsesor: async (id_asesor, data) => {
    const id_usuario = await pool.query('SELECT 1 FROM asesor WHERE id_asesor = $1', [id_asesor]);
    if (id_usuario.rowCount === 0) {
      throw new Error("Asesor no encontrado");
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await userModel.updateUsuario(client, { ...data, id_usuario: id_asesor, activo: (data.estado === 'Activo') });
      await userModel.updateAsesorData(client, id_asesor, data);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  updateArbitro: async (id_arbitro, data) => {
    const id_usuario = await pool.query('SELECT 1 FROM arbitro WHERE id_arbitro = $1', [id_arbitro]);
    if (id_usuario.rowCount === 0) {
      throw new Error("Árbitro no encontrado");
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Actualiza parte general en USUARIO (el rol de árbitro no suele cambiar)
      await userModel.updateUsuario(client, { ...data, id_usuario: id_arbitro, rol: 'arbitro', Activo: true });
      // Actualiza parte técnica en ARBITRO
      await userModel.updateArbitroData(client, id_arbitro, data);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  deleteAsesor: async (id_asesor) => {
    try {
      const result = await userModel.deleteUsuario(pool, id_asesor);
      
      if (result.rowCount === 0) {
        throw new Error("Asesor no encontrado");
      }
      return result;
    } catch (e) {
      throw e;
    }
  },

  deleteArbitro: async (id_arbitro) => {
    try {
      const result = await userModel.deleteUsuario(pool, id_arbitro);
      
      if (result.rowCount === 0) {
        throw new Error("Árbitro no encontrado");
      }
      return result;
    } catch (e) {
      throw e;
    }
  },

  getDashboardData: async () => {
    // 1. Ejecutamos la limpieza de estados de árbitros
    await userModel.limpiarEstadosGlobales();
    
    // 2. Ahora sí, obtenemos los totales y la distribución actualizada
    const totales = await userModel.getDashboardTotales();
    const distribucion = await userModel.getArbitrosDistribucion();
    
    return { totales, distribucion };
  },

  forgotPassword: async (email) => {
    // 1. Verificar si el usuario existe
    const user = await userModel.findUserByEmail(email);
    if (!user) throw new Error("No existe un usuario asociado a este correo electrónico.");

    // 2. Generar un token aleatorio y expiración (1 hora)
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora desde ahora

    // 3. Guardar en la BD
    await userModel.setResetToken(user.id_usuario, token, expires);

    // 4. Configurar el enlace (ajusta el puerto si tu frontend usa otro)
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    // 5. Contenido del correo
    const mailOptions = {
      from: 'bicentenariobolivia25@gmail.com',
      to: user.email,
      subject: 'Recuperación de Contraseña - Sistema de Arbitraje',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
          <h2 style="color: #151960; text-align: center;">Recuperación de Contraseña</h2>
          <p>Hola, <strong>${user.nombre}</strong>.</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar. Este enlace caducará en 1 hora.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #337ab7; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi Contraseña</a>
          </div>
          <p style="font-size: 12px; color: #777;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  },

  resetPassword: async (token, newPassword) => {
    // 1. Validar si el token es válido y no ha expirado
    const user = await userModel.validateResetToken(token);
    if (!user) throw new Error("El enlace es inválido o ha expirado.");

    // 2. Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // 3. Actualizar en la BD y limpiar el token
    return await userModel.updatePasswordWithToken(user.id_usuario, hash);
  },
};

userService.transporter = transporter;

module.exports = userService;