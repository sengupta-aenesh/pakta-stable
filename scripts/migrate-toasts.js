#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Migration statistics
let stats = {
  filesProcessed: 0,
  filesToProcess: 0,
  toastsReplaced: 0,
  errors: 0,
  skipped: 0
};

// Files to exclude from migration
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/build/**',
  '**/dist/**',
  '**/.next/**',
  '**/scripts/**',
  '**/notification.hooks.ts', // Already migrated
  '**/notification.utils.ts', // Helper file
  '**/toaster.tsx' // Old toast component
];

// Migration rules for different toast patterns
const MIGRATION_RULES = [
  // Analysis notifications - with specific IDs available
  {
    name: 'Analysis started with ID',
    pattern: /toast\(['"`]Starting (template|contract) analysis\.\.\.['"`],\s*['"`]info['"`]\)/g,
    requiresContext: true,
    replacement: (match, type, context) => {
      const idVar = `${type}Id`;
      if (context.includes(idVar)) {
        return `notify(notificationHelpers.analysisStarted('${type}', ${idVar}))`;
      }
      return `notifications.info('Analysis Started', 'Starting ${type} analysis...')`;
    }
  },
  
  // Analysis completed - with risk count
  {
    name: 'Analysis completed with risks',
    pattern: /toast\(['"`](Template|Contract) analysis completed successfully!?['"`],\s*['"`]success['"`]\)/g,
    requiresContext: true,
    replacement: (match, type, context) => {
      const lowerType = type.toLowerCase();
      const idVar = `${lowerType}Id`;
      // Check if we have access to risks array
      if (context.includes('risks') && context.includes(idVar)) {
        return `notify(notificationHelpers.analysisCompleted('${lowerType}', ${idVar}, risks.length))`;
      } else if (context.includes(idVar)) {
        return `notify(notificationHelpers.analysisCompleted('${lowerType}', ${idVar}))`;
      }
      return `notifications.success('Analysis Complete', '${type} analysis completed successfully!')`;
    }
  },

  // File operations - moved
  {
    name: 'File moved',
    pattern: /toast\(['"`](Contract|Template|File) moved successfully['"`],\s*['"`]success['"`]\)/g,
    requiresContext: true,
    replacement: (match, type, context) => {
      const lowerType = type.toLowerCase();
      // Look for common variable patterns
      if (context.includes(`${lowerType}.title`) || context.includes(`${lowerType}Title`)) {
        const titleVar = context.includes(`${lowerType}.title`) ? `${lowerType}.title` : `${lowerType}Title`;
        return `notify(notificationHelpers.fileMoved(${titleVar}, targetFolder?.name || 'folder'))`;
      }
      return `notifications.success('File Moved', '${type} moved successfully')`;
    }
  },

  // File operations - deleted
  {
    name: 'File deleted',
    pattern: /toast\(['"`](Contract|Template|File) deleted successfully['"`],\s*['"`]success['"`]\)/g,
    requiresContext: true,
    replacement: (match, type, context) => {
      const lowerType = type.toLowerCase();
      if (context.includes(`${lowerType}.title`) || context.includes(`${lowerType}Title`)) {
        const titleVar = context.includes(`${lowerType}.title`) ? `${lowerType}.title` : `${lowerType}Title`;
        return `notify(notificationHelpers.fileDeleted(${titleVar}))`;
      }
      return `notifications.success('File Deleted', '${type} deleted successfully')`;
    }
  },

  // Risk resolved
  {
    name: 'Risk resolved',
    pattern: /toast\(['"`]Risk (?:marked as )?resolved(?:\s+successfully)?['"`],\s*['"`]success['"`]\)/g,
    replacement: () => `notifications.success('Risk Resolved', 'Risk has been marked as resolved')`
  },

  // Version created
  {
    name: 'Version created',
    pattern: /toast\(['"`](?:Template )?[Vv]ersion created successfully['"`],\s*['"`]success['"`]\)/g,
    requiresContext: true,
    replacement: (match, context) => {
      if (context.includes('versionName') || context.includes('version.name')) {
        const versionVar = context.includes('versionName') ? 'versionName' : 'version.name';
        return `notify(notificationHelpers.versionCreated(${versionVar}))`;
      }
      return `notifications.success('Version Created', 'Template version created successfully')`;
    }
  },

  // Generic errors with dynamic messages
  {
    name: 'Dynamic error messages',
    pattern: /toast\((['"`]Failed to .+?['"`]|`Failed to .+?`),\s*['"`]error['"`]\)/g,
    replacement: (match, message) => {
      // Clean up the message quotes
      const cleanMessage = message.replace(/^['"`]|['"`]$/g, '');
      return `notifications.error('Operation Failed', ${message})`;
    }
  },

  // Generic success with dynamic messages
  {
    name: 'Dynamic success messages',
    pattern: /toast\((['"`].+?['"`]|`.+?`),\s*['"`]success['"`]\)/g,
    replacement: (match, message) => {
      return `notifications.success('Success', ${message})`;
    }
  },

  // Generic info messages
  {
    name: 'Info messages',
    pattern: /toast\((['"`].+?['"`]|`.+?`),\s*['"`]info['"`]\)/g,
    replacement: (match, message) => {
      return `notifications.info('Info', ${message})`;
    }
  },

  // Simple toast calls without type
  {
    name: 'Simple toast calls',
    pattern: /toast\((['"`].+?['"`]|`.+?`)\)/g,
    replacement: (match, message) => {
      return `notifications.info('Info', ${message})`;
    }
  }
];

// Function to add necessary imports
function addImports(content, filePath) {
  // Check if already has notification imports
  if (content.includes('useEnhancedNotifications') || content.includes('notificationHelpers')) {
    return content;
  }

  // Check if file uses toast
  if (!content.includes('toast(') && !content.includes('useToast')) {
    return content;
  }

  // Find the best place to add imports
  const importLines = [];
  
  // Check if we need notificationHelpers
  if (content.includes('notificationHelpers.')) {
    importLines.push("import { notificationHelpers } from '@/components/notifications/notification.utils'");
  }
  
  // Check if we need useNotifications
  if (content.includes('notifications.') || content.includes('notify(')) {
    importLines.push("import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'");
  }

  if (importLines.length === 0) {
    return content;
  }

  // Try to add after other @/components imports
  const componentImportRegex = /import.*from\s+['"]@\/components[^'"]*['"];?\n/g;
  const lastComponentImport = [...content.matchAll(componentImportRegex)].pop();
  
  if (lastComponentImport) {
    const insertPosition = lastComponentImport.index + lastComponentImport[0].length;
    return content.slice(0, insertPosition) + importLines.join('\n') + '\n' + content.slice(insertPosition);
  }

  // Otherwise, add after the last import
  const importRegex = /import.*from.*['"];?\n/g;
  const lastImport = [...content.matchAll(importRegex)].pop();
  
  if (lastImport) {
    const insertPosition = lastImport.index + lastImport[0].length;
    return content.slice(0, insertPosition) + importLines.join('\n') + '\n' + content.slice(insertPosition);
  }

  // As a last resort, add at the beginning
  return importLines.join('\n') + '\n\n' + content;
}

// Function to update hook usage
function updateHookUsage(content) {
  // Replace useToast hook with useEnhancedNotifications
  if (content.includes('useToast()')) {
    content = content.replace(
      /const\s*{\s*toast\s*}\s*=\s*useToast\(\)/g,
      'const notifications = useEnhancedNotifications()\n  const { notify } = notifications'
    );
  }

  return content;
}

// Get context around a match (for context-aware replacements)
function getContext(content, matchIndex, contextSize = 500) {
  const start = Math.max(0, matchIndex - contextSize);
  const end = Math.min(content.length, matchIndex + contextSize);
  return content.slice(start, end);
}

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;
    let toastCount = 0;

    // Skip if file doesn't contain toast
    if (!content.includes('toast')) {
      stats.skipped++;
      return;
    }

    console.log(`\n${colors.blue}Processing: ${colors.reset}${filePath}`);

    // Apply migration rules
    MIGRATION_RULES.forEach(rule => {
      const matches = [...content.matchAll(rule.pattern)];
      
      matches.forEach(match => {
        toastCount++;
        const context = rule.requiresContext ? getContext(content, match.index) : '';
        const replacement = typeof rule.replacement === 'function' 
          ? rule.replacement(match[0], match[1], context)
          : rule.replacement;
        
        console.log(`  ${colors.yellow}→${colors.reset} ${rule.name}: ${match[0].substring(0, 50)}...`);
        console.log(`    ${colors.green}✓${colors.reset} ${replacement.substring(0, 80)}...`);
      });

      if (matches.length > 0) {
        content = content.replace(rule.pattern, (...args) => {
          const match = args[0];
          const context = rule.requiresContext ? getContext(originalContent, args[args.length - 2]) : '';
          return typeof rule.replacement === 'function' 
            ? rule.replacement(match, args[1], context)
            : rule.replacement;
        });
        modified = true;
      }
    });

    // Update hook usage
    const updatedContent = updateHookUsage(content);
    if (updatedContent !== content) {
      content = updatedContent;
      modified = true;
      console.log(`  ${colors.green}✓${colors.reset} Updated hook usage`);
    }

    // Add imports if needed
    if (modified) {
      content = addImports(content, filePath);
      
      // Write the file
      fs.writeFileSync(filePath, content);
      stats.toastsReplaced += toastCount;
      console.log(`${colors.green}✅ Migrated ${toastCount} toast(s)${colors.reset}`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error processing ${filePath}: ${error.message}${colors.reset}`);
    stats.errors++;
  }

  stats.filesProcessed++;
}

// Main function
function main() {
  console.log(`${colors.bright}${colors.blue}🔄 Toast to Notification Migration Script${colors.reset}\n`);

  // Find all TypeScript/React files
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: EXCLUDE_PATTERNS
  });

  stats.filesToProcess = files.length;
  console.log(`Found ${colors.yellow}${files.length}${colors.reset} files to process\n`);

  // Process each file
  files.forEach(processFile);

  // Print summary
  console.log(`\n${colors.bright}📊 Migration Summary:${colors.reset}`);
  console.log(`${colors.green}✓ Files processed: ${stats.filesProcessed}${colors.reset}`);
  console.log(`${colors.green}✓ Toasts replaced: ${stats.toastsReplaced}${colors.reset}`);
  console.log(`${colors.yellow}→ Files skipped: ${stats.skipped}${colors.reset}`);
  console.log(`${colors.red}✗ Errors: ${stats.errors}${colors.reset}`);

  if (stats.errors > 0) {
    console.log(`\n${colors.red}⚠️  Some files had errors. Please review and fix manually.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✨ Migration completed successfully!${colors.reset}`);
  }

  // Provide next steps
  console.log(`\n${colors.bright}📝 Next Steps:${colors.reset}`);
  console.log('1. Review the changes using: git diff');
  console.log('2. Test the application thoroughly');
  console.log('3. Commit the changes: git add . && git commit -m "Migrate toasts to notification system"');
  console.log('4. Remove the old Toast component from components/ui/toaster.tsx when ready');
}

// Run the migration
main();