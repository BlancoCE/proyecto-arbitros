const pool = require('../config/db');

const designacionModel = {
    // 1. Obtiene los partidos usando subconsultas a PLANILLA_JUEGO para los nombres
    listarPartidosParaGestion: async () => {
        const query = `
            SELECT 
                p.id_partido, p.fecha, p.hora, p.liga as torneo, p.categoria, p.ubicacion, 
                CASE 
                    WHEN p.estado = 'Programado' AND (p.fecha + p.hora) < CURRENT_TIMESTAMP THEN 'Finalizado'
                    ELSE p.estado 
                END as estado,

                (SELECT e.nombre FROM planilla_juego pl JOIN equipo e ON pl.id_equipo = e.id_equipo 
                WHERE pl.id_partido = p.id_partido AND pl.visitante = false LIMIT 1) as equipo_local,

                (SELECT e.nombre FROM planilla_juego pl JOIN equipo e ON pl.id_equipo = e.id_equipo 
                WHERE pl.id_partido = p.id_partido AND pl.visitante = true LIMIT 1) as equipo_visitante,
                
                EXISTS (SELECT 1 FROM designado d WHERE d.id_partido = p.id_partido) as tiene_designacion,
                
                -- LÓGICA DE CONFLICTO DE HORARIO (Semáforo)
                -- Busca si hay otro partido en la misma fecha y ubicación con menos de 2 horas de diferencia
                EXISTS (
                    SELECT 1 FROM partido p2 
                    WHERE p2.id_partido != p.id_partido 
                    AND p2.fecha = p.fecha 
                    AND p2.ubicacion = p.ubicacion 
                    AND ABS(EXTRACT(EPOCH FROM (p2.hora - p.hora)) / 3600) < 2
                ) as tiene_conflicto_horario,

                (SELECT json_object_agg(d.rol, d.id_arbitro) FROM designado d WHERE d.id_partido = p.id_partido) as terna_ids,
                
                (SELECT json_object_agg(
                    d.rol, 
                    TRIM(u.nombre || ' ' || u.apellido_paterno || ' ' || COALESCE(u.apellido_materno, ''))
                ) 
                FROM designado d JOIN usuario u ON d.id_arbitro = u.id_usuario WHERE d.id_partido = p.id_partido) as terna_nombres
            FROM partido p
            ORDER BY p.fecha DESC, p.hora ASC`;
        
        const res = await pool.query(query);
        return res.rows;
    },

    // Recibe el ID del partido para saber FECHA, HORA y UBICACIÓN del contexto
    listarArbitrosDisponibles: async (id_partido) => {
        const query = `
            WITH partido_actual AS (
                SELECT fecha, hora, ubicacion, liga FROM partido WHERE id_partido = $1
            )
            SELECT 
                u.id_usuario as id_arbitro, 
                TRIM(u.nombre || ' ' || u.apellido_paterno || ' ' || COALESCE(u.apellido_materno, '')) as nombre_completo,
                a.categoria,
                a.especializacion
            FROM ARBITRO a
            INNER JOIN USUARIO u ON a.id_arbitro = u.id_usuario
            CROSS JOIN partido_actual pa
            WHERE a.estado = 'Activo'
            
            -- VALIDACIÓN DINÁMICA DE SANCIONES Y LICENCIAS
            AND NOT EXISTS (
                SELECT 1 FROM sancion s 
                WHERE s.id_arbitro = u.id_usuario 
                AND pa.fecha BETWEEN s.fecha_inicio AND s.fecha_fin
            )
            AND NOT EXISTS (
                SELECT 1 FROM licencia l 
                WHERE l.id_arbitro = u.id_usuario 
                AND pa.fecha BETWEEN l.fecha_inicio AND l.fecha_fin
            )

            -- VALIDACIÓN DE CONFLICTOS DE HORARIO Y LUGAR
            AND NOT EXISTS (
                SELECT 1 
                FROM designado d 
                JOIN partido p ON d.id_partido = p.id_partido
                WHERE d.id_arbitro = u.id_usuario 
                AND p.fecha = pa.fecha
                AND p.id_partido != $1
                AND (
                    -- REGLA 1: Si alguno es PROVINCIAL, se bloquea todo el día
                    p.liga ILIKE '%provincial%' OR pa.liga ILIKE '%provincial%'
                    
                    -- REGLA 2: Diferente ubicación, requiere al menos 3 horas de margen
                    OR (p.ubicacion <> pa.ubicacion AND ABS(EXTRACT(HOUR FROM p.hora) - EXTRACT(HOUR FROM pa.hora)) < 3)
                    
                    -- REGLA 3: Misma ubicación, no pueden ser a la misma hora exacta
                    OR (p.ubicacion = pa.ubicacion AND p.hora = pa.hora)
                )
            )
            ORDER BY 
                CASE a.categoria
                    WHEN 'FIFA' THEN 1
                    WHEN 'Primera' THEN 2
                    WHEN 'Segunda' THEN 3
                    WHEN 'Tercera' THEN 4
                    WHEN 'Cuarta' THEN 5
                    ELSE 6
                END, 
                u.apellido_paterno ASC;`;
        
        return (await pool.query(query, [id_partido])).rows;
    },
    
    borrarDesignacion: async (id_partido) => {
        const query = 'DELETE FROM designado WHERE id_partido = $1';
        return await pool.query(query, [id_partido]);
    },

    asignarTerna: async (id_partido, terna) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Obtener datos del partido actual (Fecha, Ubicación, Liga)
            const datosPart = await client.query(
                'SELECT fecha, hora, ubicacion, liga FROM partido WHERE id_partido = $1',
                [id_partido]
            );
            const { fecha, hora, ubicacion, liga } = datosPart.rows[0];

            // 2. Preparar los IDs de los árbitros a validar (sin duplicados)
            const arbitrosIds = [terna.central, terna.as1, terna.as2, terna.cuarto].filter(id => id && id !== "");

            for (const id_arbitro of arbitrosIds) {
                // 3. Consultar designaciones del árbitro para ese mismo día
                const designacionesDia = await client.query(`
                    SELECT p.id_partido, p.hora, p.ubicacion, p.liga, d.rol
                    FROM designado d
                    JOIN partido p ON d.id_partido = p.id_partido
                    WHERE d.id_arbitro = $1 AND p.fecha = $2 AND p.id_partido != $3
                `, [id_arbitro, fecha, id_partido]);

                if (designacionesDia.rows.length > 0) {
                    // REGLA: Provincial = Bloqueo total del día
                    const tieneProvincial = designacionesDia.rows.some(d => d.liga.toLowerCase().includes('provincial')) || 
                                        liga.toLowerCase().includes('provincial');
                    
                    if (tieneProvincial) {
                        throw new Error(`El árbitro con ID ${id_arbitro} tiene un partido Provincial. No puede tener más designaciones este día.`);
                    }

                    // REGLA: Máximo 2 partidos al día (a menos que sean seguidos en el mismo lugar)
                    const mismoLugar = designacionesDia.rows.every(d => d.ubicacion === ubicacion);
                    
                    if (!mismoLugar && designacionesDia.rows.length >= 2) {
                        throw new Error(`El árbitro con ID ${id_arbitro} ya tiene 2 partidos en ubicaciones distintas.`);
                    }

                    // REGLA: Choque de horario (Si no es en el mismo lugar, debe haber al menos 3 horas de diferencia)
                    if (!mismoLugar) {
                        for (const des of designacionesDia.rows) {
                            const diff = Math.abs(parseInt(des.hora.split(':')[0]) - parseInt(hora.split(':')[0]));
                            if (diff < 3) {
                                throw new Error(`Conflicto de horario para el árbitro ID ${id_arbitro}. Los partidos en distintas sedes requieren 3 horas de diferencia.`);
                            }
                        }
                    }
                    
                    // REGLA: Terna rotativa (Permitido si es el mismo lugar y partidos seguidos/cercanos)
                    // Aquí no lanzamos error si es la misma ubicación, permitiendo hasta 4 partidos.
                    if (mismoLugar && designacionesDia.rows.length >= 4) {
                        throw new Error(`El árbitro con ID ${id_arbitro} ya alcanzó el límite máximo de 4 partidos seguidos.`);
                    }
                }
            }

            // 4. Si todas las validaciones pasan, procedemos a insertar
            await client.query('DELETE FROM designado WHERE id_partido = $1', [id_partido]);

            const registros = [
                { id: terna.central, rol: 'Central' },
                { id: terna.as1, rol: 'Asistente 1' },
                { id: terna.as2, rol: 'Asistente 2' }
            ];
            if (terna.cuarto) registros.push({ id: terna.cuarto, rol: 'Cuarto Árbitro' });

            for (const r of registros) {
                if (r.id) {
                    await client.query(
                        'INSERT INTO designado (id_partido, id_arbitro, rol) VALUES ($1, $2, $3)',
                        [id_partido, r.id, r.rol]
                    );
                }
            }

            await client.query("UPDATE partido SET estado = 'Programado' WHERE id_partido = $1", [id_partido]);
            await client.query('COMMIT');
            return { success: true };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e; // El controlador capturará este error y enviará el mensaje al frontend
        } finally {
            client.release();
        }
    },

    listarDesignacionesPorArbitro: async (id_usuario) => {
        const query = `
            SELECT 
                p.id_partido, p.fecha, p.hora, p.liga as torneo, p.categoria, p.ubicacion,
                p.estado,
                (SELECT e.nombre FROM planilla_juego pl JOIN equipo e ON pl.id_equipo = e.id_equipo 
                WHERE pl.id_partido = p.id_partido AND pl.visitante = false LIMIT 1) as equipo_local,
                (SELECT e.nombre FROM planilla_juego pl JOIN equipo e ON pl.id_equipo = e.id_equipo 
                WHERE pl.id_partido = p.id_partido AND pl.visitante = true LIMIT 1) as equipo_visitante,
                d.rol as mi_rol_en_partido,
                true as tiene_designacion, -- Agregamos esto para que el frontend lo reconozca
                (SELECT json_object_agg(d2.rol, u.nombre || ' ' || u.apellido_paterno || ' ' || u.apellido_materno)
                FROM designado d2
                JOIN usuario u ON d2.id_arbitro = u.id_usuario
                WHERE d2.id_partido = p.id_partido) as terna_nombres
            FROM designado d
            JOIN partido p ON d.id_partido = p.id_partido
            WHERE d.id_arbitro = $1
            ORDER BY p.fecha DESC, p.hora DESC;
        `;
        const result = await pool.query(query, [id_usuario]); 
        return result.rows;
    },

    // Validación de seguridad para el Asesor
    verificarAsesorEvaluador: async (id_usuario, id_asesor_enviado) => {
        const res = await pool.query(
            'SELECT id_asesor FROM asesor WHERE id_asesor = $1 AND id_asesor = $2',
            [id_usuario, id_asesor_enviado]
        );
        return res.rows.length > 0;
    },

    obtenerEstadisticasYEvaluaciones: async (id_usuario) => {
        const client = await pool.connect();
        try {
            // 1. Estadísticas Generales (Promedio de notas y total partidos)
            const stats = await client.query(`
                SELECT 
                    ROUND(AVG(e.nota), 2) as promedio_nota,
                    COUNT(e.id_evaluacion) as total_evaluaciones,
                    (SELECT COUNT(*) FROM designado WHERE id_arbitro = $1) as total_partidos
                FROM evaluacion_partido e
                JOIN designado d ON e.id_designado = d.id_partido -- Ajustar según tu lógica de FK
                WHERE d.id_arbitro = $1
            `, [id_usuario]);

            // 2. Historial de Evaluaciones con detalle de partidos
            const historial = await client.query(`
                SELECT 
                    e.*, 
                    p.fecha, p.liga, p.categoria,
                    (SELECT eq.nombre FROM planilla_juego pl JOIN equipo eq ON pl.id_equipo = eq.id_equipo WHERE pl.id_partido = p.id_partido AND pl.visitante = false LIMIT 1) as local,
                    (SELECT eq.nombre FROM planilla_juego pl JOIN equipo eq ON pl.id_equipo = eq.id_equipo WHERE pl.id_partido = p.id_partido AND pl.visitante = true LIMIT 1) as visitante
                FROM evaluacion_partido e
                JOIN partido p ON e.id_designado = p.id_partido
                JOIN designado d ON p.id_partido = d.id_partido
                WHERE d.id_arbitro = $1
                ORDER BY p.fecha DESC
            `, [id_usuario]);

            return {
                stats: stats.rows[0],
                historial: historial.rows
            };
        } finally {
            client.release();
        }
    }
};

module.exports = designacionModel;