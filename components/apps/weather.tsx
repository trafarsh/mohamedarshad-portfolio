"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudLightning,
  CloudFog,
  Sun,
  RefreshCw,
  WifiOff,
} from "lucide-react"
import { useSystem } from "@/components/system-context"

interface WeatherProps {
  isDarkMode?: boolean
}

interface Place {
  name: string
  country?: string
  latitude: number
  longitude: number
}

type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "foggy" | "rainy" | "stormy" | "snowy"

interface Forecast {
  current: {
    temp: number
    feelsLike: number
    humidity: number
    windSpeed: number
    code: number
  }
  sunrise: string
  sunset: string
  daily: { date: string; max: number; min: number; code: number }[]
}

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

const POPULAR_CITIES: Place[] = [
  { name: "Coimbatore", country: "India", latitude: 11.0168, longitude: 76.9558 },
  { name: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707 },
  { name: "London", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
]

// WMO weather interpretation codes used by Open-Meteo
function describe(code: number): { label: string; condition: WeatherCondition } {
  if (code === 0) return { label: "Clear Sky", condition: "sunny" }
  if (code === 1) return { label: "Mainly Clear", condition: "sunny" }
  if (code === 2) return { label: "Partly Cloudy", condition: "partly-cloudy" }
  if (code === 3) return { label: "Overcast", condition: "cloudy" }
  if (code === 45 || code === 48) return { label: "Fog", condition: "foggy" }
  if (code >= 51 && code <= 57) return { label: "Drizzle", condition: "rainy" }
  if (code >= 61 && code <= 67) return { label: "Rain", condition: "rainy" }
  if (code >= 71 && code <= 77) return { label: "Snow", condition: "snowy" }
  if (code >= 80 && code <= 82) return { label: "Rain Showers", condition: "rainy" }
  if (code === 85 || code === 86) return { label: "Snow Showers", condition: "snowy" }
  if (code >= 95) return { label: "Thunderstorm", condition: "stormy" }
  return { label: "Cloudy", condition: "cloudy" }
}

function ConditionIcon({ code, className = "w-6 h-6" }: { code: number; className?: string }) {
  const { condition } = describe(code)
  switch (condition) {
    case "sunny":
      return <Sun className={`${className} text-yellow-400`} />
    case "partly-cloudy":
      return <CloudSun className={`${className} text-yellow-300`} />
    case "rainy":
      return <CloudRain className={`${className} text-blue-400`} />
    case "stormy":
      return <CloudLightning className={`${className} text-purple-400`} />
    case "snowy":
      return <CloudSnow className={`${className} text-sky-200`} />
    case "foggy":
      return <CloudFog className={`${className} text-gray-400`} />
    default:
      return <Cloud className={`${className} text-gray-400`} />
  }
}

// Open-Meteo returns local times like "2026-09-30T06:12"
const formatClock = (isoLocal: string) => {
  const [hours, minutes] = (isoLocal.split("T")[1] ?? "0:0").split(":").map(Number)
  const suffix = hours >= 12 ? "PM" : "AM"
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`
}

const formatDay = (date: string, index: number) => {
  if (index === 0) return "Today"
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" })
}

async function fetchForecast(place: Place, signal?: AbortSignal): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: "6",
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal })
  if (!response.ok) throw new Error("Weather request failed")
  const data = await response.json()

  return {
    current: {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      code: data.current.weather_code,
    },
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      code: data.daily.weather_code[i],
    })),
  }
}

export default function Weather({ isDarkMode = true }: WeatherProps) {
  const { wifiEnabled } = useSystem()
  const [place, setPlace] = useState<Place>(POPULAR_CITIES[0])
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchError, setSearchError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const condition: WeatherCondition = forecast ? describe(forecast.current.code).condition : "partly-cloudy"

  const bgColor = isDarkMode ? "bg-gray-900" : "bg-gray-100"
  const textColor = isDarkMode ? "text-white" : "text-gray-800"
  const cardBg = isDarkMode ? "bg-gray-800/80" : "bg-white/80"
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-500"

  // Load the forecast whenever the place changes
  useEffect(() => {
    if (!wifiEnabled) return
    const controller = new AbortController()
    setStatus("loading")

    fetchForecast(place, controller.signal)
      .then((result) => {
        setForecast(result)
        setStatus("ready")
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error")
      })

    return () => controller.abort()
  }, [place, wifiEnabled, reloadKey])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    setIsSearching(true)
    setSearchError("")
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
      )
      const data = await response.json()
      const result = data.results?.[0]
      if (!result) {
        setSearchError(`No city found for “${query}”`)
      } else {
        setPlace({ name: result.name, country: result.country, latitude: result.latitude, longitude: result.longitude })
        setSearchQuery("")
      }
    } catch {
      setSearchError("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const createParticles = useCallback(
    (weather: WeatherCondition): Particle[] => {
      const count = { rainy: 100, stormy: 120, snowy: 80, sunny: 40, "partly-cloudy": 18, cloudy: 26, foggy: 30 }[weather]

      return Array.from({ length: count }, () => {
        if (weather === "rainy" || weather === "stormy") {
          return {
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            speedX: Math.random() - 0.5,
            speedY: Math.random() * 7 + 10,
            color: isDarkMode ? "rgba(120, 160, 255, 0.6)" : "rgba(0, 90, 190, 0.45)",
          }
        }
        if (weather === "snowy") {
          return {
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 2,
            speedX: Math.random() - 0.5,
            speedY: Math.random() + 1,
            color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(148, 163, 184, 0.8)",
          }
        }
        if (weather === "sunny") {
          return {
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: `rgba(255, ${200 + Math.random() * 55}, 0, ${Math.random() * 0.4 + 0.2})`,
          }
        }
        // Clouds and fog
        return {
          x: Math.random() * 130 - 15,
          y: weather === "foggy" ? Math.random() * 100 : Math.random() * 30,
          size: Math.random() * 30 + 20,
          speedX: Math.random() * 0.2 - 0.1,
          speedY: 0,
          color: isDarkMode ? "rgba(200, 200, 220, 0.12)" : "rgba(255, 255, 255, 0.6)",
        }
      })
    },
    [isDarkMode],
  )

  // Animated weather effects on the background canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const particles = createParticles(condition)
    let frame = 0

    // Match the canvas to the window size, including when the window is resized
    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const animate = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        const x = (p.x / 100) * width
        const y = (p.y / 100) * height
        ctx.beginPath()

        if (condition === "rainy" || condition === "stormy") {
          ctx.strokeStyle = p.color
          ctx.lineWidth = p.size / 2
          ctx.moveTo(x, y)
          ctx.lineTo(x + p.speedX, y + p.size * 4)
          ctx.stroke()
        } else {
          ctx.fillStyle = p.color
          ctx.arc(x, y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }

        p.x += p.speedX * 0.1
        p.y += p.speedY * 0.1

        if (condition === "rainy" || condition === "stormy" || condition === "snowy") {
          if (p.y > 100) {
            p.y = 0
            p.x = Math.random() * 100
          }
          if (p.x < 0 || p.x > 100) p.x = Math.random() * 100
        } else if (condition === "sunny") {
          if (p.x < 0) p.x = 100
          if (p.x > 100) p.x = 0
          if (p.y < 0) p.y = 100
          if (p.y > 100) p.y = 0
        } else {
          if (p.x < -30) p.x = 130
          if (p.x > 130) p.x = -30
        }
      }

      frame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [condition, createParticles])

  const renderBody = () => {
    if (!wifiEnabled) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <WifiOff className={`w-12 h-12 mb-3 ${mutedText}`} />
          <p className="font-medium">You&apos;re offline</p>
          <p className={`text-sm ${mutedText}`}>Turn Wi-Fi back on to see the latest weather.</p>
        </div>
      )
    }

    if (status === "error") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Cloud className={`w-12 h-12 mb-3 ${mutedText}`} />
          <p className="font-medium mb-3">Couldn&apos;t load the weather</p>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )
    }

    if (!forecast) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className={`w-8 h-8 animate-spin ${mutedText}`} />
        </div>
      )
    }

    const { current } = forecast

    return (
      <div className={`transition-opacity ${status === "loading" ? "opacity-50" : "opacity-100"}`}>
        {/* Current weather */}
        <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              <h2 className="text-2xl font-bold">{place.name}</h2>
            </div>
            {place.country && <p className={`${mutedText} text-sm mt-1`}>{place.country}</p>}

            <div className="flex items-center mt-4">
              <div className="text-6xl font-light mr-4 tabular-nums">{current.temp}°</div>
              <div>
                <p className="text-lg flex items-center gap-2">
                  <ConditionIcon code={current.code} className="w-5 h-5" />
                  {describe(current.code).label}
                </p>
                <p className={`text-sm ${mutedText}`}>Feels like {current.feelsLike}°</p>
                <p className={`text-sm ${mutedText}`}>
                  H:{forecast.daily[0]?.max}° L:{forecast.daily[0]?.min}°
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardBg} backdrop-blur p-4 rounded-lg border ${borderColor} grid grid-cols-2 gap-4 w-full md:w-auto`}>
            {[
              { icon: <Droplets className="w-5 h-5 text-blue-500" />, label: "Humidity", value: `${current.humidity}%` },
              { icon: <Wind className="w-5 h-5 text-blue-500" />, label: "Wind", value: `${current.windSpeed} km/h` },
              { icon: <Sunrise className="w-5 h-5 text-orange-500" />, label: "Sunrise", value: formatClock(forecast.sunrise) },
              { icon: <Sunset className="w-5 h-5 text-orange-500" />, label: "Sunset", value: formatClock(forecast.sunset) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.icon}
                <div>
                  <p className={`text-sm ${mutedText}`}>{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast */}
        <div className="px-6 mt-2">
          <h3 className="text-lg font-medium mb-3">{forecast.daily.length}-Day Forecast</h3>
          <div className={`grid grid-cols-3 sm:grid-cols-6 gap-2 ${cardBg} backdrop-blur rounded-lg border ${borderColor} p-4`}>
            {forecast.daily.map((day, index) => (
              <div key={day.date} className="flex flex-col items-center">
                <p className="font-medium text-sm">{formatDay(day.date, index)}</p>
                <div className="my-2">
                  <ConditionIcon code={day.code} />
                </div>
                <p className="font-medium tabular-nums">{day.max}°</p>
                <p className={`text-xs ${mutedText} tabular-nums`}>{day.min}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full ${bgColor} ${textColor} flex flex-col relative overflow-hidden`}>
      {/* Canvas for weather effects */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col h-full overflow-auto">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="p-4 pb-1 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search any city..."
              aria-label="Search city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-9 rounded-md pl-9 pr-3 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <button
            type="submit"
            disabled={isSearching || !wifiEnabled}
            className="h-9 px-4 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium"
          >
            {isSearching ? "Searching…" : "Search"}
          </button>
        </form>
        <p className="px-4 min-h-5 text-xs text-red-500">{searchError}</p>

        {renderBody()}

        {/* City selector */}
        <div className="px-6 mt-6 pb-6">
          <h3 className="text-lg font-medium mb-3">Popular Cities</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  setSearchError("")
                  setPlace(city)
                }}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  place.name === city.name
                    ? "bg-blue-500 border-blue-500 text-white"
                    : isDarkMode
                      ? "border-gray-700 bg-gray-800/70 hover:bg-gray-700"
                      : "border-gray-300 bg-white/70 hover:bg-white"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
          <p className={`text-[11px] ${mutedText} mt-4`}>
            Weather data by{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline">
              Open-Meteo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
