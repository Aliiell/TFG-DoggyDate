const pool = require('../db');

const crearUsuario = async (usuario) => {
  const { nombre, apellidos, edad, localizacion, correo, password, imagen_perfil } = usuario;

  const resultado = await pool.query(
    'INSERT INTO usuarios (nombre, apellidos, edad, localizacion, correo, password, imagen_perfil) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [nombre, apellidos, edad, localizacion, correo, password, imagen_perfil]
  );

  return resultado.rows[0];
};

const buscarUsuarioPorCorreo = async (correo) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
  return result.rows[0];
};

const guardarTokenRecuperacion = async (correo, token) => {
  const result = await pool.query(
    `UPDATE usuarios SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE correo = $2 RETURNING *`,
    [token, correo]
  );
  return result.rows[0];
};

const buscarUsuarioPorToken = async (token) => {
  const result = await pool.query(
    'SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expires > NOW()',
    [token]
  );
  return result.rows[0];
};

const actualizarPasswordConToken = async (token, newPasswordHashed) => {
  await pool.query(
    'UPDATE usuarios SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2',
    [newPasswordHashed, token]
  );
};

const eliminarUsuario = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM mensajes WHERE usuario_id = $1', [userId]);
    await client.query('DELETE FROM rechazos WHERE usuario_id = $1', [userId]);

    const { rows: mascotas } = await client.query('SELECT id FROM mascotas WHERE usuario_id = $1', [userId]);
    const mascotaIds = mascotas.map(m => m.id);

    if (mascotaIds.length > 0) {
      await client.query('DELETE FROM matches WHERE mascota_id = ANY($1::int[])', [mascotaIds]);
      await client.query('DELETE FROM vacunas_mascota WHERE mascota_id = ANY($1::int[])', [mascotaIds]);
      await client.query('DELETE FROM mascotas WHERE id = ANY($1::int[])', [mascotaIds]);
    }

    await client.query('DELETE FROM likes_post WHERE usuario_id = $1', [userId]);
    await client.query('DELETE FROM comentarios_post WHERE usuario_id = $1', [userId]);
    await client.query('DELETE FROM posts WHERE usuario_id = $1', [userId]);

    const { rows: grupos } = await client.query('SELECT id FROM grupos WHERE creador_id = $1', [userId]);
    const grupoIds = grupos.map(g => g.id);

    if (grupoIds.length > 0) {
      await client.query('DELETE FROM miembros_grupo WHERE grupo_id = ANY($1::int[])', [grupoIds]);
      await client.query('DELETE FROM grupos WHERE id = ANY($1::int[])', [grupoIds]);
    }

    const { rows: chats } = await client.query(
      'SELECT id FROM chats WHERE usuario1_id = $1 OR usuario2_id = $1',
      [userId]
    );
    const chatIds = chats.map(c => c.id);

    if (chatIds.length > 0) {
      await client.query('DELETE FROM mensajes WHERE chat_id = ANY($1::int[])', [chatIds]);
      await client.query('DELETE FROM chats WHERE id = ANY($1::int[])', [chatIds]);
    }

    await client.query('DELETE FROM matches WHERE usuario_id = $1', [userId]);
    await client.query('DELETE FROM usuarios WHERE id = $1', [userId]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const obtenerUsuarioPorId = async (userId) => {
  const result = await pool.query(
    'SELECT id, nombre, apellidos, edad, localizacion, correo, imagen_perfil FROM usuarios WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

const obtenerMascotasDeUsuario = async (userId) => {
  const result = await pool.query('SELECT * FROM mascotas WHERE usuario_id = $1', [userId]);
  return result.rows;
};

const actualizarUsuario = async (userId, fieldsToUpdate) => {
  let query = 'UPDATE usuarios SET ';
  const values = [];
  let param = 1;

  for (const field in fieldsToUpdate) {
    query += `${field} = $${param}, `;
    values.push(fieldsToUpdate[field]);
    param++;
  }

  query = query.slice(0, -2); // eliminar última coma
  query += ` WHERE id = $${param} RETURNING *`;
  values.push(userId);

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  crearUsuario,
  buscarUsuarioPorCorreo,
  guardarTokenRecuperacion,
  buscarUsuarioPorToken,
  actualizarPasswordConToken,
  eliminarUsuario,
  obtenerUsuarioPorId,
  obtenerMascotasDeUsuario,
  actualizarUsuario,
};