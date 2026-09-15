import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { DocumentForm } from './DocumentForm';

interface AddDocumentModalProps {
  openerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function AddDocumentModal({ openerRef, onClose }: AddDocumentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstFieldRef = useRef<HTMLSelectElement>(null);
  const closeRequestedRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    const animationFrame = window.requestAnimationFrame(() => firstFieldRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [openerRef]);

  function handleClose() {
    // StrictMode cleanup can close the dialog without a user action.
    if (!closeRequestedRef.current) return;

    closeRequestedRef.current = false;
    onClose();
  }

  function closeDialog() {
    if (!dialogRef.current?.open) return;

    closeRequestedRef.current = true;
    dialogRef.current.close();
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDialog();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }

  return (
    <dialog
      className="modal"
      ref={dialogRef}
      aria-labelledby="add-document-title"
      aria-describedby="add-document-description"
      onCancel={handleCancel}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
    >
      <header className="modal-header">
        <div>
          <p className="eyebrow">Nowe zgłoszenie</p>
          <h2 id="add-document-title">Dodaj dokument</h2>
        </div>
        <button className="icon-button" type="button" onClick={closeDialog} aria-label="Zamknij">
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <p id="add-document-description" className="modal-description">
        Uzupełnij wymagane pola, aby przekazać dokument do weryfikacji.
      </p>

      <DocumentForm firstFieldRef={firstFieldRef} onClose={closeDialog} />
    </dialog>
  );
}
