import { assertNoOverflow, expect, test } from './helpers';

test('console skips the pin, keeps the session, and signs out', async ({ page }) => {
  await page.goto('/console');
  await expect(page.getByTestId('admin-shell')).toBeVisible();
  await expect(page.getByTestId('pin-sheet')).toHaveCount(0);
  await expect(page.getByTestId('dev-bypass')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('admin-shell')).toContainText('[ADMIN_CONSOLE]');
  await page.getByTestId('sign-out').click();
  await expect(page.getByTestId('admin-shell')).toHaveCount(0);
  await expect(page.locator('#hero')).toBeVisible();
});

test('long-press on the system id opens the admin shell', async ({ page }) => {
  await page.goto('/');
  const sys = page.locator('[data-testid="sys-id"]:visible');
  const box = await sys.boundingBox();
  if (!box) throw new Error('system id is not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + 8);
  await page.mouse.down();
  await page.waitForTimeout(800);
  await page.mouse.up();
  await expect(page.getByTestId('admin-shell')).toContainText('[ADMIN_CONSOLE]');
  await expect(page.getByTestId('pin-sheet')).toHaveCount(0);
});

test('admin shell has no horizontal overflow and keeps the save bar in view', async ({ page }) => {
  await page.goto('/console');
  await page.getByTestId('admin-tab-projects').click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByTestId('save-bar')).toBeInViewport();
  await assertNoOverflow(page);
  await page.goto('/');
  await assertNoOverflow(page);
});
