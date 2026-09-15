import errorFixture from '../data/submit-error.json';
import successFixture from '../data/submit-success.json';
import type { DocumentFormValues } from './documentFormState';

export interface SubmitSuccess {
  requestId: string;
  status: 'accepted';
  message: string;
  documentId: string;
}

export interface SubmitError {
  requestId: string;
  status: 'error';
  code: string;
  message: string;
}

const REQUEST_DELAY_MS = 350;

export function submitDocument(
  _values: DocumentFormValues,
  attempt: number,
): Promise<SubmitSuccess> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (attempt === 1) {
        reject(errorFixture as SubmitError);
        return;
      }

      resolve(successFixture as SubmitSuccess);
    }, REQUEST_DELAY_MS);
  });
}

export function isSubmitError(error: unknown): error is SubmitError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 'error' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}
