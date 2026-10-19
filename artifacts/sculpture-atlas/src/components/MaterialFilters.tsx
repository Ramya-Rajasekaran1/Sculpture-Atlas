// A fixed tonal lookup preserves the original carvings and stays consistent
// across every source view without generating synthetic geometry or new frames.
export function MaterialFilters() {
  const steelTones = '0 0.01 0.025 0.05 0.09 0.17 0.3 0.58 0.94';
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden="true">
      <defs>
        <filter id="black-steel-material" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={steelTones} />
            <feFuncG type="table" tableValues={steelTones} />
            <feFuncB type="table" tableValues={steelTones} />
            <feFuncA type="identity" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
