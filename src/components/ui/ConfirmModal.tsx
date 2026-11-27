import { AlertTriangle } from 'lucide-react';
import { ConfirmDialogState } from '../../types';
import { sound } from '../../lib/audio';
import { Modal } from './Modal';

interface ConfirmModalProps {
  dialog: ConfirmDialogState | null;
  onClose: () => void;
}

export function ConfirmModal({ dialog, onClose }: ConfirmModalProps) {
  if (!dialog || !dialog.isOpen) return null;

  const isDanger = dialog.tone === 'danger';

  return (
    <Modal
      isOpen={dialog.isOpen}
      onClose={onClose}
      title={dialog.title}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="min-h-[52px] rounded-full border border-white/15 bg-[#1B2029] px-4 font-display text-sm font-bold text-[#F8FAFC] transition active:scale-[0.98]"
          >
            {dialog.cancelLabel ?? 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              dialog.onConfirm();
              onClose();
            }}
            className={`min-h-[52px] rounded-full px-4 font-display text-sm font-extrabold transition active:scale-[0.98] ${
              isDanger
                ? 'bg-[#FF6B35] text-[#070B14]'
                : 'bg-[#00F5D4] text-[#070B14]'
            }`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3.5 py-2">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isDanger ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#00F5D4]/15 text-[#00F5D4]'
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm leading-relaxed text-[#DFE2F0]">{dialog.message}</p>
      </div>
    </Modal>
  );
}
