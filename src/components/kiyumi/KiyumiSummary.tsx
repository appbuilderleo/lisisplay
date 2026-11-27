import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings2,
  SkipForward,
  Trophy,
} from 'lucide-react';
import { KiyumiRoundRecord } from '../../types';
import { sound } from '../../lib/audio';

interface KiyumiSummaryProps {
  record: KiyumiRoundRecord;
  totalPoints: number;
  bestScore: number;
  onNewRound: () => void;
  onChangeSetup: () => void;
}

function getCelebrationMessage(score: number): string {
  if (score >= 10) return 'Lendário! A roda está imparável!';
  if (score >= 7) return 'Brilhante! Sintonia total no grupo!';
  if (score >= 4) return 'Boa ronda! O ritmo está forte!';
  if (score >= 1) return 'Boa! Agora passa o celular ao próximo jogador!';
  return '0 acertos nos 30s — penalização de -1 ponto! Passa o celular e recupera na próxima!';
}

export function KiyumiSummary({
  record,
  totalPoints,
  bestScore,
  onNewRound,
  onChangeSetup,
}: KiyumiSummaryProps) {
  const isPenalty = record.score === 0;
  const isNewRecord = record.score > 0 && record.score >= bestScore && record.roundNumber > 1;
  const modeLabel = record.mode === 'mimica' ? 'Mímica' : 'Descreve';

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-28 pt-4">
      <div className="space-y-4">
        {/* Big Score Banner */}
        <section
          className={`animate-pop-in relative rounded-3xl border-2 bg-[#0F172A] p-6 text-center ${
            isPenalty ? 'border-[#FF6B35]' : 'border-[#00F5D4]/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="rounded-full bg-[#070B14] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#19D8F2]">
              Ronda #{record.roundNumber} · {modeLabel} · {record.deckName}
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display text-7xl font-extrabold leading-none ${
                  isPenalty ? 'text-[#FF6B35]' : 'text-[#00F5D4]'
                }`}
              >
                {record.roundPoints > 0 ? `+${record.roundPoints}` : record.roundPoints}
              </span>
              <span className="font-display text-xl font-bold text-[#F8FAFC]/80">
                {Math.abs(record.roundPoints) === 1 ? 'ponto' : 'pontos'}
              </span>
            </div>

            {isPenalty && (
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/15 px-3 py-1 text-xs font-bold text-[#FF6B35]">
                <AlertTriangle className="h-3.5 w-3.5" />
                0 acertos → -1 ponto
              </span>
            )}

            {isNewRecord && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/15 px-3 py-1 text-xs font-bold text-[#FF6B35]">
                <Trophy className="h-3.5 w-3.5" />
                Novo recorde da sessão!
              </span>
            )}

            <p className="mt-3 text-sm font-medium text-[#F8FAFC]/85">
              {getCelebrationMessage(record.score)}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[#070B14] p-3">
              <p className="text-[11px] font-semibold text-[#F8FAFC]/60">Acertos</p>
              <p className="font-display mt-0.5 text-2xl font-extrabold text-[#00F5D4]">
                {record.score}
              </p>
            </div>
            <div className="rounded-2xl bg-[#070B14] p-3">
              <p className="text-[11px] font-semibold text-[#F8FAFC]/60">Passadas</p>
              <p className="font-display mt-0.5 text-2xl font-extrabold text-[#FF6B35]">
                {record.passed}
              </p>
            </div>
            <div className="rounded-2xl bg-[#070B14] p-3">
              <p className="text-[11px] font-semibold text-[#F8FAFC]/60">Sessão</p>
              <p
                className={`font-display mt-0.5 text-2xl font-extrabold ${
                  totalPoints < 0 ? 'text-[#FF6B35]' : 'text-[#19D8F2]'
                }`}
              >
                {totalPoints > 0 ? `+${totalPoints}` : totalPoints}
              </p>
            </div>
          </div>
        </section>

        {/* Words List */}
        <section className="space-y-2.5">
          <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-[#19D8F2]">
            Palavras da Ronda ({record.items.length})
          </h3>

          {record.items.length === 0 ? (
            <div className="rounded-2xl border border-[#F8FAFC]/10 bg-[#0F172A] p-5 text-center text-sm text-[#F8FAFC]/65">
              Nenhuma palavra acertada ou passada nesta ronda.
            </div>
          ) : (
            <ul className="space-y-2">
              {record.items.map((item, idx) => {
                const hit = item.status === 'correct';
                return (
                  <li
                    key={`${item.word}-${idx}`}
                    className={`flex items-center justify-between rounded-2xl border bg-[#0F172A] px-4 py-3 ${
                      hit ? 'border-[#00F5D4]/35' : 'border-[#FF6B35]/30'
                    }`}
                  >
                    <span className="font-display text-base font-bold text-[#F8FAFC]">
                      {item.word}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        hit
                          ? 'bg-[#00F5D4]/15 text-[#00F5D4]'
                          : 'bg-[#FF6B35]/15 text-[#FF6B35]'
                      }`}
                    >
                      {hit ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Acertou +1
                        </>
                      ) : (
                        <>
                          <SkipForward className="h-3.5 w-3.5" />
                          Passou
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Fixed Thumb-Zone Compact Row */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/8 bg-[#070B14]/92 px-4 pt-3 pb-safe backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onChangeSetup();
            }}
            aria-label="Trocar Baralho ou Modo"
            className="glass-card flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full text-[#00F5D4] transition active:scale-[0.98]"
          >
            <Settings2 className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onNewRound();
            }}
            className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-full bg-[#00F5D4] px-5 font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.42)] transition active:scale-[0.98]"
          >
            <RefreshCw className="h-5 w-5" />
            Passar Celular e Nova Ronda
          </button>
        </div>
      </div>
    </div>
  );
}
