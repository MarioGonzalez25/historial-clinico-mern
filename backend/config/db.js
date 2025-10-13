// backend/config/db.js
import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI no está definido en .env');
  }

  try {
    // Opcional: afinar comportamiento de índices/consultas
    // mongoose.set('strictQuery', true);

    await mongoose.connect(uri /*, { autoIndex: true } */);
    console.log('✅ MongoDB conectado');

    // Cierre limpio al terminar el proceso (opcional)
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexión MongoDB cerrada');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    throw err; // deja que server.js maneje el fallo
  }
}
