import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createAppServer } from "./app.js";

const server = createAppServer();
const transport = new StdioServerTransport();

await server.connect(transport);
