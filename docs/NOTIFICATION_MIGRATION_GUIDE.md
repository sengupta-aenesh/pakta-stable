# Notification System Migration Guide - Phase 2

## Overview
This guide provides detailed instructions for migrating from the old toast system to the new notification system in Contract Manager V2.

## Migration Status
- ✅ Phase 1: Core notification system implemented
- 🚧 Phase 2: Migrate existing toasts (67 occurrences across 10 files)
- ⏳ Phase 3: Advanced features (future)

## Quick Start

### Option 1: Automated Migration (Recommended)
```bash
# Make the script executable
chmod +x scripts/migrate-toasts.js

# Run the migration script
node scripts/migrate-toasts.js

# Review changes
git diff

# Run the application and test
npm run dev
```

### Option 2: Manual Migration
Follow the patterns below for manual migration of specific components.

## Migration Patterns

### 1. Basic Toast Replacement

#### Simple Success/Error/Info
```typescript
// OLD:
const { toast } = useToast()
toast('Operation successful', 'success')
toast('Operation failed', 'error')
toast('Processing...', 'info')

// NEW:
const notifications = useEnhancedNotifications()
notifications.success('Success', 'Operation successful')
notifications.error('Error', 'Operation failed')
notifications.info('Info', 'Processing...')
```

#### Dynamic Messages
```typescript
// OLD:
toast(`Moved to ${folderName}`, 'success')
toast(`Failed to load ${fileName}`, 'error')

// NEW:
notifications.success('File Moved', `Moved to ${folderName}`)
notifications.error('Load Failed', `Failed to load ${fileName}`)
```

### 2. Analysis Notifications

```typescript
// OLD:
toast('Starting template analysis...', 'info')
toast('Template analysis completed successfully!', 'success')
toast('Analysis failed', 'error')

// NEW (with context):
const { notify } = useEnhancedNotifications()

// Starting analysis
notify(notificationHelpers.analysisStarted('template', templateId))

// Completed with risk count
notify(notificationHelpers.analysisCompleted('template', templateId, risks.length))

// Failed
notify(notificationHelpers.analysisFailed('template', error))

// NEW (simple):
notifications.info('Analysis Started', 'Starting template analysis...')
notifications.success('Analysis Complete', 'Template analysis completed successfully!')
notifications.error('Analysis Failed', 'Analysis failed')
```

### 3. File Operations

```typescript
// OLD:
toast('Contract moved successfully', 'success')
toast('Template deleted successfully', 'success')
toast('File uploaded successfully', 'success')

// NEW (with context):
notify(notificationHelpers.fileMoved(contract.title, targetFolder.name))
notify(notificationHelpers.fileDeleted(template.title))
notify(notificationHelpers.fileUploaded(file.name))

// NEW (simple):
notifications.success('File Moved', 'Contract moved successfully')
notifications.success('File Deleted', 'Template deleted successfully')
notifications.success('File Uploaded', 'File uploaded successfully')
```

### 4. Component-Specific Examples

#### template-analysis.tsx
```typescript
// Add imports
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import { notificationHelpers } from '@/components/notifications/notification.utils'

// Replace hook
const notifications = useEnhancedNotifications()
const { notify } = notifications

// Replace onToast prop usage
// OLD: onToast('Analysis started', 'info')
// NEW: notifications.info('Analysis Started', 'Starting template analysis...')

// Use rich notifications for analysis
notify(notificationHelpers.analysisCompleted(
  'template',
  templateId,
  risks.length,
  duplicatesFiltered // optional
))
```

#### contract-grid.tsx / template-grid.tsx
```typescript
// File operations
// OLD: toast('Contract moved successfully', 'success')
// NEW: notify(notificationHelpers.fileMoved(contract.title, folder.name))

// Deletion
// OLD: toast('Contract deleted successfully', 'success')
// NEW: notify(notificationHelpers.fileDeleted(contract.title))
```

## Testing Checklist

### Core Functionality
- [ ] Notifications appear in bottom-right corner
- [ ] Notification bell shows unread count
- [ ] Clicking bell opens notification center
- [ ] Notifications persist after page refresh
- [ ] Mark as read/unread works
- [ ] Clear all notifications works

### Specific Scenarios
- [ ] **File Upload**: Upload a contract/template → see notification
- [ ] **Analysis**: Start analysis → see progress notification
- [ ] **Analysis Complete**: Finish analysis → see completion with action button
- [ ] **File Move**: Move file to folder → see success notification
- [ ] **File Delete**: Delete file → see success notification
- [ ] **Errors**: Trigger an error → see error notification
- [ ] **Risk Resolution**: Resolve a risk → see success notification

### Notification Features
- [ ] Action buttons work (e.g., "View Analysis")
- [ ] Categories filter correctly
- [ ] Settings persist (sound, desktop notifications)
- [ ] Date grouping displays correctly
- [ ] Empty states show when no notifications

## Manual Migration Steps

### For Each Component:

1. **Add Imports**
```typescript
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import { notificationHelpers } from '@/components/notifications/notification.utils'
```

2. **Replace Hook**
```typescript
// OLD:
const { toast } = useToast()

// NEW:
const notifications = useEnhancedNotifications()
const { notify } = notifications
```

3. **Update Toast Calls**
Use the patterns above to replace each toast call.

4. **Test Thoroughly**
Test each modified component using the checklist.

## Priority Order for Manual Migration

### High Priority (Core Features)
1. **template-analysis.tsx** (20 occurrences)
   - Critical for template analysis flow
   - Uses onToast prop pattern
   
2. **contract-analysis.tsx** (similar to template)
   - Critical for contract analysis flow
   
3. **contract-grid.tsx** (8 occurrences)
   - File operations (move, delete)
   
4. **template-grid.tsx** (8 occurrences)
   - File operations (move, delete)

### Medium Priority (Dashboards)
5. **template-dashboard/page.tsx** (6 occurrences)
   - Dashboard interactions
   
6. **dashboard/page.tsx** (7 occurrences)
   - Dashboard interactions
   
7. **contract-creator/page.tsx** (7 occurrences)
   - Contract creation flow

### Low Priority
8. **template-version-list.tsx** (7 occurrences)
   - Version management
   
9. **folders/page.tsx** (1 occurrence)
   - Folder operations
   
10. **auth/login/page.tsx** (1 occurrence)
    - Login feedback

## Common Pitfalls & Solutions

### Issue: Missing Variables for Context
```typescript
// Problem: notificationHelpers.fileMoved() needs title and folder name
// but variables aren't available

// Solution 1: Use simple notification
notifications.success('File Moved', 'Contract moved successfully')

// Solution 2: Add context
notifications.success('File Moved', `Moved ${contract?.title || 'file'} to ${folder?.name || 'folder'}`)
```

### Issue: Async Operations
```typescript
// Make sure to handle async operations properly
try {
  await moveContract(contractId, folderId)
  notify(notificationHelpers.fileMoved(contract.title, folder.name))
} catch (error) {
  notifications.error('Move Failed', error.message)
}
```

### Issue: Component Props
Some components receive `onToast` as a prop. Update both the component and its parent:
```typescript
// In parent component
// OLD: <TemplateAnalysis onToast={(msg, type) => toast(msg, type)} />
// NEW: <TemplateAnalysis />

// In child component
// Add notification hook directly
const notifications = useEnhancedNotifications()
```

## Verification Steps

After migration:
1. Run `npm run dev` and test all modified features
2. Check browser console for errors
3. Verify notifications appear and function correctly
4. Test notification persistence (refresh page)
5. Ensure no toast imports remain

## Final Cleanup

Once all components are migrated:
1. Remove old Toast component: `components/ui/toaster.tsx`
2. Remove Toast-related types and utilities
3. Update any documentation
4. Commit changes

## Need Help?

Common issues:
- **Import errors**: Make sure paths are correct
- **Hook errors**: Ensure hooks are used in components, not regular functions
- **Type errors**: The new system is fully typed, check notification.types.ts

For complex migrations or custom patterns, refer to the implemented examples in the notification.utils.ts file.