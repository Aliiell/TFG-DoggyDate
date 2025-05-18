const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/', chatController.obtenerChats);
router.delete('/:chatId', chatController.eliminarChat);
router.delete('/', chatController.eliminarMultiplesChats);
router.get('/:chatId/mensajes', chatController.obtenerMensajes);
router.post('/:chatId/mensajes', chatController.enviarMensaje);

module.exports = router;