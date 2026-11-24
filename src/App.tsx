import { useEffect, useState } from 'react';
import { AppView, ConfirmDialogState, GameId, RulesTab } from './types';
import { sound } from './lib/audio';
import { loadSoundPreference, saveSoundPreference } from './lib/storage';
import { Header } from './components/ui/Header';
import { RulesModal } from './components/ui/RulesModal';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { HubScreen } from './components/hub/HubScreen';
import { KiyumiGame } from './components/kiyumi/KiyumiGame';
import { ImpostorGame } from './components/impostor/ImpostorGame';
import { ZoeGame } from './components/zoe/ZoeGame';

const GAME_META: Record<GameId, { title: string; subtitle: string }> = {
  kiyumi: { title: 'Kiyumi', subtitle: 'Mímica Rápida · 30s' },
  impostor: { title: 'O Impostor', subtitle: 'Dedução Social · Clássico' },
  zoe: { title: 'Zoe', subtitle: 'Quem na Roda?' },
};

export function App() {
  const [view, setView] = useState<AppView>('hub');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadSoundPreference());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [impostorMatchActive, setImpostorMatchActive] = useState(false);

  useEffect(() => {
    sound.setEnabled(soundEnabled);
    saveSoundPreference(soundEnabled);
  }, [soundEnabled]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) {
      sound.unlock();
      sound.tap();
    }
  };

  const requestConfirm = (opts: {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    tone?: 'danger' | 'primary';
    onConfirm: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel,
      cancelLabel: opts.cancelLabel,
      tone: opts.tone ?? 'danger',
      onConfirm: opts.onConfirm,
    });
  };

  const handleBackToHub = () => {
    if (view === 'impostor' && impostorMatchActive) {
      requestConfirm({
        title: 'Sair da partida de O Impostor?',
        message: 'Os papéis secretos e o progresso desta ronda serão perdidos.',
        confirmLabel: 'Sair para o Hub',
        onConfirm: () => {
          setImpostorMatchActive(false);
          setView('hub');
        },
      });
      return;
    }
    setView('hub');
  };

  const rulesInitialTab: RulesTab = view === 'hub' ? 'geral' : view;
  const activeMeta = view !== 'hub' ? GAME_META[view] : null;

  return (
    <div className="min-h-[100dvh] w-full bg-[#07131D] text-[#F3FAFA]">
      <Header
        showBack={view !== 'hub'}
        title={activeMeta?.title}
        subtitle={activeMeta?.subtitle}
        onBack={handleBackToHub}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setRulesOpen(true)}
      />

      <main className="w-full">
        {view === 'hub' && <HubScreen onSelectGame={(game) => setView(game)} />}
        {view === 'kiyumi' && <KiyumiGame onRequestConfirm={requestConfirm} />}
        {view === 'impostor' && <ImpostorGame onActiveChange={setImpostorMatchActive} />}
        {view === 'zoe' && <ZoeGame />}
      </main>

      <RulesModal
        isOpen={rulesOpen}
        initialTab={rulesInitialTab}
        onClose={() => setRulesOpen(false)}
      />

      <ConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />
    </div>
  );
}

export default App;
