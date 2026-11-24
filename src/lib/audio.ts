/**
 * Lisis Play — Motor de Áudio Sintetizado (Web Audio API) & Háptica
 * 100% em tempo real, zero ficheiros .mp3 externos.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(value: boolean) {
    this.enabled = value;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public unlock() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    options: {
      type?: OscillatorType;
      volume?: number;
      delay?: number;
      endFreq?: number;
    } = {},
  ) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const { type = 'sine', volume = 0.16, delay = 0, endFreq } = options;
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently ignore on unsupported browsers
      }
    }
  }

  /** Toque leve de interface */
  public tap() {
    this.playTone(540, 0.045, { type: 'sine', volume: 0.06, endFreq: 420 });
  }

  /** Tick normal de contagem 3-2-1 */
  public tick() {
    this.playTone(680, 0.08, { type: 'triangle', volume: 0.14, endFreq: 520 });
    this.vibrate(25);
  }

  /** Tick urgente dos últimos 5 segundos */
  public urgentTick() {
    this.playTone(920, 0.09, { type: 'square', volume: 0.11, endFreq: 760 });
    this.vibrate(35);
  }

  /** Sinal de arranque ("VAI!" ou "APONTEM!") */
  public go() {
    this.playTone(587.33, 0.12, { type: 'triangle', volume: 0.16, delay: 0 });
    this.playTone(880, 0.24, { type: 'triangle', volume: 0.18, delay: 0.07 });
    this.vibrate([45, 30, 75]);
  }

  /** Acerto (+1) — arpejo positivo brilhante */
  public correct() {
    this.playTone(523.25, 0.11, { type: 'triangle', volume: 0.17, delay: 0 }); // C5
    this.playTone(659.25, 0.11, { type: 'triangle', volume: 0.17, delay: 0.06 }); // E5
    this.playTone(1046.5, 0.22, { type: 'sine', volume: 0.2, delay: 0.12 }); // C6
    this.vibrate([35, 25, 50]);
  }

  /** Passar palavra — tom descendente curto */
  public pass() {
    this.playTone(390, 0.11, { type: 'sawtooth', volume: 0.09, endFreq: 240 });
    this.vibrate(40);
  }

  /** Revelação de papel / carta */
  public reveal() {
    this.playTone(440, 0.14, { type: 'sine', volume: 0.12, delay: 0 });
    this.playTone(554.37, 0.22, { type: 'sine', volume: 0.13, delay: 0.07 });
    this.vibrate(30);
  }

  /** Revelação dramática de Impostor */
  public impostor() {
    this.playTone(220, 0.24, { type: 'sawtooth', volume: 0.11, delay: 0, endFreq: 196 });
    this.playTone(207.65, 0.34, { type: 'triangle', volume: 0.14, delay: 0.14, endFreq: 164.81 });
    this.vibrate([60, 40, 90]);
  }

  /** Alarme de fim de ronda (30s ou debate) */
  public roundEnd() {
    this.playTone(740, 0.16, { type: 'triangle', volume: 0.18, delay: 0 });
    this.playTone(587.33, 0.16, { type: 'triangle', volume: 0.18, delay: 0.17 });
    this.playTone(440, 0.36, { type: 'triangle', volume: 0.2, delay: 0.34 });
    this.vibrate([120, 60, 120, 60, 220]);
  }

  /** Fanfarra de vitória */
  public victory() {
    this.playTone(523.25, 0.12, { type: 'triangle', volume: 0.16, delay: 0 });
    this.playTone(659.25, 0.12, { type: 'triangle', volume: 0.16, delay: 0.1 });
    this.playTone(783.99, 0.12, { type: 'triangle', volume: 0.16, delay: 0.2 });
    this.playTone(1046.5, 0.35, { type: 'sine', volume: 0.2, delay: 0.3 });
    this.vibrate([50, 35, 50, 35, 110]);
  }
}

export const sound = new SoundEngine();
