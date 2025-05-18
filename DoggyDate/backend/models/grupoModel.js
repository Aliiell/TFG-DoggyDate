// models/grupoModel.js
const pool = require('../db');

const obtenerGruposRecientes = async () => {
  const result = await pool.query(
    `SELECT g.*, COUNT(m.usuario_id) as miembros_count 
     FROM grupos g
     LEFT JOIN miembros_grupo m ON g.id = m.grupo_id
     GROUP BY g.id
     ORDER BY g.fecha_creacion DESC
     LIMIT 5`
  );
  return result.rows;
};

const buscarGrupos = async (searchTerm) => {
  const result = await pool.query(
    `SELECT g.*, COUNT(m.usuario_id) as miembros_count 
     FROM grupos g
     LEFT JOIN miembros_grupo m ON g.id = m.grupo_id
     WHERE g.nombre ILIKE $1
     GROUP BY g.id
     ORDER BY g.nombre ASC`,
    [`%${searchTerm}%`]
  );
  return result.rows;
};

const crearGrupo = async (nombre, descripcion, imagen, creador_id) => {
  const newGroup = await pool.query(
    `INSERT INTO grupos (nombre, descripcion, imagen, creador_id, fecha_creacion) 
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [nombre, descripcion, imagen, creador_id]
  );

  await pool.query(
    `INSERT INTO miembros_grupo (grupo_id, usuario_id, fecha_union, es_admin) 
     VALUES ($1, $2, NOW(), true)`,
    [newGroup.rows[0].id, creador_id]
  );

  return newGroup.rows[0];
};

const obtenerDetallesGrupo = async (grupoId) => {
  const groupQuery = await pool.query(
    `SELECT g.* FROM grupos g WHERE g.id = $1`,
    [grupoId]
  );

  if (groupQuery.rows.length === 0) {
    return null;
  }

  const group = groupQuery.rows[0];

  const membersQuery = await pool.query(
    `SELECT u.id, u.nombre, u.apellidos, u.imagen_perfil, mg.es_admin, mg.fecha_union
     FROM miembros_grupo mg
     JOIN usuarios u ON mg.usuario_id = u.id
     WHERE mg.grupo_id = $1
     ORDER BY mg.es_admin DESC, mg.fecha_union ASC`,
    [grupoId]
  );

  group.miembros = membersQuery.rows;

  return group;
};

const actualizarGrupo = async (grupoId, nombre, descripcion, imagen) => {
  let query = 'UPDATE grupos SET ';
  const values = [];
  const updates = [];
  let index = 1;

  if (nombre) {
    updates.push(`nombre = $${index++}`);
    values.push(nombre);
  }

  if (descripcion !== undefined) {
    updates.push(`descripcion = $${index++}`);
    values.push(descripcion);
  }

  if (imagen) {
    updates.push(`imagen = $${index++}`);
    values.push(imagen);
  }

  query += updates.join(', ');
  query += ` WHERE id = $${index} RETURNING *`;
  values.push(grupoId);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminarGrupo = async (grupoId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      DELETE FROM comentarios_post
      WHERE post_id IN (SELECT id FROM posts WHERE grupo_id = $1)
    `, [grupoId]);

    await client.query(`
      DELETE FROM likes_post
      WHERE post_id IN (SELECT id FROM posts WHERE grupo_id = $1)
    `, [grupoId]);

    await client.query(`DELETE FROM posts WHERE grupo_id = $1`, [grupoId]);
    await client.query(`DELETE FROM miembros_grupo WHERE grupo_id = $1`, [grupoId]);

    const result = await client.query(
      `DELETE FROM grupos WHERE id = $1 RETURNING *`,
      [grupoId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const obtenerPostsGrupo = async (grupoId) => {
  const posts = await pool.query(
    `SELECT p.*, u.nombre as usuario_nombre, u.imagen_perfil as usuario_imagen
     FROM posts p
     JOIN usuarios u ON p.usuario_id = u.id
     WHERE p.grupo_id = $1
     ORDER BY p.fecha_creacion DESC`,
    [grupoId]
  );
  return posts.rows;
};

const unirseGrupo = async (grupoId, usuarioId) => {
  const existe = await pool.query(
    'SELECT 1 FROM miembros_grupo WHERE usuario_id = $1 AND grupo_id = $2',
    [usuarioId, grupoId]
  );

  if (existe.rows.length > 0) {
    throw new Error('Ya eres miembro de este grupo');
  }

  await pool.query(
    `INSERT INTO miembros_grupo (grupo_id, usuario_id, fecha_union, es_admin)
     VALUES ($1, $2, NOW(), false)`,
    [grupoId, usuarioId]
  );
};

const salirGrupo = async (grupoId, usuarioId) => {
  const grupo = await pool.query(
    'SELECT creador_id FROM grupos WHERE id = $1',
    [grupoId]
  );

  if (grupo.rows.length && grupo.rows[0].creador_id === usuarioId) {
    throw new Error('El creador del grupo no puede abandonarlo');
  }

  await pool.query(
    `DELETE FROM miembros_grupo WHERE usuario_id = $1 AND grupo_id = $2`,
    [usuarioId, grupoId]
  );
};

module.exports = {
  obtenerGruposRecientes,
  buscarGrupos,
  crearGrupo,
  obtenerDetallesGrupo,
  actualizarGrupo,
  eliminarGrupo,
  obtenerPostsGrupo,
  unirseGrupo,
  salirGrupo  
};
