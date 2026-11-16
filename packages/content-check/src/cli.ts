#!/usr/bin/env node
import path from 'node:path';
import { checkContent } from './index.ts';

const root = path.resolve(process.argv[2] ?? 'apps/web/content');
const findings = checkContent(root);
for (const f of findings) {
  const where = f.line ? `${f.lesson}:${f.line}` : f.lesson;
  console.log(`${f.severity === 'error' ? 'error' : 'warn '} ${where} [${f.rule}] ${f.message}`);
}
const errors = findings.filter((f) => f.severity === 'error').length;
console.log(`\n${errors} errors, ${findings.length - errors} warnings in ${root}`);
process.exitCode = errors ? 1 : 0;
