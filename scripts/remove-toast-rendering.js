#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  'app/dashboard/page.tsx',
  'app/contract-creator/page.tsx',
  'app/auth/login/page.tsx',
  'components/folders/contract-grid.tsx',
  'components/folders/template-grid.tsx',
  'components/contracts/contract-creator-dialog.tsx'
];

// Process each file
filesToProcess.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Remove Toast import
  if (content.includes('useToast, Toast')) {
    content = content.replace(/, useToast, Toast/g, '');
    content = content.replace(/useToast, Toast, /g, '');
    content = content.replace(/useToast, Toast/g, '');
    modified = true;
  }
  
  // Remove useToast hook usage
  if (content.includes('const { toast, toasts, removeToast } = useToast()')) {
    content = content.replace(
      /const \{ toast, toasts, removeToast \} = useToast\(\)/g,
      '// Using notification system instead of toasts'
    );
    modified = true;
  }
  
  // Remove Toast rendering block - handle different variations
  const toastRenderPattern = /\{\/\* Render toasts \*\/\}[\s\S]*?\{toasts\.map[\s\S]*?\)\}\s*\)\)/g;
  if (toastRenderPattern.test(content)) {
    content = content.replace(toastRenderPattern, '{/* Toasts are now handled by the notification system */}');
    modified = true;
  }
  
  // Also handle cases without the comment
  const toastRenderPattern2 = /\{toasts\.map\s*\(\s*toast\s*=>\s*\([\s\S]*?<Toast[\s\S]*?\/>\s*\)\s*\)\}/g;
  if (toastRenderPattern2.test(content)) {
    content = content.replace(toastRenderPattern2, '{/* Toasts are now handled by the notification system */}');
    modified = true;
  }
  
  // Handle debug code in dashboard
  if (filePath.includes('dashboard/page.tsx')) {
    const debugPattern = /\/\/ Debug duplicate keys[\s\S]*?\}, \[toasts\]\)/;
    if (debugPattern.test(content)) {
      content = content.replace(debugPattern, '// Debug code removed - using notification system now');
      modified = true;
    }
  }
  
  // Clean up any standalone Toast imports
  content = content.replace(/import.*\{ Toast \}.*from.*['"]@\/components\/ui['"];?\n/g, '');
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️ No changes needed: ${filePath}`);
  }
});

console.log('\n✨ Toast rendering cleanup complete!');