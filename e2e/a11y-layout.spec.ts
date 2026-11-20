import { assertNoOverflow, expect, test } from './helpers';

test('public and console stay on screen and keep a reachable control', async ({ page }) => {
  await page.goto('/');
  await assertNoOverflow(page);
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();

  await page.goto('/console');
  await page.getByTestId('admin-tab-cv').click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByTestId('save-bar')).toBeInViewport();
  await assertNoOverflow(page);
});
