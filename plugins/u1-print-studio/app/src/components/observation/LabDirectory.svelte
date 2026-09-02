<script lang="ts">
  import { ArrowRight, FlaskConical } from 'lucide-svelte';
  const views = [
    ['overview', 'Overview'], ['progress', 'Print Progress'], ['thermals', 'Thermals'],
    ['heads', 'Heads & Filaments'], ['jobs', 'Current Job'], ['job_history', 'Job History'],
    ['queue', 'Print Queue'], ['fans', 'Fans & Air'], ['bed_mesh', 'Bed Mesh'], ['camera', 'U1 Camera']
  ] as const;
</script>

<main class="lab-directory" data-private-lab="directory">
  <header><div class="directory-icon"><FlaskConical aria-hidden="true" /></div><div><h1>Observation Lab</h1><p>Synthetic fixture views · private dashboard only</p></div></header>
  <nav aria-label="Observation lab views">
    {#each views as [path, label]}
      <a href={`/dashboard/lab/${path}`} data-sveltekit-reload data-lab-link={path}><span>{label}</span><ArrowRight aria-hidden="true" /></a>
    {/each}
  </nav>
</main>

<style>
  .lab-directory { width: min(100% - 24px, 720px); margin: 24px auto; padding: 24px; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-card); background: var(--u1-surface); box-shadow: var(--u1-shadow); }
  header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .directory-icon { display: grid; place-items: center; width: 52px; height: 52px; flex: 0 0 auto; border: 1px solid var(--u1-line); border-radius: 14px; background: var(--u1-canvas); }
  .directory-icon :global(svg) { width: 22px; height: 22px; }
  h1 { margin: 0; font-size: 24px; letter-spacing: -.035em; }
  p { margin: 5px 0 0; color: var(--u1-muted); font-size: 13px; }
  nav { display: grid; grid-template-columns: 1fr; overflow: hidden; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); }
  a { display: flex; align-items: center; justify-content: space-between; min-height: 52px; padding: 0 14px; border-bottom: 1px solid var(--u1-line); color: var(--u1-ink); font-size: 14px; font-weight: 570; text-decoration: none; }
  a:last-child { border-bottom: 0; }
  a:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: -3px; }
  a :global(svg) { width: 18px; height: 18px; color: var(--u1-muted); }
  @media (min-width: 590px) { .lab-directory { margin-block: 40px; } nav { grid-template-columns: repeat(2, minmax(0, 1fr)); } a:nth-child(odd) { border-right: 1px solid var(--u1-line); } a:nth-last-child(-n + 2) { border-bottom: 0; } }
</style>
