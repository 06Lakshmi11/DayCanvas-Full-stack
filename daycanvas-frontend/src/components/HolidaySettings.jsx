const CACHE_PREFIX = 'calendar-notes:holidays:'
const API_KEY = import.meta.env.VITE_CALENDARIFIC_KEY

export const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'BR', name: 'Brazil' },
  { code: 'ZA', name: 'South Africa' },
]

/**
 * Fetches public holidays for a given year and country using the
 * Calendarific API, caching results in localStorage so repeat visits
 * don't re-fetch (also helps stay under the free tier's request limit).
 *
 * @param {number} year
 * @param {string} countryCode - ISO 3166-1 alpha-2, e.g. 'IN', 'US'
 * @returns {Promise<{date: string, name: string}[]>}
 */
export async function fetchHolidays(year, countryCode) {
  const cacheKey = `${CACHE_PREFIX}${countryCode}:${year}`

  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {
    // ignore cache read errors, fall through to fetch
  }

  if (!API_KEY) {
    throw new Error('Missing Calendarific API key (VITE_CALENDARIFIC_KEY).')
  }

  const response = await fetch(
    `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${countryCode}&year=${year}`,
  )
  const data = await response.json()

  if (!response.ok || data?.meta?.code !== 200) {
    throw new Error(data?.meta?.error_detail || `Could not load holidays for ${countryCode} ${year}`)
  }

  const rawHolidays = data?.response?.holidays || []
  const holidays = rawHolidays.map((h) => ({
    date: h.date.iso.slice(0, 10), // "2026-01-01"
    name: h.name,
  }))

  try {
    localStorage.setItem(cacheKey, JSON.stringify(holidays))
  } catch {
    // storage full or unavailable — non-fatal, just won't be cached
  }

  return holidays
}