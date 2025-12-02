# Copilot Instructions for Multi-Sport Platform

## Project Context
- **Stack:** React 19, TypeScript, Vite, Bun, Supabase, Stripe.
- **AI/RAG:** OpenAI (GPT-3.5/4), Supabase Vector (pgvector), Edge Functions.
- **State:** Zustand (client), React Query (server).
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons.
- **Testing:** Bun native test runner (`bun test`).

## Architecture & Patterns

### Feature-Based Structure
- Code is organized by feature in `src/features/` (e.g., `tournament`, `billing`, `players`).
- **Rule:** Keep feature-specific components, hooks, and logic within their respective feature folders.
- Shared UI components live in `src/components/ui/`.

### Sport Plugin System (Critical)
- The app uses a **plugin architecture** to support multiple sports (Tennis, Basketball).
- **Location:** `src/sports/` contains sport-specific logic.
- **Pattern:** Each sport (e.g., `src/sports/tennis/`) must implement the `SportPlugin` interface defined in `src/sports/core/types.ts`.
- **Usage:** Use `useSportPlugin()` hook to access the active sport's logic (scoring, rules, wizard steps).
- **Adding a Sport:** Create a new folder in `src/sports/`, implement the plugin interface, and register it in `src/store/sportStore.ts`.

### AI & RAG System
- **Chatbot:** Implemented via Supabase Edge Function `chat-bot`.
- **Knowledge Base:**
  - Source of truth: `docs/KNOWLEDGE_BASE.md` + indexed code files.
  - Indexing: Run `bun run scripts/seed-knowledge.ts` to chunk and embed files into `documents` table.
- **Pattern:** The chatbot uses **Tool Calling** (`get_tournaments`) to fetch live data and **JSON Mode** to return structured responses (reply + navigation actions).
- **Frontend:** `SupportChat.tsx` handles the chat UI and renders navigation buttons based on the JSON response.

### State Management
- **Zustand:** Used for complex client-side state (e.g., `tournamentStore.ts`, `sportStore.ts`).
  - **Pattern:** Store logic often includes "engines" (e.g., `TournamentEngine`) to separate business logic from state updates.
- **React Query:** Used for all data fetching (Supabase/Stripe).
  - **Pattern:** Custom hooks in `src/hooks/` (e.g., `useTournaments.ts`) wrap React Query logic.

### Backend (Supabase)
- **Edge Functions:** Located in `supabase/functions/`.
  - **Pattern:** Use `supabase.functions.invoke()` or native `fetch`.
  - **AI Functions:** Must enforce `response_format: { type: "json_object" }` for reliability.
- **Database:** Managed via migrations in `supabase/migrations/`.
- **Types:** Generated types are in `src/types/supabase.ts`.

## Developer Workflow

### Commands
- **Start:** `bun run dev`
- **Test:** `bun test` (or `bun test:watch`)
- **Lint:** `bun run lint`
- **Seed Knowledge:** `bun run scripts/seed-knowledge.ts` (requires `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`).

### Testing Strategy
- **Unit Tests:** Focus on logic engines (e.g., `scoring.ts`, `engine.ts`).
- **Integration:** Test hooks and store interactions.
- **Mocking:** Use `src/lib/mockData.ts` or `src/test/setup.ts` for test data.

## Coding Conventions
- **Imports:** Use absolute imports `@/` for `src/`.
- **Components:** Functional components with named exports.
- **Error Handling:**
  - Backend: Return structured JSON errors.
  - Frontend: Use `toast` from `src/components/ui/toast.tsx` for user feedback.
- **Styling:** Use `clsx` and `tailwind-merge` (via `cn` utility) for dynamic classes.
