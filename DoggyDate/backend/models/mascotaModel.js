const pool = require('../db');

const crearMascota = async (mascota) => {
  const { nombre, raza, edad, genero, caracteristicas, gustos, imagenes, usuario_id } = mascota;

  const result = await pool.query(
    `INSERT INTO mascotas (nombre, raza, edad, genero, caracteristicas, gustos, imagenes, usuario_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [nombre, raza, edad, genero, caracteristicas, gustos, imagenes, usuario_id]
  );

  return result.rows[0];
};

const getMascotasDisponibles = async (userId) => {
  const result = await pool.query(
    `SELECT m.* FROM mascotas m 
     WHERE m.usuario_id != $1 
     AND NOT EXISTS (
         SELECT 1 FROM matches WHERE usuario_id = $1 AND mascota_id = m.id
     )
     AND NOT EXISTS (
         SELECT 1 FROM rechazos WHERE usuario_id = $1 AND mascota_id = m.id
     )
     ORDER BY RANDOM() 
     LIMIT 10`,
    [userId]
  );

  return result.rows;
};

const obtenerMascotaPorId = async (id) => {
  const result = await pool.query('SELECT * FROM mascotas WHERE id = $1', [id]);
  return result.rows[0];
};

const actualizarMascota = async (id, datosMascota) => {
  const { nombre, raza, edad, genero, caracteristicas, gustos, imagenes } = datosMascota;

  const result = await pool.query(
    `UPDATE mascotas 
     SET nombre = $1, raza = $2, edad = $3, genero = $4, caracteristicas = $5, gustos = $6, imagenes = $7 
     WHERE id = $8 RETURNING *`,
    [nombre, raza, edad, genero, caracteristicas, gustos, imagenes, id]
  );

  return result.rows[0];
};

const obtenerVacunasDeMascota = async (mascotaId) => {
  const result = await pool.query(
    'SELECT * FROM vacunas_mascota WHERE mascota_id = $1 ORDER BY fecha_aplicacion DESC',
    [mascotaId]
  );
  return result.rows;
};

const crearVacuna = async (mascotaId, vacunaData) => {
  const { nombre, fecha_aplicacion, aplicada, fecha_proxima, notas } = vacunaData;

  const result = await pool.query(
    `INSERT INTO vacunas_mascota 
     (mascota_id, nombre, fecha_aplicacion, aplicada, fecha_proxima, notas) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [mascotaId, nombre, fecha_aplicacion, aplicada, fecha_proxima, notas]
  );

  return result.rows[0];
};

const eliminarMascota = async (mascotaId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Eliminar registros relacionados
    await client.query('DELETE FROM vacunas_mascota WHERE mascota_id = $1', [mascotaId]);
    await client.query('DELETE FROM matches WHERE mascota_id = $1', [mascotaId]);
    
    // Eliminar la mascota y devolver la fila eliminada
    const result = await client.query('DELETE FROM mascotas WHERE id = $1 RETURNING *', [mascotaId]);
    
    await client.query('COMMIT');

    // Si borró una fila, devolver true, si no, false
    return result.rowCount > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  crearMascota,
  getMascotasDisponibles,
  obtenerMascotaPorId,
  actualizarMascota,
  obtenerVacunasDeMascota,
  crearVacuna,
  eliminarMascota
};