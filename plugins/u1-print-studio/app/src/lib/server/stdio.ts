import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createAppServer } from "./app.js";
import { createCameraIceServerProvider } from "./camera-ice-config.js";
import {
  cameraMaxViewersFromEnvironment,
  createCameraRuntime,
  tailscaleHostAddresses,
} from "./camera-runtime.js";
import { readLocalConfig } from "./local-config.js";

export async function startStdioConnector(): Promise<void> {
  const config = readLocalConfig();
  const camera = createCameraRuntime({
    iceServerProvider: createCameraIceServerProvider(process.env, {
      configuredStunUrls: config.camera.stunUrls,
    }),
    maxViewers: cameraMaxViewersFromEnvironment(),
    downstreamAdditionalHostAddresses: tailscaleHostAddresses(),
  });
  const server = createAppServer({ cameraSessions: camera.controller });
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
