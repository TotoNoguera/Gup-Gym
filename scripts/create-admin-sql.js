const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const email = 'admin@gupgym.com';
    const nombre = 'Administrador GUP Gym';

    // Primero intenta actualizar
    const updateResult = await pool.query(
      'UPDATE "Admin" SET password = $1, "updatedAt" = NOW() WHERE email = $2 RETURNING *',
      [hashedPassword, email]
    );

    if (updateResult.rows.length > 0) {
      console.log('✅ Admin actualizado');
    } else {
      // Si no existe, crear uno nuevo
      const result = await pool.query(
        'INSERT INTO "Admin" (id, email, password, nombre, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING email',
        [email, hashedPassword, nombre]
      );
      console.log('✅ Admin creado');
    }

    console.log('\n📧 Email: admin@gupgym.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
