import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4181' });
for (const width of [320, 720]) {
  test(`Kit Fans hydrate once and preserve neutral error geometry at ${width}`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 1100 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await request.post('/__fixture/state', { data: { reset: true, hold: true } });
    const serverPage = await request.get('/dashboard/fans');
    expect(serverPage.status()).toBe(200);
    expect(await (await request.get('/__fixture/state')).json()).toEqual({ statusReads: 0, environmentReads: 0 });
    await page.goto('/dashboard/fans');
    const shell = page.getByRole('article', { name: 'Fans & Air' });
    await expect(shell).toBeVisible();
    await expect.poll(async () => (await (await request.get('/__fixture/state')).json()).environmentReads).toBe(1);
    const initial = (await shell.boundingBox())!.height;
    await request.post('/__fixture/state', { data: { hold: false } });
    await expect(shell).toContainText('1,200');
    await expect(shell).toHaveAttribute('aria-busy', 'false');
    const ready = (await shell.boundingBox())!.height;
    expect(Math.abs(initial - ready)).toBeLessThanOrEqual(1);
    await request.post('/__fixture/state', { data: { fail: true } });
    await page.getByRole('button', { name: 'Refresh Fans & Air' }).click();
    await expect(shell.locator('[data-footer-status]')).toBeVisible();
    await expect(shell.locator('[data-footer-status]')).toHaveAttribute('aria-label', 'Could not load Fans & Air');
    await expect(shell).not.toContainText('1,200');
    expect(Math.abs((await shell.boundingBox())!.height - ready)).toBeLessThanOrEqual(1);
    await request.post('/__fixture/state', { data: { fail: false } });
    await page.getByRole('button', { name: 'Refresh Fans & Air' }).click();
    await expect(shell).toContainText('1,200');
    await expect(shell.locator('[data-footer-status]')).toBeHidden();
    expect((await (await request.get('/__fixture/state')).json()).environmentReads).toBe(3);
    expect(errors).toEqual([]);
  });
}
