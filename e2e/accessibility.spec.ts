import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('open modal has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Dodaj dokument' }).click();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
