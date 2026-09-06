import { readFileSync } from 'node:fs';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import embeddedComposableLabFile from '../../../public/mcp-composable-lab-v2.html' with { type: 'file' };
import { composableEnvelopeSchema, composableEnvelopeWireSchema } from '../composable/envelope.js';
import { presentationSpecSchema } from '../composable/schema.js';
import { composeEntityCardEnvelope, type ComposableReaders } from './composable-presentation.js';

export const COMPOSABLE_LAB_RESOURCE_URI = 'ui://u1-print-studio/experiments/composable-lab-v2-r5.html';
export const COMPOSABLE_LAB_RESOURCE_HTML = readFileSync(embeddedComposableLabFile as unknown as string, 'utf8');
export const composableToolOutputSchema = composableEnvelopeSchema;

/** Isolated protocol proof. Production createAppServer never constructs or registers this server. */
export const createComposableLabMcpServer = (readers: ComposableReaders): McpServer => {
  const server = new McpServer({ name: 'u1-composable-ui-experiment', version: '0.0.7-provisional' });
  registerAppResource(server, 'u1-composable-lab', COMPOSABLE_LAB_RESOURCE_URI, {}, async () => ({ contents: [{
    uri: COMPOSABLE_LAB_RESOURCE_URI,
    mimeType: RESOURCE_MIME_TYPE,
    text: COMPOSABLE_LAB_RESOURCE_HTML,
    _meta: { ui: { prefersBorder: false, csp: { connectDomains: [], resourceDomains: [], frameDomains: [] } }, 'openai/widgetDescription': 'Provisional closed-node U1 entity composition.' },
  }] }));
  registerAppTool(server, 'compose_u1_entity_card_v2', ({
    title: 'Compose U1 entity card v2',
    description: 'Validate and render the provisional read-only v2 presentation AST for the fixed T1 entity.',
    inputSchema: z.object({ spec: presentationSpecSchema }).strict(),
    outputSchema: composableEnvelopeWireSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true },
    _meta: { ui: { resourceUri: COMPOSABLE_LAB_RESOURCE_URI }, 'openai/outputTemplate': COMPOSABLE_LAB_RESOURCE_URI },
  } as any), (async ({ spec }: { spec: unknown }) => {
    const structuredContent = composableToolOutputSchema.parse(await composeEntityCardEnvelope(spec, readers));
    return { content: [{ type: 'text' as const, text: 'Provisional T1 v2 composition ready.' }], structuredContent };
  }) as any);
  return server;
};
