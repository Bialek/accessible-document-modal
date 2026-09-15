import { useRef, useState } from 'react';
import { AddDocumentModal } from './AddDocumentModal';

export function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Panel dokumentów</p>
        <h1 id="page-title">Twoje dokumenty</h1>
        <p className="intro">
          Dodaj dokument potrzebny do weryfikacji. Po wysłaniu pokażemy status zgłoszenia.
        </p>
        <button
          className="button button-primary"
          type="button"
          ref={openButtonRef}
          onClick={() => setIsModalOpen(true)}
        >
          Dodaj dokument
        </button>
      </section>

      {isModalOpen && (
        <AddDocumentModal
          openerRef={openButtonRef}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}
