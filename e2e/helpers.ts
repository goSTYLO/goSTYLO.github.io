import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const reset = await page.request.post('/api/test/reset');
    if (!reset.ok()) throw new Error(`reset failed: ${reset.status()}`);
    await use(page);
  },
});

export { expect };

export async function openNav(page: import('@playwright/test').Page) {
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  if (await menu.isVisible()) await menu.click();
}

export async function saveAdmin(page: import('@playwright/test').Page) {
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/content') && response.request().method() === 'PUT' && response.ok(),
    ),
    page.getByRole('button', { name: '[SAVE]' }).click(),
  ]);
}

export async function assertNoOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}
