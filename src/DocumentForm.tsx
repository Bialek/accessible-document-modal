import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from 'react';
import {
  initialDocumentFormValues,
  validateDocumentForm,
  type DocumentFormErrors,
  type DocumentFormValues,
} from './documentFormState';
import { isSubmitError, submitDocument, type SubmitSuccess } from './submitDocument';

interface DocumentFormProps {
  firstFieldRef: RefObject<HTMLSelectElement | null>;
  onClose: () => void;
}

type FieldName = keyof DocumentFormValues;

interface ValidationAnnouncement {
  id: number;
  message: string;
}

const fieldOrder: FieldName[] = [
  'documentType',
  'documentNumber',
  'email',
  'consent',
  'note',
];

export function DocumentForm({ firstFieldRef, onClose }: DocumentFormProps) {
  const [values, setValues] = useState(initialDocumentFormValues);
  const [errors, setErrors] = useState<DocumentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitSuccess | null>(null);
  const [validationAnnouncement, setValidationAnnouncement] =
    useState<ValidationAnnouncement | null>(null);
  const attemptRef = useRef(0);
  const validationAttemptRef = useRef(0);
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement>>>({});
  const pendingErrorFocusRef = useRef<FieldName | null>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fieldName = pendingErrorFocusRef.current;
    if (!fieldName) return;

    fieldRefs.current[fieldName]?.focus();
    pendingErrorFocusRef.current = null;
  }, [errors]);

  useEffect(() => {
    if (result) successButtonRef.current?.focus();
  }, [result]);

  function updateValue<Name extends FieldName>(name: Name, value: DocumentFormValues[Name]) {
    setValues((current) => ({ ...current, [name]: value }));
    setValidationAnnouncement(null);
    if (errors[name] || (name === 'documentType' && value !== 'other' && errors.note)) {
      setErrors((current) => ({
        ...current,
        [name]: undefined,
        ...(name === 'documentType' && value !== 'other' ? { note: undefined } : {}),
      }));
    }
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    updateValue(event.target.name as 'documentNumber' | 'email' | 'note', event.target.value);
  }

  async function sendForm() {
    setIsSubmitting(true);
    setBackendError(null);
    attemptRef.current += 1;

    try {
      const response = await submitDocument(values, attemptRef.current);
      setResult(response);
    } catch (error) {
      setBackendError(
        isSubmitError(error) ? error.message : 'Nie udało się wysłać dokumentu. Spróbuj ponownie.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateDocumentForm(values);
    setErrors(nextErrors);

    const firstInvalidField = fieldOrder.find((fieldName) => nextErrors[fieldName]);
    if (firstInvalidField) {
      validationAttemptRef.current += 1;
      setValidationAnnouncement({
        id: validationAttemptRef.current,
        message: `Formularz zawiera błędy. ${nextErrors[firstInvalidField]}`,
      });
      pendingErrorFocusRef.current = firstInvalidField;
      return;
    }

    setValidationAnnouncement(null);
    void sendForm();
  }

  if (result) {
    return (
      <section className="result-panel" role="status" aria-live="polite">
        <div className="result-icon" aria-hidden="true">✓</div>
        <h3>Dokument wysłany</h3>
        <p>{result.message}</p>
        <dl className="result-details">
          <div>
            <dt>Numer dokumentu</dt>
            <dd>{result.documentId}</dd>
          </div>
          <div>
            <dt>Numer zgłoszenia</dt>
            <dd>{result.requestId}</dd>
          </div>
        </dl>
        <button
          className="button button-primary"
          type="button"
          ref={successButtonRef}
          onClick={onClose}
        >
          Gotowe
        </button>
      </section>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <span className="sr-only" role="status" aria-live="polite">
        {isSubmitting ? 'Wysyłanie dokumentu.' : ''}
      </span>
      {validationAnnouncement && (
        <span className="sr-only" role="alert" key={validationAnnouncement.id}>
          {validationAnnouncement.message}
        </span>
      )}
      <div className="field">
        <label htmlFor="document-type">Typ dokumentu</label>
        <select
          id="document-type"
          name="documentType"
          ref={(element) => {
            firstFieldRef.current = element;
            fieldRefs.current.documentType = element ?? undefined;
          }}
          value={values.documentType}
          onChange={(event) => updateValue('documentType', event.target.value as DocumentFormValues['documentType'])}
          disabled={isSubmitting}
        >
          <option value="id">ID</option>
          <option value="income">Proof of income</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="document-number">
          Numer dokumentu <span aria-hidden="true">*</span>
        </label>
        <input
          id="document-number"
          name="documentNumber"
          ref={(element) => { fieldRefs.current.documentNumber = element ?? undefined; }}
          value={values.documentNumber}
          onChange={handleTextChange}
          aria-invalid={Boolean(errors.documentNumber)}
          aria-describedby={errors.documentNumber ? 'document-number-error' : undefined}
          required
          disabled={isSubmitting}
          autoComplete="off"
        />
        {errors.documentNumber && (
          <p className="field-error" id="document-number-error">{errors.documentNumber}</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="owner-email">
          E-mail właściciela <span aria-hidden="true">*</span>
        </label>
        <input
          id="owner-email"
          name="email"
          type="email"
          ref={(element) => { fieldRefs.current.email = element ?? undefined; }}
          value={values.email}
          onChange={handleTextChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'owner-email-error' : undefined}
          required
          disabled={isSubmitting}
          autoComplete="email"
          spellCheck={false}
        />
        {errors.email && (
          <p className="field-error" id="owner-email-error">{errors.email}</p>
        )}
      </div>

      <div className="field checkbox-field">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          ref={(element) => { fieldRefs.current.consent = element ?? undefined; }}
          checked={values.consent}
          onChange={(event) => updateValue('consent', event.target.checked)}
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'consent-error' : undefined}
          required
          disabled={isSubmitting}
        />
        <div>
          <label htmlFor="consent">
            Wyrażam zgodę na weryfikację dokumentu <span aria-hidden="true">*</span>
          </label>
          {errors.consent && (
            <p className="field-error" id="consent-error">{errors.consent}</p>
          )}
        </div>
      </div>

      <div className="field">
        <div className="label-row">
          <label htmlFor="note">
            Notatka{' '}
            {values.documentType === 'other' && <span aria-hidden="true">*</span>}
          </label>
          <span className="character-count" id="note-count">{values.note.length}/200</span>
        </div>
        <textarea
          id="note"
          name="note"
          rows={4}
          ref={(element) => { fieldRefs.current.note = element ?? undefined; }}
          value={values.note}
          onChange={handleTextChange}
          aria-invalid={Boolean(errors.note)}
          aria-describedby={errors.note ? 'note-count note-error' : 'note-count'}
          required={values.documentType === 'other'}
          disabled={isSubmitting}
        />
        {errors.note && <p className="field-error" id="note-error">{errors.note}</p>}
      </div>

      {backendError && (
        <div className="backend-error" role="alert">
          <strong>Nie udało się wysłać dokumentu</strong>
          <p>{backendError}</p>
        </div>
      )}

      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onClose} disabled={isSubmitting}>
          Anuluj
        </button>
        <button
          className="button button-primary"
          type="submit"
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><span className="spinner" aria-hidden="true" /> Wysyłanie…</>
          ) : backendError ? 'Spróbuj ponownie' : 'Wyślij dokument'}
        </button>
      </div>
    </form>
  );
}
