import { useEffect, useState } from 'react';
import { Lightbulb, WifiOff } from 'lucide-react';
import { RULES_CONTENT } from '../../data/rules';
import { RulesTab } from '../../types';
import { sound } from '../../lib/audio';
import { Modal } from './Modal';

interface RulesModalProps {
  isOpen: boolean;
  initialTab: RulesTab;
  onClose: () => void;
}

const TABS: { id: RulesTab; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'kiyumi', label: 'Kiyumi' },
  { id: 'impostor', label: 'Impostor' },
  { id: 'zoe', label: 'Zoe' },
];

export function RulesModal({ isOpen, initialTab, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<RulesTab>(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  const current = RULES_CONTENT[activeTab];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Como Jogar · Lisis Play"
      footer={
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onClose();
          }}
          className="h-13 min-h-[48px] w-full rounded-2xl bg-[#00E5C4] font-display text-base font-extrabold text-[#07131D] transition active:scale-[0.98]"
        >
          Entendido, vamos jogar!
        </button>
      }
    >
      {/* Tabs */}
      <div className="mb-4 grid grid-cols-4 gap-1.5 rounded-2xl bg-[#07131D] p-1.5">
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.tap();
                setActiveTab(tab.id);
              }}
              className={`min-h-[44px] rounded-xl px-2 text-xs font-bold transition ${
                selected
                  ? 'bg-[#00E5C4] text-[#07131D]'
                  : 'text-[#F3FAFA]/70 hover:text-[#F3FAFA]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Brand showcase on General tab using official logo.png */}
      {activeTab === 'geral' && (
        <div className="mb-4 flex flex-col items-center rounded-2xl bg-[#F3FAFA] px-6 py-5 text-center">
          <img
            src="/logo.png"
            alt="Lisis Play — A diversão é estar juntos."
            className="h-24 w-auto object-contain"
          />
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#07131D] px-3 py-1 text-[11px] font-semibold text-[#00E5C4]">
            <WifiOff className="h-3.5 w-3.5" />
            PWA · Modo Roda (1 Celular · Offline)
          </div>
        </div>
      )}

      {/* Rule Details */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-xl font-extrabold text-[#F3FAFA]">{current.title}</h3>
          <p className="mt-1 text-sm text-[#19D8F2]">{current.tagline}</p>
        </div>

        <ol className="space-y-2.5">
          {current.steps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-2xl border border-[#F3FAFA]/10 bg-[#07131D]/70 p-3.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00E5C4]/15 font-display text-xs font-extrabold text-[#00E5C4]">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-[#F3FAFA]/90">{step}</p>
            </li>
          ))}
        </ol>

        <div className="flex items-start gap-3 rounded-2xl border border-[#F97316]/35 bg-[#F97316]/10 p-3.5">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#F97316]" />
          <p className="text-xs leading-relaxed text-[#F3FAFA]/90">
            <strong className="text-[#F97316]">Dica: </strong>
            {current.tip}
          </p>
        </div>
      </div>
    </Modal>
  );
}
