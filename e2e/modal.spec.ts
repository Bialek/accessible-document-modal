import { expect, test } from '@playwright/test';

test('native modal contains keyboard focus and restores it after Escape', async ({ page }) => {
  await page.goto('/');

  const opener = page.getByRole('button', { name: 'Dodaj dokument' });
  const dialog = page.getByRole('dialog', { name: 'Dodaj dokument' });
  const documentType = page.getByRole('combobox', { name: 'Typ dokumentu' });
  const closeButton = page.getByRole('button', { name: 'Zamknij' });
  const submitButton = page.getByRole('button', { name: 'Wyślij dokument' });

  await opener.click();
  await expect(dialog).toBeVisible();
  await expect(documentType).toBeFocused();

  await closeButton.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(submitButton).toBeFocused();

  await submitButton.focus();
  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();

  await opener.focus();
  await expect(opener).not.toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});
