import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import { CubeAxis, CubeMove, invertMove } from '../../lib/cubeEngine';
import { CubeSize } from '../../types';
import { sound } from '../../lib/audio';

export interface CubeCanvasHandle {
  applyScramble: (moves: CubeMove[]) => void;
  resetSolved: () => void;
  undoMove: () => boolean;
  centerCamera: () => void;
}

interface CubeCanvasProps {
  size: CubeSize;
  locked?: boolean;
  onUserMove?: (moveCount: number) => void;
  onSolved?: () => void;
}

const STEP = 1.04;
const CUBIE_BODY_SIZE = 0.95;
const STICKER_SIZE = 0.82;
const STICKER_OFFSET = 0.486;

const FACE_COLORS = {
  px: 0xff6b35, // +X: Laranja Lisis
  nx: 0xff3366, // -X: Carmim Vivo
  py: 0xf8fafc, // +Y: Branco Névoa
  ny: 0xfacc15, // -Y: Amarelo Ouro
  pz: 0x00e5c4, // +Z: Turquesa Lisis
  nz: 0x2563eb, // -Z: Azul Elétrico
} as const;

interface StickerRecord {
  mesh: THREE.Mesh;
  colorHex: number;
  localNormal: THREE.Vector3;
}

interface CubieData {
  group: THREE.Group;
  gx: number;
  gy: number;
  gz: number;
  stickers: StickerRecord[];
}

function snapCoord(value: number, size: CubeSize): number {
  if (size === 3) {
    return Math.round(value);
  }
  return Math.round(value - 0.5) + 0.5;
}

function snapQuaternion(q: THREE.Quaternion): THREE.Quaternion {
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const e = m.elements;
  const cols = [
    new THREE.Vector3(e[0], e[1], e[2]),
    new THREE.Vector3(e[4], e[5], e[6]),
    new THREE.Vector3(e[8], e[9], e[10]),
  ];
  const snapped = cols.map((v) => {
    const ax = Math.abs(v.x);
    const ay = Math.abs(v.y);
    const az = Math.abs(v.z);
    if (ax >= ay && ax >= az) return new THREE.Vector3(Math.sign(v.x) || 1, 0, 0);
    if (ay >= ax && ay >= az) return new THREE.Vector3(0, Math.sign(v.y) || 1, 0);
    return new THREE.Vector3(0, 0, Math.sign(v.z) || 1);
  });
  // Garante base ortonormal direita
  snapped[2].crossVectors(snapped[0], snapped[1]);
  const out = new THREE.Matrix4().makeBasis(snapped[0], snapped[1], snapped[2]);
  return new THREE.Quaternion().setFromRotationMatrix(out);
}

function snapCardinal(v: THREE.Vector3): THREE.Vector3 {
  const ax = Math.abs(v.x);
  const ay = Math.abs(v.y);
  const az = Math.abs(v.z);
  if (ax >= ay && ax >= az) return new THREE.Vector3(Math.sign(v.x) || 1, 0, 0);
  if (ay >= ax && ay >= az) return new THREE.Vector3(0, Math.sign(v.y) || 1, 0);
  return new THREE.Vector3(0, 0, Math.sign(v.z) || 1);
}

export const CubeCanvas = forwardRef<CubeCanvasHandle, CubeCanvasProps>(
  function CubeCanvas({ size, locked = false, onUserMove, onSolved }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lockedRef = useRef(locked);
    const onUserMoveRef = useRef(onUserMove);
    const onSolvedRef = useRef(onSolved);

    lockedRef.current = locked;
    onUserMoveRef.current = onUserMove;
    onSolvedRef.current = onSolved;

    // Imperative bridge refs
    const apiRef = useRef<CubeCanvasHandle | null>(null);

    useImperativeHandle(ref, () => ({
      applyScramble: (moves) => apiRef.current?.applyScramble(moves),
      resetSolved: () => apiRef.current?.resetSolved(),
      undoMove: () => apiRef.current?.undoMove() ?? false,
      centerCamera: () => apiRef.current?.centerCamera(),
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Scene & Renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.touchAction = 'none';
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Studio Lighting tuned for dark obsidian Electric Social Arcade
      const ambient = new THREE.AmbientLight(0xffffff, 1.35);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
      keyLight.position.set(6, 10, 8);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x00f5d4, 0.45);
      fillLight.position.set(-8, -4, 6);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xff6b35, 0.35);
      rimLight.position.set(4, -6, -8);
      scene.add(rimLight);

      const cubeRoot = new THREE.Group();
      scene.add(cubeRoot);

      const pivotGroup = new THREE.Group();
      scene.add(pivotGroup);

      // Reusable Geometries & Materials
      const bodyGeo = new THREE.BoxGeometry(CUBIE_BODY_SIZE, CUBIE_BODY_SIZE, CUBIE_BODY_SIZE);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0a0f1d,
        roughness: 0.34,
        metalness: 0.16,
      });

      const stickerGeo = new THREE.BoxGeometry(STICKER_SIZE, STICKER_SIZE, 0.025);
      const stickerMaterials = new Map<number, THREE.MeshStandardMaterial>();
      Object.values(FACE_COLORS).forEach((hex) => {
        stickerMaterials.set(
          hex,
          new THREE.MeshStandardMaterial({
            color: hex,
            roughness: 0.22,
            metalness: 0.08,
          }),
        );
      });

      let cubies: CubieData[] = [];
      let pickableMeshes: THREE.Object3D[] = [];
      let undoStack: CubeMove[] = [];
      let moveQueue: { move: CubeMove; recordUndo: boolean; isUser: boolean }[] = [];
      let isScrambledSession = false;

      // Active layer animation state
      let activeAnim: {
        move: CubeMove;
        layerCubies: CubieData[];
        startTime: number;
        duration: number;
        targetAngle: number;
        recordUndo: boolean;
        isUser: boolean;
      } | null = null;

      // Camera orbit spherical state
      const DEFAULT_THETA = Math.PI / 4;
      const DEFAULT_PHI = Math.PI / 3;
      const baseRadius = size === 2 ? 5.4 : 7.2;
      let radius = baseRadius;

      let theta = DEFAULT_THETA;
      let phi = DEFAULT_PHI;
      let targetTheta = DEFAULT_THETA;
      let targetPhi = DEFAULT_PHI;

      const updateCamera = () => {
        camera.position.set(
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.cos(theta),
        );
        camera.lookAt(0, 0, 0);
      };
      updateCamera();

      const buildCube = () => {
        // Clear previous cubies
        cubies.forEach((c) => cubeRoot.remove(c.group));
        cubies = [];
        pickableMeshes = [];
        undoStack = [];
        moveQueue = [];
        activeAnim = null;
        pivotGroup.rotation.set(0, 0, 0);

        const coords = size === 2 ? [-0.5, 0.5] : [-1, 0, 1];
        const maxCoord = size === 2 ? 0.5 : 1;

        for (const x of coords) {
          for (const y of coords) {
            for (const z of coords) {
              if (size === 3 && x === 0 && y === 0 && z === 0) continue;

              const group = new THREE.Group();
              group.position.set(x * STEP, y * STEP, z * STEP);

              const body = new THREE.Mesh(bodyGeo, bodyMat);
              body.userData.isCubiePart = true;
              group.add(body);

              const cubie: CubieData = {
                group,
                gx: x,
                gy: y,
                gz: z,
                stickers: [],
              };
              body.userData.cubie = cubie;
              pickableMeshes.push(body);

              const addSticker = (
                colorHex: number,
                pos: [number, number, number],
                rot: [number, number, number],
                normal: [number, number, number],
              ) => {
                const mat = stickerMaterials.get(colorHex)!;
                const mesh = new THREE.Mesh(stickerGeo, mat);
                mesh.position.set(pos[0], pos[1], pos[2]);
                mesh.rotation.set(rot[0], rot[1], rot[2]);
                mesh.userData.isCubiePart = true;
                mesh.userData.cubie = cubie;
                group.add(mesh);
                pickableMeshes.push(mesh);
                cubie.stickers.push({
                  mesh,
                  colorHex,
                  localNormal: new THREE.Vector3(normal[0], normal[1], normal[2]),
                });
              };

              if (x === maxCoord) {
                addSticker(FACE_COLORS.px, [STICKER_OFFSET, 0, 0], [0, Math.PI / 2, 0], [1, 0, 0]);
              }
              if (x === -maxCoord) {
                addSticker(FACE_COLORS.nx, [-STICKER_OFFSET, 0, 0], [0, -Math.PI / 2, 0], [-1, 0, 0]);
              }
              if (y === maxCoord) {
                addSticker(FACE_COLORS.py, [0, STICKER_OFFSET, 0], [-Math.PI / 2, 0, 0], [0, 1, 0]);
              }
              if (y === -maxCoord) {
                addSticker(FACE_COLORS.ny, [0, -STICKER_OFFSET, 0], [Math.PI / 2, 0, 0], [0, -1, 0]);
              }
              if (z === maxCoord) {
                addSticker(FACE_COLORS.pz, [0, 0, STICKER_OFFSET], [0, 0, 0], [0, 0, 1]);
              }
              if (z === -maxCoord) {
                addSticker(FACE_COLORS.nz, [0, 0, -STICKER_OFFSET], [0, Math.PI, 0], [0, 0, -1]);
              }

              cubeRoot.add(group);
              cubies.push(cubie);
            }
          }
        }
      };

      const getLayerCubies = (axis: CubeAxis, layer: number): CubieData[] => {
        return cubies.filter((c) => {
          const val = axis === 'x' ? c.gx : axis === 'y' ? c.gy : c.gz;
          return Math.abs(val - layer) < 0.1;
        });
      };

      const applyMoveInstant = (move: CubeMove) => {
        const layerCubies = getLayerCubies(move.axis, move.layer);
        pivotGroup.rotation.set(0, 0, 0);
        pivotGroup.updateMatrixWorld(true);
        layerCubies.forEach((c) => pivotGroup.attach(c.group));

        const angle = move.dir * (Math.PI / 2);
        pivotGroup.rotation[move.axis] = angle;
        pivotGroup.updateMatrixWorld(true);

        layerCubies.forEach((c) => {
          cubeRoot.attach(c.group);
          c.gx = snapCoord(c.group.position.x / STEP, size);
          c.gy = snapCoord(c.group.position.y / STEP, size);
          c.gz = snapCoord(c.group.position.z / STEP, size);
          c.group.position.set(c.gx * STEP, c.gy * STEP, c.gz * STEP);
          c.group.quaternion.copy(snapQuaternion(c.group.quaternion));
          c.group.updateMatrixWorld(true);
        });
        pivotGroup.rotation.set(0, 0, 0);
      };

      const checkIsSolved = (): boolean => {
        const faceMap = new Map<string, Set<number>>();
        const worldNormal = new THREE.Vector3();
        const q = new THREE.Quaternion();

        for (const cubie of cubies) {
          cubie.group.getWorldQuaternion(q);
          for (const st of cubie.stickers) {
            worldNormal.copy(st.localNormal).applyQuaternion(q);
            const snapped = snapCardinal(worldNormal);
            const key = `${snapped.x},${snapped.y},${snapped.z}`;
            let colors = faceMap.get(key);
            if (!colors) {
              colors = new Set<number>();
              faceMap.set(key, colors);
            }
            colors.add(st.colorHex);
          }
        }

        if (faceMap.size !== 6) return false;
        for (const colors of faceMap.values()) {
          if (colors.size !== 1) return false;
        }
        return true;
      };

      const startNextAnimation = (now: number) => {
        if (activeAnim || moveQueue.length === 0) return;
        const next = moveQueue.shift()!;
        const layerCubies = getLayerCubies(next.move.axis, next.move.layer);
        if (layerCubies.length === 0) return;

        pivotGroup.rotation.set(0, 0, 0);
        pivotGroup.updateMatrixWorld(true);
        layerCubies.forEach((c) => pivotGroup.attach(c.group));

        activeAnim = {
          move: next.move,
          layerCubies,
          startTime: now,
          duration: 145,
          targetAngle: next.move.dir * (Math.PI / 2),
          recordUndo: next.recordUndo,
          isUser: next.isUser,
        };
      };

      const finishAnimation = () => {
        if (!activeAnim) return;
        const { move, layerCubies, recordUndo, isUser } = activeAnim;
        pivotGroup.rotation[move.axis] = activeAnim.targetAngle;
        pivotGroup.updateMatrixWorld(true);

        layerCubies.forEach((c) => {
          cubeRoot.attach(c.group);
          c.gx = snapCoord(c.group.position.x / STEP, size);
          c.gy = snapCoord(c.group.position.y / STEP, size);
          c.gz = snapCoord(c.group.position.z / STEP, size);
          c.group.position.set(c.gx * STEP, c.gy * STEP, c.gz * STEP);
          c.group.quaternion.copy(snapQuaternion(c.group.quaternion));
          c.group.updateMatrixWorld(true);
        });
        pivotGroup.rotation.set(0, 0, 0);
        activeAnim = null;

        if (recordUndo) {
          undoStack.push(move);
        }

        if (isUser) {
          onUserMoveRef.current?.(undoStack.length);
          if (isScrambledSession && checkIsSolved()) {
            isScrambledSession = false;
            onSolvedRef.current?.();
          }
        }
      };

      const enqueueMove = (move: CubeMove, recordUndo: boolean, isUser: boolean) => {
        if (moveQueue.length > 4) return;
        moveQueue.push({ move, recordUndo, isUser });
        if (isUser) {
          if (recordUndo) {
            sound.cubeTurn();
          } else {
            sound.cubeUndo();
          }
        }
      };

      // Expose imperative methods
      apiRef.current = {
        applyScramble: (moves: CubeMove[]) => {
          buildCube();
          moves.forEach((m) => applyMoveInstant(m));
          // Garante que nunca fica resolvido após scramble
          if (checkIsSolved()) {
            applyMoveInstant({ axis: 'y', layer: size === 2 ? 0.5 : 1, dir: 1 });
            applyMoveInstant({ axis: 'x', layer: size === 2 ? 0.5 : 1, dir: 1 });
          }
          undoStack = [];
          isScrambledSession = true;
        },
        resetSolved: () => {
          buildCube();
          isScrambledSession = false;
        },
        undoMove: () => {
          if (activeAnim || moveQueue.length > 0 || undoStack.length === 0) return false;
          const last = undoStack.pop()!;
          enqueueMove(invertMove(last), false, true);
          return true;
        },
        centerCamera: () => {
          targetTheta = DEFAULT_THETA;
          targetPhi = DEFAULT_PHI;
        },
      };

      buildCube();

      // Resize observer for crisp, dead-center mobile responsiveness
      const handleResize = () => {
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        const aspect = w / h;
        camera.aspect = aspect;
        // Se o ecrã for estreito (portrait), afasta suavemente a câmara para o cubo nunca ficar cortado
        radius = aspect < 0.85 ? baseRadius * (0.85 / Math.max(0.55, aspect)) : baseRadius;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        updateCamera();
      };
      handleResize();
      window.requestAnimationFrame(handleResize);
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Raycasting + Gesture Handling (Swipe on Cubie = Layer Turn | Drag Outside = 360° Orbit)
      const raycaster = new THREE.Raycaster();
      const pointerNDC = new THREE.Vector2();

      interface DragState {
        pointerId: number;
        mode: 'orbit' | 'turn';
        startX: number;
        startY: number;
        lastX: number;
        lastY: number;
        consumed: boolean;
        cubie?: CubieData;
        hitPoint?: THREE.Vector3;
        hitNormal?: THREE.Vector3;
      }

      let drag: DragState | null = null;

      const getPointerNDC = (clientX: number, clientY: number) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        return rect;
      };

      const projectDelta2D = (origin: THREE.Vector3, dir3D: THREE.Vector3, rect: DOMRect) => {
        const p0 = origin.clone().project(camera);
        const p1 = origin.clone().addScaledVector(dir3D, 0.5).project(camera);
        const dx = (p1.x - p0.x) * (rect.width / 2);
        const dy = -(p1.y - p0.y) * (rect.height / 2);
        return new THREE.Vector2(dx, dy);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (drag !== null) return;
        sound.unlock();
        renderer.domElement.setPointerCapture(e.pointerId);

        getPointerNDC(e.clientX, e.clientY);
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObjects(pickableMeshes, false);

        if (hits.length > 0 && !lockedRef.current && !activeAnim) {
          const hit = hits[0];
          const cubie = hit.object.userData.cubie as CubieData | undefined;
          if (cubie && hit.face) {
            const worldNormal = hit.face.normal
              .clone()
              .transformDirection(hit.object.matrixWorld);
            const snappedNormal = snapCardinal(worldNormal);
            drag = {
              pointerId: e.pointerId,
              mode: 'turn',
              startX: e.clientX,
              startY: e.clientY,
              lastX: e.clientX,
              lastY: e.clientY,
              consumed: false,
              cubie,
              hitPoint: hit.point.clone(),
              hitNormal: snappedNormal,
            };
            return;
          }
        }

        // Fora do cubo (ou bloqueado): roda a câmara orbital livremente em 360°
        drag = {
          pointerId: e.pointerId,
          mode: 'orbit',
          startX: e.clientX,
          startY: e.clientY,
          lastX: e.clientX,
          lastY: e.clientY,
          consumed: false,
        };
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!drag || drag.pointerId !== e.pointerId) return;

        if (drag.mode === 'orbit') {
          const dx = e.clientX - drag.lastX;
          const dy = e.clientY - drag.lastY;
          drag.lastX = e.clientX;
          drag.lastY = e.clientY;

          targetTheta -= dx * 0.0085;
          targetPhi = Math.max(0.18, Math.min(Math.PI - 0.18, targetPhi - dy * 0.0085));
          return;
        }

        if (drag.mode === 'turn' && !drag.consumed && drag.cubie && drag.hitPoint && drag.hitNormal) {
          const totalDx = e.clientX - drag.startX;
          const totalDy = e.clientY - drag.startY;
          const dist = Math.hypot(totalDx, totalDy);
          if (dist < 18) return;

          drag.consumed = true;
          const hitNormal = drag.hitNormal;
          const hitPoint = drag.hitPoint;
          const hitCubie = drag.cubie;
          const rect = renderer.domElement.getBoundingClientRect();
          const drag2D = new THREE.Vector2(totalDx / dist, totalDy / dist);

          // Eixos tangentes ortogonais à face tocada
          const cardinals = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1),
          ];
          const tangents = cardinals.filter((c) => Math.abs(c.dot(hitNormal)) < 0.5);

          let bestTangent = tangents[0];
          let bestDot = 0;

          for (const t of tangents) {
            const proj = projectDelta2D(hitPoint, t, rect);
            if (proj.lengthSq() < 0.0001) continue;
            proj.normalize();
            const dot = drag2D.dot(proj);
            if (Math.abs(dot) > Math.abs(bestDot)) {
              bestDot = dot;
              bestTangent = t;
            }
          }

          if (Math.abs(bestDot) < 0.1) return;

          const swipeWorldDir = bestTangent.clone().multiplyScalar(Math.sign(bestDot));
          const rotVec = new THREE.Vector3().crossVectors(hitNormal, swipeWorldDir);
          const rotCardinal = snapCardinal(rotVec);

          let axis: CubeAxis = 'x';
          let dir: 1 | -1 = 1;
          let layer = hitCubie.gx;

          if (Math.abs(rotCardinal.x) > 0.5) {
            axis = 'x';
            dir = rotCardinal.x > 0 ? 1 : -1;
            layer = hitCubie.gx;
          } else if (Math.abs(rotCardinal.y) > 0.5) {
            axis = 'y';
            dir = rotCardinal.y > 0 ? 1 : -1;
            layer = hitCubie.gy;
          } else {
            axis = 'z';
            dir = rotCardinal.z > 0 ? 1 : -1;
            layer = hitCubie.gz;
          }

          enqueueMove({ axis, layer, dir }, true, true);
        }
      };

      const onPointerEnd = (e: PointerEvent) => {
        if (!drag || drag.pointerId !== e.pointerId) return;
        try {
          renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        drag = null;
      };

      const dom = renderer.domElement;
      dom.addEventListener('pointerdown', onPointerDown);
      dom.addEventListener('pointermove', onPointerMove);
      dom.addEventListener('pointerup', onPointerEnd);
      dom.addEventListener('pointercancel', onPointerEnd);

      // 60fps render loop
      let rafId = 0;
      const animate = (now: number) => {
        rafId = window.requestAnimationFrame(animate);

        // Smooth camera damping
        theta += (targetTheta - theta) * 0.16;
        phi += (targetPhi - phi) * 0.16;
        updateCamera();

        if (!activeAnim && moveQueue.length > 0) {
          startNextAnimation(now);
        }

        if (activeAnim) {
          const elapsed = now - activeAnim.startTime;
          const t = Math.min(1, elapsed / activeAnim.duration);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          pivotGroup.rotation[activeAnim.move.axis] = activeAnim.targetAngle * eased;

          if (t >= 1) {
            finishAnimation();
          }
        }

        renderer.render(scene, camera);
      };
      rafId = window.requestAnimationFrame(animate);

      return () => {
        window.cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        dom.removeEventListener('pointerdown', onPointerDown);
        dom.removeEventListener('pointermove', onPointerMove);
        dom.removeEventListener('pointerup', onPointerEnd);
        dom.removeEventListener('pointercancel', onPointerEnd);
        bodyGeo.dispose();
        bodyMat.dispose();
        stickerGeo.dispose();
        stickerMaterials.forEach((m) => m.dispose());
        renderer.dispose();
      };
    }, [size]);

    return (
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full select-none"
        aria-label={`Cubo Mágico 3D ${size}x${size}`}
      />
    );
  },
);
