const vacunaModel = require('../models/vacunaModel');

const actualizarVacuna = async (req, res) => {
  const { vacunaId } = req.params;
  const updateData = req.body;

  try {
    const vacunaActual = await vacunaModel.obtenerVacunaPorId(vacunaId);
    if (!vacunaActual) {
      return res.status(404).json({ error: 'Vacuna no encontrada' });
    }

    const merged = { ...vacunaActual, ...updateData };
    const updated = await vacunaModel.actualizarVacuna(vacunaId, merged);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la vacuna' });
  }
};

const eliminarVacuna = async (req, res) => {
  const { vacunaId } = req.params;
  try {
    await vacunaModel.eliminarVacuna(vacunaId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la vacuna' });
  }
};

module.exports = {
  actualizarVacuna,
  eliminarVacuna,
};
