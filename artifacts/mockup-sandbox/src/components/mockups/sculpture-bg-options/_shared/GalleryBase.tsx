import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

type Artwork = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  material: string;
  clipInfo: string;
  note: string;
  sequence: string;
  frames: number;
  transparentBackground: boolean;
};

const artworks: Artwork[] = [
  {
    id: '01',
    title: 'The Gilded Witness',
    subtitle: 'Temple figure · original footage',
    image: '/__mockup/images/artworks-transparent/golden-statue/frame-12.webp',
    material: 'Gilded stone appearance',
    clipInfo: '8 sec · MP4',
    note: 'The richly detailed gold-toned figure from your clip. Drag across the viewer to move through the camera’s original orbit and see its front, edges, and reverse.',
    sequence: 'golden-statue',
    frames: 24,
    transparentBackground: true,
  },
  {
    id: '02',
    title: 'Water Keeper',
    subtitle: 'Carved stone sculpture · original footage',
    image: '/__mockup/images/artworks-transparent/carved-relief/frame-12.webp',
    material: 'Pale carved stone',
    clipInfo: '8 sec · MP4',
    note: 'The carved stone panel from your clip. Move through the source views to follow the figure around to the quieter, weathered reverse.',
    sequence: 'carved-relief',
    frames: 24,
    transparentBackground: true,
  },
  {
    id: '03',
    title: 'Threshold Guardian',
    subtitle: 'Temple relief · original footage',
    image: '/__mockup/images/artworks-transparent/stone-guardian/frame-12.webp',
    material: 'Pale carved stone',
    clipInfo: '8 sec · MP4',
    note: 'The stone temple relief shown in your sculpture clip. Drag left or right to inspect the changing sides and carved front.',
    sequence: 'stone-guardian',
    frames: 24,
    transparentBackground: true,
  },
  {
    id: '04',
    title: 'Chromatic Deity',
    subtitle: 'Temple figure · original footage',
    image: '/__mockup/images/artworks-transparent/neon-figure/frame-12.webp',
    material: 'Pink and cyan scan',
    clipInfo: '8 sec · MP4',
    note: 'The pink-and-cyan temple figure from the source clip. Scrub through its original camera movement to see the relief from different angles.',
    sequence: 'neon-figure',
    frames: 24,
    transparentBackground: true,
  },
  {
    id: '05',
    title: 'Echo / 05',
    subtitle: 'Luminous scan · screen recording',
    image: '/__mockup/images/artworks/digital-scan/frame-11.jpg',
    material: 'Green structured-light scan',
    clipInfo: '23 sec · MOV',
    note: 'The luminous green scan in your screen recording. Scrub through the original capture from its wide view into the close-up details.',
    sequence: 'digital-scan',
    frames: 23,
    transparentBackground: false,
  },
];

function framePath(work: Artwork, index: number) {
  const folder = work.transparentBackground ? 'artworks-transparent' : 'artworks';
  const extension = work.transparentBackground ? 'webp' : 'jpg';
  return `/__mockup/images/${folder}/${work.sequence}/frame-${String(index).padStart(2, '0')}.${extension}`;
}

function Viewer({ work, resetToken }: { work: Artwork; resetToken: number }) {
  const [frame, setFrame] = useState(Math.floor(work.frames / 2));
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; x: number; carry: number } | null>(null);

  useEffect(() => {
    setFrame(Math.floor(work.frames / 2));
    setZoom(1);
  }, [resetToken, work.frames]);

  useEffect(() => {
    for (let index = 0; index < work.frames; index += 1) {
      const image = new Image();
      image.src = framePath(work, index);
    }
  }, [work.sequence, work.frames]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key === 'ArrowLeft') {
        setFrame(value => (value - 1 + work.frames) % work.frames);
      } else if (event.key === 'ArrowRight') {
        setFrame(value => (value + 1) % work.frames);
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
  }, [work.frames]);

  return (
    <div
      className="absolute inset-0 z-[2] flex items-center justify-center overflow-hidden"
      role="group"
      tabIndex={0}
      aria-label={`Interactive view of ${work.title}, using still frames from the original video. Drag horizontally or use left and right arrow keys to move through the source views.`}
      data-testid="source-turntable"
      onPointerDown={event => {
        drag.current = { pointerId: event.pointerId, x: event.clientX, carry: 0 };
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const state = drag.current;
        if (!state || state.pointerId !== event.pointerId) return;
        state.carry += event.clientX - state.x;
        state.x = event.clientX;
        const steps = Math.trunc(state.carry / 18);
        if (steps !== 0) {
          state.carry -= steps * 18;
          setFrame(value => ((value - steps) % work.frames + work.frames) % work.frames);
        }
      }}
      onPointerUp={event => {
        drag.current = null;
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onWheel={event => {
        event.preventDefault();
        setZoom(value => Math.max(0.7, Math.min(1.8, value - event.deltaY * 0.0007)));
      }}
      style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(177,164,126,.2),transparent_55%)]" />
      <img
        src={framePath(work, frame)}
        alt={`${work.title} — source view ${frame + 1} of ${work.frames}`}
        draggable={false}
        data-testid="source-frame"
        className="pointer-events-none relative max-h-[90%] max-w-[88%] select-none object-contain drop-shadow-[0_28px_24px_rgba(0,0,0,.55)]"
        style={{
          transform: `scale(${zoom})`,
          transition: dragging ? 'none' : 'transform 180ms ease-out',
        }}
      />
    </div>
  );
}

export function GalleryBase({ theme }: { theme: string }) {
  const [selected, setSelected] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const work = artworks[selected];
  const selectWork = (index: number) => {
    setSelected(index);
    setResetToken(value => value + 1);
  };

  return (
    <main className={`app-shell gallery-theme-${theme}`} data-theme={theme}>
      <div className="gallery-atmosphere" aria-hidden="true">
        <span className="gallery-atmosphere__glow gallery-atmosphere__glow--one" />
        <span className="gallery-atmosphere__glow gallery-atmosphere__glow--two" />
        <span className="gallery-atmosphere__orbit gallery-atmosphere__orbit--one" />
        <span className="gallery-atmosphere__orbit gallery-atmosphere__orbit--two" />
        <span className="gallery-atmosphere__floor" />
        <span className="gallery-atmosphere__particle gallery-atmosphere__particle--one" />
        <span className="gallery-atmosphere__particle gallery-atmosphere__particle--two" />
        <span className="gallery-atmosphere__particle gallery-atmosphere__particle--three" />
        <span className="gallery-atmosphere__particle gallery-atmosphere__particle--four" />
        <span className="gallery-atmosphere__particle gallery-atmosphere__particle--five" />
        <span className="gallery-atmosphere__particle gallery-atmosphere__particle--six" />
      </div>
      <section className="relative z-10 mx-auto grid h-dvh max-w-[1920px] grid-cols-[minmax(0,1fr)_58px] gap-2 p-2 sm:grid-cols-[minmax(0,1fr)_68px] md:grid-cols-[minmax(0,1fr)_90px] md:gap-4 md:p-4 lg:grid-cols-[minmax(0,1fr)_104px]">
        <div className="min-w-0">
          <div className="viewer-grid viewer-enter relative h-full min-h-[360px] overflow-hidden rounded-[4px] border border-[#454940] bg-[#282b27] shadow-[0_22px_65px_rgba(58,52,40,.2)]">
            <div className="gallery-stage-effects pointer-events-none absolute inset-0 z-0" aria-hidden="true">
              <span className="gallery-stage-effects__halo" />
              <span className="gallery-stage-effects__ring gallery-stage-effects__ring--one" />
              <span className="gallery-stage-effects__ring gallery-stage-effects__ring--two" />
              <span className="gallery-stage-effects__floor" />
              <span className="gallery-stage-effects__beam" />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_48%,rgba(166,154,117,.12),transparent_54%)]" />
            <Viewer key={work.id} work={work} resetToken={resetToken} />
            <button
              type="button"
              data-testid="reset-view"
              aria-label="Reset source view"
              onClick={() => setResetToken(value => value + 1)}
              className="absolute bottom-3 right-3 z-[3] flex h-10 w-10 items-center justify-center rounded-full border border-[#777567] bg-[#292c28]/80 text-[#e2ddcb] backdrop-blur-sm transition hover:border-[#c0ad7c] hover:bg-[#3a3b33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3ae75] md:bottom-5 md:right-5"
            >
              <RotateCcw size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#777567]/80 bg-[#292c28]/85 p-1 backdrop-blur-sm md:bottom-5">
              <button
                type="button"
                aria-label="Previous artwork"
                data-testid="previous-artwork"
                onClick={() => selectWork((selected + artworks.length - 1) % artworks.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#d8d1bf] transition hover:bg-[#45463e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3ae75]"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Zoom out"
                data-testid="zoom-out"
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '-' }))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#d8d1bf] transition hover:bg-[#45463e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3ae75]"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                data-testid="zoom-in"
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#d8d1bf] transition hover:bg-[#45463e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3ae75]"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                aria-label="Next artwork"
                data-testid="next-artwork"
                onClick={() => selectWork((selected + 1) % artworks.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a784d] text-[#f4efdf] transition hover:bg-[#75643e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3ae75]"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <aside
          className="flex min-h-0 flex-col items-center justify-center gap-2 sm:gap-2.5 md:gap-3"
          role="list"
          aria-label="Select an artwork"
        >
          {artworks.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              data-testid={`artwork-${item.id}`}
              aria-label={`View ${item.title}`}
              aria-pressed={selected === index}
              onClick={() => selectWork(index)}
              className={`artwork-thumb relative flex h-[74px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-md border bg-[#333630] p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e7541] sm:h-[84px] sm:w-[60px] md:h-[104px] md:w-[78px] lg:h-[116px] lg:w-[88px] ${selected === index ? 'border-[#c4a75c] bg-[#4a473a] shadow-[0_0_18px_rgba(196,167,92,.28)]' : 'border-[#68685d]/70 opacity-80 hover:border-[#b3a176] hover:opacity-100'}`}
            >
              <img src={item.image} alt="" className="h-full w-full rounded-[3px] object-contain" />
              {selected === index && (
                <span className="absolute inset-0 rounded-[3px] ring-1 ring-inset ring-[#e8c975]/60" aria-hidden="true" />
              )}
            </button>
          ))}
        </aside>
      </section>
    </main>
  );
}
