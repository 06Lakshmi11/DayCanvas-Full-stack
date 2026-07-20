const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const CACHE_PREFIX = 'calendar-notes:holidays:'

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

export async function fetchHolidays(year, countryCode) {
  const cacheKey = `${CACHE_PREFIX}${countryCode}:${year}`

  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {
    // ignore cache read errors
  }

  const response = await fetch(`${API_BASE}/holidays?country=${countryCode}&year=${year}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || `Could not load holidays for ${countryCode} ${year}`)
  }

  const holidays = data.holidays || []

  try {
    localStorage.setItem(cacheKey, JSON.stringify(holidays))
  } catch {
    // storage full or unavailable
  }

  return holidays
}