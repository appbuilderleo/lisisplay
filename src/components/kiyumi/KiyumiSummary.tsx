import { CheckCircle2, RefreshCw, Settings2, SkipForward, Trophy } from 'lucide-react';
import { KiyumiRoundRecord } from '../../types';
import { sound } from '../../lib/audio';

interface KiyumiSummaryProps {
  record: KiyumiRoundRecord;
  bestScore: number;
  onNewRound: () => void;
  onChangeSetup: () => void;
}

function getCelebrationMessage(score: number): string {
  if (score >= 10) return 'Lendário! A roda está imparável!';
  if (score >= 7) return 'Brilhante! Sintonia total no grupo!';
  if (score >= 4) return 'Boa ronda! O aquecimento está forte!';
  if (score >= 1) return 'Valeu! Agora é a vez do próximo mostrar serviço!';
  return 'Sem pânico! A próxima ronda vai rebentar!';
}

export function KiyumiSummary({
  record,
  bestScore,
  onNewRound,
  onChangeSetup,
}: KiyumiSummaryProps) {
  const isNewRecord = record.score > 0 && record.score >= bestScore && record.roundNumber > 1;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-lg flex-col justify-between px-4 pb-44 pt-4">
      <div className="space-y-4">
        {/* Big Score Banner */}
        <section className="animate-pop-in relative overflow-hidden rounded-3xl border-2 border-[#00E5C4]/50 bg-[#0B1B28] p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="rounded-full bg-[#07131D] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#19D8F2]">
              Fim da Ronda #{record.roundNumber} · {record.deckName}
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-7xl font-extrabold leading-none text-[#00E5C4]">
                {record.score}
              </span>
              <span className="font-display text-xl font-bold text-[#F3FAFA]/80">
                {record.score === 1 ? 'acerto' : 'acertos'}
              </span>
            </div>

            {isNewRecord && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#F97316]/15 px-3 py-1 text-xs font-bold text-[#F97316]">
                <Trophy className="h-3.5 w-3.5" />
                Novo recorde da sessão!
              </span>
            )}

            <p className="mt-3 text-sm font-medium text-[#F3FAFA]/85">
              {getCelebrationMessage(record.score)}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-[#07131D] p-3">
              <p className="text-xs font-semibold text-[#F3FAFA]/60">Acertadas</p>
              <p className="font-display mt-0.5 text-2xl font-extrabold text-[#00E5C4]">
                {record.score}
              </p>
            </div>
            <div className="rounded-2xl bg-[#07131D] p-3">
              <p className="text-xs font-semibold text-[#F3FAFA]/60">Passadas</p>
              <p className="font-display mt-0.5 text-2xl font-extrabold text-[#F97316]">
                {record.passed}
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
            <div className="rounded-2xl border border-[#F3FAFA]/10 bg-[#0B1B28] p-5 text-center text-sm text-[#F3FAFA]/65">
              Nenhuma palavra foi registada nesta ronda.
            </div>
          ) : (
            <ul className="space-y-2">
              {record.items.map((item, idx) => {
                const hit = item.status === 'correct';
                return (
                  <li
                    key={`${item.word}-${idx}`}
                    className={`flex items-center justify-between rounded-2xl border bg-[#0B1B28] px-4 py-3 ${
                      hit ? 'border-[#00E5C4]/35' : 'border-[#F97316]/30'
                    }`}
                  >
                    <span className="font-display text-base font-bold text-[#F3FAFA]">
                      {item.word}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        hit
                          ? 'bg-[#00E5C4]/15 text-[#00E5C4]'
                          : 'bg-[#F97316]/15 text-[#F97316]'
                      }`}
                    >
                      {hit ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Acertou
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

      {/* Fixed Thumb-Zone Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F3FAFA]/10 bg-[#07131D]/95 px-4 pt-3 pb-safe backdrop-blur-md">
        <div className="mx-auto max-w-lg space-y-2.5">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onNewRound();
            }}
            className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00E5C4] px-6 font-display text-base font-extrabold text-[#07131D] shadow-[0_8px_28px_rgba(0,229,196,0.28)] transition active:scale-[0.98]"
          >
            <RefreshCw className="h-5 w-5" />
            Passar Celular e Nova Ronda
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onChangeSetup();
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[#F3FAFA]/15 bg-[#0B1B28] px-4 text-sm font-semibold text-[#F3FAFA] transition active:scale-[0.98]"
          >
            <Settings2 className="h-4 w-4 text-[#19D8F2]" />
            Trocar Baralho ou Modo
          </button>
        </div>
      </div>
    </div>
  );
}
