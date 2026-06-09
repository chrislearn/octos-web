/**
 * Weather hook — fetches current weather from Open-Meteo.
 *
 * Location resolution waterfall:
 *   1. Browser Geolocation API
 *   2. IP-based geolocation (ipapi.co)
 *   3. Hardcoded default (San Francisco)
 *
 * Refreshes every 15 minutes. Never shows "unavailable" — the
 * default-city fallback guarantees a result.
 */

import { useState, useEffect, useRef } from "react";
import { WMO_WEATHER, DEFAULT_LOCATION } from "./constants";

export interface WeatherState {
  temperature: number;
  weatherCode: number;
  emoji: string;
  label: string;
  city: string | null;
  loading: boolean;
  error: string | null;
}

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 min

interface ResolvedLocation {
  lat: number;
  lon: number;
  city: string | null;
}

async function fetchWeather(
  lat: number,
  lon: number,
): Promise<{ temperature: number; weatherCode: number }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    current: { temperature_2m: number; weather_code: number };
  };
  return {
    temperature: Math.round(data.current.temperature_2m),
    weatherCode: data.current.weather_code,
  };
}

/** Attempt IP-based geolocation via ipapi.co. */
async function fetchIpLocation(): Promise<ResolvedLocation> {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error(`IP geolocation HTTP ${res.status}`);
  const data = (await res.json()) as {
    latitude: number;
    longitude: number;
    city?: string;
  };
  if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    throw new Error("IP geolocation returned invalid coordinates");
  }
  return { lat: data.latitude, lon: data.longitude, city: data.city ?? null };
}

export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({
    temperature: 0,
    weatherCode: 0,
    emoji: "",
    label: "",
    city: null,
    loading: true,
    error: null,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const locationRef = useRef<ResolvedLocation | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(loc: ResolvedLocation) {
      try {
        const w = await fetchWeather(loc.lat, loc.lon);
        if (cancelled) return;
        const wmo = WMO_WEATHER[w.weatherCode] ?? {
          emoji: "\u2600\uFE0F",
          label: "Unknown",
        };
        setState({
          temperature: w.temperature,
          weatherCode: w.weatherCode,
          emoji: wmo.emoji,
          label: wmo.label,
          city: loc.city,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "fetch failed",
        }));
      }
    }

    async function resolveLocation(): Promise<ResolvedLocation> {
      // 1. Try browser geolocation
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("geolocation_unsupported"));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 5 * 60 * 1000,
          });
        });
        return {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: null,
        };
      } catch {
        // Geolocation denied or unavailable — try IP fallback
      }

      // 2. Try IP-based geolocation
      try {
        return await fetchIpLocation();
      } catch {
        // IP geolocation also failed — use default
      }

      // 3. Hardcoded default
      return {
        lat: DEFAULT_LOCATION.lat,
        lon: DEFAULT_LOCATION.lon,
        city: DEFAULT_LOCATION.city,
      };
    }

    void (async () => {
      const loc = await resolveLocation();
      if (cancelled) return;
      locationRef.current = loc;
      await load(loc);
    })();

    timerRef.current = setInterval(() => {
      if (locationRef.current) {
        void load(locationRef.current);
      }
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
    };
  }, []);

  return state;
}
