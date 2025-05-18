const pool = require('../db');

const obtenerVacunaPorId = async (id) => {
  const { rows } = await pool.query('SELECT * FROM vacunas_mascota WHERE id = $1', [id]);
  return rows[0];
};

const actualizarVacuna = async (id, datos) => {
  const { nombre, fecha_aplicacion, aplicada, fecha_proxima, notas } = datos;

  const { rows } = await pool.query(
    `UPDATE vacunas_mascota 
     SET nombre = $1, fecha_aplicacion = $2, aplicada = $3, fecha_proxima = $4, notas = $5 
     WHERE id = $6 RETURNING *`,
    [nombre, fecha_aplicacion, aplicada, fecha_proxima, notas, id]
  );
  return rows[0];
};

const eliminarVacuna = async (id) => {
  await pool.query('DELETE FROM vacunas_mascota WHERE id = $1', [id]);
};

module.exports = {
  obtenerVacunaPorId,
  actualizarVacuna,
  eliminarVacuna,
};
