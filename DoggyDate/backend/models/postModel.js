const pool = require('../db');

const actualizarPost = async (id, campos) => {
  const keys = Object.keys(campos);
  if (keys.length === 0) return null;

  let query = 'UPDATE posts SET ';
  const values = [];

  keys.forEach((key, i) => {
    query += `${key} = $${i + 1}${i < keys.length - 1 ? ', ' : ''}`;
    values.push(campos[key]);
  });

  query += ` WHERE id = $${keys.length + 1} RETURNING *`;
  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const toggleLike = async (postId, usuario_id) => {
  const likeCheck = await pool.query(
    'SELECT * FROM likes_post WHERE post_id = $1 AND usuario_id = $2',
    [postId, usuario_id]
  );

  if (likeCheck.rows.length > 0) {
    await pool.query('DELETE FROM likes_post WHERE post_id = $1 AND usuario_id = $2', [postId, usuario_id]);
    return false;
  } else {
    await pool.query('INSERT INTO likes_post (post_id, usuario_id, fecha_like) VALUES ($1, $2, NOW())', [postId, usuario_id]);
    return true;
  }
};

const contarLikes = async (postId) => {
  const result = await pool.query('SELECT COUNT(*) FROM likes_post WHERE post_id = $1', [postId]);
  return parseInt(result.rows[0].count);
};

const verificarLike = async (postId, usuario_id) => {
  const result = await pool.query('SELECT * FROM likes_post WHERE post_id = $1 AND usuario_id = $2', [postId, usuario_id]);
  return result.rows.length > 0;
};

const agregarComentario = async (postId, usuario_id, texto) => {
  const comentario = await pool.query(
    'INSERT INTO comentarios_post (post_id, usuario_id, texto, fecha_creacion) VALUES ($1, $2, $3, NOW()) RETURNING *',
    [postId, usuario_id, texto]
  );
  return comentario.rows[0];
};

const obtenerUsuarioComentario = async (usuario_id) => {
  const result = await pool.query('SELECT nombre, imagen_perfil FROM usuarios WHERE id = $1', [usuario_id]);
  return result.rows[0];
};

const obtenerComentarios = async (postId) => {
  const result = await pool.query(
    `SELECT c.*, u.nombre as usuario_nombre, u.imagen_perfil as usuario_imagen
     FROM comentarios_post c
     JOIN usuarios u ON c.usuario_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.fecha_creacion ASC`,
    [postId]
  );
  return result.rows;
};

const crearPost = async (usuario_id, grupo_id, texto, imagenes, ubicacion, fecha_quedada) => {
  const result = await pool.query(
    `INSERT INTO posts (usuario_id, grupo_id, texto, imagenes, ubicacion, fecha_quedada, fecha_creacion) 
     VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
    [usuario_id, grupo_id, texto, imagenes, ubicacion || null, fecha_quedada || null]
  );
  return result.rows[0];
};


const eliminarPost = async (postId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`DELETE FROM comentarios_post WHERE post_id = $1`, [postId]);
    await client.query(`DELETE FROM likes_post WHERE post_id = $1`, [postId]);

    const result = await client.query(
      `DELETE FROM posts WHERE id = $1 RETURNING *`,
      [postId]
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

const esMiembroDelGrupo = async (usuario_id, grupo_id) => {
  const result = await pool.query(
    'SELECT 1 FROM miembros_grupo WHERE usuario_id = $1 AND grupo_id = $2',
    [usuario_id, grupo_id]
  );
  return result.rows.length > 0;
};

module.exports = {
  actualizarPost,
  toggleLike,
  contarLikes,
  verificarLike,
  agregarComentario,
  obtenerUsuarioComentario,
  obtenerComentarios,
  crearPost,
  eliminarPost,
  esMiembroDelGrupo
};
