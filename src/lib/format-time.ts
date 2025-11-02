/**
 * Utilidades centralizadas para manejo de fechas y horas
 *
 * IMPORTANTE: Este proyecto almacena TODAS las fechas en UTC en el backend.
 * Las funciones de este archivo convierten automáticamente a la zona horaria de Lima, Perú (America/Lima, UTC-5).
 *
 * Zona horaria predeterminada: America/Lima (UTC-5)
 *
 * @see https://date-fns.org/docs/Time-Zones
 */

import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

//* Constante para la zona horaria de Lima, Perú
export const LIMA_TIMEZONE = 'America/Lima';

//* Constante para la zona horaria UTC (para enviar al backend)
export const UTC_TIMEZONE = 'UTC';

/**
 * Convierte una fecha UTC (del backend) a la zona horaria de Lima
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @returns Date object en zona horaria de Lima
 *
 * @example
 * // Backend retorna: "2025-01-15T18:30:00.000Z" (UTC)
 * const limaDate = utcToLima("2025-01-15T18:30:00.000Z");
 * // Resultado: Date object que representa 15/01/2025 13:30:00 en Lima (UTC-5)
 */
export const utcToLima = (dateString: string): Date => {
  try {
    const utcDate = parseISO(dateString);
    return toZonedTime(utcDate, LIMA_TIMEZONE);
  } catch (error) {
    console.error('Error convirtiendo fecha UTC a Lima:', error);
    return new Date();
  }
};

/**
 * Convierte una fecha local (del navegador) a UTC para enviar al backend
 *
 * @param date - Date object local
 * @returns String en formato ISO 8601 (UTC)
 *
 * @example
 * const now = new Date(); // Fecha local del navegador
 * const utcString = limaToUTC(now);
 * // Resultado: "2025-01-15T18:30:00.000Z" (listo para enviar al backend)
 */
export const limaToUTC = (date: Date = new Date()): string => {
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error convirtiendo fecha Lima a UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * Formatea una fecha UTC (del backend) en formato corto español para Lima
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @param pattern - Patrón de formato (opcional, por defecto: 'dd/MM/yyyy')
 * @returns String formateado en español para Lima
 *
 * @example
 * // Backend retorna: "2025-01-15T18:30:00.000Z"
 * formatDate("2025-01-15T18:30:00.000Z");
 * // Resultado: "15/01/2025"
 *
 * formatDate("2025-01-15T18:30:00.000Z", "dd 'de' MMMM, yyyy");
 * // Resultado: "15 de enero, 2025"
 */
export const formatDate = (
  dateString: string,
  pattern: string = 'dd/MM/yyyy'
): string => {
  try {
    const utcDate = parseISO(dateString);
    return formatInTimeZone(utcDate, LIMA_TIMEZONE, pattern, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateString;
  }
};

/**
 * Formatea solo la hora de una fecha UTC (del backend) para Lima
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @param pattern - Patrón de formato (opcional, por defecto: 'HH:mm:ss')
 * @returns String con la hora en formato 24h para Lima
 *
 * @example
 * // Backend retorna: "2025-01-15T18:30:45.000Z" (6:30:45 PM UTC)
 * formatTime("2025-01-15T18:30:45.000Z");
 * // Resultado: "13:30:45" (1:30:45 PM en Lima, UTC-5)
 *
 * formatTime("2025-01-15T18:30:45.000Z", "hh:mm a");
 * // Resultado: "01:30 PM"
 */
export const formatTime = (
  dateString: string,
  pattern: string = 'HH:mm:ss'
): string => {
  try {
    const utcDate = parseISO(dateString);
    return formatInTimeZone(utcDate, LIMA_TIMEZONE, pattern, { locale: es });
  } catch (error) {
    console.error('Error formateando hora:', error);
    return dateString;
  }
};

/**
 * Formatea fecha y hora completa de una fecha UTC (del backend) para Lima
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @param pattern - Patrón de formato (opcional, por defecto: 'dd/MM/yyyy HH:mm:ss')
 * @returns String con fecha y hora completa para Lima
 *
 * @example
 * // Backend retorna: "2025-01-15T18:30:45.000Z"
 * formatDateTime("2025-01-15T18:30:45.000Z");
 * // Resultado: "15/01/2025 13:30:45"
 *
 * formatDateTime("2025-01-15T18:30:45.000Z", "dd 'de' MMMM 'a las' HH:mm");
 * // Resultado: "15 de enero a las 13:30"
 */
export const formatDateTime = (
  dateString: string,
  pattern: string = 'dd/MM/yyyy HH:mm:ss'
): string => {
  try {
    const utcDate = parseISO(dateString);
    return formatInTimeZone(utcDate, LIMA_TIMEZONE, pattern, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha y hora:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha en formato largo y legible en español para Lima
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @returns String en formato largo (ej: "15 de enero de 2025, 13:30")
 *
 * @example
 * // Backend retorna: "2025-01-15T18:30:00.000Z"
 * formatDateLong("2025-01-15T18:30:00.000Z");
 * // Resultado: "15 de enero de 2025, 13:30"
 */
export const formatDateLong = (dateString: string): string => {
  try {
    const utcDate = parseISO(dateString);
    return formatInTimeZone(
      utcDate,
      LIMA_TIMEZONE,
      "d 'de' MMMM 'de' yyyy, HH:mm",
      { locale: es }
    );
  } catch (error) {
    console.error('Error formateando fecha larga:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha en formato corto para tablas (sin hora)
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @returns String en formato corto (ej: "15 ene 2025")
 *
 * @example
 * // Backend retorna: "2025-01-15T18:30:00.000Z"
 * formatDateShort("2025-01-15T18:30:00.000Z");
 * // Resultado: "15 ene 2025"
 */
export const formatDateShort = (dateString: string): string => {
  try {
    const utcDate = parseISO(dateString);
    return formatInTimeZone(utcDate, LIMA_TIMEZONE, 'd MMM yyyy', {
      locale: es,
    });
  } catch (error) {
    console.error('Error formateando fecha corta:', error);
    return dateString;
  }
};

/**
 * Obtiene la fecha y hora actual en Lima y la convierte a UTC para enviar al backend
 *
 * @returns String en formato ISO 8601 (UTC) listo para enviar al backend
 *
 * @example
 * // Al crear una cotización o registro
 * const requestBody = {
 *   response_date: getNowUTC(),
 *   // ... otros campos
 * };
 * // Resultado: "2025-01-15T18:30:00.000Z"
 */
export const getNowUTC = (): string => {
  return new Date().toISOString();
};

/**
 * Obtiene la fecha actual de Lima como Date object
 *
 * @returns Date object con la hora actual de Lima
 *
 * @example
 * const now = getNowLima();
 * // Usar este Date object para cálculos locales, NO para enviar al backend
 */
export const getNowLima = (): Date => {
  return toZonedTime(new Date(), LIMA_TIMEZONE);
};

/**
 * Calcula una fecha futura en UTC (útil para expiraciones de tokens)
 *
 * @param days - Número de días en el futuro
 * @returns String en formato ISO 8601 (UTC)
 *
 * @example
 * // Para token que expira en 7 días
 * const expirationDate = getFutureDateUTC(7);
 * localStorage.setItem("token_expiration", expirationDate);
 */
export const getFutureDateUTC = (days: number): string => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return futureDate.toISOString();
};

/**
 * Compara si una fecha UTC ya expiró
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @returns true si la fecha ya pasó, false si aún está en el futuro
 *
 * @example
 * const tokenExpiration = localStorage.getItem("token_expiration");
 * if (isExpired(tokenExpiration)) {
 *   // Token expirado, redirigir a login
 * }
 */
export const isExpired = (dateString: string): boolean => {
  try {
    const expirationDate = parseISO(dateString);
    return expirationDate.getTime() < Date.now();
  } catch {
    return true; // Si hay error, considerar como expirado por seguridad
  }
};

/**
 * Calcula el tiempo restante hasta una fecha en milisegundos
 *
 * @param dateString - String de fecha en formato ISO 8601 (UTC)
 * @returns Milisegundos hasta la fecha, o 0 si ya pasó
 *
 * @example
 * const tokenExpiration = localStorage.getItem("token_expiration");
 * const msUntilExpiration = getTimeUntil(tokenExpiration);
 * const hoursRemaining = msUntilExpiration / (1000 * 60 * 60);
 */
export const getTimeUntil = (dateString: string): number => {
  try {
    const targetDate = parseISO(dateString);
    const timeRemaining = targetDate.getTime() - Date.now();
    return Math.max(0, timeRemaining);
  } catch {
    return 0;
  }
};
