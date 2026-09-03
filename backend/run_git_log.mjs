import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

try {
  const log = execSync('git --no-pager log --oneline --graph --all', { encoding: 'utf-8' });
  writeFileSync(join(process.cwd(), 'git_log_output.txt'), log);
  console.log('Log de git guardado en backend/git_log_output.txt');
} catch (e) {
  writeFileSync(join(process.cwd(), 'git_log_error.txt'), e.message);
}
