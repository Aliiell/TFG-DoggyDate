
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mascotaController = require('../controllers/mascotaController');

// Configuración de Multer para múltiples imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post('/', upload.array('imagenes', 5), mascotaController.crearMascota);
router.get('/disponibles/:userId', mascotaController.obtenerMascotasDisponibles);
router.put('/:id', upload.array('imagenes', 5), mascotaController.actualizarMascota);

router.get('/:mascotaId/vacunas', mascotaController.obtenerVacunas);

router.post('/:mascotaId/vacunas', mascotaController.crearVacuna);

router.delete('/:id', mascotaController.eliminarMascota);

module.exports = router;
