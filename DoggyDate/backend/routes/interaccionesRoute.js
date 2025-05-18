const express = require('express');
const router = express.Router();
const interaccionController = require('../controllers/interaccionController');

// Crear match
router.post('/matches', interaccionController.crearMatch);

// Registrar rechazo
router.post('/rechazos', interaccionController.registrarRechazo);

module.exports = router;
