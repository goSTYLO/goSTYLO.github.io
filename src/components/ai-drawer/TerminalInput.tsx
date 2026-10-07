export default function TerminalInput() {
  return (
    <label className="mt-4 block font-mono text-sm text-[var(--text-muted)]">
      <span className="text-[var(--accent-cyan)]">$ </span>
      <input
        type="text"
        disabled
        placeholder="ask a question..."
        className="w-full border-0 bg-transparent p-0 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Chat prompt (Phase 4)"
      />
    </label>
  );
}
