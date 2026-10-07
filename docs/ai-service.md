# AI service (decoupled backend)

Placeholder module for a future **Google Cloud Run** (or similar) API that powers the portfolio `[AI_CHATBOT_INTERFACE]` drawer.

## Frontend wiring

Set in the Vite app (e.g. `.env.local`, not committed):

```env
VITE_AI_SERVICE_URL=https://your-service.run.app
```

The static GitHub Pages frontend calls this origin via [`src/services/aiClient.ts`](../src/services/aiClient.ts) (Phase 4). See also [`docs/README.md`](README.md).

## Planned API (sketch)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/v1/chat` | `{ "message": string }` | `{ "reply": string }` |

## Local / deploy

This directory currently holds a **shell Dockerfile** only. Implement the runtime (Node, Python, etc.) when Phase 4 starts.
