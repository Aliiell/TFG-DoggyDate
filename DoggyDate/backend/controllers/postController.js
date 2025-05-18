const path = require('path');
const postModel = require('../models/postModel');

const actualizarPost = async (req, res) => {
  const { id } = req.params;
  const { contenido, lugar } = req.body;

  try {
    const campos = {};
    if (contenido !== undefined) campos.texto = contenido;
    if (lugar !== undefined) campos.ubicacion = lugar;
    if (req.file) {
      campos.imagenes = [req.file.path.replace(/\\/g, '/')];
    }

    if (Object.keys(campos).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const actualizado = await postModel.actualizarPost(id, campos);

    if (!actualizado) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    res.json(actualizado);
  } catch (err) {
    console.error('Error al actualizar el post:', err);
    res.status(500).json({ error: 'Error al actualizar el post' });
  }
};

const darLike = async (req, res) => {
  const { postId } = req.params;
  const { usuario_id } = req.body;

  try {
    const liked = await postModel.toggleLike(postId, usuario_id);
    res.json({ liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar like' });
  }
};

const obtenerLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    const count = await postModel.contarLikes(postId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener likes' });
  }
};

const verificarLike = async (req, res) => {
  const { postId } = req.params;
  const { usuario_id } = req.query;

  try {
    const liked = await postModel.verificarLike(postId, usuario_id);
    res.json({ liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar like' });
  }
};

const añadirComentario = async (req, res) => {
  const { postId } = req.params;
  const { usuario_id, texto } = req.body;

  try {
    if (!texto || texto.trim() === '') {
      return res.status(400).json({ error: 'El comentario no puede estar vacío' });
    }

    const nuevoComentario = await postModel.agregarComentario(postId, usuario_id, texto);
    const usuario = await postModel.obtenerUsuarioComentario(usuario_id);

    res.status(201).json({
      ...nuevoComentario,
      usuario_nombre: usuario.nombre,
      usuario_imagen: usuario.imagen_perfil
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al añadir comentario' });
  }
};

const obtenerComentarios = async (req, res) => {
  const { postId } = req.params;

  try {
    const comentarios = await postModel.obtenerComentarios(postId);
    res.json(comentarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

const crearPost = async (req, res) => {
  const { usuario_id, grupo_id, texto, ubicacion, fecha_quedada } = req.body;
  const imagenes = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

  try {
    const esMiembro = await postModel.esMiembroDelGrupo(usuario_id, grupo_id);
    if (!esMiembro) {
      return res.status(403).json({ error: 'No eres miembro de este grupo' });
    }

    const newPost = await postModel.crearPost(usuario_id, grupo_id, texto, imagenes, ubicacion, fecha_quedada);
    res.status(201).json({ id: newPost.id, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el post' });
  }
};

const eliminarPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const deletedPost = await postModel.eliminarPost(postId);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json({ success: true, message: 'Post eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar el post:', err);
    res.status(500).json({ error: 'Error al eliminar el post' });
  }
};

module.exports = {
  actualizarPost,
  darLike,
  obtenerLikes,
  verificarLike,
  añadirComentario,
  obtenerComentarios,
  crearPost,
  eliminarPost
};
