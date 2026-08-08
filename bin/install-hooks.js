#!/usr/bin/env bun
// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// .githooks installer (PHA-1750)
//
// Wires `core.hooksPath` to `.githooks/` so every clone of this repo gets
// the local commit-msg authorship rule plus the existing pre-commit build
// hook. Runs on `bun install` via the `postinstall` npm script, or directly:
//
//     bun run install-hooks
//
// Idempotent. Safe to run repeatedly. Does NOT copy hooks into
// .git/hooks — that path conflicts when more than one contribution flow
// uses git-dir hooks; `core.hooksPath` is the durable, portable answer.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.join(__dirname, '..');
const GITHOOKS_DIR = path.join(REPO_ROOT, '.githooks');

function log(line) {
  console.log(line);
}

function die(msg, code = 1) {
  console.error(`install-hooks: ${msg}`);
  process.exit(code);
}

// Pre-flight: must be inside a git working tree.
try {
  execSync('git rev-parse --show-toplevel', { cwd: REPO_ROOT, stdio: 'pipe' });
} catch (err) {
  die('not inside a git working tree (no .git directory reachable from ' + REPO_ROOT + ')');
}

// Pre-flight: source hooks must exist and be executable.
if (!fs.existsSync(GITHOOKS_DIR) || !fs.statSync(GITHOOKS_DIR).isDirectory()) {
  die('expected source directory not found: ' + GITHOOKS_DIR);
}

const REQUIRED_HOOKS = ['commit-msg', 'pre-commit'];
for (const name of REQUIRED_HOOKS) {
  const p = path.join(GITHOOKS_DIR, name);
  if (!fs.existsSync(p)) {
    die('missing required hook source file: ' + p);
  }
  // Make executable on POSIX; no-op on Windows where bit is ignored.
  if (process.platform !== 'win32') {
    try { fs.chmodSync(p, 0o755); } catch { /* best-effort */ }
  }
}

// Set core.hooksPath — scoped to this repo, not global.
try {
  execSync('git config core.hooksPath .githooks', { cwd: REPO_ROOT, stdio: 'pipe' });
} catch (err) {
  die('failed to set core.hooksPath: ' + err.message);
}

const verified = execSync('git config --get core.hooksPath', {
  cwd: REPO_ROOT,
  stdio: ['pipe', 'pipe', 'pipe'],
}).toString().trim();

if (verified !== '.githooks') {
  die(`core.hooksPath verification failed — got "${verified}", expected ".githooks"`);
}

log('');
log('='.repeat(60));
log('✅ .githooks installed');
log('='.repeat(60));
log(`   core.hooksPath => ${verified}`);
log('   hooks in tree  => ' + REQUIRED_HOOKS.join(', '));
log('');
log('From now on, every commit in this repo will be checked by:');
log('  - .githooks/pre-commit  (runs the build, adds artifacts)');
log('  - .githooks/commit-msg  (rejects disallowed co-author trailers)');
log('');
log('To re-install after pulling new hooks: bun run install-hooks');
log('='.repeat(60));
log('');
