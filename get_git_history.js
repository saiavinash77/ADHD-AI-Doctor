import { execSync } from 'child_process';
import fs from 'fs';

try {
  const status = execSync('git status').toString();
  const log = execSync('git log -n 10 --oneline').toString();
  const reflog = execSync('git reflog').toString();
  const stashes = execSync('git stash list').toString();
  
  fs.writeFileSync('./git_debug.json', JSON.stringify({
    status,
    log,
    reflog,
    stashes
  }, null, 2));
  console.log('Git history inspected successfully.');
} catch (e) {
  fs.writeFileSync('./git_debug.json', JSON.stringify({ error: e.message, stack: e.stack }, null, 2));
  console.error("Git check error:", e);
}
