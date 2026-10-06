import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

const corners = [
  '-top-2.5 -left-2.5',
  '-top-2.5 -right-2.5',
  '-bottom-2.5 -left-2.5',
  '-bottom-2.5 -right-2.5',
];

type BlueprintCardProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function BlueprintCard({ children, className = '', id }: BlueprintCardProps) {
  return (
    <div
      id={id}
      className={`blueprint-card relative overflow-visible border border-[var(--border-cyan)] p-6 ${className}`.trim()}
    >
      {corners.map((position) => (
        <Plus
          key={position}
          aria-hidden="true"
          className={`pointer-events-none absolute ${position} size-5 text-[var(--crosshair)]`}
        />
      ))}
      {children}
    </div>
  );
}
