// routes/grupoRoute.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const grupoController = require('../controllers/grupoController');

// Configuración multer para imagenes de grupo
const groupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/groups/');
  },
  filename: (req, file, cb) => {
    cb(null, 'group-' + Date.now() + path.extname(file.originalname));
  },
});
const uploadGroupImage = multer({ storage: groupStorage });

// Rutas
router.get('/recientes', grupoController.obtenerGruposRecientes);

router.get('/buscar', grupoController.buscarGrupos);

router.post('/', uploadGroupImage.single('imagen'), grupoController.crearGrupo);

router.get('/:grupoId', grupoController.obtenerDetallesGrupo);

router.put('/:grupoId', uploadGroupImage.single('imagen'), grupoController.actualizarGrupo);

router.delete('/:grupoId', grupoController.eliminarGrupo);

router.get('/:grupoId/posts', grupoController.obtenerPostsGrupo);

router.post('/:grupoId/unirse', grupoController.unirseGrupo);

router.delete('/:grupoId/salir', grupoController.salirGrupo);

module.exports = router;
