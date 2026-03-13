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

      // Replace @@/ with proper paths based on what follows
      // @@/ipc/* → @/core/ipc/*
      // @@/constants/* → @/core/constants/*
      // @@/types/* → @/core/types/*
      // @@/lib/* → @/core/lib/*
      // @@/db/* → @/core/db/*
      // @@/mock-data/* → @/core/mock-data/*

      if (content.includes('@@/')) {
        content = content
          .replace(/@@\/ipc\//g, '@/core/ipc/')
          .replace(/@@\/constants\//g, '@/core/constants/')
          .replace(/@@\/types\//g, '@/core/types/')
          .replace(/@@\/lib\//g, '@/core/lib/')
          .replace(/@@\/db\//g, '@/core/db/')
          .replace(/@@\/mock-data\//g, '@/core/mock-data/');

        changed = true;
        console.log('Fixed:', fullPath);
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}
walk('src');
