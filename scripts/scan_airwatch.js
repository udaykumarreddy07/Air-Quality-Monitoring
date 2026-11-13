const fs = require('fs');
const path = require('path');

const exts = ['.html', '.js', '.json', '.md', '.css'];
const ignoreDirs = ['node_modules', '.git', 'temp_ppt_sample', 'airwatch_ppt_workspace'];

const results = {};
const exactForms = {};

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        scan(fullPath);
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const regex = /air[\s_-]?watch/gi;
          let m;
          while ((m = regex.exec(content)) !== null) {
            const form = m[0];
            exactForms[form] = (exactForms[form] || 0) + 1;
            results[fullPath] = (results[fullPath] || 0) + 1;
          }
        } catch (e) {}
      }
    }
  }
}

scan('.');
console.log('--- EXACT FORMS FOUND ---');
console.log(exactForms);
console.log('\n--- MATCHES BY FILE ---');
for (const [file, count] of Object.entries(results)) {
  console.log(file + ': ' + count + ' matches');
}

