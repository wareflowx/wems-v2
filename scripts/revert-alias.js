const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !file.startsWith('.')) {
      walk(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Reverse: @/core/* → @@/*
      if (content.includes('@/core/')) {
        content = content
          .replace(/@\/core\/ipc\//g, '@@/ipc/')
          .replace(/@\/core\/constants\//g, '@@/constants/')
          .replace(/@\/core\/types\//g, '@@/types/')
          .replace(/@\/core\/lib\//g, '@@/lib/')
          .replace(/@\/core\/db\//g, '@@/db/')
          .replace(/@\/core\/mock-data\//g, '@@/mock-data/');

        changed = true;
        console.log('Reverted:', fullPath);
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}
walk('src');
