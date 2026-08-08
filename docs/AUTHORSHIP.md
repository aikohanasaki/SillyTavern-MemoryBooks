# Authorship rule — `@phattbeats`-only

> The repo rule for SillyTavern-MemoryBooks-Auto is **@phattbeats only —
> no agent, no Paperclip** as commit author or `Co-Authored-By:` trailer.

This file is the policy detail backing [CONTRIBUTING.md](../CONTRIBUTING.md)
and the local + CI hooks. Read CONTRIBUTING.md first; read this file when
you need to know **why** a specific trailer is rejected.

## 1. Identities (ground truth)

| Identity           | Symbol                                       |
| ------------------ | -------------------------------------------- |
| `phattbeats`       | `phattbeats <obiwouldjablowme@protonmail.com>` (Brandon's ProtonMail) |
| `Claude Van Dam`   | `Claude Van Dam <van-dam@phatt.tech>` and `<noreply@phatt.tech>` — placeholder agent identity |
| `Paperclip`        | `Paperclip <noreply@paperclip.ing>` — automation/co-author service |

`95bf161` and `68c9d53` on `main` verify the `phattbeats` /
`obiwouldjablowme@protonmail.com` pair on PR-merged commits. The five
Claude Van Dam commits and one Paperclip `Co-Authored-By:` trailer on
`main` predate this rule and are out of scope here (governance decision
in [PHA-1749](https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto/issues)):
no rewrite, no bulk cleanup.

## 2. Allowed commit author

A commit lands on `main` only if the author is exactly:

```
phattbeats <obiwouldjablowme@protonmail.com>
```

— both fields case-sensitive, both fields exact, both fields required.

## 3. Allowed `Co-Authored-By:` trailers

The trailers on the allowed side mirror the author:

| Allowed trailer                                  |
| ------------------------------------------------ |
| `Co-Authored-By: phattbeats <obiwouldjablowme@protonmail.com>` |

Anything else is rejected. The four disallowed patterns below cover the
known offenders; a fifth catch-all check ensures any future agent/email
identity on the disallowed domains still fails the test once a governance
amendment adds it.

## 4. Disallowed patterns (exactly what the hooks enforce)

| # | Pattern                                                       | Match style                       |
| - | ------------------------------------------------------------- | --------------------------------- |
| 1 | `Co-Authored-By: Paperclip <noreply@paperclip.ing>`           | exact substring, case-insensitive |
| 2 | `Co-Authored-By: Claude Van Dam`                              | substring, case-insensitive       |
| 3 | `Co-Authored-By: ... <noreply@phatt.tech>` (full line)        | anchored whole-line email match   |
| 4 | `Co-Authored-By: ... <van-dam@phatt.tech>` (full line)        | anchored whole-line email match   |

Patterns (3) and (4) anchor on the `Co-Authored-By:` header followed by
`<…@…>` so prose that mentions "van-dam@phatt.tech" inside a sentence
is not falsely flagged. Patterns (1) and (2) are content-based so they
catch malformed or partial lines.

## 5. On-hook rejection message

When the local `.githooks/commit-msg` rejects a commit, the message
points back here and to CONTRIBUTING.md so you can self-service the fix:

```
=================================================================
  COMMIT REJECTED -- @phattbeats-only authorship rule (PHA-1750)
=================================================================
...
Disallowed trailer(s) detected in this commit message:
  - 'Co-Authored-By: Claude Van Dam' is not allowed. The repo accepts commits only from @phattbeats.
  - A 'Co-Authored-By:' line lists '<van-dam@phatt.tech>', which is the agent's placeholder address. Remove it or replace with @phattbeats.
...
```

## 6. CI mirror

`.github/workflows/authorship-check.yml` runs the same checks on every
PR that targets `main` (and on direct pushes to `main`). Branch
protection requires the job to be green before merge is enabled, so
even a `git commit --no-verify` workaround is caught at PR time.

## 7. Why this is a hard rule

- Five Claude Van Dam commits and one Paperclip `Co-Authored-By:`
  trailer on `main` already showed that "tribal knowledge" does not
  survive cloning, forking, or new contributor setup.
- The agent's email addresses are placeholder (`@phatt.tech`,
  `@paperclip.ing`) — anyone reading the history should see at a glance
  that they are placeholders, not the human's address.
- Enforcing in-repo (`.githooks/` + CI) keeps the rule durable across
  fork, clone, and contributor onboarding. A global `git config` is
  per-machine and not portable.

## 8. How to add a new allowed identity

Open a governance amendment issue. In the amendment, do all of:

1. State the new identity's `Name <email>` pair exactly (case-sensitive,
   whitespace-sensitive).
2. Update the `.githooks/commit-msg` and
   `.github/workflows/authorship-check.yml` to recognise the new pair.
3. Update sections 3 and 4 of this document.
4. Open a PR for review; merge requires both authorship-check and
   reviewer approval.

Do **not** bypass the rule locally with `--no-verify` to land the
amendment — the change has to flow through the same gate it extends.

Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
