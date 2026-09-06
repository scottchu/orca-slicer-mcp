import { afterEach, describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createAppServer } from '../../src/lib/server/app.js';
import { t1BalancedCompositionSpec, t1EntityCardSpec, t1ExplicitGroupedSummarySpec, t1SmartGroupedSummarySpec } from '../../src/lib/composable/specs.js';
import { COMPOSABLE_LAB_RESOURCE_HTML, COMPOSABLE_LAB_RESOURCE_URI, composableToolOutputSchema, createComposableLabMcpServer } from '../../src/lib/server/composable-lab-mcp.js';
import { DASHBOARD_PAGES, routePolicy } from '../../src/lib/server/route-policy.js';

const observedAt = '2026-09-03T16:20:00.000Z';
const receivedAt = '2026-09-03T16:20:00.250Z';
const readers = {
  status: async () => ({ observedAt, receivedAt, heads: [{ id: 'T1', status: 'active', actualC: 215, targetC: 220 }] }),
  materials: async () => ({ observedAt, receivedAt, heads: [{ id: 'T1', color: '#E89B3C' }] }),
  environment: async () => ({ observedAt, receivedAt, relations: [{ headId: 'T1', fanId: 'part', label: 'Part cooling fan', role: 'partCooling' }] }),
};
const closeCallbacks: Array<() => Promise<void>> = [];
afterEach(async () => { await Promise.all(closeCallbacks.splice(0).map((close) => close())); });

const connect = async (lab: boolean): Promise<Client> => {
  const server = lab ? createComposableLabMcpServer(readers) : createAppServer();
  const client = new Client({ name: lab ? 'composable-lab-test' : 'production-negative-test', version: '1' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  closeCallbacks.push(async () => { await client.close(); await server.close(); });
  return client;
};

describe('isolated composable MCP proof', () => {
  test('explicit lab factory alone exposes one typed read-only tool and one closed resource', async () => {
    const client = await connect(true);
    expect(client.getServerVersion()).toMatchObject({ name: 'u1-composable-ui-experiment', version: '0.0.7-provisional' });
    const tools = (await client.listTools()).tools;
    expect(tools.map((tool) => tool.name)).toEqual(['compose_u1_entity_card_v2']);
    expect(tools[0].annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true });
    expect(tools[0]._meta).toMatchObject({ ui: { resourceUri: COMPOSABLE_LAB_RESOURCE_URI }, 'openai/outputTemplate': COMPOSABLE_LAB_RESOURCE_URI });
    expect(tools[0].inputSchema).toMatchObject({ type: 'object', additionalProperties: false, required: ['spec'] });
    expect(tools[0].outputSchema).toMatchObject({ type: 'object', additionalProperties: false, required: ['canonicalSpec', 'canonicalSpecSha256', 'viewModel'] });
    expect(JSON.stringify(tools[0].inputSchema)).not.toContain('PercentageFill');

    const resources = (await client.listResources()).resources;
    expect(resources.map((resource) => resource.uri)).toEqual([COMPOSABLE_LAB_RESOURCE_URI]);
    const resource = await client.readResource({ uri: COMPOSABLE_LAB_RESOURCE_URI });
    expect(resource.contents[0]).toMatchObject({ uri: COMPOSABLE_LAB_RESOURCE_URI, mimeType: 'text/html;profile=mcp-app' });
    expect((resource.contents[0] as { text: string }).text).toBe(COMPOSABLE_LAB_RESOURCE_HTML);
    expect(COMPOSABLE_LAB_RESOURCE_HTML).toContain('ui/initialize');
    expect(COMPOSABLE_LAB_RESOURCE_HTML).not.toContain(observedAt);
    expect(COMPOSABLE_LAB_RESOURCE_HTML).not.toContain('#E89B3C');
    expect(COMPOSABLE_LAB_RESOURCE_HTML).not.toContain('−100.0° / 500.0°');
    expect(COMPOSABLE_LAB_RESOURCE_HTML).not.toContain('Reported part fan');
    expect(COMPOSABLE_LAB_RESOURCE_HTML).not.toContain('PercentageFill');
    expect(COMPOSABLE_LAB_RESOURCE_HTML).not.toContain('PercentageSurface');

    const result = await client.callTool({ name: 'compose_u1_entity_card_v2', arguments: { spec: t1EntityCardSpec } });
    expect(result.isError).not.toBe(true);
    expect(result.content).toEqual([{ type: 'text', text: 'Provisional T1 v2 composition ready.' }]);
    expect(result.structuredContent).toMatchObject({ canonicalSpec: t1EntityCardSpec, viewModel: { schemaVersion: 2, state: 'ready', subject: { kind: 'toolHead', id: 'T1' } } });
    expect(JSON.stringify(result.structuredContent)).not.toContain('PercentageFill');
    expect(composableToolOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    const balanced = await client.callTool({ name: 'compose_u1_entity_card_v2', arguments: { spec: t1BalancedCompositionSpec } });
    expect(balanced.isError).not.toBe(true);
    expect(balanced.structuredContent).toMatchObject({ canonicalSpec: t1BalancedCompositionSpec, viewModel: { root: { tint: null, children: [{ type: 'Inline' }, { type: 'Grid', arrangement: 'lead' }] } } });
    for (const [spec, layoutSource] of [[t1SmartGroupedSummarySpec, 'smart'], [t1ExplicitGroupedSummarySpec, 'explicit']] as const) {
      const grouped = await client.callTool({ name: 'compose_u1_entity_card_v2', arguments: { spec } });
      expect(grouped.isError).not.toBe(true);
      expect(grouped.structuredContent).toMatchObject({
        canonicalSpec: spec,
        viewModel: { root: { tint: null, children: [
          { type: 'Group', relation: 'identity', layoutSource: 'smart', defaultRule: 'identity-packed-v1' },
          { type: 'Group', relation: 'summary', layoutSource, defaultRule: 'summary-grid6-v1', tracks: 6 },
        ] } },
      });
    }
    const rejected = await client.callTool({ name: 'compose_u1_entity_card_v2', arguments: { spec: { ...t1EntityCardSpec, javascript: 'alert(1)' } } });
    expect(rejected.isError).toBe(true);
    const rejectedV1 = await client.callTool({ name: 'compose_u1_entity_card_v2', arguments: { spec: { ...t1EntityCardSpec, schemaVersion: 1 } } });
    expect(rejectedV1.isError).toBe(true);
  });

  test('production factory inventory contains neither lab tool nor lab resource', async () => {
    const client = await connect(false);
    expect((await client.listTools()).tools.map((tool) => tool.name)).not.toContain('compose_u1_entity_card_v2');
    expect((await client.listResources()).resources.map((resource) => resource.uri)).not.toContain(COMPOSABLE_LAB_RESOURCE_URI);
    expect((await client.listResources()).resources.map((resource) => resource.uri)).not.toContain('ui://u1-print-studio/experiments/composable-lab-v1.html');
  });

  test('keeps route and imports private, dashboard-only, and without printer authority', () => {
    expect(DASHBOARD_PAGES.has('/dashboard/lab/composition')).toBe(true);
    expect(routePolicy('/dashboard/lab/composition', true, false, false)).toEqual({ kind: 'page', methods: ['GET'], deniedMethod: 405 });
    expect(routePolicy('/dashboard/lab/composition', false, false, false)).toBeNull();
    expect(routePolicy('/dashboard/composition', true, false, false)).toBeNull();

    const productionSources = ['app.ts', 'mcp-http.ts', 'stdio.ts'].map((name) => readFileSync(new URL(`../../src/lib/server/${name}`, import.meta.url), 'utf8')).join('\n');
    expect(productionSources).not.toContain('composable-lab-mcp');
    expect(productionSources).not.toContain('createComposableLabMcpServer');

    const experimentSources = [
      ...readdirSync(new URL('../../src/lib/composable/', import.meta.url)).filter((name) => name.endsWith('.ts'))
        .map((name) => readFileSync(new URL(`../../src/lib/composable/${name}`, import.meta.url), 'utf8')),
      ...readdirSync(new URL('../../src/components/composable/', import.meta.url)).filter((name) => name.endsWith('.svelte'))
        .map((name) => readFileSync(new URL(`../../src/components/composable/${name}`, import.meta.url), 'utf8')),
    ].join('\n');
    expect(experimentSources).not.toMatch(/\b(?:fetch|WebSocket|XMLHttpRequest|RTCPeerConnection)\s*\(/u);
    expect(experimentSources).not.toMatch(/(?:auth|tailscale|printer-command|start_print|cancel_print)/iu);
    expect(experimentSources).not.toContain('{@html');
    expect(experimentSources).not.toContain('<svelte:element');

    const domainLeafSources = ['HeadStatus.svelte', 'HeadTemperature.svelte', 'FilamentColor.svelte', 'FanRelation.svelte']
      .map((name) => readFileSync(new URL(`../../src/components/composable/${name}`, import.meta.url), 'utf8')).join('\n');
    expect(domainLeafSources).not.toContain('reserveDisplay');
    expect(domainLeafSources).not.toMatch(/#E89B3C|−100\.0°|500\.0°|Reported part fan/u);
    expect(domainLeafSources).toContain('reserveLines={2}');
    const statusLineSource = readFileSync(new URL('../../src/components/common/StatusLine.svelte', import.meta.url), 'utf8');
    expect(statusLineSource).not.toMatch(/reserve(?:Text|Display)|data-reserve|content:\s*attr/iu);
  });
});
