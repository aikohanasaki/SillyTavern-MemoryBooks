// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// auditorJobsRegistration.test.js — PHA-1651 follow-up regression: ensure the
// four Phase-5 audit job executors are actually registered at extension init.
// Brandon's "nothing working" comment showed the audit jobs failing with
// "No executor registered for stmbc-audit-*" — `registerAuditorJobs` was
// exported + tested in auditorTechnicalPass.js but never wired into index.js.
// Same architectural pattern as the Auto Module UI bug: code exists, tests
// pass, wiring missing. These static-source assertions lock the wiring down
// so a future refactor that drops it fails loudly.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, 'index.js');
const BUILD_PATH = resolve(__dirname, 'index.build.js');

const src = readFileSync(INDEX_PATH, 'utf8');

// ----- import surface -------------------------------------------------------

test('index.js imports registerAuditorJobs from ./auditorTechnicalPass.js', () => {
    assert.match(
        src,
        /import\s*\{[^}]*\bregisterAuditorJobs\b[^}]*\}\s*from\s*['"]\.\/auditorTechnicalPass\.js['"]/,
        'expected registerAuditorJobs to be imported',
    );
});

test('index.js imports the four audit-report popup functions from ./auditorReportUIs.js', () => {
    const names = [
        'showCoverageReportPopup',
        'showRegenerationDiffPopup',
        'showTechnicalPassPopup',
        'showClaimReverificationPopup',
    ];
    for (const name of names) {
        assert.match(
            src,
            new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*['"]\\.\\/auditorReportUIs\\.js['"]`),
            `expected ${name} to be imported from auditorReportUIs.js`,
        );
    }
});

// ----- registration call site ------------------------------------------------

test('index.js calls registerAuditorJobs with both registerStmbJobExecutor and awaitStmbJobApproval', () => {
    // The function needs both API methods. The call must include
    // `awaitStmbJobApproval` (otherwise the popup flow silently degrades).
    assert.match(
        src,
        /registerAuditorJobs\s*\(\s*\{[^}]*\bregisterStmbJobExecutor\b[^}]*\bawaitStmbJobApproval\b[^}]*\}\s*,/s,
        'expected registerAuditorJobs to be called with { registerStmbJobExecutor, awaitStmbJobApproval }',
    );
});

test('index.js passes the four popup functions as opts to registerAuditorJobs', () => {
    const names = [
        'showCoverageReportPopup',
        'showRegenerationDiffPopup',
        'showTechnicalPassPopup',
        'showClaimReverificationPopup',
    ];
    for (const name of names) {
        assert.match(
            src,
            new RegExp(`\\b${name}\\b`),
            `expected registerAuditorJobs call to reference ${name}`,
        );
    }
});

test('registerAuditorJobs call site sits next to the existing audit executor registration', () => {
    // Should be near `registerStmbJobExecutor("audit", executeAuditJob)` —
    // both wire up the audit family, keeping them adjacent is a clear signal
    // they're a unit.
    const auditCallIdx = src.search(/registerStmbJobExecutor\(\s*["']audit["']\s*,\s*executeAuditJob\s*\)/);
    const auditorJobsIdx = src.search(/registerAuditorJobs\s*\(/);
    assert.ok(auditCallIdx >= 0, 'existing audit registration must still exist');
    assert.ok(auditorJobsIdx >= 0, 'registerAuditorJobs call must exist');
    // AuditorJobs call should be within ~600 chars (one screen) of the
    // existing audit registration.
    assert.ok(
        Math.abs(auditorJobsIdx - auditCallIdx) < 600,
        `registerAuditorJobs (offset ${auditorJobsIdx}) must be near registerStmbJobExecutor("audit", ...) (offset ${auditCallIdx}); gap was ${Math.abs(auditorJobsIdx - auditCallIdx)} chars`,
    );
});

// ----- bundled output sanity check -----------------------------------------

test('index.build.js includes the auditor-jobs registration call site (template was bundled)', () => {
    const built = readFileSync(BUILD_PATH, 'utf8');
    // The minified bundle reuses the registerAuditorJobs identifier inside
    // its own scope (the import name is mangled, but the function-name string
    // is preserved as a property key in the import map). The presence of
    // any of the audit job-type strings is enough proof.
    for (const jobType of [
        'stmbc-audit-coverage',
        'stmbc-audit-regenerate',
        'stmbc-audit-technical',
        'stmbc-audit-claims',
    ]) {
        assert.match(
            built,
            new RegExp(jobType),
            `expected index.build.js to contain ${jobType} (proves auditorTechnicalPass.js was bundled and the four job types are wired)`,
        );
    }
});