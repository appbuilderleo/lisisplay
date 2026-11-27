import { useState } from 'react';
import {
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Smartphone,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import { sound } from '../../lib/audio';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [emblemSpin, setEmblemSpin] = useState(false);

  const handleStart = () => {
    sound.unlock();
    sound.go();
    onEnter();
  };

  const handleEmblemTap = () => {
    sound.unlock();
    sound.tap();
    setEmblemSpin(true);
    window.setTimeout(() => setEmblemSpin(false), 300);
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-x-clip bg-[#070B14]">
      {/* Ambient Electric Social Arcade Lighting Orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00F5D4]/12 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 rounded-full bg-[#FF6B35]/12 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[#00F5D4]/10 blur-[110px]" />

      {/* Atmospheric Mozambican Party Scrim */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25">
        <img
          src="/hero-social.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B14] via-[#070B14]/82 to-[#070B14]" />
      </div>

      {/* Main Centered Container (max 440px mobile-first) */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[440px] flex-col justify-between px-5 pt-safe pb-safe">
        {/* Top Floating Status Pill */}
        <header className="flex w-full justify-center pt-3">
          <div className="glass-card inline-flex items-center gap-2 rounded-full border-[#00F5D4]/25 px-4 py-2 shadow-lg">
            <Smartphone className="h-4 w-4 text-[#00F5D4]" />
            <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-[#00F5D4]">
              Modo Roda • 1 Celular
            </span>
            <span className="h-1 w-1 rounded-full bg-[#B9CAC4]/40" />
            <WifiOff className="h-3.5 w-3.5 text-[#00F5D4]" />
            <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-[#00F5D4]">
              Offline
            </span>
          </div>
        </header>

        {/* Center Brand Hero */}
        <section className="my-auto flex w-full flex-col items-center py-5 text-center">
          {/* Glowing Squircle Emblem */}
          <button
            type="button"
            onClick={handleEmblemTap}
            aria-label="Lisis Play Símbolo"
            className="group relative mb-5 cursor-pointer"
          >
            <div className="absolute -inset-3 rounded-full bg-[#00F5D4]/25 blur-xl transition-all duration-500 group-hover:bg-[#00F5D4]/40" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-[#00F5D4]/35 bg-[#F8FAFC] p-5 shadow-2xl transition-transform duration-300 active:scale-95 sm:h-30 sm:w-30">
              <img
                src="/simbolo.png"
                alt="Símbolo oficial Lisis Play"
                className={`h-full w-full translate-x-[2px] object-contain transition-transform duration-300 ${
                  emblemSpin ? 'rotate-12 scale-105' : ''
                }`}
              />
            </div>
          </button>

          {/* Lisis Jogos Pill */}
          <div className="glass-card mb-3 inline-block rounded-full border-[#00F5D4]/25 px-3.5 py-1">
            <span className="font-display text-[11px] font-extrabold uppercase tracking-widest text-[#00F5D4]">
              Lisis Jogos
            </span>
          </div>

          {/* Stacked LISIS / PLAY Headline */}
          <div className="mb-3 flex flex-col items-center leading-none">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-5xl">
              LISIS
            </h1>
            <span className="font-display text-4xl font-extrabold uppercase tracking-tight text-[#FF6B35] drop-shadow-[0_2px_20px_rgba(255,107,53,0.4)] sm:text-5xl">
              PLAY
            </span>
          </div>

          {/* Official Slogan */}
          <h2 className="font-display mb-3 px-2 text-xl font-bold text-[#00F5D4] drop-shadow-[0_0_12px_rgba(0,245,212,0.25)] sm:text-2xl">
            A diversão é estar juntos.
          </h2>

          {/* Concise Description */}
          <p className="mb-6 max-w-[330px] text-sm leading-relaxed text-[#B9CAC4]">
            <strong className="font-semibold text-[#F8FAFC]">Kiyumi</strong>,{' '}
            <strong className="font-semibold text-[#F8FAFC]">O Impostor</strong>,{' '}
            <strong className="font-semibold text-[#F8FAFC]">Zoe</strong> e{' '}
            <strong className="font-semibold text-[#F8FAFC]">Cubo Mágico 3D</strong> — jogos
            sociais presenciais feitos para juntar a roda.
          </p>

          {/* 3 Glassmorphic Bento Highlight Cards */}
          <div className="grid w-full max-w-[360px] grid-cols-3 gap-2.5">
            <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-3 text-center shadow-md">
              <WifiOff className="mb-1.5 h-5 w-5 text-[#FF6B35]" />
              <span className="font-display text-sm font-bold text-[#F8FAFC]">100%</span>
              <span className="mt-0.5 text-[11px] leading-none text-[#B9CAC4]">Offline</span>
            </div>

            <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-3 text-center shadow-md">
              <RefreshCw className="mb-1.5 h-5 w-5 text-[#00F5D4]" />
              <span className="font-display text-sm font-bold text-[#F8FAFC]">Passa</span>
              <span className="mt-0.5 text-[11px] leading-none text-[#B9CAC4]">&amp; Joga</span>
            </div>

            <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-3 text-center shadow-md">
              <Users className="mb-1.5 h-5 w-5 text-[#00FFA3]" />
              <span className="font-display text-sm font-bold text-[#F8FAFC]">3 a 10+</span>
              <span className="mt-0.5 text-[11px] leading-none text-[#B9CAC4]">Pessoas</span>
            </div>
          </div>
        </section>

        {/* Bottom Thumb-Zone Pill CTAs */}
        <footer className="flex w-full flex-col gap-3 pb-4 pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="flex h-14 min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#00F5D4] font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_28px_-4px_rgba(0,245,212,0.45)] transition-all duration-200 active:scale-[0.98]"
          >
            <span>Entrar nos Jogos</span>
            <ArrowRight className="h-5 w-5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.tap();
              setShowHowItWorks(true);
            }}
            className="glass-card flex h-12 min-h-[48px] w-full items-center justify-center gap-2 rounded-full font-display text-xs font-bold tracking-wide text-[#DFE2F0] transition-all active:scale-[0.98]"
          >
            <HelpCircle className="h-4 w-4 text-[#00F5D4]" />
            <span>Como funciona o Modo Roda?</span>
          </button>
        </footer>
      </div>

      {/* Bottom-Sheet Modal: O que é Modo Roda? */}
      {showHowItWorks && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#070B14]/80 px-4 pb-6 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Como funciona o Modo Roda"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              sound.tap();
              setShowHowItWorks(false);
            }
          }}
        >
          <div className="animate-slide-up flex w-full max-w-[420px] flex-col gap-4 rounded-3xl border border-[#00F5D4]/25 bg-[#0F172A] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-5 w-5 text-[#00F5D4]" />
                <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
                  O que é o Modo Roda?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setShowHowItWorks(false);
                }}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#262A34] text-[#DFE2F0] transition active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-[#B9CAC4]">
              Não precisam de internet nem de instalar nada nos outros telefones. Um único celular
              circula pelas mãos do grupo!
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 rounded-2xl bg-[#1B2029] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00F5D4] font-display text-xs font-extrabold text-[#070B14]">
                  1
                </span>
                <span className="text-xs text-[#DFE2F0]">
                  A aplicação indica quem deve segurar o aparelho.
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#1B2029] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] font-display text-xs font-extrabold text-[#070B14]">
                  2
                </span>
                <span className="text-xs text-[#DFE2F0]">
                  O jogador vê o seu papel secreto ou cumpre a ronda rápida.
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#1B2029] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00FFA3] font-display text-xs font-extrabold text-[#070B14]">
                  3
                </span>
                <span className="text-xs text-[#DFE2F0]">
                  Passa para o próximo na roda e preparem-se para as gargalhadas!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.tap();
                setShowHowItWorks(false);
                handleStart();
              }}
              className="mt-1 h-13 min-h-[52px] w-full rounded-full bg-[#00F5D4] font-display text-base font-extrabold text-[#070B14] shadow-[0_8px_24px_-4px_rgba(0,245,212,0.35)] transition active:scale-95"
            >
              Entendido, vamos jogar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
