<!--
Pull request template — SillyTavern-MemoryBooks-Auto

The checkboxes below are advisory; the actual gate is the GitHub Actions
authorship-check job (and the local .githooks/commit-msg hook). Confirming
these does not bypass CI; failing them does not fail the PR on its own,
but reviewers and branch protection require the authorship check to be
green before merge.
-->

## What this PR does

<!-- One or two sentences. Reference the issue(s) it closes, e.g. "Closes PHA-NNNN." -->

## Linked issues

<!-- Add PHA-NNNN or "none" as appropriate. -->

- Closes / relates to: PHA-____

## Authorship checklist (PHA-1750)

<!-- Reviewer confirmation: -->

- [ ] **HEAD commit author is `phattbeats <obiwouldjablowme@protonmail.com>`.**
  - Confirmed locally with `git log -1 --format='%an <%ae>'`.
  - Confirmed by the `authorship-check` GitHub Actions job (green check).
- [ ] **HEAD commit message contains no disallowed `Co-Authored-By:` trailers.**
  - No `Co-Authored-By: Paperclip <noreply@paperclip.ing>` line.
  - No `Co-Authored-By: Claude Van Dam` line (case-insensitive).
  - No `Co-Authored-By:` line listing `<noreply@phatt.tech>` or `<van-dam@phatt.tech>`.
- [ ] **Local commit-msg hook is installed for this clone.**
  - `git config --get core.hooksPath` returns `.githooks`.
  - If unsure, run `bun run install-hooks`.

If any box above is unchecked, see [CONTRIBUTING.md](../CONTRIBUTING.md) and
[docs/AUTHORSHIP.md](../docs/AUTHORSHIP.md) for the full rule and how to
amend the message (`git commit --amend`).

## Build + tests

- [ ] `bun run build` is clean locally.
- [ ] `node --test` is green locally.
- [ ] If you touched any `STMBC-HOOK` site, the marker count is unchanged
      (`grep -c STMBC-HOOK sidePrompts.js addlore.js stmemory.js auditor.js
      sentinel.js autosummary.js clipManager.js clipperPlus.js injection.js
      review.js index.js` should match the existing baseline).

## Notes for the reviewer

<!-- Anything non-obvious: trade-offs, follow-up issues, intentional
     exceptions to documented conventions. If you're amending a trailer
     rule, link to the governance amendment issue here. -->
