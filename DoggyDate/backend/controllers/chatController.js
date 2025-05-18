const chatModel = require('../models/chatModel');

const obtenerChats = async (req, res) => {
  const { usuario_id } = req.query;

  try {
    const chats = await chatModel.obtenerChatsDeUsuario(usuario_id);
    res.json(chats);
  } catch (err) {
    console.error('Error al obtener chats:', err);
    res.status(500).json({ error: 'Error al obtener chats' });
  }
};

const eliminarChat = async (req, res) => {
  const { chatId } = req.params;
  const { usuario_id } = req.query;

  try {
    const tieneAcceso = await chatModel.verificarParticipacionChat(chatId, usuario_id);
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este chat' });
    }

    await chatModel.eliminarChatConMensajes(chatId);
    res.json({ success: true, message: 'Chat eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar chat:', err);
    res.status(500).json({ error: 'Error al eliminar el chat' });
  }
};

const eliminarMultiplesChats = async (req, res) => {
  const { usuario_id } = req.query;
  const { chatIds } = req.body;

  if (!Array.isArray(chatIds) || chatIds.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de IDs de chat' });
  }

  try {
    const accesibles = await chatModel.verificarParticipacionEnChats(chatIds, usuario_id);
    if (accesibles.length !== chatIds.length) {
      return res.status(403).json({ error: 'No tienes acceso a uno o más de los chats seleccionados' });
    }

    await chatModel.eliminarMultiplesChatsConMensajes(chatIds);
    res.json({ success: true, message: `${chatIds.length} chat(s) eliminados correctamente` });
  } catch (err) {
    console.error('Error al eliminar chats:', err);
    res.status(500).json({ error: 'Error al eliminar los chats' });
  }
};

const obtenerMensajes = async (req, res) => {
  const { chatId } = req.params;
  const { usuario_id } = req.query;

  try {
    const tieneAcceso = await chatModel.verificarAccesoChat(chatId, usuario_id);
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este chat' });
    }

    const mensajes = await chatModel.obtenerMensajesDeChat(chatId);
    await chatModel.marcarMensajesComoLeidos(chatId, usuario_id);

    res.json(mensajes);
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

const enviarMensaje = async (req, res) => {
  const { chatId } = req.params;
  const { usuario_id, texto } = req.body;

  try {
    const tieneAcceso = await chatModel.verificarAccesoChat(chatId, usuario_id);
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este chat' });
    }

    const mensaje = await chatModel.insertarMensaje(chatId, usuario_id, texto);
    await chatModel.actualizarFechaUltimoMensaje(chatId);

    res.status(201).json(mensaje);
  } catch (err) {
    console.error('Error al enviar mensaje:', err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

module.exports = {
  obtenerChats,
  eliminarChat,
  eliminarMultiplesChats,
  obtenerMensajes,
  enviarMensaje
};
