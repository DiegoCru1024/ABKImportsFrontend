/**
 * Definiciones de rutas de envío
 * Datos extraídos de tracking.md con coordenadas convertidas a decimal
 */

import type { RouteDefinition, RoutePoint } from './types';

/**
 * Ruta aérea desde Shenzhen (Carga General)
 * Dataset 1: Salidas Shenzhen - Carga General
 */
const SHENZHEN_POINTS: RoutePoint[] = [
  // FASE 1: FIRST MILE (Almacén Nanning → Aeropuerto Shenzhen)
  {
    order: 1,
    place: 'ALMACEN',
    status: 'PENDIENTE LLEGADA DE PRODUCTO',
    coords: { lat: 22.825056, lng: 108.293444 },
    phase: 'first_mile',
  },
  {
    order: 2,
    place: 'ALMACEN',
    status: 'PROCESO DE INSPECCION',
    coords: { lat: 22.825056, lng: 108.293444 },
    phase: 'first_mile',
  },
  {
    order: 3,
    place: 'ALMACEN',
    status: 'PENDIENTE DE RECOJO',
    coords: { lat: 22.825056, lng: 108.293444 },
    phase: 'first_mile',
  },
  {
    order: 4,
    place: 'VEHICULO 0%',
    status: 'EN CAMINO AL SHENZHEN',
    coords: { lat: 22.823111, lng: 108.688250 },
    phase: 'first_mile',
  },
  {
    order: 5,
    place: 'VEHICULO 50%',
    status: 'EN CAMINO AL SHENZHEN',
    coords: { lat: 22.635639, lng: 110.162556 },
    phase: 'first_mile',
  },
  {
    order: 6,
    place: 'VEHICULO 75%',
    status: 'EN CAMINO AL SHENZHEN',
    coords: { lat: 23.108944, lng: 113.248833 },
    phase: 'first_mile',
  },
  {
    order: 7,
    place: 'VEHICULO 100%',
    status: 'LLEGO AEROPUERTO SZX',
    coords: { lat: 22.651111, lng: 113.812278 },
    phase: 'first_mile',
  },

  // FASE 2: CUSTOMS ORIGEN (Aduana China - Aeropuerto Shenzhen)
  {
    order: 8,
    place: 'AEROPUERTO',
    status: 'ENTRO INSPECCION ADUANA',
    coords: { lat: 22.651111, lng: 113.812278 },
    phase: 'customs_origin',
  },
  {
    order: 9,
    place: 'AEROPUERTO',
    status: 'ESPERA LIBERACION ADUANAL',
    coords: { lat: 22.651111, lng: 113.812278 },
    phase: 'customs_origin',
  },
  {
    order: 10,
    place: 'AEROPUERTO',
    status: 'RETRASO EN LA LIBERACION',
    coords: { lat: 22.651111, lng: 113.812278 },
    phase: 'customs_origin',
    isOptional: true,
  },
  {
    order: 11,
    place: 'AEROPUERTO',
    status: 'LIBERACION APROBADA',
    coords: { lat: 22.651111, lng: 113.812278 },
    phase: 'customs_origin',
  },
  {
    order: 12,
    place: 'AEROPUERTO',
    status: 'ESPERA DE EMBARQUE',
    coords: { lat: 22.651111, lng: 113.812278 },
    phase: 'customs_origin',
  },
  {
    order: 13,
    place: 'AEROPUERTO',
    status: 'EMBARQUE CONFIRMADO',
    coords: { lat: 22.651111, lng: 113.812278 },
    phase: 'customs_origin',
  },

  // FASE 3: TRANSIT (Tránsito Internacional)
  {
    order: 14,
    place: 'PUNTO 1 / EN EL MAR',
    status: 'EN TRANSITO',
    coords: { lat: 22.493750, lng: 117.181444 },
    phase: 'transit',
  },
  {
    order: 15,
    place: 'PUNTO 2 / TAIWAN PORT',
    status: 'EN TRANSITO',
    coords: { lat: 25.075972, lng: 121.229417 },
    phase: 'transit',
  },
  {
    order: 16,
    place: 'PUNTO 3 / EN EL MAR',
    status: 'EN TRANSITO',
    coords: { lat: 30.713861, lng: 133.362333 },
    phase: 'transit',
  },
  {
    order: 17,
    place: 'PUNTO 4 / OSAKA',
    status: 'EN TRANSITO',
    coords: { lat: 34.792083, lng: 135.439111 },
    phase: 'transit',
  },
  {
    order: 18,
    place: 'PUNTO 5 / EN EL MAR',
    status: 'EN TRANSITO',
    coords: { lat: 49.877472, lng: 174.004778 },
    phase: 'transit',
  },
  {
    order: 19,
    place: 'PUNTO 6 / ALASKA ANCHORAGE',
    status: 'EN TRANSITO',
    coords: { lat: 61.178611, lng: -150.040917 },
    phase: 'transit',
  },
  {
    order: 20,
    place: 'PUNTO 7 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: 50.401778, lng: -127.869944 },
    phase: 'transit',
  },
  {
    order: 21,
    place: 'PUNTO 8 / LOS ANGELES',
    status: 'EN TRANSITO',
    coords: { lat: 33.942750, lng: -118.411139 },
    phase: 'transit',
  },
  {
    order: 22,
    place: 'PUNTO 9 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: 37.208944, lng: -108.044972 },
    phase: 'transit',
  },
  {
    order: 23,
    place: 'PUNTO 10 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: 40.566278, lng: -92.886278 },
    phase: 'transit',
  },
  {
    order: 24,
    place: 'PUNTO 11 / CHICAGO PORT',
    status: 'EN TRANSITO',
    coords: { lat: 41.983917, lng: -87.917417 },
    phase: 'transit',
  },
  {
    order: 25,
    place: 'PUNTO 12 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: 38.853972, lng: -88.524028 },
    phase: 'transit',
  },
  {
    order: 26,
    place: 'PUNTO 13 / MEMPHIS PORT',
    status: 'EN TRANSITO',
    coords: { lat: 35.045722, lng: -89.975722 },
    phase: 'transit',
  },
  {
    order: 27,
    place: 'PUNTO 14 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: 31.723056, lng: -85.050083 },
    phase: 'transit',
  },
  {
    order: 28,
    place: 'PUNTO 15 / MIAMI PORT',
    status: 'EN TRANSITO',
    coords: { lat: 25.793028, lng: -80.278722 },
    phase: 'transit',
  },
  {
    order: 29,
    place: 'PUNTO 16 / EN EL MAR',
    status: 'EN TRANSITO',
    coords: { lat: 15.648472, lng: -77.666167 },
    phase: 'transit',
  },
  {
    order: 30,
    place: 'PUNTO 17 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: 6.815778, lng: -69.994500 },
    phase: 'transit',
  },
  {
    order: 31,
    place: 'PUNTO 18 / BOGOTA COLOMBIA',
    status: 'EN TRANSITO',
    coords: { lat: 4.700417, lng: -74.138194 },
    phase: 'transit',
  },
  {
    order: 32,
    place: 'PUNTO 19 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: -1.940861, lng: -76.479556 },
    phase: 'transit',
  },
  {
    order: 33,
    place: 'PUNTO 20 / EN CONTINENTE',
    status: 'EN TRANSITO',
    coords: { lat: -10.142972, lng: -77.702694 },
    phase: 'transit',
  },
  {
    order: 34,
    place: 'PUNTO 21 / LIMA AEROPUERTO JORGE CHAVEZ',
    status: 'EN TRANSITO',
    coords: { lat: -12.024833, lng: -77.123472 },
    phase: 'transit',
  },

  // FASE 4: CUSTOMS DESTINO (Aduana Perú)
  {
    order: 35,
    place: 'AEROPUERTO',
    status: 'ENTRO INSPECCION ADUANA',
    coords: { lat: -12.027722, lng: -77.104278 },
    phase: 'customs_destination',
  },
  {
    order: 36,
    place: 'AEROPUERTO',
    status: 'ESPERA LIBERACION ADUANAL',
    coords: { lat: -12.027722, lng: -77.104278 },
    phase: 'customs_destination',
  },
  {
    order: 37,
    place: 'AEROPUERTO',
    status: 'RETRASO EN LA LIBERACION',
    coords: { lat: -12.027722, lng: -77.104278 },
    phase: 'customs_destination',
    isOptional: true,
  },
  {
    order: 38,
    place: 'AEROPUERTO',
    status: 'LIBERACION APROBADA',
    coords: { lat: -12.027722, lng: -77.104278 },
    phase: 'customs_destination',
  },

  // FASE 5: LAST MILE (Aeropuerto → Almacén ABK)
  {
    order: 39,
    place: 'ALMACEN AEROLINEA',
    status: 'PENDIENTE DE RECOJO',
    coords: { lat: -12.027778, lng: -77.103611 },
    phase: 'last_mile',
  },
  {
    order: 40,
    place: 'VEHICULO 0%',
    status: 'VEHICULO DE ABK',
    coords: { lat: -12.027778, lng: -77.103611 },
    phase: 'last_mile',
  },
  {
    order: 41,
    place: 'VEHICULO 50%',
    status: 'VEHICULO DE ABK',
    coords: { lat: -12.041472, lng: -77.035444 },
    phase: 'last_mile',
  },
  {
    order: 42,
    place: 'VEHICULO 100%',
    status: 'VEHICULO DE ABK',
    coords: { lat: -12.064361, lng: -76.999639 },
    phase: 'last_mile',
  },
  {
    order: 43,
    place: 'ALMACEN ABK',
    status: 'PROCESO DE INSPECCION',
    coords: { lat: -12.064500, lng: -76.999833 },
    phase: 'last_mile',
  },
  {
    order: 44,
    place: 'ALMACEN ABK',
    status: 'LISTO PARA LA ENTREGA',
    coords: { lat: -12.064500, lng: -76.999833 },
    phase: 'last_mile',
  },
  {
    order: 45,
    place: 'ALMACEN ABK',
    status: 'ENTREGADO',
    coords: { lat: -12.064500, lng: -76.999833 },
    phase: 'last_mile',
  },
];

/**
 * Ruta aérea desde Hong Kong (Carga IMO Mixta)
 * Dataset 2: Salidas Hong Kong - Carga IMO - Mixta
 * Diferencia: puntos 4-13 tienen coordenadas diferentes (ruta a HKG en lugar de SZX)
 */
const HONGKONG_POINTS: RoutePoint[] = [
  // FASE 1: FIRST MILE (Almacén Nanning → Aeropuerto Hong Kong)
  {
    order: 1,
    place: 'ALMACEN',
    status: 'PENDIENTE LLEGADA DE PRODUCTO',
    coords: { lat: 22.825056, lng: 108.293444 },
    phase: 'first_mile',
  },
  {
    order: 2,
    place: 'ALMACEN',
    status: 'PROCESO DE INSPECCION',
    coords: { lat: 22.825056, lng: 108.293444 },
    phase: 'first_mile',
  },
  {
    order: 3,
    place: 'ALMACEN',
    status: 'PENDIENTE DE RECOJO',
    coords: { lat: 22.825056, lng: 108.293444 },
    phase: 'first_mile',
  },
  {
    order: 4,
    place: 'VEHICULO 0%',
    status: 'EN CAMINO AL HONG KONG',
    coords: { lat: 22.888417, lng: 109.443528 },
    phase: 'first_mile',
  },
  {
    order: 5,
    place: 'VEHICULO 50%',
    status: 'EN CAMINO AL HONG KONG',
    coords: { lat: 23.470000, lng: 111.248472 },
    phase: 'first_mile',
  },
  {
    order: 6,
    place: 'VEHICULO 75%',
    status: 'EN CAMINO AL HONG KONG',
    coords: { lat: 23.008222, lng: 113.862139 },
    phase: 'first_mile',
  },
  {
    order: 7,
    place: 'VEHICULO 100%',
    status: 'LLEGO AEROPUERTO HKG',
    coords: { lat: 22.298917, lng: 113.931417 },
    phase: 'first_mile',
  },

  // FASE 2: CUSTOMS ORIGEN (Aduana - Aeropuerto Hong Kong)
  {
    order: 8,
    place: 'AEROPUERTO',
    status: 'ENTRO INSPECCION ADUANA',
    coords: { lat: 22.298917, lng: 113.931417 },
    phase: 'customs_origin',
  },
  {
    order: 9,
    place: 'AEROPUERTO',
    status: 'ESPERA LIBERACION ADUANAL',
    coords: { lat: 22.298917, lng: 113.931417 },
    phase: 'customs_origin',
  },
  {
    order: 10,
    place: 'AEROPUERTO',
    status: 'RETRASO EN LA LIBERACION',
    coords: { lat: 22.298917, lng: 113.931417 },
    phase: 'customs_origin',
    isOptional: true,
  },
  {
    order: 11,
    place: 'AEROPUERTO',
    status: 'LIBERACION APROBADA',
    coords: { lat: 22.298917, lng: 113.931417 },
    phase: 'customs_origin',
  },
  {
    order: 12,
    place: 'AEROPUERTO',
    status: 'ESPERA DE EMBARQUE',
    coords: { lat: 22.298917, lng: 113.931417 },
    phase: 'customs_origin',
  },
  {
    order: 13,
    place: 'AEROPUERTO',
    status: 'EMBARQUE CONFIRMADO',
    coords: { lat: 22.298917, lng: 113.931417 },
    phase: 'customs_origin',
  },

  // FASE 3-5: Idénticas a Shenzhen (desde punto 14)
  ...SHENZHEN_POINTS.filter((p) => p.order >= 14),
];

/**
 * Mapa de rutas disponibles
 * Clave: {serviceType}_{cargoType}
 */
export const ROUTES: Record<string, RouteDefinition> = {
  aerial_general: {
    id: 'aerial_general',
    serviceType: 'aerial',
    cargoType: 'general',
    origin: 'Shenzhen (SZX)',
    destination: 'Lima (LIM)',
    totalPoints: 45,
    points: SHENZHEN_POINTS,
  },
  aerial_imo_mixta: {
    id: 'aerial_imo_mixta',
    serviceType: 'aerial',
    cargoType: 'imo_mixta',
    origin: 'Hong Kong (HKG)',
    destination: 'Lima (LIM)',
    totalPoints: 45,
    points: HONGKONG_POINTS,
  },
};

/**
 * Obtiene la definición de ruta basada en el tipo de servicio y carga
 */
export function getRouteDefinition(
  serviceType: string,
  cargoType: string
): RouteDefinition | null {
  const routeKey = `${serviceType}_${cargoType}`;
  return ROUTES[routeKey] || null;
}

/**
 * Obtiene la etiqueta legible para una fase
 */
export function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    first_mile: 'Primera Milla',
    customs_origin: 'Aduana Origen',
    transit: 'Tránsito Internacional',
    customs_destination: 'Aduana Destino',
    last_mile: 'Última Milla',
  };
  return labels[phase] || phase;
}
