---
name: implement-spec
description: "Implement the result of /to-spec and /to-tickets in code."
---

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

The goal is the entire spec implemented on a single **integration branch**, with every ticket resolved the way the issue tracker closes work.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Start every subagent with a fresh context window.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Проектные соглашения (booking-api, обязательны)

1. **Язык — русский.** Все артефакты агента пишутся на русском: body PR (включая заполнение шаблона), комментарии в issue, cart-closed комментарий, session-манифест. Исключения: Conventional Commits-типы (`feat:`, `fix:` и т.д.), технические идентификаторы (имена файлов, путей, endpoint'ов, кодов ошибок) и сгенерированный код.
2. **Commit-сообщения** — Conventional Commits; реализация конкретного тикета ссылается на него: `type(scope): subject (#NN)`. Типы файла `commitlint.config.js`; drift запрещён.
3. **Generated-артефакты не правятся руками**: `openapi.yaml` и `web/src/api/sdk.ts` — только регенерацией (`mise run spec` / `mise run gen:sdk`). Правится источник `spec/*.tsp`.
4. **Gate на CI**: один раз в конце — полный `make check`. Промежуточный gate на каждом тикете: `typecheck + lint + unit`-тесты (быстрее, чем полный прогон).
5. **PR обязан заполнять шаблон** репозитория `.github/pull_request_template.md`: «Чек-лист проверок», «Риск» (с обоснованием — что ломается, почему допустимо), «Способ отката». Пустые секции недопустимы.
6. **Сессия оставляет след**: session-манифест в `docs/agents/sessions/YYYY-MM-DD-<cart-id>-<short>.md` (закрытые sub-tickets, drift с reasons, findings ревью, fixups с SHA) + краткий cart-closed комментарий в issue спеки.
7. **Не устанавливать ПО на CI** (тулчейн предустановлен воркфлоу), exploration-отчёты — краткие. Детали — `AGENTS.md` → «Бюджет прогона агента на CI».

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, open a draft PR after the first merge in step 5 (a branch with no commits ahead of main can't open one), marked as closing the spec and tickets. The PR body MUST follow `.github/pull_request_template.md` in Russian (see Проектные соглашения #5).

4. Use a fresh **implementer subagent** for each ticket, each in its own worktree on its own branch. Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - builds the ticket test-first: writes failing acceptance tests for the ticket's acceptance criteria, then implements until they pass (не зависит от скилла `tdd` — инструкция самодостаточна);
   - merges the integration branch tip into its own branch before reporting done

5. Once an **implementer subagent** completes, merge its work to the integration branch with a **merger subagent**.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, review the integration branch against `REVIEW.md` (секции Spec / Standards / Quality / Risk) — самостоятельно или субагентом, без зависимости от скилла `code-review`; затем один раз прогнать полный `make check`. Fix all issues raised in a single fresh **implementer subagent**.

8. If a draft PR exists, ensure its body fully follows the template (соглашение #5), then mark it ready for review. Write the session manifest (соглашение #6). Otherwise, resolve each ticket the way the issue tracker closes work, and report the integration branch.

9. Clean up all **implementer subagent** worktrees.
