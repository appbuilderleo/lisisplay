import { ArrowRight, Smartphone, WifiOff } from 'lucide-react';
import { sound } from '../../lib/audio';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const handleStart = () => {
    sound.unlock();
    sound.go();
    onEnter();
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#07131D]">
      {/* Full-bleed atmospheric background photo */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/hero-social.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07131D]/85 via-[#07131D]/70 to-[#07131D]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 38%, rgba(0,229,196,0.14) 0%, rgba(7,19,29,0) 60%)',
          }}
        />
      </div>

      {/* Top subtle mode badge */}
      <div className="relative z-10 flex items-center justify-center px-6 pt-safe">
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#19D8F2]/30 bg-[#0B1B28]/85 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#19D8F2] backdrop-blur-md">
          <Smartphone className="h-3.5 w-3.5 text-[#00E5C4]" />
          <span>Modo Roda · 1 Celular</span>
          <span className="text-[#F3FAFA]/30">•</span>
          <WifiOff className="h-3 w-3 text-[#00E5C4]" />
          <span>Offline</span>
        </div>
      </div>

      {/* Center Brand Showcase */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-6 text-center">
        <div className="animate-pop-in flex h-28 w-28 items-center justify-center rounded-[2rem] border-2 border-[#00E5C4]/50 bg-[#F3FAFA] p-5 shadow-[0_0_50px_rgba(0,229,196,0.28)] sm:h-32 sm:w-32">
          <img
            src="/simbolo.png"
            alt="Lisis Play"
            className="h-full w-full translate-x-[2px] object-contain"
          />
        </div>

        <div className="animate-slide-up mt-7 space-y-2">
          <span className="inline-block rounded-full border border-[#00E5C4]/35 bg-[#0B1B28]/90 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-[#00E5C4]">
            Lisis Jogos
          </span>

          <h1 className="font-display text-5xl font-extrabold tracking-tight text-[#F3FAFA] sm:text-6xl">
            LISIS <span className="text-[#F97316]">PLAY</span>
          </h1>

          <p className="font-display text-lg font-bold text-[#19D8F2] sm:text-xl">
            A diversão é estar juntos.
          </p>
        </div>

        <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#F3FAFA]/75">
          Kiyumi, O Impostor e Zoe — jogos sociais presenciais feitos para juntar a roda com apenas
          um celular.
        </p>
      </div>

      {/* Bottom Thumb-Zone Single Action */}
      <div className="relative z-10 mx-auto w-full max-w-md px-5 pb-safe">
        <div className="pb-4">
          <button
            type="button"
            onClick={handleStart}
            className="flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[#00E5C4] px-6 font-display text-lg font-extrabold text-[#07131D] shadow-[0_12px_36px_rgba(0,229,196,0.34)] transition active:scale-[0.98]"
          >
            Entrar nos Jogos
            <ArrowRight className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
