#!/usr/bin/env node
// CI guard: fail if any identifier exported from js/*.js is redeclared in
// tests/*.js. Catches the silent-CI mode where tests re-declare their own
// SYMBOLS/PAYTABLE/etc. and drift from production. Static parse only — does
// not execute the modules.
//
// Detection of exports: looks for `module.exports = { ... }` blocks in
// js/*.js and pulls identifier names out of the object literal. Detection of
// redeclarations: looks for `const|let|var|function|class <name>` at the top
// level of tests/*.js. Imperfect — comments and strings could fool it — but
// catches the obvious drift mode that bit us.

'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const jsDir = path.join(repoRoot, 'js');
const testsDir = path.join(repoRoot, 'tests');

const exportRe = /module\.exports\s*=\s*\{([\s\S]*?)\}/g;

function collectExports() {
  const exports = new Map(); // name -> source file
  for (const f of fs.readdirSync(jsDir)) {
    if (!f.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
    let m;
    while ((m = exportRe.exec(src)) !== null) {
      const body = m[1];
      // Each comma-separated entry is either `name` (shorthand), `name: value`,
      // or `name,` — pull the leading identifier.
      for (const entry of body.split(',')) {
        const name = entry.trim().split(/[:\s]/)[0];
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
          if (!exports.has(name)) exports.set(name, f);
        }
      }
    }
  }
  return exports;
}

function findRedeclarations(testFile, exports) {
  const src = fs.readFileSync(testFile, 'utf8');
  // Strip line comments and block comments — naive but good enough for our test files.
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const declRe = /\b(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  const violations = [];
  let m;
  while ((m = declRe.exec(stripped)) !== null) {
    const name = m[1];
    if (exports.has(name)) {
      const before = stripped.slice(0, m.index);
      const line = before.split('\n').length;
      violations.push({ name, line, source: exports.get(name) });
    }
  }
  return violations;
}

function main() {
  const exports = collectExports();
  if (exports.size === 0) {
    console.error('check-no-redeclare: no js/* exports detected — refusing to silent-pass.');
    console.error('Did js/*.js lose its `module.exports = { ... }` block?');
    process.exit(2);
  }

  let total = 0;
  for (const f of fs.readdirSync(testsDir)) {
    if (!f.endsWith('.js')) continue;
    const violations = findRedeclarations(path.join(testsDir, f), exports);
    if (violations.length === 0) continue;
    total += violations.length;
    console.error(`tests/${f}:`);
    for (const v of violations) {
      console.error(`  line ${v.line}: redeclares "${v.name}" (exported from js/${v.source})`);
    }
  }

  if (total > 0) {
    console.error(
      `\n${total} redeclaration${total === 1 ? '' : 's'} found. Tests must import from js/*, not redeclare.`
    );
    process.exit(1);
  }
  console.log(`check-no-redeclare: OK (${exports.size} exported names, 0 redeclarations in tests/)`);
}

main();
