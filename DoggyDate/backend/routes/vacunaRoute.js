const express = require('express');
const router = express.Router();
const vacunaController = require('../controllers/vacunaController');

router.put('/:vacunaId', vacunaController.actualizarVacuna);

router.delete('/:vacunaId', vacunaController.eliminarVacuna);

module.exports = router;