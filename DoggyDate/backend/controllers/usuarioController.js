// controllers/usuarioController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const usuarioModel = require('../models/usuarioModel');
const nodemailer = require('nodemailer');

const crearUsuario = async (req, res) => {
  const { nombre, apellidos, edad, localizacion, correo, password } = req.body;
  const imagen_perfil = req.file ? req.file.path : null;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await usuarioModel.crearUsuario({
      nombre,
      apellidos,
      edad,
      localizacion,
      correo,
      password: hashedPassword,
      imagen_perfil,
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

const recuperarPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await usuarioModel.buscarUsuarioPorCorreo(correo);

    if (usuario) {
      const token = crypto.randomBytes(32).toString('hex');
      await usuarioModel.guardarTokenRecuperacion(correo, token);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const resetLink = `http://localhost:5173/reset-password/${token}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Recuperación de contraseña',
        html: `<p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>Este enlace expirará en 1 hora.</p>`
      });
    }

    // Siempre responder lo mismo, exista o no el usuario
    res.status(200).json({
      message: 'Si el correo está registrado, recibirás un mensaje con instrucciones.'
    });

  } catch (error) {
    console.error('Error al procesar la recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud de recuperación.' });
  }
};

const verificarTokenRecuperacion = async (req, res) => {
  const { token } = req.params;

  try {
    const usuario = await usuarioModel.buscarUsuarioPorToken(token);
    if (!usuario) {
      return res.status(400).json({ valid: false, message: 'Token inválido o expirado.' });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar el token' });
  }
};

const restablecerPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const usuario = await usuarioModel.buscarUsuarioPorToken(token);
    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido o expirado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await usuarioModel.actualizarPasswordConToken(token, hashedPassword);

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};

const loginUsuario = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const usuario = await usuarioModel.buscarUsuarioPorCorreo(correo);

    if (!usuario) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Guardar sesión
    req.session.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
    };

    res.json({ message: 'Inicio de sesión exitoso', usuario: req.session.user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const obtenerSesionUsuario = (req, res) => {
  if (req.session.user) {
    res.json({ usuario: req.session.user });
  } else {
    res.status(401).json({ error: 'No hay sesión activa' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid'); // Elimina la cookie de sesión
    res.json({ message: 'Sesión cerrada correctamente' });
  });
};

const eliminarUsuario = async (req, res) => {
  try {
    await usuarioModel.eliminarUsuario(req.params.id);
    res.json({ message: 'Usuario y datos asociados eliminados correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const user = await usuarioModel.obtenerUsuarioPorId(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

const obtenerMascotas = async (req, res) => {
  try {
    const mascotas = await usuarioModel.obtenerMascotasDeUsuario(req.params.userId);
    res.json(mascotas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mascotas' });
  }
};

const actualizarUsuario = async (req, res) => {
  const { nombre, apellidos, edad, localizacion, correo, password } = req.body;
  const imagen_perfil = req.file ? req.file.path : null;

  const campos = {};
  if (nombre) campos.nombre = nombre;
  if (apellidos) campos.apellidos = apellidos;
  if (edad) campos.edad = edad;
  if (localizacion) campos.localizacion = localizacion;
  if (correo) campos.correo = correo;
  if (password) campos.password = await bcrypt.hash(password, 10);
  if (imagen_perfil) campos.imagen_perfil = imagen_perfil;

  try {
    const user = await usuarioModel.actualizarUsuario(req.params.userId, campos);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    delete user.password;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};


module.exports = {
  crearUsuario,
  recuperarPassword,
  verificarTokenRecuperacion,
  restablecerPassword,
  loginUsuario,
  obtenerSesionUsuario, 
  logout,
  eliminarUsuario,
  obtenerUsuario,
  obtenerMascotas,
  actualizarUsuario,
};