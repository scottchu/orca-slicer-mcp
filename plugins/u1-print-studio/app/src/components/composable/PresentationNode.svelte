<script lang="ts">
  import type { ResolvedNode } from '../../lib/composable/view-model';
  import Card from '../common/Card.svelte';
  import Title from '../common/Title.svelte';
  import Table from '../common/Table.svelte';
  import Row from '../common/Row.svelte';
  import HeadStatus from './HeadStatus.svelte';
  import HeadTemperature from './HeadTemperature.svelte';
  import FilamentColor from './FilamentColor.svelte';
  import FanRelation from './FanRelation.svelte';
  import PresentationNode from './PresentationNode.svelte';

  let { node, subjectLabel = 'Tool head T1', busy = false }: { node: ResolvedNode; subjectLabel?: string; busy?: boolean } = $props();
</script>

{#if node.type === 'Card'}
  <Card label={subjectLabel} {busy} tint={node.tint?.color ?? null}>
    {#each node.children as child}<PresentationNode node={child} {subjectLabel} {busy} />{/each}
  </Card>
{:else if node.type === 'Title'}
  <Title text={node.text} />
{:else if node.type === 'Table'}
  <Table>{#each node.children as child}<PresentationNode node={child} {subjectLabel} {busy} />{/each}</Table>
{:else if node.type === 'Row'}
  <Row>{#each node.children as child}<PresentationNode node={child} {subjectLabel} {busy} />{/each}</Row>
{:else if node.type === 'HeadStatus'}
  <HeadStatus value={node.value} />
{:else if node.type === 'HeadTemperature'}
  <HeadTemperature value={node.value} />
{:else if node.type === 'FilamentColor'}
  <FilamentColor value={node.value} />
{:else if node.type === 'FanRelation'}
  <FanRelation value={node.value} />
{/if}
