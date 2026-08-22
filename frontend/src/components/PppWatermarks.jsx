import { useMemo } from 'react';

// Genere des positions stables de filigranes trombone PPP pour decorer la page.
function buildWatermarkLayout(count = 9) {
  return Array.from({ length: count }, (_, index) => {
    const seed = (index + 1) * 7919;
    const top = 6 + ((seed * 13) % 820) / 10;
    const left = 4 + ((seed * 17) % 860) / 10;
    const size = 42 + ((seed * 11) % 96);
    const rotation = -32 + ((seed * 7) % 64);
    const opacity = 0.045 + (index % 4) * 0.018;

    return {
      id: index,
      top: `${top}%`,
      left: `${left}%`,
      size,
      rotation,
      opacity,
    };
  });
}

function PppWatermarks() {
  const marks = useMemo(() => buildWatermarkLayout(), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {marks.map((mark) => (
        <img
          key={mark.id}
          className="absolute max-w-none select-none"
          src="/ppp-watermark.png"
          alt=""
          style={{
            top: mark.top,
            left: mark.left,
            width: mark.size,
            height: mark.size,
            transform: `rotate(${mark.rotation}deg)`,
            opacity: mark.opacity,
            filter: 'saturate(0.85)',
          }}
        />
      ))}
    </div>
  );
}

export default PppWatermarks;
