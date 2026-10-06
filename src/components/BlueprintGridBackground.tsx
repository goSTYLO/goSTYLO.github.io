const H_LANES = [
  { row: 4, duration: 11, delay: -2 },
  { row: 9, duration: 8, delay: -5 },
  { row: 14, duration: 14, delay: -1 },
  { row: 22, duration: 9, delay: -7 },
  { row: 28, duration: 16, delay: -3 },
  { row: 35, duration: 7, delay: -4 },
  { row: 41, duration: 12, delay: -6 },
] as const;

const V_LANES = [
  { col: 3, duration: 10, delay: -3 },
  { col: 8, duration: 13, delay: -8 },
  { col: 15, duration: 8, delay: -2 },
  { col: 22, duration: 15, delay: -5 },
  { col: 30, duration: 9, delay: -1 },
  { col: 38, duration: 11, delay: -6 },
  { col: 45, duration: 17, delay: -4 },
] as const;

const ORBS = [
  { className: 'blueprint-orb blueprint-orb--a', style: { top: '18%', left: '12%' } },
  { className: 'blueprint-orb blueprint-orb--b', style: { top: '62%', left: '78%' } },
  { className: 'blueprint-orb blueprint-orb--c', style: { top: '44%', left: '48%' } },
  { className: 'blueprint-orb blueprint-orb--d', style: { top: '82%', left: '28%' } },
] as const;

const SPARKS = [
  { className: 'blueprint-spark blueprint-spark--a', style: { top: '32%', left: '65%' } },
  { className: 'blueprint-spark blueprint-spark--b', style: { top: '55%', left: '22%' } },
] as const;

export default function BlueprintGridBackground() {
  return (
    <div className="blueprint-grid" aria-hidden="true">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="blueprint-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border-cyan)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      </svg>

      <div className="blueprint-motion-layer">
        {H_LANES.map((lane) => (
          <div
            key={`h-${lane.row}`}
            className="blueprint-data-lane blueprint-data-lane--h"
            style={{
              top: `${lane.row * 32}px`,
              animationDuration: `${lane.duration}s`,
              animationDelay: `${lane.delay}s`,
            }}
          />
        ))}
        {V_LANES.map((lane) => (
          <div
            key={`v-${lane.col}`}
            className="blueprint-data-lane blueprint-data-lane--v"
            style={{
              left: `${lane.col * 32}px`,
              animationDuration: `${lane.duration}s`,
              animationDelay: `${lane.delay}s`,
            }}
          />
        ))}
        {ORBS.map((orb) => (
          <div key={orb.className} className={orb.className} style={orb.style} />
        ))}
        {SPARKS.map((spark) => (
          <div key={spark.className} className={spark.className} style={spark.style} />
        ))}
      </div>
    </div>
  );
}
