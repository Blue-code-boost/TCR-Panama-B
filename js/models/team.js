const mongoose = require('mongoose');

// Definir el esquema del equipo
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pilots: {
    type: [String], // Array de strings para los nombres de los pilotos
    required: true,
  },
  position: {
    type: Number, // Posición del equipo en la tabla de posiciones
    required: true,
  },
}, {
  timestamps: true, // Esta opción agrega las fechas de creación y actualización automáticamente
});

// Crear el modelo de 'Team' basado en el esquema
const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
