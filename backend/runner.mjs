import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';

const res = spawnSync('node', ['scripts/backup_sqlite.mjs'], { encoding: 'utf-8' });
writeFileSync('backup_out.txt', `STDOUT:\n${res.stdout}\nSTDERR:\n${res.stderr}\nSTATUS:\n${res.status}`);
