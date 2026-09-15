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

test('validation reveals Other note and focuses the first invalid field', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Dodaj dokument' }).click();

  const documentType = page.getByRole('combobox', { name: 'Typ dokumentu' });
  const documentNumber = page.getByRole('textbox', { name: /Numer dokumentu/ });
  const note = page.getByRole('textbox', { name: /Notatka/ });

  await documentType.selectOption('other');
  await expect(note).toHaveAttribute('required', '');

  await page.getByRole('button', { name: 'Wyślij dokument' }).click();
  await expect(documentNumber).toBeFocused();
  await expect(page.getByText('Notatka jest wymagana dla typu Other.')).toBeVisible();

  await note.fill('a'.repeat(201));
  await expect(note).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Notatka może mieć maksymalnie 200 znaków.')).toBeVisible();
});
