import { registerAppTool } from '@modelcontextprotocol/ext-apps/server';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema, type CallToolResult, type ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { toJsonSchemaCompat } from '@modelcontextprotocol/sdk/server/zod-json-schema-compat.js';
import { z } from 'zod';

type SecurityScheme = { type: 'oauth2'; scopes: string[] };
type InputSchema = z.ZodRawShape | z.AnyZodObject;
type Input<S extends InputSchema> = S extends z.AnyZodObject ? z.output<S> : S extends z.ZodRawShape ? z.output<z.ZodObject<S>> : never;
type ToolDeclaration<S extends InputSchema> = {
  title: string;
  description: string;
  inputSchema: S;
  outputSchema?: z.AnyZodObject;
  annotations: ToolAnnotations;
  securitySchemes?: SecurityScheme[];
  _meta?: Record<string, unknown>;
};

// Erase the SDK's Zod 3/4/Standard-Schema overload once, after the concrete
// declaration and handler were paired by register<S>. No caller uses this edge.
const registerSdkTool = registerAppTool as unknown as (
  server: McpServer, name: string, declaration: unknown, handler: unknown,
) => void;

// Preserve the existing OAuth catalog order independently of registration order.
const compatibilityOrder = ['get_printer_snapshot', 'open_printer_view', 'refresh_printer_observation', 'get_u1_camera_frame', 'open_printer_camera',
  'open_u1_camera_stream', 'answer_u1_camera_stream', 'add_u1_camera_ice_candidates', 'close_u1_camera_stream'];

// The existing OAuth wire catalog represents constrained nullable primitives as
// a type array; pinned Zod emits anyOf for them. Preserve that representation
// without duplicating the field's validation limits or changing SDK calls.
const compatibilitySchema = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(compatibilitySchema);
  if (!value || typeof value !== 'object') return value;
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, compatibilitySchema(item)]));
  const union = result.anyOf;
  if (Array.isArray(union) && union.length === 2) {
    const [primitive, nullable] = union as Record<string, unknown>[];
    if (Object.keys(result).length === 1 && Object.keys(nullable).length === 1 && nullable.type === 'null' &&
        ['string', 'number', 'integer', 'boolean'].includes(String(primitive.type))) {
      return { ...primitive, type: [primitive.type, 'null'] };
    }
  }
  return result;
};

/** One declaration feeds SDK registration and its existing OAuth list mirror. */
export const createToolRegistration = (server: McpServer, oauth: boolean) => {
  const descriptors: Array<Record<string, unknown> & { name: string }> = [];
  const register = <S extends InputSchema>(
    name: string,
    declaration: ToolDeclaration<S>,
    handler: (args: Input<S>, extra: { signal: AbortSignal }) => Promise<CallToolResult> | CallToolResult,
  ): void => {
    const schema = declaration.inputSchema instanceof z.ZodObject ? declaration.inputSchema : z.object(declaration.inputSchema);
    const convert = toJsonSchemaCompat as (schema: unknown) => Record<string, unknown>;
    const { $schema: _dialect, ...inputSchema } = convert(schema);
    const output = declaration.outputSchema ? convert(declaration.outputSchema) : undefined;
    if (output) delete output.$schema;
    descriptors.push({ name, ...declaration, inputSchema: compatibilitySchema(inputSchema),
      ...(output ? { outputSchema: output } : {}) });
    // The pinned ext-apps/SDK generic spans Zod 3/4 and Standard Schema. The
    // concrete declaration/handler pair is checked above; erase only here.
    if (declaration._meta?.ui) registerSdkTool(server, name, declaration, handler);
    else {
      // Tool-only intents have no Apps UI metadata. ext-apps 1.7.5 requires it;
      // the same declaration goes directly to the standard SDK for these tools.
      const registerPlain = server.registerTool.bind(server) as unknown as (name: string, declaration: unknown, handler: unknown) => void;
      registerPlain(name, declaration, handler);
    }
  };
  const finish = (): void => {
    if (!oauth) return;
    // Keep the top-level securitySchemes compatibility mirror. Do not rely on
    // visibility hints as enforcement or expose a second manually owned schema.
    const tools = [...descriptors].sort((a, b) => compatibilityOrder.indexOf(a.name) - compatibilityOrder.indexOf(b.name));
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  };
  return { register, finish };
};
