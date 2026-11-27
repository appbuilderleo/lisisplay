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
  { id: 'cubo', label: 'Cubo' },
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
          className="h-13 min-h-[52px] w-full rounded-full bg-[#00F5D4] font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_24px_-4px_rgba(0,245,212,0.35)] transition active:scale-[0.98]"
        >
          Entendido, vamos jogar!
        </button>
      }
    >
      {/* Tabs */}
      <div className="mb-4 grid grid-cols-5 gap-1 rounded-full bg-[#070B14] p-1">
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
              className={`min-h-[40px] rounded-full px-2 font-display text-xs font-extrabold transition ${
                selected
                  ? 'bg-[#00F5D4] text-[#070B14]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Brand showcase on General tab using official logo.png */}
      {activeTab === 'geral' && (
        <div className="mb-4 flex flex-col items-center rounded-2xl bg-[#F8FAFC] px-6 py-5 text-center">
          <img
            src="/logo.png"
            alt="Lisis Play — A diversão é estar juntos."
            className="h-24 w-auto object-contain"
          />
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#070B14] px-3 py-1 text-[11px] font-bold text-[#00F5D4]">
            <WifiOff className="h-3.5 w-3.5" />
            PWA · Modo Roda (1 Celular · Offline)
          </div>
        </div>
      )}

      {/* Rule Details */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-xl font-extrabold text-[#F8FAFC]">{current.title}</h3>
          <p className="mt-1 text-sm text-[#00F5D4]">{current.tagline}</p>
        </div>

        <ol className="space-y-2.5">
          {current.steps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-2xl bg-[#1B2029] p-3.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00F5D4]/15 font-display text-xs font-extrabold text-[#00F5D4]">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-[#DFE2F0]">{step}</p>
            </li>
          ))}
        </ol>

        <div className="flex items-start gap-3 rounded-2xl border border-[#FF6B35]/35 bg-[#FF6B35]/10 p-3.5">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B35]" />
          <p className="text-xs leading-relaxed text-[#DFE2F0]">
            <strong className="text-[#FF6B35]">Dica: </strong>
            {current.tip}
          </p>
        </div>
      </div>
    </Modal>
  );
}
