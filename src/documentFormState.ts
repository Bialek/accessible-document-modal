export type DocumentType = 'id' | 'income' | 'other';

export interface DocumentFormValues {
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  consent: boolean;
  note: string;
}

export type DocumentFormErrors = Partial<Record<keyof DocumentFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NOTE_MAX_LENGTH = 200;
export const NOTE_TOO_LONG_MESSAGE = `Notatka może mieć maksymalnie ${NOTE_MAX_LENGTH} znaków.`;

export const initialDocumentFormValues: DocumentFormValues = {
  documentType: 'id',
  documentNumber: '',
  email: '',
  consent: false,
  note: '',
};

export function validateDocumentForm(values: DocumentFormValues): DocumentFormErrors {
  const errors: DocumentFormErrors = {};

  if (!values.documentNumber.trim()) {
    errors.documentNumber = 'Numer dokumentu jest wymagany.';
  }

  if (!values.email.trim()) {
    errors.email = 'E-mail właściciela jest wymagany.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Wpisz poprawny adres e-mail.';
  }

  if (!values.consent) {
    errors.consent = 'Zgoda jest wymagana.';
  }

  if (values.documentType === 'other' && !values.note.trim()) {
    errors.note = 'Notatka jest wymagana dla typu Other.';
  } else if (values.note.length > NOTE_MAX_LENGTH) {
    errors.note = NOTE_TOO_LONG_MESSAGE;
  }

  return errors;
}
