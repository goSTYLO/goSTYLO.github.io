import { expect, openNav, saveAdmin, test } from './helpers';

test('profile, skills, education, and certifications can be edited and toggled', async ({ page }) => {
  await page.goto('/console');
  await page.getByTestId('admin-tab-profile').click();
  await page.getByTestId('profile-name').fill('E2E Name');
  await page.getByTestId('admin-tab-skills').click();
  await page.getByTestId('skill-languages').fill('E2ELang');
  await page.getByTestId('admin-tab-education').click();
  await page.getByTestId('add-education').click();
  await page.getByTestId('education-school').last().fill('E2E Institute');
  await page.getByTestId('admin-tab-certifications').click();
  await page.getByTestId('add-certification').click();
  await page.getByTestId('cert-title').last().fill('E2E Certificate');
  await saveAdmin(page);

  await page.goto('/');
  await expect(page.locator('#hero')).toContainText('E2E Name');
  await page.locator('#education').scrollIntoViewIfNeeded();
  await expect(page.locator('#education')).toContainText('E2E Institute');
  await expect(page.locator('#education')).toContainText('PHINMA University of Pangasinan');
  await page.locator('#certifications').scrollIntoViewIfNeeded();
  const certNav = page.locator('#certifications');
  await expect(certNav.getByRole('button', { name: 'Previous slide' })).toBeVisible();
  await expect(certNav.getByRole('button', { name: 'Next slide' })).toBeVisible();
  await certNav.getByRole('button', { name: 'Next slide' }).click();
  await expect(certNav).toContainText('E2E Certificate');
  await page.locator('#skills').scrollIntoViewIfNeeded();
  await expect(page.locator('#skills')).toContainText('E2ELang', { timeout: 15_000 });

  await page.goto('/console');
  await page.getByTestId('admin-tab-sections').click();
  await page.getByTestId('toggle-education').uncheck();
  await saveAdmin(page);
  await page.goto('/');
  await expect(page.locator('#education')).toHaveCount(0);
  await openNav(page);
  await expect(page.getByRole('button', { name: '[EDUCATION]' })).toHaveCount(0);

  await page.goto('/console');
  await page.getByTestId('admin-tab-sections').click();
  await page.getByTestId('toggle-education').check();
  await saveAdmin(page);
  await page.goto('/');
  await page.locator('#education').scrollIntoViewIfNeeded();
  await expect(page.locator('#education')).toContainText('E2E Institute');
  await expect(page.locator('#education')).toContainText('PHINMA University of Pangasinan');
});
