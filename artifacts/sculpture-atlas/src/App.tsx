import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SculptureViewer as Viewer } from './components/SculptureViewer';
import { GoldenDust } from './components/GoldenDust';
import { BackgroundMusic } from './components/BackgroundMusic';
import { MaterialFilters } from './components/MaterialFilters';
import './gallery-stage.css';
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
  ambient: 'gold' | 'stone' | 'chromatic' | 'teal';
  stroke: string;
  materialStyle?: 'black-steel';
};

const publicAssetUrl = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const artworks: Artwork[] = [
  {
    id: '01',
    title: 'The Gilded Witness',
    subtitle: 'Temple figure · original footage',
    image: publicAssetUrl('/artworks-transparent/golden-statue/frame-12.webp'),
    material: 'Gilded stone appearance',
    clipInfo: '8 sec · MP4',
    note: 'The richly detailed gold-toned figure from your clip. Drag across the viewer to move through the camera’s original orbit and see its front, edges, and reverse.',
    sequence: 'golden-statue',
    frames: 24,
    transparentBackground: true,
    ambient: 'gold',
    stroke: '#c6a75c',
  },
  {
    id: '02',
    title: 'Water Keeper',
    subtitle: 'Carved stone sculpture · original footage',
    image: publicAssetUrl('/artworks-transparent/carved-relief/frame-12.webp'),
    material: 'Pale carved stone',
    clipInfo: '8 sec · MP4',
    note: 'The carved stone panel from your clip. Move through the source views to follow the figure around to the quieter, weathered reverse.',
    sequence: 'carved-relief',
    frames: 24,
    transparentBackground: true,
    ambient: 'stone',
    stroke: '#adb2ab',
  },
  {
    id: '03',
    title: 'Threshold Guardian',
    subtitle: 'Temple relief · black steel finish',
    image: publicAssetUrl('/artworks-transparent/stone-guardian/frame-12.webp'),
    material: 'Blackened steel finish',
    clipInfo: '8 sec · MP4',
    note: 'The stone temple relief shown in your sculpture clip. Drag left or right to inspect the changing sides and carved front.',
    sequence: 'stone-guardian',
    materialStyle: 'black-steel',
    frames: 24,
    transparentBackground: true,
    ambient: 'stone',
    stroke: '#89999e',
  },
  {
    id: '04',
    title: 'Chromatic Deity',
    subtitle: 'Temple figure · original footage',
    image: publicAssetUrl('/artworks-transparent/neon-figure/frame-12.webp'),
    material: 'Pink and cyan scan',
    clipInfo: '8 sec · MP4',
    note: 'The pink-and-cyan temple figure from the source clip. Scrub through its original camera movement to see the relief from different angles.',
    sequence: 'neon-figure',
    frames: 24,
    transparentBackground: true,
    ambient: 'chromatic',
    stroke: '#a28ba9',
  },
  {
    id: '05',
    title: 'Echo / 05',
    subtitle: 'Luminous scan · screen recording',
    image: publicAssetUrl('/artworks/digital-scan-retouched/frame-11.jpg'),
    material: 'Green structured-light scan',
    clipInfo: '23 sec · MOV',
    note: 'The luminous green scan in your screen recording. Scrub through the original capture from its wide view into the close-up details.',
    sequence: 'digital-scan-retouched',
    frames: 23,
    transparentBackground: false,
    ambient: 'teal',
    stroke: '#50a98e',
  },
];

type TransitionFrame = {
  id: number;
  src: string;
  materialStyle?: Artwork['materialStyle'];
  transform: string;
};

function App() {
  const [selected, setSelected] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [transitionFrame, setTransitionFrame] = useState<TransitionFrame | null>(null);
  const transitionId = useRef(0);
  const transitionTimer = useRef<number | null>(null);
  const work = artworks[selected];
  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  const selectWork = (index: number) => {
    if (index === selected) {
      setResetToken(value => value + 1);
      return;
    }

    const id = ++transitionId.current;
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    const currentFrame = document.querySelector<HTMLImageElement>('[data-testid="source-frame"]');
    if (currentFrame?.complete && currentFrame.naturalWidth > 0) {
      setTransitionFrame({
        id,
        src: currentFrame.src,
        materialStyle: currentFrame.dataset.material as Artwork['materialStyle'],
        transform: currentFrame.style.transform || 'scale(1)',
      });
      transitionTimer.current = window.setTimeout(() => {
        setTransitionFrame(current => current?.id === id ? null : current);
        transitionTimer.current = null;
      }, 520);
    } else {
      setTransitionFrame(null);
      transitionTimer.current = null;
    }
    setSelected(index);
    setResetToken(value => value + 1);
  };

  const clearTransitionFrame = (id: number) => {
    if (transitionId.current !== id) return;
    setTransitionFrame(current => current?.id === id ? null : current);
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  };

  return (
    <main className={`app-shell gallery-theme-obsidian gallery-accent-${work.ambient}`}>
      <MaterialFilters />
      <div className="gallery-atmosphere" aria-hidden="true">
        <span className="gallery-atmosphere__glow gallery-atmosphere__glow--one" />
        <span className="gallery-atmosphere__glow gallery-atmosphere__glow--two" />
        <span className="gallery-atmosphere__orbit gallery-atmosphere__orbit--one" />
        <span className="gallery-atmosphere__orbit gallery-atmosphere__orbit--two" />
        <span className="gallery-atmosphere__floor" />
      </div>
      <section className="relative z-10 mx-auto grid h-dvh max-w-[1920px] grid-cols-[minmax(0,1fr)_58px] gap-2 p-2 sm:grid-cols-[minmax(0,1fr)_68px] md:grid-cols-[minmax(0,1fr)_90px] md:gap-4 md:p-4 lg:grid-cols-[minmax(0,1fr)_104px]">
        <div className="min-w-0">
          <div className="viewer-grid viewer-enter relative h-full min-h-[360px] overflow-hidden rounded-[4px] border border-[#454940] bg-[#282b27] shadow-[0_22px_65px_rgba(58,52,40,.2)]">
            <h1 className="gallery-title absolute left-4 top-16 z-[3] font-serif text-[clamp(15px,1.5vw,20px)] font-medium tracking-[.13em] text-[#eadbb8] md:left-5 md:top-5">
              Sculpture Atlas
            </h1>
            <div className="gallery-stage-effects pointer-events-none absolute inset-0 z-0" aria-hidden="true">
              <span className="gallery-stage-effects__halo" />
              <span className="gallery-stage-effects__ring gallery-stage-effects__ring--one" />
              <span className="gallery-stage-effects__ring gallery-stage-effects__ring--two" />
              <span className="gallery-stage-effects__floor" />
              <span className="gallery-stage-effects__beam" />
            </div>
            <GoldenDust subtle={work.ambient === 'chromatic'} />
            <BackgroundMusic />
            <Viewer key={work.id} work={work} resetToken={resetToken} animateEntrance={transitionFrame !== null} />
            {transitionFrame && (
              <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center" aria-hidden="true">
                <img
                  key={transitionFrame.id}
                  src={transitionFrame.src}
                  alt=""
                  data-material={transitionFrame.materialStyle}
                  className="artwork-transition-out max-h-[90%] max-w-[88%] select-none object-contain drop-shadow-[0_28px_24px_rgba(0,0,0,.55)]"
                  style={{ transform: transitionFrame.transform, '--outgoing-frame-transform': transitionFrame.transform } as CSSProperties}
                  onAnimationEnd={() => clearTransitionFrame(transitionFrame.id)}
                />
              </div>
            )}
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
              style={{ '--thumbnail-accent': item.stroke } as CSSProperties}
              className={`artwork-thumb relative flex h-[74px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-md border bg-[#333630] p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-[84px] sm:w-[60px] md:h-[104px] md:w-[78px] lg:h-[116px] lg:w-[88px] ${selected !== index ? 'opacity-80' : ''}`}
            >
              <img src={item.image} alt="" data-material={item.materialStyle} className="h-full w-full rounded-[3px] object-contain" />
              {selected === index && (
                 <span className="absolute inset-0 rounded-[3px] ring-1 ring-inset" aria-hidden="true" />
              )}
            </button>
          ))}
        </aside>
      </section>
    </main>
  );
}

export default App;
