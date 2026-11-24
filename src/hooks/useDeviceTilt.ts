import { useEffect, useRef, useState } from 'react';

export type TiltSupportState = 'idle' | 'active' | 'unsupported' | 'denied';

interface DeviceOrientationEventIOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export async function requestMotionPermissionIfNeeded(): Promise<'granted' | 'denied' | 'not-required'> {
  if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
    return 'not-required';
  }
  const DOE = DeviceOrientationEvent as unknown as DeviceOrientationEventIOS;
  if (typeof DOE.requestPermission === 'function') {
    try {
      const result = await DOE.requestPermission();
      return result;
    } catch {
      return 'denied';
    }
  }
  return 'not-required';
}

interface UseDeviceTiltOptions {
  enabled: boolean;
  onTiltDown: () => void; // Acertou (+1)
  onTiltUp: () => void;   // Passar
  cooldownMs?: number;
}

/**
 * Deteta inclinação do celular no Modo Testa (Kiyumi):
 * - Suporta orientação horizontal (clássico na testa) e vertical.
 * - Exige retorno à posição neutra + cooldown para evitar disparos acidentais duplos.
 */
export function useDeviceTilt({
  enabled,
  onTiltDown,
  onTiltUp,
  cooldownMs = 950,
}: UseDeviceTiltOptions): TiltSupportState {
  const [status, setStatus] = useState<TiltSupportState>('idle');
  const onDownRef = useRef(onTiltDown);
  const onUpRef = useRef(onTiltUp);
  onDownRef.current = onTiltDown;
  onUpRef.current = onTiltUp;

  const armedRef = useRef(true);
  const lastTriggerRef = useRef(0);
  const neutralAxisRef = useRef<number | null>(null);
  const receivedEventRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setStatus('unsupported');
      return;
    }

    armedRef.current = true;
    neutralAxisRef.current = null;
    receivedEventRef.current = false;

    const fallbackTimer = window.setTimeout(() => {
      if (!receivedEventRef.current) {
        setStatus('unsupported');
      }
    }, 1400);

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      if (!receivedEventRef.current) {
        receivedEventRef.current = true;
        setStatus('active');
      }

      const isLandscape = window.innerWidth > window.innerHeight;
      const now = Date.now();

      if (isLandscape) {
        // Na testa em horizontal, |gamma| fica perto de 75°–90° (vertical voltado para fora).
        // Inclinar a cabeça para baixo (ecrã aponta para o chão) reduz |gamma| com sinal específico,
        // enquanto inclinar para cima (ecrã aponta para o teto) move no sentido oposto.
        const screenAngle =
          (window.screen?.orientation?.angle ??
            (window as unknown as { orientation?: number }).orientation ??
            90) as number;
        // Normalizar para que inclinar para baixo dê delta positivo e para cima dê delta negativo
        const orientedGamma = screenAngle === 270 || screenAngle === -90 ? -gamma : gamma;

        // Zona neutra na testa: |orientedGamma| > 60
        if (Math.abs(orientedGamma) > 62) {
          if (now - lastTriggerRef.current > cooldownMs) {
            armedRef.current = true;
          }
          return;
        }

        if (!armedRef.current || now - lastTriggerRef.current < cooldownMs) return;

        // Inclinação clara (~40° a partir da vertical)
        if (orientedGamma > 10 && orientedGamma < 52) {
          armedRef.current = false;
          lastTriggerRef.current = now;
          onDownRef.current();
        } else if (orientedGamma < -10 && orientedGamma > -52) {
          armedRef.current = false;
          lastTriggerRef.current = now;
          onUpRef.current();
        }
      } else {
        // Retrato na testa: beta perto de 90°.
        // Inclinar para baixo (ecrã para o chão): beta > 128°
        // Inclinar para cima (ecrã para o teto): beta < 52°
        if (beta >= 65 && beta <= 115) {
          if (now - lastTriggerRef.current > cooldownMs) {
            armedRef.current = true;
          }
          return;
        }

        if (!armedRef.current || now - lastTriggerRef.current < cooldownMs) return;

        if (beta > 128) {
          armedRef.current = false;
          lastTriggerRef.current = now;
          onDownRef.current();
        } else if (beta < 52 && beta > -20) {
          armedRef.current = false;
          lastTriggerRef.current = now;
          onUpRef.current();
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enabled, cooldownMs]);

  return status;
}
