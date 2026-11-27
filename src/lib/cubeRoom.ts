import Peer, { type DataConnection } from 'peerjs';
import { CubeRoomPlayer, CubeSize } from '../types';

export type RoomConnectionState = 'idle' | 'connecting' | 'connected' | 'offline-fallback' | 'error';

export type RoomMessage =
  | { type: 'join'; playerId: string; name: string }
  | {
      type: 'state';
      players: CubeRoomPlayer[];
      size: CubeSize;
      seed: string;
      phase: 'lobby' | 'countdown' | 'racing';
      duelId: number;
    }
  | { type: 'start-duel'; size: CubeSize; seed: string; duelId: number }
  | { type: 'solved'; playerId: string; timeMs: number; moves: number; duelId: number }
  | { type: 'progress'; playerId: string; moves: number; duelId: number };

export interface CubeRoomCallbacks {
  onConnectionState: (state: RoomConnectionState, detail?: string) => void;
  onPlayersChange: (players: CubeRoomPlayer[]) => void;
  onStartDuel: (payload: { size: CubeSize; seed: string; duelId: number }) => void;
  onConfigSync: (payload: { size: CubeSize; seed: string }) => void;
}

const PEER_PREFIX = 'lisis-play-cubo-v1-';

/**
 * Controlador de Sala Multijogador P2P (WebRTC via PeerJS) com fallback offline gracioso.
 * - Host cria uma sala de 4 letras (`lisis-play-cubo-v1-XXXX`).
 * - Convidados entram pelo código ou QR Code e recebem exatamente a mesma seed de embaralhamento.
 * - Se não houver acesso ao broker WebRTC (modo 100% offline), ativa o fallback de Código de Scramble partilhado.
 */
export class CubeRoomController {
  private peer: Peer | null = null;
  private hostConnections: Map<string, DataConnection> = new Map();
  private clientConnection: DataConnection | null = null;
  private players: CubeRoomPlayer[] = [];
  private isHost = false;
  private localPlayerId: string;
  private localPlayerName: string;
  private size: CubeSize = 3;
  private seed = '';
  private phase: 'lobby' | 'countdown' | 'racing' = 'lobby';
  private duelId = 0;
  private callbacks: CubeRoomCallbacks;
  private destroyed = false;

  constructor(playerId: string, playerName: string, callbacks: CubeRoomCallbacks) {
    this.localPlayerId = playerId;
    this.localPlayerName = playerName;
    this.callbacks = callbacks;
  }

  public createRoom(code: string, size: CubeSize, seed: string) {
    this.destroy();
    this.destroyed = false;
    this.isHost = true;
    this.size = size;
    this.seed = seed;
    this.phase = 'lobby';
    this.players = [
      {
        id: this.localPlayerId,
        name: this.localPlayerName,
        isHost: true,
        status: 'ready',
      },
    ];
    this.callbacks.onPlayersChange([...this.players]);
    this.callbacks.onConnectionState('connecting', 'A abrir sala na rede...');

    try {
      const peer = new Peer(`${PEER_PREFIX}${code.toUpperCase()}`, {
        debug: 0,
      });
      this.peer = peer;

      const timeout = window.setTimeout(() => {
        if (!this.destroyed && peer.disconnected) {
          this.callbacks.onConnectionState(
            'offline-fallback',
            'Sem internet: usa o Código de Scramble partilhado!',
          );
        }
      }, 6500);

      peer.on('open', () => {
        window.clearTimeout(timeout);
        if (this.destroyed) return;
        this.callbacks.onConnectionState('connected', 'Sala pronta! Partilha o QR ou código.');
      });

      peer.on('connection', (conn) => {
        conn.on('data', (raw) => {
          const msg = raw as RoomMessage;
          this.handleHostMessage(conn, msg);
        });
        conn.on('close', () => {
          const pid = conn.metadata?.playerId as string | undefined;
          if (pid) {
            this.hostConnections.delete(pid);
            this.players = this.players.filter((p) => p.id !== pid);
            this.broadcastState();
          }
        });
      });

      peer.on('error', () => {
        window.clearTimeout(timeout);
        if (this.destroyed) return;
        this.callbacks.onConnectionState(
          'offline-fallback',
          'Modo Offline ativo — todos jogam o mesmo cubo pela Seed!',
        );
      });
    } catch {
      this.callbacks.onConnectionState(
        'offline-fallback',
        'Modo Offline ativo — usa o Código de Scramble partilhado!',
      );
    }
  }

  public joinRoom(code: string, fallbackSize: CubeSize, fallbackSeed: string) {
    this.destroy();
    this.destroyed = false;
    this.isHost = false;
    this.size = fallbackSize;
    this.seed = fallbackSeed;
    this.players = [
      {
        id: this.localPlayerId,
        name: this.localPlayerName,
        isHost: false,
        status: 'ready',
      },
    ];
    this.callbacks.onPlayersChange([...this.players]);
    this.callbacks.onConnectionState('connecting', `A ligar à sala ${code.toUpperCase()}...`);

    try {
      const peer = new Peer({ debug: 0 });
      this.peer = peer;

      const timeout = window.setTimeout(() => {
        if (!this.destroyed && !this.clientConnection?.open) {
          this.callbacks.onConnectionState(
            'offline-fallback',
            'Sem resposta online — Modo Scramble Partilhado pronto!',
          );
        }
      }, 6500);

      peer.on('open', () => {
        if (this.destroyed) return;
        const conn = peer.connect(`${PEER_PREFIX}${code.toUpperCase()}`, {
          reliable: true,
          metadata: { playerId: this.localPlayerId },
        });
        this.clientConnection = conn;

        conn.on('open', () => {
          window.clearTimeout(timeout);
          if (this.destroyed) return;
          this.callbacks.onConnectionState('connected', `Ligado à sala ${code.toUpperCase()}!`);
          conn.send({
            type: 'join',
            playerId: this.localPlayerId,
            name: this.localPlayerName,
          } satisfies RoomMessage);
        });

        conn.on('data', (raw) => {
          const msg = raw as RoomMessage;
          this.handleClientMessage(msg);
        });

        conn.on('error', () => {
          window.clearTimeout(timeout);
          if (this.destroyed) return;
          this.callbacks.onConnectionState(
            'offline-fallback',
            'Ligação offline — joga com a mesma Seed de Scramble!',
          );
        });
      });

      peer.on('error', () => {
        window.clearTimeout(timeout);
        if (this.destroyed) return;
        this.callbacks.onConnectionState(
          'offline-fallback',
          'Modo Offline ativo — usa o mesmo Código de Scramble!',
        );
      });
    } catch {
      this.callbacks.onConnectionState(
        'offline-fallback',
        'Modo Offline ativo — usa o mesmo Código de Scramble!',
      );
    }
  }

  public updateHostConfig(size: CubeSize, seed: string) {
    if (!this.isHost) return;
    this.size = size;
    this.seed = seed;
    this.broadcastState();
  }

  public startDuel(size: CubeSize, seed: string) {
    this.size = size;
    this.seed = seed;
    this.duelId += 1;
    this.phase = 'racing';
    this.players = this.players.map((p) => ({
      ...p,
      status: 'solving',
      timeMs: undefined,
      moves: 0,
    }));

    if (this.isHost) {
      const msg: RoomMessage = {
        type: 'start-duel',
        size,
        seed,
        duelId: this.duelId,
      };
      this.hostConnections.forEach((conn) => {
        if (conn.open) conn.send(msg);
      });
      this.broadcastState();
    }

    this.callbacks.onStartDuel({ size, seed, duelId: this.duelId });
  }

  public reportSolved(timeMs: number, moves: number) {
    if (this.isHost) {
      this.players = this.players.map((p) =>
        p.id === this.localPlayerId ? { ...p, status: 'solved', timeMs, moves } : p,
      );
      this.broadcastState();
    } else if (this.clientConnection?.open) {
      this.clientConnection.send({
        type: 'solved',
        playerId: this.localPlayerId,
        timeMs,
        moves,
        duelId: this.duelId,
      } satisfies RoomMessage);
      // Atualização otimista local
      this.players = this.players.map((p) =>
        p.id === this.localPlayerId ? { ...p, status: 'solved', timeMs, moves } : p,
      );
      this.callbacks.onPlayersChange([...this.players]);
    } else {
      // Fallback offline local
      this.players = this.players.map((p) =>
        p.id === this.localPlayerId ? { ...p, status: 'solved', timeMs, moves } : p,
      );
      this.callbacks.onPlayersChange([...this.players]);
    }
  }

  private handleHostMessage(conn: DataConnection, msg: RoomMessage) {
    if (msg.type === 'join') {
      this.hostConnections.set(msg.playerId, conn);
      const exists = this.players.some((p) => p.id === msg.playerId);
      if (exists) {
        this.players = this.players.map((p) =>
          p.id === msg.playerId ? { ...p, name: msg.name } : p,
        );
      } else {
        this.players = [
          ...this.players,
          {
            id: msg.playerId,
            name: msg.name,
            isHost: false,
            status: this.phase === 'racing' ? 'solving' : 'ready',
          },
        ];
      }
      this.broadcastState();
    } else if (msg.type === 'solved') {
      this.players = this.players.map((p) =>
        p.id === msg.playerId
          ? { ...p, status: 'solved', timeMs: msg.timeMs, moves: msg.moves }
          : p,
      );
      this.broadcastState();
    } else if (msg.type === 'progress') {
      this.players = this.players.map((p) =>
        p.id === msg.playerId ? { ...p, moves: msg.moves } : p,
      );
      this.broadcastState();
    }
  }

  private handleClientMessage(msg: RoomMessage) {
    if (msg.type === 'state') {
      this.players = msg.players;
      this.size = msg.size;
      this.seed = msg.seed;
      this.duelId = msg.duelId;
      this.callbacks.onPlayersChange([...msg.players]);
      this.callbacks.onConfigSync({ size: msg.size, seed: msg.seed });
    } else if (msg.type === 'start-duel') {
      this.size = msg.size;
      this.seed = msg.seed;
      this.duelId = msg.duelId;
      this.callbacks.onStartDuel({ size: msg.size, seed: msg.seed, duelId: msg.duelId });
    }
  }

  private broadcastState() {
    const stateMsg: RoomMessage = {
      type: 'state',
      players: this.players,
      size: this.size,
      seed: this.seed,
      phase: this.phase,
      duelId: this.duelId,
    };
    this.hostConnections.forEach((conn) => {
      if (conn.open) conn.send(stateMsg);
    });
    this.callbacks.onPlayersChange([...this.players]);
  }

  public destroy() {
    this.destroyed = true;
    this.hostConnections.forEach((c) => {
      try {
        c.close();
      } catch {
        // ignore
      }
    });
    this.hostConnections.clear();
    if (this.clientConnection) {
      try {
        this.clientConnection.close();
      } catch {
        // ignore
      }
      this.clientConnection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }
  }
}
