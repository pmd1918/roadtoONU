'use client';
import { useState } from 'react';

interface PreregistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUusJMOrmfhDIs737C_UVZX8hOFC2eM9MIW4N9u08Ibbg7GYpj71ueSZ_zGhs7xnpQGg/exec';

export default function PreregistrationModal({ isOpen, onClose }: PreregistrationModalProps) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    chapter: '',
    bringingGuest: '',
    guestCount: '',
    arrivalDate: '',
    departureDate: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setStatus('success');
      setFormData({ 
        name: '', 
        email: '', 
        phone: '',
        chapter: '',
        bringingGuest: '',
        guestCount: '',
        arrivalDate: '',
        departureDate: ''
      });
    } catch (err) {
      setStatus('error');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setStatus('idle');
    }
  };

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        <button style={styles.closeButton} onClick={() => { onClose(); setStatus('idle'); }}>
          ×
        </button>

        {status === 'success' ? (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>You're In!</h2>
            <p style={styles.successText}>
              We'll be in touch with registration details soon.
            </p>
            <button style={styles.submitButton} onClick={() => { onClose(); setStatus('idle'); }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Preregister Now</h2>
            <p style={styles.subtitle}>
              Be the first to know when registration opens for the 62nd National Conclave.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={styles.input}
                    placeholder="Your full name"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={styles.input}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Chapter *</label>
                  <input
                    type="text"
                    required
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    style={styles.input}
                    placeholder="e.g., Mu Beta"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Are you bringing a guest? *</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="bringingGuest"
                      value="Y"
                      required
                      checked={formData.bringingGuest === 'Y'}
                      onChange={(e) => setFormData({ ...formData, bringingGuest: e.target.value, guestCount: '1' })}
                      style={styles.radio}
                    />
                    Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="bringingGuest"
                      value="N"
                      checked={formData.bringingGuest === 'N'}
                      onChange={(e) => setFormData({ ...formData, bringingGuest: e.target.value, guestCount: '' })}
                      style={styles.radio}
                    />
                    No
                  </label>
                  {formData.bringingGuest === 'Y' && (
                    <div style={styles.guestCountWrapper}>
                      <label style={styles.guestCountLabel}>How many?</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                        style={styles.guestCountInput}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Arrival Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              {status === 'error' && (
                <p style={styles.errorText}>Something went wrong. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  ...styles.submitButton,
                  opacity: status === 'submitting' ? 0.7 : 1,
                }}
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '1rem',
    overflowY: 'auto',
  },
  modal: {
    position: 'relative',
    backgroundColor: '#2a2b2a',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '520px',
    width: '100%',
    border: '1px solid rgba(241, 212, 75, 0.2)',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
    margin: 'auto',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: '#8a8e96',
    fontSize: '1.75rem',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0.25rem',
  },
  title: {
    fontFamily: "'Have Heart', cursive",
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #ea7600, #f1d44b)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
    marginTop: 0,
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    color: '#e8ecf4',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  radioGroup: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '0.25rem',
  },
  radioLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    color: '#f4f7ff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  radio: {
    width: '18px',
    height: '18px',
    accentColor: '#ea7600',
    cursor: 'pointer',
  },
  guestCountWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginLeft: '0.5rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid rgba(241, 212, 75, 0.3)',
  },
  guestCountLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    color: '#f4f7ff',
  },
  guestCountInput: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    padding: '0.4rem 0.6rem',
    backgroundColor: '#212322',
    border: '1px solid rgba(241, 212, 75, 0.3)',
    borderRadius: '6px',
    color: '#f4f7ff',
    width: '60px',
    textAlign: 'center' as const,
    outline: 'none',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#f1d44b',
  },
  input: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#212322',
    border: '1px solid rgba(241, 212, 75, 0.3)',
    borderRadius: '8px',
    color: '#f4f7ff',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  submitButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    padding: '0.85rem 1.75rem',
    background: 'linear-gradient(135deg, #ea7600, #f1d44b)',
    color: '#212322',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: '0 4px 20px rgba(234, 118, 0, 0.4)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  errorText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    color: '#ff6b6b',
    margin: 0,
  },
  successContainer: {
    textAlign: 'center' as const,
    padding: '1rem 0',
  },
  successIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #ea7600, #f1d44b)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: '#212322',
    margin: '0 auto 1.5rem',
  },
  successText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    color: '#e8ecf4',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
};
