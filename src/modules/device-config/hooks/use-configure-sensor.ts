import { useMutation } from "@tanstack/react-query";

import { deviceConfigService } from "../services/device-config.service";
import type { ConfigureSensorPayload } from "../types/device-config.types";

interface ConfigureSensorArgs {
  sensorId: string;
  body: ConfigureSensorPayload;
}

export function useConfigureSensor() {
  return useMutation({
    mutationFn: ({ sensorId, body }: ConfigureSensorArgs) =>
      deviceConfigService.configureSensor(sensorId, body),
  });
}
