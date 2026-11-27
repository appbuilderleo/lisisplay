import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { sound } from '../../lib/audio';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#070B14]/82 p-3 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.tap();
          onClose();
        }
      }}
    >
      <div className="animate-slide-up flex max-h-[88dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl border border-[#00F5D4]/25 bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-extrabold text-[#F8FAFC]">{title}</h2>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            aria-label="Fechar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B2029] text-[#F8FAFC] transition active:scale-95 hover:bg-[#262A34]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="border-t border-white/10 bg-[#070B14]/60 px-5 py-3.5 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
