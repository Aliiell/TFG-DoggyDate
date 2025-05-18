
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');

// Configuración multer específica para imágenes de posts
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    cb(null, 'post-' + Date.now() + path.extname(file.originalname));
  },
});
const uploadPostImages = multer({ storage: postStorage });

// Rutas
router.post('/', uploadPostImages.array('imagenes', 4), postController.crearPost);
router.delete('/:postId', postController.eliminarPost);
router.put('/:id', uploadPostImages.single('imagen'), postController.actualizarPost);
router.post('/:postId/like', postController.darLike);
router.get('/:postId/likes', postController.obtenerLikes);
router.get('/:postId/likes/check', postController.verificarLike);
router.post('/:postId/comentarios', postController.añadirComentario);
router.get('/:postId/comentarios', postController.obtenerComentarios);
module.exports = router;
