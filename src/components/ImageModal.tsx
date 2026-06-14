import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  title: string;
  onClose: () => void;
}

export function ImageModal({ imageUrl, title, onClose }: ImageModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="modal-panel modal-image-panel"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-image-toolbar">
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-sm btn-icon"
            aria-label="Download image"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-icon"
            aria-label="Close preview"
            title="Close (esc)"
          >
            <X size={16} />
          </button>
        </div>
        <img src={imageUrl} alt={title} />
        <p className="modal-image-caption">{title}</p>
      </div>
    </div>
  );
}
