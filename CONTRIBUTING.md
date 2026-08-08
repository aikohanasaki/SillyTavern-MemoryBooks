# Contributing to SillyTavern-MemoryBooks-Auto

Thank you for working on this fork. Before opening a pull request, please read
the rules below — especially the **Authorship** section, which is enforced in
two places (local hook + GitHub Actions) and is not negotiable on a PR.

This file is the top-level onboarding doc. The full authorship rule, with
rejection reasons, lives in [`docs/AUTHORSHIP.md`](docs/AUTHORSHIP.md).

---

## Authorship

This fork of `aikohanasaki/SillyTavern-MemoryBooks` is maintained by a single
human. The repo rule is **@phattbeats only — no agent, no Paperclip** as
commit author or `Co-Authored-By:` trailer.

### Author identity (ground truth)

| Display name    | Email                                | Where it comes from                                            |
| --------------- | ------------------------------------ | -------------------------------------------------------------- |
| `phattbeats`    | `obiwouldjablowme@protonmail.com`    | Brandon's ProtonMail — verified on PR-merged commits `95bf161`, `68c9d53`. |
| Claude Van Dam  | `van-dam@phatt.tech`, `<noreply@phatt.tech>` | This agent's placeholder addresses — NOT @phattbeats.                |

### How commits get accepted

A commit lands on `main` only if **all** of the following are true:

1. **HEAD author** is `phattbeats <obiwouldjablowme@protonmail.com>` (case
   sensitive). The local hook checks the trailer set; the GitHub Actions
   `.github/workflows/authorship-check.yml` re-checks HEAD author on every PR.
2. **HEAD commit message** contains no disallowed `Co-Authored-By:` line.
   The disallowed trailers are:
   - `Co-Authored-By: Paperclip <noreply@paperclip.ing>` (exact)
   - `Co-Authored-By: Claude Van Dam` (substring, case-insensitive)
   - `Co-Authored-By: noreply@phatt.tech` (co-author email on wrong domain)
   - `Co-Authored-By: van-dam@phatt.tech` (co-author email on wrong domain)

The same rules are enforced locally by `.githooks/commit-msg` (POSIX shell)
and centrally by `.github/workflows/authorship-check.yml`.

### Installing the local hook

The hook path is wired to `.githooks/` via `core.hooksPath`. Bun (or npm)
runs `postinstall` after every dependency install, and we provide a one-shot
command:

```sh
bun install
bun run install-hooks   # sets `git config core.hooksPath .githooks`
```

That's it. Every subsequent `git commit` runs through `.githooks/commit-msg`
and is rejected if it carries a disallowed trailer.

### If the hook fires

The error from `.githooks/commit-msg` lists the offending trailer(s) and
points back to this file and to `docs/AUTHORSHIP.md`. The fix is to remove
the disallowed line from the commit message and `git commit --amend`.

If you believe the rule should allow a legitimate co-author credit that is
not @phattbeats, open a **governance** issue to amend the policy. Bypassing
the hook (`git commit --no-verify`) is a violation of this contributing
guide and CI will catch it anyway at PR-time.

### Why and not just `git config user.name`?

`git config user.name` only affects your local checkout. A new clone, a
fork, or a fresh contributor machine starts from a clean config. Enforcing
the rule inside the repo (via `.githooks/commit-msg` + `core.hooksPath`)
means every clone — yours, the CI runner, a downstream fork — runs the
same gate. CI re-checks the rule independently of any local state.

### Why and not just a `CODEOWNERS` style gate?

CODEOWNERS routes PR review, it doesn't gate merge on identity. The rule
is about content of the commit (who is recorded as author + trailers),
not about who clicked the merge button. Branch protection on `main` is
what enforces merge-time, and it requires `.github/workflows/authorship-check.yml`
to be green before the merge button is enabled.

### Out of scope

- Rewriting the existing 5 bot-authored commits on `main` (governance
  decision: declined on PHA-1749; tracked separately and not in scope of
  this rule).
- Cleaning up the same trailers in other forks or downstream branches.
- A pre-rebase check (this rule is enforced at commit time, not at rebase
  time — that is a deliberate choice).

---

## Opening a pull request

1. Branch off `main` (or off the active `sync/upstream-vX.Y.Z` branch if
   you're working on an upstream-port task).
2. Use a conventional subject (`PHA-NNNN: …` if the work is tracked in
   the PHATT TECH issue tracker, or `feat/fix/refactor(scope): …`).
3. Run `bun run install-hooks` once per fresh clone.
4. Run `bun run build` and `node --test` before pushing.
5. Push and open the PR; the **PR template** includes an **Authorship**
   checkbox so the reviewer can confirm the rule.
6. Wait for the `authorship-check` CI job to pass and for the reviewer
   (Brandon) to approve. Branch protection requires both.

If you are an external contributor, please open an issue first so we can
agree on scope before code lands.

---

## Communication

- **Issue tracker** — every change should reference an existing issue
  (or open one first). Use `PHA-NNNN` references in commit subjects.
- **PR description** — should call out the issue(s) it closes and any
  non-obvious trade-offs.
- **Trailers** — leave them off unless you've confirmed a legitimate
  co-author credit (see above).

---

## License

This fork is licensed under AGPL-3.0-only. By contributing, you agree
that your contributions are licensed under the same terms.

Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
