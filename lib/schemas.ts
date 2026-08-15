import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const planSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  precio: z
    .string()
    .or(z.number())
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .refine(val => val > 0, 'El precio debe ser mayor que 0'),
  duracionMeses: z
    .string()
    .or(z.number())
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => Number.isInteger(val) && val > 0, 'La duración debe ser un número entero mayor que 0'),
});

export type PlanInput = z.infer<typeof planSchema>;

export const socioSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  telefono: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 7,
      'El teléfono debe tener al menos 7 caracteres'
    )
    .refine(
      val => !val || /^\d+$/.test(val),
      'El teléfono debe contener solo dígitos'
    ),
});

export type SocioInput = z.infer<typeof socioSchema>;

export const membresiaSchema = z.object({
  socioId: z
    .string()
    .min(1, 'El socio es requerido'),
  duracionMeses: z
    .string()
    .or(z.number())
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => Number.isInteger(val) && val > 0, 'La duración debe ser un número entero mayor que 0'),
  fechaInicio: z
    .string()
    .min(1, 'La fecha de inicio es requerida')
    .refine(
      val => !isNaN(new Date(val).getTime()),
      'La fecha de inicio no es válida'
    ),
  monto: z
    .string()
    .or(z.number())
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .refine(val => val > 0, 'El monto debe ser mayor que 0'),
  metodo: z
    .enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])
    .refine(val => ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(val), {
      message: 'Método de pago inválido'
    }),
});

export type MembresiaInput = z.infer<typeof membresiaSchema>;

export const pagoSchema = z.object({
  socioId: z
    .string()
    .min(1, 'El socio es requerido'),
  meses: z
    .string()
    .or(z.number())
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => Number.isInteger(val) && val > 0 && val <= 12, 'Los meses deben estar entre 1 y 12'),
  importe: z
    .string()
    .or(z.number())
    .transform(val => typeof val === 'string' ? parseFloat(val) : val)
    .refine(val => val > 0, 'El importe debe ser mayor que 0'),
  fechaPago: z
    .string()
    .min(1, 'La fecha de pago es requerida')
    .refine(
      val => !isNaN(new Date(val).getTime()),
      'La fecha de pago no es válida'
    ),
  metodo: z
    .enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])
    .refine(val => ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(val), {
      message: 'Método de pago inválido'
    }),
});

export type PagoInput = z.infer<typeof pagoSchema>;
