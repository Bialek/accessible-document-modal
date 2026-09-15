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
  } else if (values.note.length > 200) {
    errors.note = 'Notatka może mieć maksymalnie 200 znaków.';
  }

  return errors;
}
