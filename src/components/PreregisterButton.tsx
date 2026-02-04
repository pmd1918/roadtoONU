'use client';
import { useState } from 'react';
import PreregistrationModal from './PreregistrationModal';

export default function PreregisterButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.75rem',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 700,
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderRadius: '50px',
          border: '2px solid transparent',
          background: 'linear-gradient(135deg, #ea7600, #f1d44b)',
          color: '#212322',
          boxShadow: '0 4px 20px rgba(234, 118, 0, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        Preregister Now
      </button>

      <PreregistrationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
