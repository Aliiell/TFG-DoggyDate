const interaccionModel = require('../models/interaccionModel');

const crearMatch = async (req, res) => {
  const { usuario_id, mascota_id } = req.body;

  try {
    const isMatch = await interaccionModel.crearMatch(usuario_id, mascota_id);
    res.json({ success: true, isMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear match' });
  }
};

const registrarRechazo = async (req, res) => {
  const { usuario_id, mascota_id } = req.body;

  try {
    await interaccionModel.insertarRechazo(usuario_id, mascota_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar rechazo' });
  }
};

module.exports = {
  crearMatch,
  registrarRechazo,
};
