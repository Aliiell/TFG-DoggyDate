// controllers/grupoController.js
const grupoModel = require('../models/grupoModel');

const obtenerGruposRecientes = async (req, res) => {
  try {
    const grupos = await grupoModel.obtenerGruposRecientes();
    res.json(grupos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener grupos recientes' });
  }
};

const buscarGrupos = async (req, res) => {
  const searchTerm = req.query.q;
  try {
    const grupos = await grupoModel.buscarGrupos(searchTerm);
    res.json(grupos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar grupos' });
  }
};

const crearGrupo = async (req, res) => {
  const { nombre, descripcion, creador_id } = req.body;
  const imagen = req.file ? req.file.path : null;

  try {
    const nuevoGrupo = await grupoModel.crearGrupo(nombre, descripcion, imagen, creador_id);
    res.status(201).json(nuevoGrupo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el grupo' });
  }
};

const obtenerDetallesGrupo = async (req, res) => {
  const { grupoId } = req.params;

  try {
    const grupo = await grupoModel.obtenerDetallesGrupo(grupoId);
    if (!grupo) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }
    res.json(grupo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener detalles del grupo' });
  }
};

const actualizarGrupo = async (req, res) => {
  const { grupoId } = req.params;
  const { nombre, descripcion } = req.body;
  const imagen = req.file ? req.file.path.replace(/\\/g, '/') : null;

  try {
    const grupoActualizado = await grupoModel.actualizarGrupo(grupoId, nombre, descripcion, imagen);
    if (!grupoActualizado) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }
    res.json(grupoActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el grupo' });
  }
};

const eliminarGrupo = async (req, res) => {
  const { grupoId } = req.params;
  try {
    const eliminado = await grupoModel.eliminarGrupo(grupoId);
    if (!eliminado) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ success: true, message: 'Grupo eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el grupo' });
  }
};

const obtenerPostsGrupo = async (req, res) => {
  const { grupoId } = req.params;
  try {
    const posts = await grupoModel.obtenerPostsGrupo(grupoId);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener posts del grupo' });
  }
};

const unirseGrupo = async (req, res) => {
  const { grupoId } = req.params;
  const { usuario_id } = req.body;
  try {
    await grupoModel.unirseGrupo(grupoId, usuario_id);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

const salirGrupo = async (req, res) => {
  const { grupoId } = req.params;
  const { usuario_id } = req.body;
  try {
    await grupoModel.salirGrupo(grupoId, usuario_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
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
