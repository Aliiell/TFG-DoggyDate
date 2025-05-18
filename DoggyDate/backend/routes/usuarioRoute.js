
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const usuarioController = require('../controllers/usuarioController');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/', upload.single('imagen'), usuarioController.crearUsuario);
router.post('/recuperar-password', usuarioController.recuperarPassword);
router.get('/verificar-token/:token', usuarioController.verificarTokenRecuperacion);
router.post('/reset-password', usuarioController.restablecerPassword);
router.get('/sesion', usuarioController.obtenerSesionUsuario);
router.post('/login', usuarioController.loginUsuario);
router.post('/logout', usuarioController.logout);
router.delete('/:id', usuarioController.eliminarUsuario);
router.get('/:userId', usuarioController.obtenerUsuario);
router.get('/:userId/mascotas', usuarioController.obtenerMascotas);
router.put('/:userId', upload.single('imagen'), usuarioController.actualizarUsuario);

module.exports = router;