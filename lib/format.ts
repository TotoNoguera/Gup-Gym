import { Prisma } from '@prisma/client';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

// Convertir Decimal a número de forma segura
export const decimalToNumber = (value: unknown): number => {
  if (value && typeof value === 'object' && 'toFixed' in value) {
    return Number((value as any).toFixed());
  }
  if (typeof value === 'string') {
    return Number(value);
  }
  if (typeof value === 'number') {
    return value;
  }
  return Number(value) || 0;
};

// Formatear moneda
export const formatCurrency = (value: unknown): string => {
  const num = decimalToNumber(value);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Formatear fecha profesional
export const formatDate = (date: Date | string, style: 'short' | 'long' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (style === 'short') {
    return format(dateObj, 'dd/MM/yyyy');
  }
  return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: es });
};

// Calcular vencimiento basado en meses pagados
export const calculateExpiration = (currentExpiration: Date, monthsToPay: number): Date => {
  return addMonths(currentExpiration, monthsToPay);
};

// Generar iniciales de avatar de forma segura
export const getInitials = (nombre: string, apellido?: string): string => {
  if (!nombre || nombre.trim() === '') {
    return '?';
  }

  const n = nombre.trim()[0]?.toUpperCase() || '';
  const a = apellido?.trim()[0]?.toUpperCase() || '';

  return (n + a).slice(0, 2) || '?';
};

// Calcular días restantes
export const getDaysRemaining = (expirationDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Determinar estado de membresía
export type MembershipStatus = 'active' | 'expiring-soon' | 'expired' | 'no-membership';

export const getMembershipStatus = (expirationDate?: Date | null): MembershipStatus => {
  if (!expirationDate) {
    return 'no-membership';
  }

  const daysRemaining = getDaysRemaining(expirationDate);

  if (daysRemaining > 7) {
    return 'active';
  }
  if (daysRemaining > 0) {
    return 'expiring-soon';
  }
  return 'expired';
};

// Textos de estado
export const getStatusText = (status: MembershipStatus): { label: string; color: string } => {
  switch (status) {
    case 'active':
      return { label: 'Al día', color: 'text-green-700 bg-green-100' };
    case 'expiring-soon':
      return { label: 'Vence pronto', color: 'text-orange-700 bg-orange-100' };
    case 'expired':
      return { label: 'Vencido', color: 'text-red-700 bg-red-100' };
    case 'no-membership':
      return { label: 'Sin suscripción', color: 'text-gray-700 bg-gray-100' };
  }
};
