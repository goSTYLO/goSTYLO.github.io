const PLACEHOLDER_CHIPS = [
  'What stacks do you use?',
  'Tell me about Serbisyo',
  'Cloud Run experience',
] as const;

export default function QuickChips() {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden="true">
      {PLACEHOLDER_CHIPS.map((label) => (
        <button
          key={label}
          type="button"
          disabled
          className="border border-[var(--border-cyan)] px-2 py-1 text-[var(--text-muted)] opacity-60"
        >
          [{label}]
        </button>
      ))}
    </div>
  );
}
