import type { WeatherLocation } from './types'

export interface HourlyForecast {
  time: string
  temp: number
  weatherCode: number
}

export interface DailyForecast {
  date: string
  max: number
  min: number
  weatherCode: number
}

export interface WeatherSnapshot {
  temperature: number
  feelsLike: number
  humidity: number
  weatherCode: number
  windSpeed: number
  high: number
  low: number
  hourly: HourlyForecast[]
  daily: DailyForecast[]
}

const WMO: Record<number, { en: string; am: string }> = {
  0: { en: 'Clear', am: 'ፀሐያማ' },
  1: { en: 'Mainly clear', am: 'በአብዛኛው ፀሐያማ' },
  2: { en: 'Partly cloudy', am: 'በከፊል ደመናማ' },
  3: { en: 'Overcast', am: 'ደመናማ' },
  45: { en: 'Fog', am: 'ጭጋግ' },
  48: { en: 'Rime fog', am: 'ጭጋግ' },
  51: { en: 'Light drizzle', am: 'ቀላል ርጥበት' },
  53: { en: 'Drizzle', am: 'ርጥበት' },
  55: { en: 'Dense drizzle', am: 'ከባድ ርጥበት' },
  56: { en: 'Freezing drizzle', am: 'ቀዝቃዛ ርጥበት' },
  57: { en: 'Freezing drizzle', am: 'ቀዝቃዛ ርጥበት' },
  61: { en: 'Light rain', am: 'ቀላል ዝናብ' },
  63: { en: 'Rain', am: 'ዝናብ' },
  65: { en: 'Heavy rain', am: 'ከባድ ዝናብ' },
  66: { en: 'Freezing rain', am: 'ቀዝቃዛ ዝናብ' },
  67: { en: 'Freezing rain', am: 'ቀዝቃዛ ዝናብ' },
  71: { en: 'Light snow', am: 'ቀላል በረዶ' },
  73: { en: 'Snow', am: 'በረዶ' },
  75: { en: 'Heavy snow', am: 'ከባድ በረዶ' },
  77: { en: 'Snow grains', am: 'በረዶ' },
  80: { en: 'Light showers', am: 'ቀላል ዝናብ ገላ' },
  81: { en: 'Showers', am: 'ዝናብ ገላ' },
  82: { en: 'Heavy showers', am: 'ከባድ ዝናብ ገላ' },
  85: { en: 'Snow showers', am: 'የበረዶ ዝናብ' },
  86: { en: 'Heavy snow showers', am: 'ከባድ የበረዶ ዝናብ' },
  95: { en: 'Thunderstorm', am: 'ነጎድጓድ' },
  96: { en: 'Thunderstorm', am: 'ነጎድጓድ' },
  99: { en: 'Thunderstorm', am: 'ነጎድጓድ' },
}

function resolveWmoEntry(code: number): { en: string; am: string } | undefined {
  if (WMO[code]) return WMO[code]
  if (code >= 51 && code <= 57) return WMO[51]
  if (code >= 61 && code <= 67) return WMO[61]
  if (code >= 71 && code <= 77) return WMO[71]
  if (code >= 80 && code <= 82) return WMO[80]
  if (code === 85 || code === 86) return WMO[85]
  if (code >= 95 && code <= 99) return WMO[95]
  return undefined
}

export function weatherLabel(code: number, lang: 'en' | 'am'): string {
  const entry = resolveWmoEntry(code)
  if (!entry) return lang === 'am' ? 'አየር' : 'Weather'
  return lang === 'am' ? entry.am : entry.en
}

export async function fetchWeather(
  location: WeatherLocation,
): Promise<WeatherSnapshot> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(location.latitude))
  url.searchParams.set('longitude', String(location.longitude))
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
  )
  url.searchParams.set('hourly', 'temperature_2m,weather_code')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '5')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather request failed')
  const data = await res.json()

  // Get current hour index
  const currentHour = new Date().getHours()
  const hourlyForecasts: HourlyForecast[] = []
  
  // Extract next 12 hours from current hour
  for (let i = 0; i < 12; i++) {
    const idx = currentHour + i
    if (data.hourly && data.hourly.time[idx] !== undefined) {
      hourlyForecasts.push({
        time: data.hourly.time[idx],
        temp: data.hourly.temperature_2m[idx],
        weatherCode: data.hourly.weather_code[idx],
      })
    }
  }

  // Extract 5-day daily forecast
  const dailyForecasts: DailyForecast[] = []
  for (let i = 0; i < 5; i++) {
    if (data.daily && data.daily.time[i] !== undefined) {
      dailyForecasts.push({
        date: data.daily.time[i],
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        weatherCode: data.daily.weather_code[i] ?? data.current.weather_code,
      })
    }
  }

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    high: data.daily.temperature_2m_max[0],
    low: data.daily.temperature_2m_min[0],
    hourly: hourlyForecasts,
    daily: dailyForecasts,
  }
}

export async function searchCities(
  query: string,
): Promise<WeatherLocation[]> {
  if (!query.trim()) return []
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', query.trim())
  url.searchParams.set('count', '6')
  url.searchParams.set('language', 'en')
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  if (!data.results) return []
  return data.results.map(
    (r: {
      name: string
      latitude: number
      longitude: number
      country?: string
      admin1?: string
    }) => ({
      name: r.admin1 ? `${r.name}, ${r.admin1}` : r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
    }),
  )
}

export function convertTemp(celsius: number, unit: 'celsius' | 'fahrenheit') {
  if (unit === 'fahrenheit') return Math.round((celsius * 9) / 5 + 32)
  return Math.round(celsius)
}
