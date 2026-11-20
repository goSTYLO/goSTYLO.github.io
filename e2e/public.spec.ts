import { assertNoOverflow, expect, openNav, test } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the seed portfolio without an admin link', async ({ page }) => {
  await expect(page.locator('#hero')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'LEAD FULL-STACK DEVELOPER' })).toBeVisible();
  await expect(page.locator('#hero')).toContainText('Aaron Christian B. Tamayo');

  await page.locator('#project-matrix').scrollIntoViewIfNeeded();
  const featured = page.getByRole('heading', { name: 'Serbisyo' });
  await featured.scrollIntoViewIfNeeded();
  await expect(featured).toBeVisible();
  await expect(page.locator('#project-matrix')).toContainText('Enterprise Warehouse Inventory & POS (Shija)');

  await page.locator('#skills').scrollIntoViewIfNeeded();
  await expect(page.locator('#skills')).toBeVisible();
  await page.locator('#education').scrollIntoViewIfNeeded();
  await expect(page.locator('#education')).toContainText('PHINMA University of Pangasinan');
  await page.locator('#certifications').scrollIntoViewIfNeeded();
  await expect(page.locator('#certifications')).toContainText('AWS Fundamentals');
  await expect(page.locator('#certifications').getByRole('button', { name: 'Previous slide' })).toHaveCount(0);
  await expect(page.locator('#contact')).toBeVisible();

  await openNav(page);
  const nav = page.getByRole('navigation', { name: 'Portfolio sections' });
  await expect(nav).toContainText('[OVERVIEW]');
  await expect(nav).not.toContainText(/admin/i);
  await assertNoOverflow(page);
});

test('mobile sheet navigates and the theme toggle flips', async ({ page }) => {
  await openNav(page);
  await page.getByRole('button', { name: '[SKILLS]' }).click();
  await expect(page.locator('#skills')).toBeInViewport();

  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  if (await menu.isVisible()) await menu.click();
  const theme = page.getByRole('button', { name: /THEME:/ });
  const before = await theme.innerText();
  await theme.click();
  await expect(theme).not.toHaveText(before);
  await assertNoOverflow(page);
});

test('portrait opens and closes the CV viewer', async ({ page }) => {
  await page.getByRole('button', { name: 'Open CV' }).click();
  await expect(page.getByText('[CV_AST_VIEWER]')).toBeVisible();
  await expect(page.getByRole('link', { name: '[DOWNLOAD_CV_PDF]' }).first()).toBeVisible();
  await page.getByRole('button', { name: '[X]' }).click();
  await expect(page.getByText('[CV_AST_VIEWER]')).toBeHidden();
});

test('mobile primary controls are at least 44px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'touch target check is for the phone viewport');
  await openNav(page);
  const controls = [
    page.getByRole('button', { name: 'Open navigation menu' }).or(page.getByRole('button', { name: 'Close navigation menu' })),
    page.getByRole('button', { name: '[SKILLS]' }),
    page.getByRole('button', { name: /THEME:/ }),
    page.getByRole('button', { name: '[EXPLORE_SYSTEMS]' }),
  ];
  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test('a content edit survives reload and is not replaced by the seed', async ({ page }) => {
  const subtitle = 'E2E subtitle that must survive a second read';
  const current = await page.request.get('/api/content');
  const doc = await current.json();
  doc.profile.subtitle = subtitle;
  const saved = await page.request.put('/api/content', { data: doc });
  expect(saved.status(), await saved.text()).toBe(401);

  await page.goto('/console');
  await page.getByTestId('admin-tab-profile').click();
  await page.getByTestId('profile-subtitle').fill(subtitle);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/content') && response.request().method() === 'PUT'),
    page.getByRole('button', { name: '[SAVE]' }).click(),
  ]);

  const again = await page.request.get('/api/content');
  const body = await again.json();
  expect(body.profile.subtitle).toBe(subtitle);
  const third = await page.request.get('/api/content');
  expect((await third.json()).profile.subtitle).toBe(subtitle);

  await page.goto('/');
  await expect(page.locator('#hero')).toContainText(subtitle);
});
