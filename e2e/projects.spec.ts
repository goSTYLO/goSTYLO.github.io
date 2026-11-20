import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assertNoOverflow, expect, saveAdmin, test } from './helpers';

async function selectProject(page: import('@playwright/test').Page, id: string) {
  await page.locator(`[data-testid="project-card"][data-project-id="${id}"]`).click();
}

test('projects can be added, reordered, deleted, and given a webp image', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/console');
  await page.getByTestId('admin-tab-projects').click();
  const firstId = await page.getByTestId('project-card').first().getAttribute('data-project-id');
  if (!firstId) throw new Error('missing project id');
  await page.getByTestId('project-card').first().click();
  const firstTitle = await page.getByTestId(`title-${firstId}`).inputValue();
  const secondId = await page.getByTestId('project-card').nth(1).getAttribute('data-project-id');
  if (!secondId) throw new Error('missing second id');
  await page.getByTestId('project-card').nth(1).click();
  const secondTitle = await page.getByTestId(`title-${secondId}`).inputValue();
  await page.getByTestId('project-card').first().click();

  const handle = page.getByTestId(`drag-handle-${firstId}`);
  const targetRow = page.getByTestId(`sort-row-${secondId}`);
  const fromBox = await handle.boundingBox();
  const toBox = await targetRow.boundingBox();
  if (!fromBox || !toBox) throw new Error('missing sort boxes');
  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height + 8, { steps: 24 });
  await page.mouse.up();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('admin-dirty')).toContainText('UNSAVED');
  await expect(page.getByTestId('save-bar')).toBeInViewport();
  await saveAdmin(page);
  await page.reload();
  await page.getByTestId('admin-tab-projects').click();
  await expect(page.getByTestId('project-card').first()).toContainText(secondTitle);

  await page.getByTestId('add-project').click();
  const cards = page.getByTestId('project-card');
  const added = cards.last();
  const addedId = await added.getAttribute('data-project-id');
  if (!addedId) throw new Error('missing added id');
  await added.click();
  await page.getByTestId(`title-${addedId}`).fill('E2E Beacon');
  await saveAdmin(page);

  const png = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#00596b';
    ctx.fillRect(0, 0, 2000, 100);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((file) => resolve(file!), 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  const dir = path.resolve('tmp');
  await mkdir(dir, { recursive: true });
  const pngPath = path.join(dir, 'e2e-wide.png');
  await writeFile(pngPath, Buffer.from(png));
  await page.getByTestId(`image-${addedId}`).setInputFiles(pngPath);
  await expect(page.getByTestId(`preview-${addedId}`)).toBeVisible();
  await saveAdmin(page);
  await page.reload();
  await page.getByTestId('admin-tab-projects').click();
  await page.locator(`[data-testid="project-card"][data-project-id="${addedId}"]`).click();
  const preview = page.getByTestId(`preview-${addedId}`);
  await expect(preview).toBeVisible();
  const src = await preview.getAttribute('src');
  if (!src) throw new Error('missing preview src');
  const dims = await page.evaluate(async (url) => {
    const res = await fetch(url);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const blob = new Blob([bytes], { type: res.headers.get('content-type') ?? '' });
    const bitmap = await createImageBitmap(blob);
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return { riff, webp, width: bitmap.width, height: bitmap.height };
  }, src);
  expect(dims.riff).toBe('RIFF');
  expect(dims.webp).toBe('WEBP');
  expect(Math.max(dims.width, dims.height)).toBeLessThanOrEqual(1600);
  expect(Math.max(dims.width, dims.height)).toBeGreaterThan(1000);

  await selectProject(page, addedId);
  await page.getByTestId(`star-${addedId}`).click();
  await saveAdmin(page);

  await page.goto('/');
  const beacon = page.getByRole('heading', { name: 'E2E Beacon' });
  await beacon.scrollIntoViewIfNeeded();
  await expect(beacon).toBeVisible();
  const featuredWindow = beacon.locator(
    "xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' blueprint-window ')]",
  );
  await expect(featuredWindow).toContainText('[FEATURED]');
  await expect(page.locator('#project-matrix')).toContainText(firstTitle);
  await assertNoOverflow(page);

  await page.goto('/console');
  await page.getByTestId('admin-tab-projects').click();
  await selectProject(page, addedId);
  await page.getByTestId(`star-${addedId}`).click();
  await saveAdmin(page);
  await page.goto('/');
  await beacon.scrollIntoViewIfNeeded();
  await expect(
    beacon.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' blueprint-window ')]"),
  ).toHaveCount(0);
  await expect(page.locator('#project-matrix')).toContainText('[FEATURED]');
  await assertNoOverflow(page);

  await page.goto('/console');
  await page.getByTestId('admin-tab-projects').click();
  await selectProject(page, addedId);
  await page.getByTestId(`delete-${addedId}`).click();
  await saveAdmin(page);
  await page.goto('/');
  await page.locator('#project-matrix').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'E2E Beacon' })).toHaveCount(0);
});
