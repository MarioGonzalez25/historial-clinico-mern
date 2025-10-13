// backend/scripts/seedAdmin.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';

async function run() {
  try {
    const {
      MONGO_URI,
      SEED_ADMIN_EMAIL = 'admin@sistema.edu',
      SEED_ADMIN_PASS  = 'Admin1234!Final',
      SEED_ADMIN_NAME  = 'Administrador'
    } = process.env;

    if (!MONGO_URI) {
      console.error('❌ Falta MONGO_URI en .env');
      process.exit(1);
    }

    await connectDB(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    let admin = await User.findOne({ email: SEED_ADMIN_EMAIL });
    if (admin) {
      console.log(`ℹ️ Admin ya existe: ${SEED_ADMIN_EMAIL}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(SEED_ADMIN_PASS, salt);

    admin = new User({
      nombre: SEED_ADMIN_NAME,
      email: SEED_ADMIN_EMAIL,
      rol: 'ADMIN',
      passwordHash
    });

    if ('passwordChangedAt' in admin) {
      admin.passwordChangedAt = new Date();
    }

    await admin.save();
    console.log(`✅ Admin creado: ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASS}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seedAdmin:', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

run();
