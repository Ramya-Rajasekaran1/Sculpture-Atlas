import { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle, Volume2, VolumeX } from 'lucide-react';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const enabled = useRef(true);
  const blocked = useRef(false);
  const playing = useRef(false);
  const request = useRef(0);
  const [phase, setPhase] = useState<'off' | 'loading' | 'ready' | 'on'>('loading');
  const [error, setError] = useState('');

  const fail = useCallback(() => {
    enabled.current = false;
    blocked.current = false;
    playing.current = false;
    request.current++;
    audioRef.current?.pause();
    setPhase('off');
    setError('Music couldn’t load. Tap Music to retry.');
  }, []);

  const playMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const currentRequest = ++request.current;
    enabled.current = true;
    blocked.current = false;
    setPhase('loading');
    audio.volume = 0.22;
    if (!audio.src || audio.error) {
      audio.src = `${import.meta.env.BASE_URL}api/audio/thillana.mp3`;
      audio.load();
    }
    setError('');
    try {
      await audio.play();
      if (currentRequest === request.current && enabled.current) setPhase('on');
    } catch (playError) {
      if (currentRequest !== request.current || !enabled.current) return;
      if (playError instanceof DOMException && playError.name === 'NotAllowedError') {
        // Audible autoplay is browser-controlled. Keep the default preference,
        // but only retry from a genuine visitor gesture, without claiming sound.
        blocked.current = true;
        setPhase('ready');
      } else {
        fail();
      }
    }
  }, [fail]);

  useEffect(() => {
    const audio = audioRef.current;
    void playMusic();
    const resumeOnGesture = (event: Event) => {
      if (!enabled.current || !blocked.current) return;
      const target = event.target;
      if (target instanceof Element && target.closest('[data-testid="toggle-background-music"]')) return;
      if (event instanceof KeyboardEvent
        && (event.repeat || ['Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(event.key))) return;
      void playMusic();
    };
    document.addEventListener('pointerdown', resumeOnGesture, true);
    document.addEventListener('touchend', resumeOnGesture, true);
    document.addEventListener('keydown', resumeOnGesture, true);
    return () => {
      enabled.current = false;
      playing.current = false;
      request.current++;
      audio?.pause();
      document.removeEventListener('pointerdown', resumeOnGesture, true);
      document.removeEventListener('touchend', resumeOnGesture, true);
      document.removeEventListener('keydown', resumeOnGesture, true);
    };
  }, [playMusic]);

  const stopMusic = () => {
    enabled.current = false;
    playing.current = false;
    request.current++;
    audioRef.current?.pause();
    setPhase('off');
    setError('');
  };

  const toggleMusic = () => {
    if (enabled.current && !blocked.current) stopMusic();
    else void playMusic();
  };

  const isOn = phase === 'on';
  const Icon = phase === 'loading' ? LoaderCircle : isOn ? Volume2 : VolumeX;

  return (
    <div className="absolute right-3 top-16 z-[4] md:right-5 md:top-5">
      <audio
        ref={audioRef}
        loop
        autoPlay
        preload="none"
        onError={fail}
        onWaiting={() => { if (enabled.current) setPhase('loading'); }}
        onPlaying={() => {
          if (enabled.current) {
            playing.current = true;
            blocked.current = false;
            setPhase('on');
          }
          else audioRef.current?.pause();
        }}
        onPause={() => {
          if (!audioRef.current?.paused || !playing.current) return;
          playing.current = false;
          enabled.current = false;
          request.current++;
          setPhase('off');
        }}
      />
      <button
        type="button"
        data-testid="toggle-background-music"
        data-state={phase}
        aria-label={phase === 'on' || phase === 'loading' ? 'Turn background music off' : 'Turn instrumental thillana music on'}
        aria-pressed={isOn}
        aria-describedby={error ? 'background-music-error' : undefined}
        onClick={toggleMusic}
        title="Instrumental thillana · background music"
        className="flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3 text-xs text-[#e2ddcb] transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3ae75]"
      >
        <Icon size={15} aria-hidden="true" className={phase === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''} />
        <span>{phase === 'loading' ? 'Loading…' : phase === 'ready' ? 'Tap for music' : isOn ? 'Music on' : 'Music off'}</span>
      </button>
      {phase === 'ready' && (
        <span className="sr-only" role="status">Your browser needs an interaction to start background music.</span>
      )}
      {error && (
        <p id="background-music-error" data-testid="background-music-error" role="alert"
          className="mt-2 max-w-44 rounded-md border border-white/15 bg-black/95 p-2 text-xs text-[#e2ddcb]">
          {error}
        </p>
      )}
    </div>
  );
}
