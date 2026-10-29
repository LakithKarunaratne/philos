// Distance helpers for the "0.4 km away" labels. Until PHI-8 reads the
// browser's real position, distances are measured from a fixed Colombo origin
// so server-rendered values stay stable between requests.

/**
 * Stand-in for the signed-in user's position (Colombo 03).
 *
 * TODO(PHI-8): replace with the browser's real position. Every distance label
 * in the app is measured from here, so this is the single place to change.
 */
export const USER_ORIGIN: [number, number] = [6.911, 79.858]

/** Where the rescue map opens. */
export const COLOMBO_CENTER: [number, number] = [6.915, 79.863]

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Great-circle distance in kilometres between two [lat, lng] pairs. */
export function distanceKm(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/** "350 m away" under a kilometre, "1.8 km away" above it. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`
  return `${km.toFixed(1)} km away`
}

/** Distance from {@link USER_ORIGIN} to a case, ready to render. */
export function distanceLabel(lat: number, lng: number): string {
  return formatDistance(distanceKm(USER_ORIGIN, [lat, lng]))
}
