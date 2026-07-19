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
    // Ignore cache errors
  }

  const API_KEY = import.meta.env.VITE_CALENDARIFIC_API_KEY

  const response = await fetch(
    `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${countryCode}&year=${year}`
  )

  if (!response.ok) {
    throw new Error(`Could not load holidays for ${countryCode}`)
  }

  const data = await response.json()

  const holidays = (data.response?.holidays || []).map((holiday) => ({
    date: holiday.date.iso,
    name: holiday.name,
  }))

  try {
    localStorage.setItem(cacheKey, JSON.stringify(holidays))
  } catch {
    // Ignore cache write errors
  }

  return holidays
}