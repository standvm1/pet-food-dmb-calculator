/**
 * Every URL the app builds for itself goes through here, so moving the app to a
 * new host or a sub-path is a config change rather than a search-and-replace.
 *
 *   BASE_PATH      build-time (vite.config.ts) — where the app is served from,
 *                  e.g. '/' today, '/PetFoodCalc/' behind app.atlasvetapps.com
 *   VITE_SITE_URL  build-time — the public origin, no trailing slash
 */

/** Always starts and ends with '/', e.g. '/' or '/PetFoodCalc/'. */
export const BASE: string = import.meta.env.BASE_URL;

/** Public origin, no trailing slash. */
export const SITE_URL: string = (
  import.meta.env.VITE_SITE_URL || 'https://pet-food-calc.netlify.app'
).replace(/\/$/, '');

/** A file in /public — asset('avh-logo.png') -> '/PetFoodCalc/avh-logo.png' */
export function asset(path: string): string {
  return BASE + path.replace(/^\//, '');
}

/** A Netlify function — fn('subscribe') -> '/PetFoodCalc/.netlify/functions/subscribe' */
export function fn(name: string): string {
  return `${BASE}.netlify/functions/${name}`;
}

/** Absolute URL for <link rel="canonical"> — canonical('/what-is-dmb') */
export function canonical(routePath: string): string {
  return SITE_URL + BASE + routePath.replace(/^\//, '');
}
