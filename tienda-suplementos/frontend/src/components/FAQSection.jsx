import { useState } from 'react';

export default function FAQSection({ title, items }) {
  return (
    <section className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">{title}</h2>
      <div className="space-y-3">
        {items.map((qa, idx) => (
          <FAQItem key={idx} qa={qa} />
        ))}
      </div>
      <p className="mt-6 text-xs text-gray-400">Contenido informativo; no reemplaza asesoría profesional.</p>
    </section>
  );
}

function FAQItem({ qa }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-md">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-4 py-3 text-left"
      >
        <span className="font-medium text-gray-800">{qa.question}</span>
        <span className="text-sm text-red-600">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
          {qa.answer}
        </div>
      )}
    </div>
  );
}
