import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gymmanager.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // CAMBIAR EN PRODUCCIÓN
  const adminNombre = process.env.ADMIN_NOMBRE || 'Administrador';

  // Verificar si el admin ya existe
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin con email ${adminEmail} ya existe`);
    return;
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Crear admin
  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      nombre: adminNombre,
    },
  });

  console.log(`✅ Admin creado exitosamente`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Nombre: ${admin.nombre}`);
  console.log(`   Fecha de creación: ${admin.createdAt}`);
  console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después de la primera conexión');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
