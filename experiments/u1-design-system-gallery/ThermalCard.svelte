<script lang="ts">
import DegreeValue from '@common/DegreeValue.svelte';
import ActualTarget from '@observation/ActualTarget.svelte';
import ReadingRow from '@common/ReadingRow.svelte';
import ObservedMeta from '@observation/ObservedMeta.svelte';
let { proposal, phase, scenario }: { proposal: boolean; phase: string; scenario: string } = $props();
const masked = $derived(['loading','failure','retry'].includes(phase));
const busy = $derived(['loading','refresh','retry'].includes(phase));
const rows = $derived(scenario === 'zero' ? [{name:'Tool 1', actual:0,target:0,active:true},{name:'Bed',actual:42,target:0,active:false}] : scenario === 'missing' ? [{name:'Tool 1',actual:null,target:210,active:false},{name:'Bed',actual:55,target:null,active:false}] : scenario === 'extreme' ? [{name:'Tool 1',actual:-12.5,target:0,active:false},{name:'Bed',actual:1e30,target:60,active:false}] : [{name:'Tool 1',actual:205.5,target:210,active:true},{name:'Bed',actual:59.2,target:60,active:false}]);
const cavity = $derived(scenario === 'zero' ? 0 : scenario === 'missing' ? null : 32.5);
</script>
<div class="card" class:failure={phase === 'failure' || phase === 'retry'} aria-busy={busy} data-card={proposal ? 'proposal' : 'baseline'}>
<header><h3>Thermals</h3><p>{proposal ? 'Proposed composition' : 'Existing composition primitives'}</p></header>
<div class="body">
{#if !proposal}<div class="receipt"><strong>Tools &amp; bed</strong><ObservedMeta observedAt={masked ? null : '2026-01-01T12:00:00Z'} loading={masked} /></div><div class="receipt"><strong>Cavity</strong><ObservedMeta observedAt={masked || scenario === 'missing' ? null : '2026-01-01T11:58:00Z'} freshness={scenario === 'stale' ? 'stale' : 'fresh'} loading={masked}/></div>{/if}
{#if proposal}<div class="receipt"><strong>Tools &amp; bed</strong><ObservedMeta observedAt={masked ? null : '2026-01-01T12:00:00Z'} loading={masked}/></div>{/if}
<div role="list" aria-label="Tools and bed temperatures">
{#each rows as row}
<ReadingRow active={!masked && row.active} label={masked ? row.name : `${row.name}, ${row.active ? 'Active' : 'Inactive'}`}>
{#snippet leading()}<span class="name">{row.name}</span>{/snippet}
{#snippet trailing()}<ActualTarget actual={masked ? undefined : row.actual} target={masked ? undefined : row.target} loading={masked}/>{/snippet}
</ReadingRow>
{/each}
</div>
{#if proposal}<div class="receipt separate"><strong>Cavity</strong><ObservedMeta observedAt={masked || scenario === 'missing' ? null : '2026-01-01T11:58:00Z'} freshness={scenario === 'stale' ? 'stale' : 'fresh'} loading={masked}/></div>{/if}
<div role="list" aria-label="Cavity temperature"><ReadingRow label="Cavity">
{#snippet leading()}<span class="name">{proposal ? 'Temperature' : 'Cavity'}</span>{/snippet}
{#snippet trailing()}{#if proposal}<div class="no-target"><DegreeValue value={masked ? undefined : cavity} loading={masked} context="Actual"/><span role="img" aria-label="Target not applicable">No target</span></div>{:else}<ActualTarget actual={masked ? undefined : cavity} target={masked ? undefined : null} loading={masked}/>{/if}{/snippet}
</ReadingRow></div>
</div>
<footer><span role="status">{phase === 'failure' ? 'Could not load' : phase === 'retry' ? 'Retrying' : phase === 'refresh' ? 'Refreshing' : phase === 'loading' ? 'Loading' : 'Synthetic observation'}</span><button disabled={busy} aria-label={phase === 'failure' ? 'Retry Thermals specimen' : 'Refresh Thermals specimen'} onclick={() => phase = phase === 'failure' ? 'retry' : 'refresh'}>{phase === 'failure' ? 'Retry' : 'Refresh'}</button></footer>
</div>
<style>
.failure :global([data-loading-value]){animation:none!important}
.card{background:var(--u1-surface);border:1px solid var(--u1-line);border-radius:var(--u1-radius-card);overflow:hidden; width:100%;}header{padding:var(--u1-space-5);border-bottom:1px solid var(--u1-line)}h3{font-size:var(--u1-type-heading-mobile);margin:0}p{font-size:var(--u1-type-label);color:var(--u1-muted);margin:8px 0 0}.body{padding:var(--u1-space-3)}.receipt{display:flex;flex-direction:column;gap:4px;font-size:var(--u1-type-label);color:var(--u1-muted);padding:8px 14px;min-height:4.4em}.receipt strong{font-weight:var(--u1-weight-name);color:var(--u1-ink)}.separate{border-top:1px solid var(--u1-line);margin-top:12px}.name{font-size:var(--u1-type-name);font-weight:var(--u1-weight-name)}.no-target{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px}.no-target span{white-space:nowrap;font-size:var(--u1-type-label);color:var(--u1-muted)}footer{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:110px;padding:16px 20px;border-top:1px solid var(--u1-line);font-size:var(--u1-type-label)}footer>span{min-width:0;overflow-wrap:anywhere}button{flex-shrink:0;min-inline-size:max-content;min-height:44px;min-width:44px;border:1px solid var(--u1-line);background:var(--u1-soft);border-radius:12px;padding:8px;color:var(--u1-ink)}button:focus-visible{outline:3px solid var(--u1-focus);outline-offset:2px}
</style>
