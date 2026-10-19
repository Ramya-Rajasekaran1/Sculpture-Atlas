import { useCallback, useEffect, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

type SourceArtwork = {
  title: string;
  sequence: string;
  frames: number;
  transparentBackground: boolean;
  materialStyle?: 'black-steel';
};

type DragState = {
  pointerId: number;
  x: number;
  time: number;
  velocity: number;
};

function framePath(work: SourceArtwork, index: number) {
  const folder = work.transparentBackground ? 'artworks-transparent' : 'artworks';
  const extension = work.transparentBackground ? 'webp' : 'jpg';
  return `/${folder}/${work.sequence}/frame-${String(index).padStart(2, '0')}.${extension}`;
}

function wrapFrame(position: number, count: number) {
  return ((Math.round(position) % count) + count) % count;
}

export function SculptureViewer({ work, resetToken, animateEntrance = false }: { work: SourceArtwork; resetToken: number; animateEntrance?: boolean }) {
  const center = Math.floor(work.frames / 2);
  const [frame, setFrame] = useState(center);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<DragState | null>(null);
  const motion = useRef({ position: center, target: center, velocity: 0 });
  const animation = useRef<number | null>(null);
  const reducedMotion = useRef(false);
  const preloadedFrames = useRef<HTMLImageElement[]>([]);

  const stopMotion = useCallback(() => {
    if (animation.current !== null) cancelAnimationFrame(animation.current);
    animation.current = null;
  }, []);

  const startMotion = useCallback(() => {
    if (animation.current !== null) return;
    let previousTime = 0;

    const tick = (time: number) => {
      const elapsed = previousTime ? Math.min(32, time - previousTime) : 16;
      previousTime = time;
      const state = motion.current;

      if (!drag.current) {
        state.target += state.velocity * elapsed;
        state.velocity *= Math.exp(-elapsed / 110);
        if (Math.abs(state.velocity) < 0.001) state.velocity = 0;
      }

      // Render on the display clock, visiting intermediate source views rather
      // than jumping several views whenever pointer events arrive in a burst.
      const distance = state.target - state.position;
      const easedStep = distance * (1 - Math.exp(-elapsed / 13));
      state.position = reducedMotion.current
        ? state.target
        : state.position + Math.max(-1, Math.min(1, easedStep));
      setFrame(wrapFrame(state.position, work.frames));

      if (!drag.current && state.velocity === 0 && Math.abs(state.target - state.position) < 0.04) {
        state.position = state.target = Math.round(state.target);
        setFrame(wrapFrame(state.position, work.frames));
        animation.current = null;
        return;
      }
      animation.current = requestAnimationFrame(tick);
    };

    animation.current = requestAnimationFrame(tick);
  }, [work.frames]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reducedMotion.current = preference.matches; };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    stopMotion();
    drag.current = null;
    motion.current = { position: center, target: center, velocity: 0 };
    setFrame(center);
    setZoom(1);
    setDragging(false);
    return stopMotion;
  }, [center, resetToken, stopMotion]);

  useEffect(() => {
    preloadedFrames.current = Array.from({ length: work.frames }, (_, index) => {
      const image = new Image();
      image.src = framePath(work, index);
      // Decode before interaction as well as downloading, avoiding a pause
      // when an already-cached source view is displayed for the first time.
      void image.decode().catch(() => undefined);
      return image;
    });
    return () => { preloadedFrames.current = []; };
  }, [work.sequence, work.frames, work.transparentBackground]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        motion.current.velocity = 0;
        motion.current.target = Math.round(motion.current.target) + (event.key === 'ArrowLeft' ? -1 : 1);
        startMotion();
      } else if (event.key === 'ArrowUp' || event.key === '+' || event.key === '=') {
        setZoom(value => Math.min(1.8, value + 0.08));
      } else if (event.key === 'ArrowDown' || event.key === '-' || event.key === '_') {
        setZoom(value => Math.max(0.7, value - 0.08));
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [startMotion]);

  return (
    <div
      className="absolute inset-0 z-[2] flex items-center justify-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-[#c3ae75]"
      role="group"
      tabIndex={0}
      aria-label={`Interactive view of ${work.title}. Drag horizontally, swipe, or use the left and right arrow keys to rotate through the source views.`}
      data-testid="source-turntable"
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        motion.current.velocity = 0;
        motion.current.target = motion.current.position;
        drag.current = { pointerId: event.pointerId, x: event.clientX, time: performance.now(), velocity: 0 };
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        startMotion();
      }}
      onPointerMove={event => {
        const state = drag.current;
        if (!state || state.pointerId !== event.pointerId) return;
        const now = performance.now();
        const elapsed = Math.max(8, now - state.time);
        const orbitWidth = Math.max(240, Math.min(420, event.currentTarget.clientWidth * 0.6));
        const change = -(event.clientX - state.x) * work.frames / orbitWidth;
        motion.current.target += change;
        const velocityBlend = 1 - Math.exp(-elapsed / 24);
        state.velocity = Math.max(-0.05, Math.min(0.05,
          state.velocity + (change / elapsed - state.velocity) * velocityBlend));
        state.x = event.clientX;
        state.time = now;
        startMotion();
      }}
      onPointerUp={event => {
        const state = drag.current;
        if (!state || state.pointerId !== event.pointerId) return;
        motion.current.velocity = !reducedMotion.current && performance.now() - state.time < 80
          ? Math.max(-0.03, Math.min(0.03, state.velocity * 0.75))
          : 0;
        drag.current = null;
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        startMotion();
      }}
      onPointerCancel={() => {
        drag.current = null;
        motion.current.velocity = 0;
        motion.current.target = motion.current.position;
        setDragging(false);
      }}
      onLostPointerCapture={() => {
        if (!drag.current) return;
        drag.current = null;
        motion.current.velocity = 0;
        setDragging(false);
      }}
      onWheel={event => {
        event.preventDefault();
        setZoom(value => Math.max(0.7, Math.min(1.8, value - event.deltaY * 0.0007)));
      }}
      style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(177,164,126,.2),transparent_55%)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-5 z-[3] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-medium tracking-wide text-[#f4efdf] shadow-lg backdrop-blur-md md:top-6"
        data-testid="rotation-instruction"
      >
        <MoveHorizontal size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Drag to rotate</span>
        <span className="sm:hidden">Swipe to rotate</span>
        <span className="hidden border-l border-white/20 pl-2 text-[#c6c2b6] md:inline" aria-hidden="true">← →</span>
      </div>
      <img
        src={framePath(work, frame)}
        alt={`${work.title} — source view ${frame + 1} of ${work.frames}`}
        draggable={false}
        decoding="sync"
        data-testid="source-frame"
        data-material={work.materialStyle}
        className={`pointer-events-none relative max-h-[90%] max-w-[88%] select-none object-contain drop-shadow-[0_28px_24px_rgba(0,0,0,.55)] ${animateEntrance ? 'artwork-transition-in' : ''}`}
        style={{
          transform: `scale(${zoom})`,
          transition: dragging ? 'none' : 'transform 180ms ease-out',
        }}
      />
    </div>
  );
}
