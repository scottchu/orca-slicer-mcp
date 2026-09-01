import { createServer } from "node:http";

import { createStatusDashboardHandler } from "../../src/status-dashboard.js";

const unavailable = async (): Promise<never> => {
  throw new Error("Static private lab fixture must not acquire printer data");
};
const handle = createStatusDashboardHandler({
  readStatus: unavailable,
  readCameraFrame: unavailable,
});
const port = Number(process.env.PORT ?? "4179");
const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (!(await handle(req, res, url.pathname))) res.writeHead(404).end("Not Found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`private lab fixture listening on http://127.0.0.1:${port}`);
});
