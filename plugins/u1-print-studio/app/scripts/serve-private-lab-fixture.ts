import { createServer } from "node:http";
import { readFileSync } from "node:fs";

import { createStatusDashboardHandler } from "../src/lib/server/status-dashboard.js";

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
  if ((req.url === '/__test/thermals' || req.url === '/__test/percentage' || req.url === '/__test/fans' || req.url === '/__test/progress' || req.url === '/__test/bed-mesh' || req.url === '/__test/icon-segmented') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    const name = req.url === '/__test/icon-segmented' ? 'icon-segmented' : req.url === '/__test/thermals' ? 'thermals' : req.url === '/__test/fans' ? 'fans' : req.url === '/__test/progress' ? 'progress' : req.url === '/__test/bed-mesh' ? 'bed-mesh' : 'percentage';
    res.end(readFileSync(new URL(`../test-results/${name}-harness.html`, import.meta.url)));
    return;
  }
  if (!(await handle(req, res, url.pathname))) res.writeHead(404).end("Not Found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`private lab fixture listening on http://127.0.0.1:${port}`);
});
