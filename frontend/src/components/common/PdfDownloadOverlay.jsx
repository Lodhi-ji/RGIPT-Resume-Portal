import { useEffect, useState } from 'react';

const MESSAGES = [
  'Preparing your resume...',
  'Rendering PDF layout...',
  'Applying styles...',
  'Almost done...',
];

const PdfDownloadOverlay = ({ visible }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!visible) { setMsgIndex(0); return; }
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '40px 48px', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        minWidth: '280px',
      }}>
        {/* Spinner */}
        <div style={{
          width: '48px', height: '48px', margin: '0 auto 20px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'pdf-spin 0.8s linear infinite',
        }} />
        <p style={{ fontWeight: 600, fontSize: '16px', color: '#111827', marginBottom: '6px' }}>
          Generating PDF
        </p>
        <p style={{ fontSize: '13px', color: '#6b7280', minHeight: '20px', transition: 'opacity 0.3s' }}>
          {MESSAGES[msgIndex]}
        </p>
        <style>{`@keyframes pdf-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default PdfDownloadOverlay;
