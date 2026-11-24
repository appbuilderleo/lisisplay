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
            className="min-h-[52px] rounded-2xl border border-[#F3FAFA]/20 bg-[#0B1B28] px-4 font-semibold text-[#F3FAFA] transition active:scale-[0.98]"
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
            className={`min-h-[52px] rounded-2xl px-4 font-display font-extrabold transition active:scale-[0.98] ${
              isDanger
                ? 'bg-[#F97316] text-[#07131D]'
                : 'bg-[#00E5C4] text-[#07131D]'
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
            isDanger ? 'bg-[#F97316]/15 text-[#F97316]' : 'bg-[#19D8F2]/15 text-[#19D8F2]'
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm leading-relaxed text-[#F3FAFA]/90">{dialog.message}</p>
      </div>
    </Modal>
  );
}
