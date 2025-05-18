const pool = require('../db');

const obtenerChatsDeUsuario = async (usuarioId) => {
  const chatsQuery = await pool.query(
    `SELECT c.*,
      CASE 
        WHEN c.usuario1_id = $1 THEN c.usuario2_id
        ELSE c.usuario1_id
      END as otro_usuario_id
    FROM chats c
    WHERE c.usuario1_id = $1 OR c.usuario2_id = $1
    ORDER BY c.ultimo_mensaje DESC NULLS LAST`,
    [usuarioId]
  );

  const chatsWithDetails = await Promise.all(chatsQuery.rows.map(async (chat) => {
    const userQuery = await pool.query(
      `SELECT id, nombre, apellidos, imagen_perfil 
       FROM usuarios 
       WHERE id = $1`,
      [chat.otro_usuario_id]
    );

    const matchQuery = await pool.query(
      `SELECT m.id, m.nombre, m.imagenes[1] as imagen
       FROM mascotas m
       JOIN matches mt ON m.id = mt.mascota_id
       WHERE mt.usuario_id = $1 AND m.usuario_id = $2
       LIMIT 1`,
      [usuarioId, chat.otro_usuario_id]
    );

    const lastMessageQuery = await pool.query(
      `SELECT * FROM mensajes 
       WHERE chat_id = $1 
       ORDER BY fecha_envio DESC 
       LIMIT 1`,
      [chat.id]
    );

    return {
      ...chat,
      otro_usuario: userQuery.rows[0] || null,
      mascota_match: matchQuery.rows[0] || null,
      ultimo_mensaje: lastMessageQuery.rows[0] || null
    };
  }));

  return chatsWithDetails;
};

const verificarParticipacionChat = async (chatId, usuarioId) => {
  const res = await pool.query(
    'SELECT 1 FROM chats WHERE id = $1 AND (usuario1_id = $2 OR usuario2_id = $2)',
    [chatId, usuarioId]
  );
  return res.rows.length > 0;
};

const verificarParticipacionEnChats = async (chatIds, usuarioId) => {
  const res = await pool.query(
    'SELECT id FROM chats WHERE id = ANY($1::int[]) AND (usuario1_id = $2 OR usuario2_id = $2)',
    [chatIds, usuarioId]
  );
  return res.rows.map(row => row.id);
};

const eliminarChatConMensajes = async (chatId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM mensajes WHERE chat_id = $1', [chatId]);
    await client.query('DELETE FROM chats WHERE id = $1', [chatId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const eliminarMultiplesChatsConMensajes = async (chatIds) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM mensajes WHERE chat_id = ANY($1::int[])', [chatIds]);
    await client.query('DELETE FROM chats WHERE id = ANY($1::int[])', [chatIds]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const verificarAccesoChat = async (chatId, usuarioId) => {
  const res = await pool.query(
    'SELECT 1 FROM chats WHERE id = $1 AND (usuario1_id = $2 OR usuario2_id = $2)',
    [chatId, usuarioId]
  );
  return res.rows.length > 0;
};

const obtenerMensajesDeChat = async (chatId) => {
  const res = await pool.query(
    `SELECT m.*, u.nombre AS usuario_nombre
     FROM mensajes m
     JOIN usuarios u ON m.usuario_id = u.id
     WHERE m.chat_id = $1
     ORDER BY m.fecha_envio ASC`,
    [chatId]
  );
  return res.rows;
};

const marcarMensajesComoLeidos = async (chatId, usuarioId) => {
  await pool.query(
    `UPDATE mensajes 
     SET leido = true 
     WHERE chat_id = $1 AND usuario_id != $2 AND leido = false`,
    [chatId, usuarioId]
  );
};

const insertarMensaje = async (chatId, usuarioId, texto) => {
  const res = await pool.query(
    `INSERT INTO mensajes (chat_id, usuario_id, texto, fecha_envio, leido)
     VALUES ($1, $2, $3, NOW(), false)
     RETURNING *`,
    [chatId, usuarioId, texto]
  );
  return res.rows[0];
};

const actualizarFechaUltimoMensaje = async (chatId) => {
  await pool.query(
    'UPDATE chats SET ultimo_mensaje = NOW() WHERE id = $1',
    [chatId]
  );
};

module.exports = {
  obtenerChatsDeUsuario,
  verificarParticipacionChat,
  verificarParticipacionEnChats,
  eliminarChatConMensajes,
  eliminarMultiplesChatsConMensajes,
  verificarAccesoChat,
  obtenerMensajesDeChat,
  marcarMensajesComoLeidos,
  insertarMensaje,
  actualizarFechaUltimoMensaje
};
