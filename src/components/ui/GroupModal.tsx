import { useEffect, useState } from 'react';
import { Plus, RotateCcw, Trash2, Users } from 'lucide-react';
import { ImpostorPlayer } from '../../types';
import {
  DEFAULT_IMPOSTOR_PLAYERS,
  loadImpostorPlayers,
  saveImpostorPlayers,
} from '../../lib/storage';
import { sound } from '../../lib/audio';
import { Modal } from './Modal';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GroupModal({ isOpen, onClose }: GroupModalProps) {
  const [players, setPlayers] = useState<ImpostorPlayer[]>(() => loadImpostorPlayers());

  useEffect(() => {
    if (isOpen) {
      setPlayers(loadImpostorPlayers());
    }
  }, [isOpen]);

  const handleSave = (next: ImpostorPlayer[]) => {
    setPlayers(next);
    saveImpostorPlayers(next);
  };

  const handleRename = (id: string, name: string) => {
    handleSave(players.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleRemove = (id: string) => {
    if (players.length <= 3) return;
    sound.tap();
    handleSave(players.filter((p) => p.id !== id));
  };

  const handleAdd = () => {
    if (players.length >= 10) return;
    sound.tap();
    const nextNum = players.length + 1;
    handleSave([
      ...players,
      { id: `p-${Date.now()}-${nextNum}`, name: `Jogador ${nextNum}` },
    ]);
  };

  const handleReset = () => {
    sound.tap();
    handleSave(DEFAULT_IMPOSTOR_PLAYERS);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="A Nossa Roda (Jogadores)"
      footer={
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onClose();
          }}
          className="h-13 min-h-[52px] w-full rounded-full bg-[#00F5D4] font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_24px_-4px_rgba(0,245,212,0.35)] transition active:scale-[0.98]"
        >
          Guardar Roda ({players.length} pessoas)
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#1B2029] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-[#00F5D4]" />
            <p className="text-xs leading-snug text-[#B9CAC4]">
              Os nomes ficam guardados neste aparelho e carregam automaticamente em{' '}
              <strong className="text-[#F8FAFC]">O Impostor</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            title="Repor nomes padrão"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#070B14] text-[#94A3B8] transition active:scale-95 hover:text-[#00F5D4]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {players.map((player, idx) => (
            <div key={player.id} className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1B2029] font-display text-xs font-extrabold text-[#00F5D4]">
                {idx + 1}
              </span>
              <input
                type="text"
                value={player.name}
                maxLength={22}
                placeholder={`Jogador ${idx + 1}`}
                onChange={(e) => handleRename(player.id, e.target.value)}
                className="min-h-[46px] w-full rounded-2xl border border-white/10 bg-[#070B14] px-3.5 text-sm font-semibold text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:border-[#00F5D4] focus:outline-none"
              />
              {players.length > 3 && (
                <button
                  type="button"
                  onClick={() => handleRemove(player.id)}
                  aria-label={`Remover ${player.name}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1B2029] text-[#94A3B8] transition active:scale-95 hover:text-[#FF3366]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {players.length < 10 && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#00F5D4]/45 bg-[#070B14]/70 font-display text-sm font-bold text-[#00F5D4] transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Adicionar Pessoa ({players.length}/10)
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
