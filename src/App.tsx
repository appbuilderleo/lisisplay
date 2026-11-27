import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AppView, ConfirmDialogState, CubeSize, GameId, RulesTab } from './types';
import { sound } from './lib/audio';
import { trackGamePlay } from './lib/adminApi';
import {
  loadFavoriteGames,
  loadSoundPreference,
  saveFavoriteGames,
  saveSoundPreference,
} from './lib/storage';
import { Header } from './components/ui/Header';
import { RulesModal } from './components/ui/RulesModal';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { GroupModal } from './components/ui/GroupModal';
import { SplashScreen } from './components/splash/SplashScreen';
import { HubScreen } from './components/hub/HubScreen';
import { KiyumiGame } from './components/kiyumi/KiyumiGame';
import { ImpostorGame } from './components/impostor/ImpostorGame';
import { ZoeGame } from './components/zoe/ZoeGame';

// Code-splitting do motor 3D Three.js e do Painel de Gestão Admin
const CuboMagicoGame = lazy(() =>
  import('./components/cubo/CuboMagicoGame').then((m) => ({ default: m.CuboMagicoGame })),
);
const AdminPortal = lazy(() =>
  import('./components/admin/AdminPortal').then((m) => ({ default: m.AdminPortal })),
);

const GAME_META: Record<GameId, { title: string; subtitle: string }> = {
  kiyumi: { title: 'Kiyumi', subtitle: 'Mímica & Descreve · 30s' },
  impostor: { title: 'O Impostor', subtitle: 'Dedução Social · Clássico' },
  zoe: { title: 'Zoe', subtitle: 'Quem na Roda?' },
  cubo: { title: 'Cubo Mágico', subtitle: '3D Digital · Solo & Duelo' },
};

function isAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return path === '/admin' || path.startsWith('/admin/') || params.get('admin') === '1';
}

function parseInitialCubeRoom(): { code: string; size?: CubeSize; seed?: string } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('cubo')?.trim().toUpperCase();
  if (!code || code.length < 3) return null;
  const rawSize = params.get('size');
  const size: CubeSize | undefined = rawSize === '2' ? 2 : rawSize === '3' ? 3 : undefined;
  const seed = params.get('seed')?.trim().toUpperCase() || undefined;
  return { code: code.slice(0, 4), size, seed };
}

export function App() {
  const initialCubeRoom = useMemo(() => parseInitialCubeRoom(), []);
  const [adminMode, setAdminMode] = useState<boolean>(() => isAdminUrl());
  const [view, setView] = useState<AppView>(() => (initialCubeRoom ? 'cubo' : 'splash'));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadSoundPreference());
  const [favorites, setFavorites] = useState<GameId[]>(() => loadFavoriteGames());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [impostorMatchActive, setImpostorMatchActive] = useState(false);

  useEffect(() => {
    sound.setEnabled(soundEnabled);
    saveSoundPreference(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    saveFavoriteGames(favorites);
  }, [favorites]);

  useEffect(() => {
    const onPopState = () => {
      setAdminMode(isAdminUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleOpenAdmin = () => {
    setAdminMode(true);
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleExitAdmin = () => {
    setAdminMode(false);
    setView('hub');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleSelectGame = (game: GameId) => {
    trackGamePlay(game);
    setView(game);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) {
      sound.unlock();
      sound.tap();
    }
  };

  const handleToggleFavorite = (gameId: GameId) => {
    setFavorites((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId],
    );
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
        confirmLabel: 'Sair para o Menu',
        onConfirm: () => {
          setImpostorMatchActive(false);
          setView('hub');
        },
      });
      return;
    }
    setView('hub');
  };

  if (adminMode) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-[#070B14] text-[#00F5D4]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00F5D4]/20 border-t-[#00F5D4]" />
            <p className="font-display text-xs font-extrabold uppercase tracking-widest">
              A abrir Painel de Gestão...
            </p>
          </div>
        }
      >
        <AdminPortal onExitToApp={handleExitAdmin} />
      </Suspense>
    );
  }

  if (view === 'splash') {
    return <SplashScreen onEnter={() => setView('hub')} />;
  }

  const rulesInitialTab: RulesTab = view === 'hub' ? 'geral' : view;
  const activeMeta = view !== 'hub' ? GAME_META[view] : null;

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#070B14] text-[#F8FAFC]">
      {/* Electric Social Arcade Ambient Glows across all game environments */}
      {view !== 'hub' && (
        <>
          <div className="pointer-events-none fixed -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00F5D4]/8 blur-[110px]" />
          <div className="pointer-events-none fixed -right-24 bottom-12 h-64 w-64 rounded-full bg-[#FF6B35]/8 blur-[100px]" />
        </>
      )}

      <Header
        showBack={view !== 'hub'}
        showTelemetryStrip={view === 'hub'}
        title={activeMeta?.title}
        subtitle={activeMeta?.subtitle}
        onBack={handleBackToHub}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setRulesOpen(true)}
      />

      <main className="relative z-10 w-full">
        {view === 'hub' && (
          <HubScreen
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectGame={handleSelectGame}
            onOpenRules={() => setRulesOpen(true)}
            onOpenGroup={() => setGroupOpen(true)}
            onOpenAdmin={handleOpenAdmin}
          />
        )}
        {view === 'kiyumi' && <KiyumiGame onRequestConfirm={requestConfirm} />}
        {view === 'impostor' && <ImpostorGame onActiveChange={setImpostorMatchActive} />}
        {view === 'zoe' && <ZoeGame />}
        {view === 'cubo' && (
          <Suspense
            fallback={
              <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00F5D4]/20 border-t-[#00F5D4]" />
                <p className="font-display text-sm font-bold text-[#00F5D4]">
                  A carregar Cubo Mágico 3D...
                </p>
              </div>
            }
          >
            <CuboMagicoGame initialRoomParams={initialCubeRoom} />
          </Suspense>
        )}
      </main>

      <RulesModal
        isOpen={rulesOpen}
        initialTab={rulesInitialTab}
        onClose={() => setRulesOpen(false)}
      />

      <GroupModal isOpen={groupOpen} onClose={() => setGroupOpen(false)} />

      <ConfirmModal dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />
    </div>
  );
}

export default App;
