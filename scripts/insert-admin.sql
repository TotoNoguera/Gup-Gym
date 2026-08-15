INSERT INTO "Admin" (id, email, password, nombre, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@gupgym.com',
  '$2b$10$bVn.6Hom.gAt3WzbRc6Zw.L8Vg0cexn8.NBHndhSYvJMNH3WdcsU6',
  'Administrador GUP Gym',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET password = '$2b$10$bVn.6Hom.gAt3WzbRc6Zw.L8Vg0cexn8.NBHndhSYvJMNH3WdcsU6', "updatedAt" = NOW()
RETURNING email, nombre;
