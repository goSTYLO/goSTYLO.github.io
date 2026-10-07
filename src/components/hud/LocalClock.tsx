import { useEffect, useState } from 'react';

function formatClock(date: Date) {
  const manila = date.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const pacific = date.toLocaleTimeString('en-GB', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const pacificZone =
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'PST';

  return { manila, pacific, pacificZone };
}

export default function LocalClock() {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time dateTime={new Date().toISOString()} className="text-[var(--text-muted)]">
      {clock.manila} UTC+8 / {clock.pacific} {clock.pacificZone}
    </time>
  );
}
