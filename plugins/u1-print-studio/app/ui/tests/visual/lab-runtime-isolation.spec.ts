import { expect, test } from '@playwright/test';

const routes = [
  'overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history',
  'queue', 'fans', 'bed_mesh', 'camera'
] as const;

declare global {
  interface Window {
    __recordLabFetch: (url: string) => Promise<void>;
  }
}

test('all lab navigation, states and controls execute without runtime fetch', async ({ page }) => {
  const calls: string[] = [];
  await page.exposeFunction('__recordLabFetch', async (url: string) => { calls.push(url); });
  await page.addInitScript(() => {
    const blockedFetch = async (input: RequestInfo | URL): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      await window.__recordLabFetch(url);
      throw new Error(`Private lab attempted runtime fetch: ${url}`);
    };
    window.fetch = blockedFetch as typeof window.fetch;
  });

  await page.goto('/dashboard/lab/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/lab\/overview$/);
  expect(calls).toEqual([]);

  for (const route of routes) {
    await page.goto(`/dashboard/lab/${route}`, { waitUntil: 'networkidle' });
    const fields = await page.locator('[data-lab-controls] select').evaluateAll((selects) =>
      selects.map((select) => ({
        label: select.getAttribute('aria-label') ?? '',
        values: [...select.querySelectorAll('option')].map((option) => option.value)
      }))
    );
    for (const { label, values } of fields) {
      for (const value of values) {
        await page.getByRole('button', { name: 'Reset lab preview' }).click();
        const select = page.getByLabel(label, { exact: true });
        await expect(select).toBeEnabled();
        await select.selectOption(value);
      }
    }
    const refresh = page.getByRole('button', { name: /Refresh lab fixture/ });
    if (await refresh.count()) await refresh.click();
    if (route === 'bed_mesh') {
      await page.getByRole('radio', { name: '2D grid' }).click();
      await page.getByRole('radio', { name: '3D surface' }).click();
    }
    await page.getByRole('button', { name: 'Reset lab preview' }).click();
    expect(calls, `${route} runtime fetch calls`).toEqual([]);
  }
});
