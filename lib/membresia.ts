import { addMonths, isAfter, differenceInDays, isBefore, isEqual } from 'date-fns';

export function calcularFechaVencimiento(
  fechaInicio: Date,
  duracionMeses: number
): Date {
  return addMonths(fechaInicio, duracionMeses);
}

export function calcularEstadoMembresia(fechaVencimiento: Date): 'ACTIVA' | 'VENCIDA' {
  const hoy = new Date();
  // Establecer la hora a medianoche para comparación justa
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  // Si hoy >= vencimiento, está vencida
  if (isAfter(hoy, vencimiento) || isEqual(hoy, vencimiento)) {
    return 'VENCIDA';
  }
  return 'ACTIVA';
}

export function calcularDiasRestantes(fechaVencimiento: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  const dias = differenceInDays(vencimiento, hoy);
  return Math.max(dias, 0);
}

export function verificarSuperposicion(
  nuevaFechaInicio: Date,
  nuevaFechaVencimiento: Date,
  membresiaExistente: {
    fechaInicio: Date;
    fechaVencimiento: Date;
  }
): boolean {
  // Dos períodos se superponen si:
  // fechaInicio1 <= fechaVencimiento2 AND fechaVencimiento1 >= fechaInicio2

  const inicio1 = new Date(nuevaFechaInicio);
  const fin1 = new Date(nuevaFechaVencimiento);
  const inicio2 = new Date(membresiaExistente.fechaInicio);
  const fin2 = new Date(membresiaExistente.fechaVencimiento);

  return !(isAfter(inicio1, fin2) || isBefore(fin1, inicio2));
}
