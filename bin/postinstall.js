#!/usr/bin/env bun
// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Post-install verifier (PHA-1750)
//
// Confirms the .githooks path is wired into core.hooksPath after
// `bun install` (or `npm install`). If not, prints the manual fix.
// Does not auto-install — installation is a one-shot operation,
// `postinstall` should not modify repo state silently on CI machines.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.join(__dirname, '..');
const GITHOOKS_DIR = path.join(REPO_ROOT, '.githooks');

console.log('\n' + '='.repeat(60));
console.log('📕 Memory Books - Post-install');
console.log('='.repeat(60) + '\n');

// Skip when there is no .git directory — e.g. npm package tarball install.
const gitDir = path.join(REPO_ROOT, '.git');
if (!fs.existsSync(gitDir)) {
  console.log('ℹ️  No .git directory found — skipping hook installation check.');
  console.log('   (Normal for npm/bun package tarball installations.)\n');
  process.exit(0);
}

// Check core.hooksPath config — this is the durable answer for
// sharing .githooks/ across every clone.
let hooksPath = '';
try {
  hooksPath = execSync('git config --get core.hooksPath', {
    cwd: REPO_ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).toString().trim();
} catch {
  hooksPath = '';
}

if (hooksPath === '.githooks') {
  console.log('✅ Git hooks are wired (core.hooksPath => .githooks).');
  console.log('   commit-msg rule will enforce the @phattbeats-only authorship policy.\n');
  process.exit(0);
}

// Hooks are not wired yet — surface the fix without silently installing.
console.log('⚠️  Git hooks are NOT wired for this clone.');
console.log('');
console.log('   core.hooksPath is unset or pointing elsewhere.');
console.log('');
console.log('   To enable the commit-msg authorship rule (PHA-1750):');
console.log('     \x1b[1;36mbun run install-hooks\x1b[0m');
console.log('');
console.log('   (postinstall does not auto-install — installation is a one-shot,');
console.log('    explicit operation so npm install on CI runners does not change');
console.log('    local repo state.)\n');

// Print a hint about the contents of .githooks as a sanity check.
if (fs.existsSync(GITHOOKS_DIR)) {
  const files = fs.readdirSync(GITHOOKS_DIR);
  console.log('   Hooks available in .githooks/:');
  for (const f of files) console.log('     - ' + f);
  console.log('');
}

console.log('='.repeat(60) + '\n');
