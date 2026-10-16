// src/server.js
const app = require('./index');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de apagado limpio (Graceful Shutdown)
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida: Cerrando servidor HTTP...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('🔒 Conexión a MongoDB cerrada.');
      process.exit(0);
    });
  });
});