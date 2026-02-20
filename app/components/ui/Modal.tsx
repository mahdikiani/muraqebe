import React from 'react';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  'aria-label': string;
  children: React.ReactNode;
  showTopBar?: boolean;
  className?: string;
  /** Overlay background, e.g. "bg-emerald-950/40" or "bg-slate-900/50". */
  overlayClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  closeOnOverlayClick = true,
  'aria-label': ariaLabel,
  children,
  showTopBar = true,
  className = '',
  overlayClassName = 'bg-slate-900/50',
}) => {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn ${overlayClassName}`}
      onClick={closeOnOverlayClick && onClose ? () => onClose() : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className={`bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden border border-slate-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showTopBar && <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />}
        {children}
      </div>
    </div>
  );
};

export default Modal;
