const pool = require('../db');

const crearMatch = async (usuario_id, mascota_id) => {
  await pool.query(
    'INSERT INTO matches (usuario_id, mascota_id, fecha_match) VALUES ($1, $2, NOW())',
    [usuario_id, mascota_id]
  );

  // Obtener dueño de la mascota
  const ownerResult = await pool.query('SELECT usuario_id FROM mascotas WHERE id = $1', [mascota_id]);
  const petOwnerId = ownerResult.rows[0].usuario_id;

  // Verificar match recíproco
  const reciprocal = await pool.query(
    `SELECT m.id FROM matches mt
     JOIN mascotas m ON mt.mascota_id = m.id
     WHERE mt.usuario_id = $1 AND m.usuario_id = $2`,
    [petOwnerId, usuario_id]
  );

  const isMatch = reciprocal.rows.length > 0;

  // Si hay match y no hay chat, crearlo
  if (isMatch) {
    const existingChat = await pool.query(
      `SELECT id FROM chats 
       WHERE (usuario1_id = $1 AND usuario2_id = $2)
       OR (usuario1_id = $2 AND usuario2_id = $1)`,
      [usuario_id, petOwnerId]
    );

    if (existingChat.rows.length === 0) {
      await pool.query(
        'INSERT INTO chats (usuario1_id, usuario2_id, fecha_creacion) VALUES ($1, $2, NOW())',
        [usuario_id, petOwnerId]
      );
    }
  }

  return isMatch;
};

const insertarRechazo = async (usuario_id, mascota_id) => {
  await pool.query(
    'INSERT INTO rechazos (usuario_id, mascota_id, fecha_rechazo) VALUES ($1, $2, NOW())',
    [usuario_id, mascota_id]
  );
};

module.exports = {
  crearMatch,
  insertarRechazo,
};