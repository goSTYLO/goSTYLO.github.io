import QuickChips from '@/components/ai-drawer/QuickChips';
import TerminalInput from '@/components/ai-drawer/TerminalInput';

type AIChatDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function AIChatDrawer({ open, onClose }: AIChatDrawerProps) {
  if (!open) return null;

  return (
    <aside
      aria-label="AI Chatbot placeholder"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border-cyan)] bg-[var(--bg-surface)] p-6"
    >
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--accent-cyan)]">[AI_CHATBOT_INTERFACE]</span>
        <button
          type="button"
          onClick={onClose}
          className="border border-[var(--border-cyan)] px-2 py-1 text-[var(--text-muted)]"
        >
          [X]
        </button>
      </div>

      <p className="mt-4 font-mono text-xs text-[var(--text-muted)]">SOCKET_STATUS: OFFLINE (Phase 4)</p>

      <div className="mt-6 flex-1 font-mono text-sm text-[var(--text-muted)]">
        <p>&gt; SYSTEM_RESPONSE: Placeholder panel. Chat runtime ships in Phase 4.</p>
      </div>

      <QuickChips />
      <TerminalInput />
    </aside>
  );
}
