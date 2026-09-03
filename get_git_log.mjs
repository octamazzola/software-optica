import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

try {
  const log = execSync('git --no-pager log --oneline --graph --all', { encoding: 'utf-8' });
  writeFileSync(join(process.cwd(), 'git_log.txt'), log);
  console.log('Log guardado');
} catch (e) {
  console.error(e.message);
}
