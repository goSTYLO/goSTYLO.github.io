import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, saveAdmin, test } from './helpers';

const PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj
trailer<</Root 1 0 R>>
%%EOF
`;

test('structured CV edits and PDF upload do not clobber each other', async ({ page }) => {
  const bullet = 'E2E bullet that must survive the pdf upload';
  await page.goto('/console');
  await page.getByTestId('admin-tab-cv').click();
  const pdfBefore = (await page.getByTestId('cv-pdf-url').innerText()).trim();
  await page.getByTestId('cv-bullet').fill(bullet);
  await saveAdmin(page);
  await expect(page.getByTestId('cv-pdf-url')).toHaveText(pdfBefore);

  await page.goto('/');
  await page.getByRole('button', { name: 'Open CV' }).click();
  await expect(page.getByText(bullet)).toBeVisible();

  await page.goto('/console');
  await page.getByTestId('admin-tab-cv').click();
  const pdfPath = path.resolve('tmp/e2e-cv.pdf');
  await writeFile(pdfPath, PDF);
  await page.getByTestId('cv-pdf-file').setInputFiles(pdfPath);
  await expect(page.getByTestId('cv-pdf-url')).not.toHaveText(pdfBefore);
  const pdfAfter = (await page.getByTestId('cv-pdf-url').innerText()).trim();
  await expect(page.getByTestId('cv-bullet')).toHaveValue(bullet);
  await saveAdmin(page);
  await expect(page.getByTestId('cv-bullet')).toHaveValue(bullet);
  await expect(page.getByTestId('cv-pdf-url')).toHaveText(pdfAfter);

  await page.goto('/');
  await expect(page.locator('#contact').getByRole('link', { name: '[DOWNLOAD_CV_PDF]' })).toHaveAttribute('href', pdfAfter);
  await page.getByRole('button', { name: 'Open CV' }).click();
  await expect(page.getByText(bullet)).toBeVisible();
});
