import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createAppServer } from "./app.js";
import { createCameraIceServerProvider } from "./camera-ice-config.js";
import { createCameraRuntime } from "./camera-runtime.js";
import { readLocalConfig } from "./local-config.js";

export async function startStdioConnector(): Promise<void> {
  const config = readLocalConfig();
  const camera = createCameraRuntime({
    iceServerProvider: createCameraIceServerProvider(process.env, {
      configuredStunUrls: config.camera.stunUrls,
    }),
  });
  const server = createAppServer({ cameraSessions: camera.controller });
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
