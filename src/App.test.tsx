import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('document modal', () => {
  it('opens natively, moves focus, handles cancel, and restores focus', async () => {
    const user = userEvent.setup();
    render(<App />);

    const opener = screen.getByRole('button', { name: 'Dodaj dokument' });
    await user.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Dodaj dokument' });
    const documentType = screen.getByRole('combobox', { name: 'Typ dokumentu' });
    await waitFor(() => expect(documentType).toHaveFocus());
    expect(dialog).toContainElement(documentType);

    expect(dialog).toHaveAttribute('open');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it.each(['Zamknij', 'Anuluj'])('closes with %s and restores focus', async (buttonName) => {
    const user = userEvent.setup();
    render(<App />);

    const opener = screen.getByRole('button', { name: 'Dodaj dokument' });
    await user.click(opener);
    await user.click(screen.getByRole('button', { name: buttonName }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('preserves values after a backend error and succeeds on retry', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Dodaj dokument' }));

    const numberInput = screen.getByLabelText(/Numer dokumentu/);
    const emailInput = screen.getByLabelText(/E-mail właściciela/);
    await user.type(numberInput, 'ABC-123');
    await user.type(emailInput, 'owner@example.com');
    await user.click(screen.getByRole('checkbox', { name: /Wyrażam zgodę/ }));
    await user.click(screen.getByRole('button', { name: 'Wyślij dokument' }));

    expect(screen.getByRole('button', { name: /Wysyłanie/ })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Wysyłanie dokumentu');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Serwer odrzucił dokument');
    expect(numberInput).toHaveValue('ABC-123');
    expect(emailInput).toHaveValue('owner@example.com');

    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Dokument został przyjęty'),
    );
    expect(screen.getByText('DOC-987654')).toBeInTheDocument();
    expect(screen.getByText('req-2026-0001')).toBeInTheDocument();
    const doneButton = screen.getByRole('button', { name: 'Gotowe' });
    expect(doneButton).toHaveFocus();
    await user.click(doneButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dodaj dokument' })).toHaveFocus();
  });

  it('clears the conditional note error when Other is no longer selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Dodaj dokument' }));

    const documentType = screen.getByRole('combobox', { name: 'Typ dokumentu' });
    await user.selectOptions(documentType, 'other');
    await user.click(screen.getByRole('button', { name: 'Wyślij dokument' }));
    const note = screen.getByRole('textbox', { name: /Notatka/ });
    expect(note).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Formularz zawiera błędy');
    expect(screen.getByText('Notatka jest wymagana dla typu Other.')).toBeInTheDocument();

    await user.selectOptions(documentType, 'id');
    expect(note).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Notatka jest wymagana dla typu Other.')).not.toBeInTheDocument();
  });
});
