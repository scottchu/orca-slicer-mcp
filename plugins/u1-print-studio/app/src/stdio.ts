import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createAppServer } from "./app.js";
import { createCameraRuntime } from "./camera-runtime.js";

export async function startStdioConnector(): Promise<void> {
  const camera = createCameraRuntime();
  const server = createAppServer({ cameraSessions: camera.controller });
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
