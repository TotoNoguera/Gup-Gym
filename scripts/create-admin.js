const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.admin.upsert({
      where: { email: 'admin@gupgym.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin@gupgym.com',
        password: hashedPassword,
        nombre: 'Administrador GUP Gym',
      },
    });

    console.log('✅ Admin creado:');
    console.log(`   Email: admin@gupgym.com`);
    console.log(`   Password: admin123`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
