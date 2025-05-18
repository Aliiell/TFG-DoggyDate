const mascotaModel = require('../models/mascotaModel');

const crearMascota = async (req, res) => {
  const { nombre, raza, edad, genero, caracteristicas, gustos, usuario_id } = req.body;
  const imagenes = req.files ? req.files.map(file => file.path) : [];

  try {
    const nuevaMascota = await mascotaModel.crearMascota({
      nombre,
      raza,
      edad,
      genero,
      caracteristicas,
      gustos,
      imagenes,
      usuario_id,
    });

    res.status(201).json(nuevaMascota);
  } catch (error) {
    console.error('Error al registrar la mascota:', error);
    res.status(500).json({ error: 'Error al registrar la mascota' });
  }
};

const obtenerMascotasDisponibles = async (req, res) => {
  const { userId } = req.params;

  try {
    const mascotas = await mascotaModel.getMascotasDisponibles(userId);
    res.json(mascotas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mascotas disponibles' });
  }
};

const actualizarMascota = async (req, res) => {
  const { id } = req.params;
  const { nombre, raza, edad, genero, caracteristicas, gustos } = req.body;
  const nuevasImagenes = req.files ? req.files.map(file => file.path) : [];

  let imagesToDelete = [];
  try {
    if (req.body.imagesToDelete) {
      imagesToDelete = JSON.parse(req.body.imagesToDelete);
    }
  } catch (err) {
    console.error('Error al parsear imágenes a eliminar:', err);
  }

  try {
    const mascotaActual = await mascotaModel.obtenerMascotaPorId(id);
    if (!mascotaActual) return res.status(404).json({ error: 'Mascota no encontrada' });

    const imagenesActuales = mascotaActual.imagenes || [];
    const imagenesMantenidas = imagenesActuales.filter(img => !imagesToDelete.includes(img));
    const todasLasImagenes = [...imagenesMantenidas, ...nuevasImagenes];

    const mascotaActualizada = await mascotaModel.actualizarMascota(id, {
      nombre, raza, edad, genero, caracteristicas, gustos, imagenes: todasLasImagenes
    });

    res.json(mascotaActualizada);
  } catch (err) {
    console.error('Error al actualizar mascota:', err);
    res.status(500).json({ error: 'Error al actualizar la mascota' });
  }
};

const obtenerVacunas = async (req, res) => {
  const { mascotaId } = req.params;
  try {
    const vacunas = await mascotaModel.obtenerVacunasDeMascota(mascotaId);
    res.json(vacunas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener vacunas' });
  }
};

const crearVacuna = async (req, res) => {
  const { mascotaId } = req.params;
  const vacunaData = req.body;
  try {
    const vacuna = await mascotaModel.crearVacuna(mascotaId, vacunaData);
    res.status(201).json(vacuna);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear vacuna' });
  }
};

const eliminarMascota = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await mascotaModel.eliminarMascota(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.json({ message: 'Mascota eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar mascota:', err);
    res.status(500).json({ error: 'Error al eliminar la mascota' });
  }
};

module.exports = {
  crearMascota,
  obtenerMascotasDisponibles,
  actualizarMascota,
  obtenerVacunas,
  crearVacuna,
  eliminarMascota
};