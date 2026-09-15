import { describe, expect, it } from 'vitest';
import { validateDocumentForm, type DocumentFormValues } from './documentFormState';

const validValues: DocumentFormValues = {
  documentType: 'id',
  documentNumber: 'ABC-123',
  email: 'owner@example.com',
  consent: true,
  note: '',
};

describe('validateDocumentForm', () => {
  it('reports all required and format errors', () => {
    expect(
      validateDocumentForm({
        ...validValues,
        documentNumber: ' ',
        email: 'not-an-email',
        consent: false,
      }),
    ).toEqual({
      documentNumber: 'Numer dokumentu jest wymagany.',
      email: 'Wpisz poprawny adres e-mail.',
      consent: 'Zgoda jest wymagana.',
    });

    expect(validateDocumentForm({ ...validValues, email: '' }).email).toBe(
      'E-mail właściciela jest wymagany.',
    );
  });

  it('requires a note for Other and enforces the 200 character limit', () => {
    expect(validateDocumentForm({ ...validValues, documentType: 'other' }).note).toBe(
      'Notatka jest wymagana dla typu Other.',
    );
    expect(validateDocumentForm({ ...validValues, note: 'a'.repeat(201) }).note).toBe(
      'Notatka może mieć maksymalnie 200 znaków.',
    );
    expect(validateDocumentForm({ ...validValues, note: 'a'.repeat(200) })).toEqual({});
    expect(validateDocumentForm({ ...validValues, documentType: 'other', note: 'Opis' })).toEqual({});
  });
});
