import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";

import { useAuthStore } from "@/modules/auth/store/auth.store";

interface TemperatureData {
  sn: string;
  temp: number;
  unit: string;
  ts: number;
}

type TemperatureMap = Record<string, TemperatureData>;

export const temperatureKeys = {
  all: ["temperatures"] as const,
  bySerialNumber: (sn: string) => [...temperatureKeys.all, sn] as const,
};

/**
 * Hook to manage WebSocket temperature data using TanStack Query
 * Provides a single source of truth for all temperature readings
 */
export const useTemperature = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore.getState().getToken();

  // Initialize query with empty temperature map
  const query = useQuery<TemperatureMap>({
    queryKey: temperatureKeys.all,
    queryFn: () => ({}),
    staleTime: Infinity, // Data is always fresh from WebSocket
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    // Connect to NestJS live-data WebSocket endpoint
    const socket: Socket = io("http://localhost:3000/live-data", {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectionAttempts: 10,
    });

    // Listen for temperature updates from MQTT
    socket.on("temperature-update", (data: TemperatureData) => {
      // Normalize timestamp - convert seconds to milliseconds if needed
      // If timestamp is in seconds (< year 2100 in seconds = 4102444800), convert to ms
      const normalizedTs = data.ts < 4102444800 ? data.ts * 1000 : data.ts;

      // Debug logging
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[Temperature Update]", {
          sn: data.sn,
          temp: data.temp,
          originalTs: data.ts,
          normalizedTs,
          tsDate: new Date(normalizedTs).toISOString(),
          now: Date.now(),
          nowDate: new Date(Date.now()).toISOString(),
        });
      }

      // Update the temperature map in the query cache with normalized timestamp
      // Each device serial number stores only its latest reading (replaces previous)
      queryClient.setQueryData<TemperatureMap>(temperatureKeys.all, (oldData = {}) => ({
        ...oldData,
        [data.sn]: { ...data, ts: normalizedTs },
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);

  return query;
};

/**
 * Hook to get temperature for a specific device serial number
 */
export const useTemperatureBySerialNumber = (serialNumber: string) => {
  const { data: temperatureMap = {} } = useTemperature();

  return useQuery({
    queryKey: temperatureKeys.bySerialNumber(serialNumber),
    queryFn: () => temperatureMap[serialNumber] ?? null,
    enabled: !!temperatureMap[serialNumber],
    staleTime: Infinity,
  });
};
