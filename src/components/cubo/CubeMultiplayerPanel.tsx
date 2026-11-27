import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  Crown,
  Play,
  QrCode,
  Radio,
  RefreshCw,
  Users,
  WifiOff,
} from 'lucide-react';
import { CubeRoomPlayer, CubeSize } from '../../types';
import { formatCubeTime } from '../../lib/cubeEngine';
import { RoomConnectionState } from '../../lib/cubeRoom';
import { sound } from '../../lib/audio';

interface CubeMultiplayerPanelProps {
  size: CubeSize;
  playerName: string;
  onChangePlayerName: (name: string) => void;
  roomCode: string | null;
  scrambleSeed: string;
  isHost: boolean;
  connectionState: RoomConnectionState;
  connectionDetail: string;
  players: CubeRoomPlayer[];
  onCreateRoom: () => void;
  onJoinRoom: (code: string, optionalSeed?: string) => void;
  onLeaveRoom: () => void;
  onRegenerateSeed: () => void;
  onStartDuel: () => void;
}

export function CubeMultiplayerPanel({
  size,
  playerName,
  onChangePlayerName,
  roomCode,
  scrambleSeed,
  isHost,
  connectionState,
  connectionDetail,
  players,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onRegenerateSeed,
  onStartDuel,
}: CubeMultiplayerPanelProps) {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [offlineSeedInput, setOfflineSeedInput] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const shareUrl =
    roomCode && typeof window !== 'undefined'
      ? `${window.location.origin}/?cubo=${encodeURIComponent(roomCode)}&size=${size}&seed=${encodeURIComponent(scrambleSeed)}`
      : '';

  useEffect(() => {
    if (!shareUrl) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(shareUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#070B14',
        light: '#F8FAFC',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  const handleCopyLink = async () => {
    sound.tap();
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  // Ordenar pódio: resolvidos primeiro por menor tempo, depois quem ainda está a resolver
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.status === 'solved' && b.status !== 'solved') return -1;
    if (b.status === 'solved' && a.status !== 'solved') return 1;
    if (a.status === 'solved' && b.status === 'solved') {
      return (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity);
    }
    return a.isHost ? -1 : 1;
  });

  if (!roomCode) {
    return (
      <div className="space-y-4">
        {/* Nome do Jogador */}
        <div className="glass-card rounded-3xl p-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#19D8F2]">
            Teu Nome no Duelo
          </label>
          <input
            type="text"
            value={playerName}
            maxLength={18}
            placeholder="Ex.: Amina, Beto, Célia..."
            onChange={(e) => onChangePlayerName(e.target.value)}
            className="mt-2 min-h-[48px] w-full rounded-2xl border border-white/12 bg-[#070B14] px-4 text-sm font-bold text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:border-[#00F5D4] focus:outline-none"
          />
        </div>

        {/* Criar Nova Sala */}
        <div className="glass-card rounded-3xl border-[#00F5D4]/30 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00F5D4]/15 text-[#00F5D4]">
              <QrCode className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#F8FAFC]">
                Criar Sala de Duelo
              </h3>
              <p className="text-xs text-[#B9CAC4]">
                Gera código de 4 letras + QR Code com o mesmo cubo para todos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onCreateRoom();
            }}
            className="mt-4 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.4)] transition active:scale-[0.98]"
          >
            <Users className="h-5 w-5" />
            Criar Sala ({size}×{size})
          </button>
        </div>

        {/* Entrar numa Sala Existente */}
        <div className="glass-card rounded-3xl p-5">
          <h3 className="font-display text-base font-extrabold text-[#F8FAFC]">
            Entrar numa Sala
          </h3>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            Digita o código de 4 letras do anfitrião (ou usa a Seed se estiverem sem internet).
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <input
              type="text"
              value={joinCodeInput}
              maxLength={4}
              placeholder="CÓDIGO (EX: LISP)"
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              className="min-h-[48px] rounded-2xl border border-white/12 bg-[#070B14] px-3.5 text-center font-display text-base font-extrabold tracking-widest text-[#00F5D4] placeholder:text-xs placeholder:tracking-normal placeholder:text-[#94A3B8]/50 focus:border-[#00F5D4] focus:outline-none"
            />
            <input
              type="text"
              value={offlineSeedInput}
              maxLength={8}
              placeholder="Seed (opcional)"
              onChange={(e) =>
                setOfflineSeedInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
              }
              className="min-h-[48px] rounded-2xl border border-white/12 bg-[#070B14] px-3.5 text-center font-display text-sm font-bold tracking-wider text-[#FF6B35] placeholder:text-xs placeholder:tracking-normal placeholder:text-[#94A3B8]/50 focus:border-[#FF6B35] focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={joinCodeInput.length < 4 && offlineSeedInput.length < 4}
            onClick={() => {
              sound.tap();
              const code = joinCodeInput.length === 4 ? joinCodeInput : 'OFFL';
              onJoinRoom(code, offlineSeedInput || undefined);
            }}
            className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#FF6B35] bg-[#070B14] px-5 font-display text-sm font-extrabold text-[#FF6B35] transition active:scale-[0.98] disabled:opacity-40"
          >
            Entrar na Sala
          </button>
        </div>
      </div>
    );
  }

  // Sala Ativa (Lobby + QR Code + Pódio Ao Vivo)
  return (
    <div className="space-y-4">
      {/* Cartão da Sala + Código + QR Code */}
      <div className="glass-card rounded-3xl border-[#00F5D4]/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {connectionState === 'offline-fallback' ? (
              <WifiOff className="h-4 w-4 text-[#FF6B35]" />
            ) : (
              <Radio
                className={`h-4 w-4 ${
                  connectionState === 'connected'
                    ? 'animate-pulse text-[#00FFA3]'
                    : 'text-[#19D8F2]'
                }`}
              />
            )}
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-[#19D8F2]">
              Sala {roomCode} · Cubo {size}×{size}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onLeaveRoom();
            }}
            className="rounded-full bg-[#1B2029] px-3 py-1 text-[11px] font-bold text-[#94A3B8] hover:text-[#FF3366]"
          >
            Sair
          </button>
        </div>

        <p className="mt-1.5 text-xs text-[#B9CAC4]">{connectionDetail}</p>

        {/* Código + QR + Seed */}
        <div className="mt-3.5 flex flex-col items-center gap-3 rounded-2xl bg-[#070B14] p-4 sm:flex-row">
          {qrDataUrl && (
            <div className="shrink-0 overflow-hidden rounded-2xl bg-[#F8FAFC] p-2">
              <img src={qrDataUrl} alt={`QR Code Sala ${roomCode}`} className="h-32 w-32" />
            </div>
          )}

          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
              Código da Sala
            </span>
            <span className="font-display text-4xl font-extrabold tracking-[0.2em] text-[#00F5D4]">
              {roomCode}
            </span>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-[#1B2029] px-2.5 py-1 font-display text-[11px] font-bold text-[#FF6B35]">
                Seed: {scrambleSeed}
              </span>
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    sound.tap();
                    onRegenerateSeed();
                  }}
                  aria-label="Nova Seed"
                  className="inline-flex items-center gap-1 rounded-full bg-[#1B2029] px-2.5 py-1 text-[11px] font-bold text-[#19D8F2] active:scale-95"
                >
                  <RefreshCw className="h-3 w-3" />
                  Nova Seed
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="mt-3 inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#1B2029] px-3.5 text-xs font-bold text-[#F8FAFC] transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#00FFA3]" />
                  Link copiado!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#00F5D4]" />
                  Copiar Link da Sala
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pódio Ao Vivo */}
      <div className="glass-card rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-xs font-extrabold uppercase tracking-widest text-[#00F5D4]">
            Pódio Ao Vivo ({players.length})
          </span>
          <span className="text-[11px] text-[#94A3B8]">Mesmo cubo para todos</span>
        </div>

        <ul className="space-y-2">
          {sortedPlayers.map((p, idx) => {
            const isFirst = idx === 0 && p.status === 'solved';
            return (
              <li
                key={p.id}
                className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 ${
                  isFirst
                    ? 'border border-[#00F5D4]/45 bg-[#00F5D4]/10'
                    : 'bg-[#070B14]'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-extrabold ${
                      isFirst
                        ? 'bg-[#00F5D4] text-[#070B14]'
                        : 'bg-[#1B2029] text-[#B9CAC4]'
                    }`}
                  >
                    {isFirst ? <Crown className="h-3.5 w-3.5" /> : `${idx + 1}º`}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-[#F8FAFC]">
                      {p.name}
                      {p.isHost && (
                        <span className="ml-1.5 text-[10px] font-semibold text-[#19D8F2]">
                          (Anfitrião)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {p.status === 'solved' && p.timeMs !== undefined ? (
                    <div>
                      <p className="font-display text-sm font-extrabold tabular-nums text-[#00F5D4]">
                        {formatCubeTime(p.timeMs)}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">{p.moves ?? 0} movs</p>
                    </div>
                  ) : p.status === 'solving' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B35]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#FF6B35]">
                      A resolver...
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#1B2029] px-2.5 py-0.5 text-[10px] font-bold text-[#00FFA3]">
                      Pronto
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Botão Iniciar Duelo 3-2-1 */}
      {(isHost || connectionState === 'offline-fallback') && (
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onStartDuel();
          }}
          className="flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00F5D4] px-6 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.45)] transition active:scale-[0.98]"
        >
          <Play className="h-5 w-5 fill-current" />
          Iniciar Duelo 3-2-1
        </button>
      )}
    </div>
  );
}
