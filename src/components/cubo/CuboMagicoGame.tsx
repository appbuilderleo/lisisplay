import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  History,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  Undo2,
  Users,
} from 'lucide-react';
import { CubeRoomPlayer, CubeSize, CubeSolveRecord } from '../../types';
import {
  computeCubeStats,
  formatCubeTime,
  generateRoomCode,
  generateScrambleMoves,
  generateScrambleSeed,
} from '../../lib/cubeEngine';
import {
  loadCubeHistory,
  loadCubePlayerName,
  saveCubeHistory,
  saveCubePlayerName,
} from '../../lib/storage';
import { CubeRoomController, RoomConnectionState } from '../../lib/cubeRoom';
import { sound } from '../../lib/audio';
import { useWakeLock } from '../../hooks/useWakeLock';
import { CountdownOverlay } from '../ui/CountdownOverlay';
import { Modal } from '../ui/Modal';
import { CubeCanvas, CubeCanvasHandle } from './CubeCanvas';
import { CubeMultiplayerPanel } from './CubeMultiplayerPanel';

type CubeMode = 'solo' | 'multiplayer';
type SolvePhase = 'idle' | 'armed' | 'running' | 'solved';

interface CuboMagicoGameProps {
  initialRoomParams?: {
    code: string;
    size?: CubeSize;
    seed?: string;
  } | null;
}

export function CuboMagicoGame({ initialRoomParams }: CuboMagicoGameProps) {
  const [mode, setMode] = useState<CubeMode>(initialRoomParams ? 'multiplayer' : 'solo');
  const [size, setSize] = useState<CubeSize>(initialRoomParams?.size ?? 3);
  const [solvePhase, setSolvePhase] = useState<SolvePhase>('idle');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [currentSeed, setCurrentSeed] = useState<string>(() =>
    initialRoomParams?.seed || generateScrambleSeed(),
  );
  const [history, setHistory] = useState<CubeSolveRecord[]>(() => loadCubeHistory());
  const [isNewPB, setIsNewPB] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPodiumModal, setShowPodiumModal] = useState(false);

  // Multiplayer Room State
  const [playerName, setPlayerName] = useState<string>(() => loadCubePlayerName() || 'Jogador');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [connectionState, setConnectionState] = useState<RoomConnectionState>('idle');
  const [connectionDetail, setConnectionDetail] = useState('');
  const [roomPlayers, setRoomPlayers] = useState<CubeRoomPlayer[]>([]);
  const [duelCountdown, setDuelCountdown] = useState<{
    active: boolean;
    size: CubeSize;
    seed: string;
  } | null>(null);
  const [inDuelRace, setInDuelRace] = useState(false);

  const cubeRef = useRef<CubeCanvasHandle | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafTimerRef = useRef<number>(0);
  const movesRef = useRef<number>(0);
  const solvePhaseRef = useRef<SolvePhase>(solvePhase);
  const modeRef = useRef<CubeMode>(mode);
  const sizeRef = useRef<CubeSize>(size);
  const seedRef = useRef<string>(currentSeed);
  const historyRef = useRef<CubeSolveRecord[]>(history);
  const roomCtrlRef = useRef<CubeRoomController | null>(null);
  const localPlayerIdRef = useRef<string>(
    `cubo-${Math.random().toString(36).slice(2, 9)}`,
  );

  movesRef.current = movesCount;
  solvePhaseRef.current = solvePhase;
  modeRef.current = mode;
  sizeRef.current = size;
  seedRef.current = currentSeed;
  historyRef.current = history;

  useWakeLock(solvePhase === 'running' || inDuelRace);

  const stats = useMemo(() => computeCubeStats(history, size), [history, size]);
  const sizeHistory = useMemo(
    () => history.filter((r) => r.size === size).slice(0, 15),
    [history, size],
  );

  // Persist player name
  const handlePlayerNameChange = (next: string) => {
    setPlayerName(next);
    saveCubePlayerName(next);
  };

  // High-precision stopwatch loop (00:00.0)
  useEffect(() => {
    if (solvePhase !== 'running') {
      window.cancelAnimationFrame(rafTimerRef.current);
      return;
    }
    const tick = () => {
      setElapsedMs(performance.now() - startTimeRef.current);
      rafTimerRef.current = window.requestAnimationFrame(tick);
    };
    rafTimerRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafTimerRef.current);
  }, [solvePhase]);

  // Cleanup multiplayer peer on unmount
  useEffect(() => {
    return () => {
      roomCtrlRef.current?.destroy();
    };
  }, []);

  const ensureRoomController = useCallback(() => {
    if (roomCtrlRef.current) {
      roomCtrlRef.current.destroy();
    }
    const cleanName = playerName.trim() || 'Jogador';
    const ctrl = new CubeRoomController(localPlayerIdRef.current, cleanName, {
      onConnectionState: (st, detail) => {
        setConnectionState(st);
        setConnectionDetail(detail ?? '');
      },
      onPlayersChange: (list) => {
        setRoomPlayers(list);
      },
      onConfigSync: ({ size: nextSize, seed: nextSeed }) => {
        setSize(nextSize);
        setCurrentSeed(nextSeed);
      },
      onStartDuel: ({ size: duelSize, seed: duelSeed }) => {
        setSize(duelSize);
        setCurrentSeed(duelSeed);
        setInDuelRace(true);
        setShowPodiumModal(false);
        setSolvePhase('idle');
        setElapsedMs(0);
        setMovesCount(0);
        setIsNewPB(false);
        setDuelCountdown({ active: true, size: duelSize, seed: duelSeed });
      },
    });
    roomCtrlRef.current = ctrl;
    return ctrl;
  }, [playerName]);

  // Auto-join room if opened via QR deep-link (?cubo=XXXX)
  const autoJoinedRef = useRef(false);
  useEffect(() => {
    if (!initialRoomParams || autoJoinedRef.current) return;
    autoJoinedRef.current = true;
    const code = initialRoomParams.code.toUpperCase();
    const targetSize = initialRoomParams.size ?? 3;
    const targetSeed = initialRoomParams.seed ?? generateScrambleSeed();
    setMode('multiplayer');
    setSize(targetSize);
    setCurrentSeed(targetSeed);
    setRoomCode(code);
    setIsHost(false);
    const ctrl = ensureRoomController();
    ctrl.joinRoom(code, targetSize, targetSeed);
  }, [initialRoomParams, ensureRoomController]);

  // Actions: Scramble, Reset, Undo, Center
  const handleScrambleSolo = useCallback(
    (overrideSize?: CubeSize, overrideSeed?: string) => {
      sound.unlock();
      sound.go();
      const targetSize = overrideSize ?? sizeRef.current;
      const seed = overrideSeed ?? generateScrambleSeed();
      setCurrentSeed(seed);
      setElapsedMs(0);
      setMovesCount(0);
      setIsNewPB(false);
      setSolvePhase('armed');

      const moves = generateScrambleMoves(targetSize, seed);
      // Pequeno micro-delay caso o tamanho do cubo tenha acabado de mudar
      window.requestAnimationFrame(() => {
        cubeRef.current?.applyScramble(moves);
      });
    },
    [],
  );

  const handleResetCube = () => {
    sound.tap();
    cubeRef.current?.resetSolved();
    setSolvePhase('idle');
    setElapsedMs(0);
    setMovesCount(0);
    setIsNewPB(false);
  };

  const handleUndo = () => {
    cubeRef.current?.undoMove();
  };

  const handleCenter = () => {
    sound.tap();
    cubeRef.current?.centerCamera();
  };

  const handleSelectSize = (nextSize: CubeSize) => {
    if (nextSize === size) return;
    sound.tap();
    setSize(nextSize);
    setSolvePhase('idle');
    setElapsedMs(0);
    setMovesCount(0);
    setIsNewPB(false);
    if (mode === 'multiplayer' && isHost && roomCode) {
      const nextSeed = generateScrambleSeed();
      setCurrentSeed(nextSeed);
      roomCtrlRef.current?.updateHostConfig(nextSize, nextSeed);
    }
  };

  // Triggered on every user layer turn
  const handleUserMove = useCallback((totalMoves: number) => {
    setMovesCount(totalMoves);
    if (solvePhaseRef.current === 'armed') {
      startTimeRef.current = performance.now();
      setSolvePhase('running');
    }
  }, []);

  // Triggered automatically when all 6 faces are solved!
  const handleCubeSolved = useCallback(() => {
    const finalMs =
      solvePhaseRef.current === 'running'
        ? Math.max(100, Math.round(performance.now() - startTimeRef.current))
        : Math.max(100, Math.round(elapsedMs));

    setElapsedMs(finalMs);
    setSolvePhase('solved');
    sound.victory();

    const activeSize = sizeRef.current;
    const prevStats = computeCubeStats(historyRef.current, activeSize);
    const beatPB = prevStats.pbMs === null || finalMs < prevStats.pbMs;
    setIsNewPB(beatPB);

    const record: CubeSolveRecord = {
      id: `solve-${Date.now()}`,
      size: activeSize,
      timeMs: finalMs,
      moves: Math.max(1, movesRef.current),
      seed: seedRef.current,
      createdAt: Date.now(),
    };
    const nextHistory = [record, ...historyRef.current].slice(0, 60);
    setHistory(nextHistory);
    saveCubeHistory(nextHistory);

    if (modeRef.current === 'multiplayer' && roomCtrlRef.current) {
      roomCtrlRef.current.reportSolved(finalMs, Math.max(1, movesRef.current));
    }
  }, [elapsedMs]);

  // Multiplayer Room Actions
  const handleCreateRoom = () => {
    const code = generateRoomCode(4);
    const seed = generateScrambleSeed(6);
    setRoomCode(code);
    setCurrentSeed(seed);
    setIsHost(true);
    setInDuelRace(false);
    const ctrl = ensureRoomController();
    ctrl.createRoom(code, size, seed);
  };

  const handleJoinRoom = (code: string, optionalSeed?: string) => {
    const cleanCode = code.toUpperCase();
    const seed = optionalSeed || generateScrambleSeed(6);
    setRoomCode(cleanCode);
    setCurrentSeed(seed);
    setIsHost(false);
    setInDuelRace(false);
    const ctrl = ensureRoomController();
    ctrl.joinRoom(cleanCode, size, seed);
  };

  const handleLeaveRoom = () => {
    roomCtrlRef.current?.destroy();
    roomCtrlRef.current = null;
    setRoomCode(null);
    setIsHost(false);
    setRoomPlayers([]);
    setInDuelRace(false);
    setConnectionState('idle');
    setSolvePhase('idle');
    setElapsedMs(0);
    setMovesCount(0);
  };

  const handleRegenerateSeed = () => {
    const nextSeed = generateScrambleSeed(6);
    setCurrentSeed(nextSeed);
    roomCtrlRef.current?.updateHostConfig(size, nextSeed);
  };

  const handleStartDuel = () => {
    const nextSeed = currentSeed || generateScrambleSeed(6);
    roomCtrlRef.current?.startDuel(size, nextSeed);
  };

  const handleDuelCountdownFinish = useCallback(() => {
    if (!duelCountdown) return;
    const moves = generateScrambleMoves(duelCountdown.size, duelCountdown.seed);
    setDuelCountdown(null);
    setMovesCount(0);
    setElapsedMs(0);
    setIsNewPB(false);
    window.requestAnimationFrame(() => {
      cubeRef.current?.applyScramble(moves);
      startTimeRef.current = performance.now();
      setSolvePhase('running');
    });
  }, [duelCountdown]);

  const showCubeStage = mode === 'solo' || inDuelRace;

  // Ordenar pódio para badge ao vivo durante duelo
  const sortedPodium = useMemo(() => {
    return [...roomPlayers].sort((a, b) => {
      if (a.status === 'solved' && b.status !== 'solved') return -1;
      if (b.status === 'solved' && a.status !== 'solved') return 1;
      if (a.status === 'solved' && b.status === 'solved') {
        return (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity);
      }
      return 0;
    });
  }, [roomPlayers]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-lg flex-col px-3.5 pb-safe pt-2.5">
      {/* Contagem Sincronizada de Duelo 3-2-1 */}
      {duelCountdown?.active && (
        <CountdownOverlay
          title={`Duelo Cubo ${duelCountdown.size}×${duelCountdown.size} · Seed ${duelCountdown.seed}`}
          instruction="Todos os jogadores recebem o mesmo cubo! Prepara os dedos..."
          finalLabel="RESOLVAM!"
          onComplete={handleDuelCountdownFinish}
        />
      )}

      {/* Top Mode & Size Selector Bar */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="glass-card grid flex-1 grid-cols-2 rounded-full p-1">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setMode('solo');
              setInDuelRace(false);
            }}
            className={`min-h-[38px] rounded-full font-display text-xs font-extrabold uppercase tracking-wider transition ${
              mode === 'solo'
                ? 'bg-[#00F5D4] text-[#070B14]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Solo
          </button>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setMode('multiplayer');
            }}
            className={`flex min-h-[38px] items-center justify-center gap-1 rounded-full font-display text-xs font-extrabold uppercase tracking-wider transition ${
              mode === 'multiplayer'
                ? 'bg-[#00F5D4] text-[#070B14]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Duelo
          </button>
        </div>

        {/* Seletor 2x2 / 3x3 */}
        <div className="glass-card flex shrink-0 items-center rounded-full p-1">
          {([2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              disabled={inDuelRace && solvePhase === 'running'}
              onClick={() => handleSelectSize(s)}
              className={`min-h-[38px] rounded-full px-3 font-display text-xs font-extrabold transition disabled:opacity-40 ${
                size === s
                  ? 'bg-[#FF6B35] text-[#070B14]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      {/* MULTIPLAYER LOBBY VIEW (when in Duelo mode and not actively racing) */}
      {!showCubeStage ? (
        <div className="flex-1 py-1">
          <CubeMultiplayerPanel
            size={size}
            playerName={playerName}
            onChangePlayerName={handlePlayerNameChange}
            roomCode={roomCode}
            scrambleSeed={currentSeed}
            isHost={isHost}
            connectionState={connectionState}
            connectionDetail={connectionDetail}
            players={roomPlayers}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onLeaveRoom={handleLeaveRoom}
            onRegenerateSeed={handleRegenerateSeed}
            onStartDuel={handleStartDuel}
          />
        </div>
      ) : (
        /* ACTIVE 3D CUBE STAGE (Solo OR Live Multiplayer Race) */
        <>
          {/* Compact Telemetry Card: Stopwatch + PB/Ao5 or Live Podium button */}
          <div className="glass-card mb-2 flex items-center justify-between gap-2 rounded-2xl px-4 py-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-display text-3xl font-extrabold tabular-nums leading-none tracking-tight ${
                    solvePhase === 'solved'
                      ? 'text-[#00F5D4]'
                      : solvePhase === 'armed'
                        ? 'text-[#FF6B35]'
                        : 'text-[#19D8F2]'
                  }`}
                >
                  {formatCubeTime(elapsedMs)}
                </span>
                {solvePhase === 'armed' && (
                  <span className="rounded-full bg-[#FF6B35]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#FF6B35]">
                    1.º toque inicia
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2.5 text-[11px] font-semibold text-[#94A3B8]">
                <span>Movs: {movesCount}</span>
                <span>•</span>
                {mode === 'solo' ? (
                  <>
                    <span>
                      PB:{' '}
                      <strong className="text-[#00F5D4]">
                        {stats.pbMs !== null ? formatCubeTime(stats.pbMs) : '--:--.-'}
                      </strong>
                    </span>
                    {stats.ao5Ms !== null && (
                      <>
                        <span>•</span>
                        <span>
                          Ao5:{' '}
                          <strong className="text-[#19D8F2]">
                            {formatCubeTime(stats.ao5Ms)}
                          </strong>
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-[#FF6B35]">
                    Sala {roomCode} · Seed {currentSeed}
                  </span>
                )}
              </div>
            </div>

            {mode === 'solo' ? (
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setShowHistoryModal(true);
                }}
                aria-label="Ver histórico de tempos"
                className="flex h-11 items-center gap-1.5 rounded-full bg-[#1B2029] px-3 text-xs font-bold text-[#19D8F2] transition active:scale-95"
              >
                <History className="h-4 w-4" />
                <span>{stats.count}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setShowPodiumModal(true);
                }}
                className="flex h-11 items-center gap-1.5 rounded-full bg-[#00F5D4]/15 px-3 text-xs font-bold text-[#00F5D4] transition active:scale-95"
              >
                <Trophy className="h-4 w-4" />
                <span>Pódio</span>
              </button>
            )}
          </div>

          {/* GIANT INTERACTIVE 3D CUBE CARD (Occupies most of the screen!) */}
          <div className="relative flex min-h-[340px] flex-1 flex-col overflow-hidden rounded-[2rem] border-2 border-[#00F5D4]/30 bg-[#070B14] shadow-2xl">
            {/* Ambient radial spotlight behind the 3D cube */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 48%, rgba(0,245,212,0.12) 0%, rgba(15,23,42,0.55) 48%, rgba(7,11,20,0.96) 100%)',
              }}
            />

            {/* WebGL 60fps 3D Cube */}
            <div className="relative z-10 h-full min-h-[330px] w-full flex-1">
              <CubeCanvas
                ref={cubeRef}
                size={size}
                locked={solvePhase === 'solved'}
                onUserMove={handleUserMove}
                onSolved={handleCubeSolved}
              />
            </div>

            {/* Subtle inside-card touch hint when idle or armed */}
            {solvePhase !== 'running' && solvePhase !== 'solved' && (
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex justify-center">
                <span className="glass-card rounded-full px-3.5 py-1.5 text-center text-[11px] font-medium text-[#B9CAC4]">
                  Desliza numa peça para girar · Arrasta fora para rodar 360°
                </span>
              </div>
            )}

            {/* Solved Celebration Overlay Inside the Card */}
            {solvePhase === 'solved' && (
              <div className="animate-pop-in absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070B14]/84 p-6 text-center backdrop-blur-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#00F5D4]/20 text-[#00F5D4]">
                  <Trophy className="h-9 w-9" />
                </div>

                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#00FFA3]/15 px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-[#00FFA3]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isNewPB ? 'Novo Recorde Pessoal!' : 'Cubo Resolvido!'}
                </span>

                <p className="font-display mt-3 text-5xl font-extrabold tabular-nums text-[#00F5D4]">
                  {formatCubeTime(elapsedMs)}
                </p>

                <p className="mt-1.5 text-xs font-semibold text-[#B9CAC4]">
                  Cubo {size}×{size} · {movesCount} movimentos · Seed {currentSeed}
                </p>

                <div className="mt-5 flex w-full max-w-xs flex-col gap-2.5">
                  {mode === 'solo' ? (
                    <button
                      type="button"
                      onClick={() => handleScrambleSolo()}
                      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-6 font-display text-sm font-extrabold text-[#070B14] shadow-[0_8px_24px_-4px_rgba(0,245,212,0.4)] transition active:scale-95"
                    >
                      <Shuffle className="h-4 w-4" />
                      Embaralhar e Tentar de Novo
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setShowPodiumModal(true);
                        }}
                        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-6 font-display text-sm font-extrabold text-[#070B14] transition active:scale-95"
                      >
                        <Trophy className="h-4 w-4" />
                        Ver Pódio Ao Vivo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setInDuelRace(false);
                          setSolvePhase('idle');
                        }}
                        className="glass-card min-h-[46px] w-full rounded-full font-display text-xs font-bold text-[#DFE2F0] transition active:scale-95"
                      >
                        Voltar à Sala
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom 35% Thumb-Zone Support Buttons */}
          <div className="flex items-center gap-2 py-2.5">
            <button
              type="button"
              disabled={movesCount === 0 || solvePhase === 'solved'}
              onClick={handleUndo}
              aria-label="Desfazer movimento"
              title="Desfazer"
              className="glass-card flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full text-[#F8FAFC] transition active:scale-95 disabled:opacity-35"
            >
              <Undo2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleCenter}
              aria-label="Centrar cubo"
              title="Centrar cubo"
              className="glass-card flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full text-[#19D8F2] transition active:scale-95"
            >
              <Compass className="h-5 w-5" />
            </button>

            {mode === 'solo' ? (
              <>
                <button
                  type="button"
                  onClick={handleResetCube}
                  aria-label="Reiniciar cubo"
                  title="Reiniciar"
                  className="glass-card flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full text-[#B9CAC4] transition active:scale-95 hover:text-[#FF3366]"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleScrambleSolo()}
                  className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-5 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(255,107,53,0.45)] transition active:scale-[0.98]"
                >
                  <Shuffle className="h-5 w-5" />
                  Embaralhar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setInDuelRace(false);
                  setSolvePhase('idle');
                }}
                className="glass-card flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-full border-[#00F5D4]/35 px-4 font-display text-sm font-extrabold text-[#00F5D4] transition active:scale-[0.98]"
              >
                <Users className="h-4 w-4" />
                Sala {roomCode} · Pódio
              </button>
            )}
          </div>
        </>
      )}

      {/* Modal: Histórico Solo (PB, Ao5 e últimos tempos) */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={`Recordes · Cubo ${size}×${size}`}
        footer={
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setShowHistoryModal(false);
            }}
            className="min-h-[50px] w-full rounded-full bg-[#00F5D4] font-display text-sm font-extrabold text-[#070B14]"
          >
            Fechar
          </button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-[#1B2029] p-3">
              <p className="text-[10px] font-bold uppercase text-[#94A3B8]">Melhor (PB)</p>
              <p className="font-display mt-1 text-base font-extrabold tabular-nums text-[#00F5D4]">
                {stats.pbMs !== null ? formatCubeTime(stats.pbMs) : '--:--.-'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#1B2029] p-3">
              <p className="text-[10px] font-bold uppercase text-[#94A3B8]">Média Ao5</p>
              <p className="font-display mt-1 text-base font-extrabold tabular-nums text-[#19D8F2]">
                {stats.ao5Ms !== null ? formatCubeTime(stats.ao5Ms) : '--:--.-'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#1B2029] p-3">
              <p className="text-[10px] font-bold uppercase text-[#94A3B8]">Resolvidos</p>
              <p className="font-display mt-1 text-base font-extrabold text-[#FF6B35]">
                {stats.count}
              </p>
            </div>
          </div>

          {sizeHistory.length === 0 ? (
            <p className="rounded-2xl bg-[#1B2029] p-5 text-center text-xs text-[#94A3B8]">
              Ainda não tens tempos registados no cubo {size}×{size}. Carrega em{' '}
              <strong className="text-[#FF6B35]">Embaralhar</strong> e começa a treinar!
            </p>
          ) : (
            <ul className="space-y-2">
              {sizeHistory.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-[#1B2029] px-4 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-[#94A3B8]">#{idx + 1}</span>
                    <span className="font-display text-base font-extrabold tabular-nums text-[#F8FAFC]">
                      {formatCubeTime(item.timeMs)}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-[#94A3B8]">
                    <span>{item.moves} movs</span>
                    <span className="mx-1.5">•</span>
                    <span className="text-[#19D8F2]">{item.seed}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {/* Modal: Pódio Ao Vivo (durante corrida multijogador) */}
      <Modal
        isOpen={showPodiumModal}
        onClose={() => setShowPodiumModal(false)}
        title={`Pódio Ao Vivo · Sala ${roomCode ?? ''}`}
        footer={
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setShowPodiumModal(false);
            }}
            className="min-h-[50px] w-full rounded-full bg-[#00F5D4] font-display text-sm font-extrabold text-[#070B14]"
          >
            Voltar ao Cubo
          </button>
        }
      >
        <div className="space-y-2.5">
          {sortedPodium.map((p, idx) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                idx === 0 && p.status === 'solved'
                  ? 'border border-[#00F5D4]/45 bg-[#00F5D4]/10'
                  : 'bg-[#1B2029]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-display text-sm font-extrabold text-[#00F5D4]">
                  {idx + 1}.º
                </span>
                <span className="font-display text-sm font-bold text-[#F8FAFC]">{p.name}</span>
              </div>
              {p.status === 'solved' && p.timeMs !== undefined ? (
                <span className="font-display text-sm font-extrabold tabular-nums text-[#00F5D4]">
                  {formatCubeTime(p.timeMs)}
                </span>
              ) : (
                <span className="text-xs font-bold text-[#FF6B35]">A resolver...</span>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
