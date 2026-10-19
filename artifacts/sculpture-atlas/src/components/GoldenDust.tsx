import { useEffect, useState, type CSSProperties } from 'react';
import './golden-dust.css';

// Fixed positions keep the atmosphere stable across artwork changes. The first
// sixteen are balanced on both sides and are the only particles shown on phones.
const particles = [
  [14, 38, 22, -7, 16, 0.65],
  [81, 46, 28, -19, -12, 0.8],
  [25, 73, 26, -11, 21, 0.7],
  [72, 79, 24, -4, -18, 0.6],
  [8, 63, 30, -22, 12, 0.6],
  [91, 68, 25, -15, -16, 0.75],
  [30, 28, 32, -9, -10, 0.6],
  [68, 35, 27, -21, 14, 0.7],
  [19, 52, 24, -13, -14, 0.8],
  [86, 25, 31, -6, 18, 0.6],
  [34, 62, 29, -17, 12, 0.75],
  [76, 58, 23, -9, -20, 0.7],
  [11, 82, 33, -26, 16, 0.55],
  [88, 84, 28, -16, -12, 0.65],
  [23, 43, 26, -20, 10, 0.55],
  [64, 69, 32, -12, -14, 0.7],
  [38, 81, 30, -23, 18, 0.6],
  [74, 19, 25, -10, -12, 0.55],
  [7, 29, 29, -14, 22, 0.8],
  [93, 39, 34, -27, -18, 0.7],
  [17, 81, 26, -18, 15, 0.85],
  [84, 75, 30, -8, -22, 0.8],
  [33, 45, 25, -6, 20, 0.7],
  [65, 51, 32, -24, -16, 0.8],
  [12, 49, 28, -19, 11, 0.75],
  [89, 56, 27, -12, -19, 0.85],
  [27, 84, 35, -30, 22, 0.7],
  [70, 86, 31, -17, -15, 0.8],
  [21, 22, 30, -15, 12, 0.65],
  [79, 31, 26, -21, -14, 0.75],
  [37, 70, 34, -25, 18, 0.75],
  [61, 77, 28, -10, -20, 0.7],
  [5, 74, 32, -20, 24, 0.8],
  [95, 83, 29, -16, -21, 0.7],
  [29, 57, 27, -13, -10, 0.8],
  [73, 65, 33, -26, 16, 0.85],
];

export function GoldenDust({ subtle = false }: { subtle?: boolean }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setPaused(document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return (
    <div className="golden-dust" data-paused={paused} aria-hidden="true">
      {particles.map(([x, y, duration, delay, drift, brightness], index) => (
        <span
          key={index}
          className="golden-dust__particle"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            '--dust-duration': `${duration / 3.5}s`,
            '--dust-delay': `${delay / 3.5}s`,
            '--dust-drift': `${drift * 2}px`,
            '--dust-brightness': brightness * (subtle ? 0.64 : 1),
            '--dust-size': index % 5 === 0 ? '40px' : index % 2 === 0 ? '28px' : '18px',
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
