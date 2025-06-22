# Session Handover Document - CRITICAL ARCHITECTURAL ISSUES

## PRIORITY 1: Critical Architecture Problems

### 1. Multiple Sidebar Implementations (MAJOR ISSUE)
The application has **THREE different sidebar components** doing essentially the same thing:

1. **FolderSidebar** (`/components/folders/folder-sidebar.tsx`)
   - Used in: `/app/folders/page.tsx` and `/app/contract-creator/page.tsx`
   - Has sign-out button and user section

2. **FolderSidebarCompact** (`/components/folders/folder-sidebar-compact.tsx`)
   - Used in: `/app/dashboard/page.tsx`
   - NO sign-out button or user section
   - This is why changes only affected dashboard, not folders page!

3. **Dashboard Sidebar** (`/components/dashboard/sidebar/`)
   - UNUSED but has modern modular architecture
   - Should be the base for consolidation

**SOLUTION REQUIRED:**
- Consolidate to ONE sidebar component used everywhere
- Use the modular Dashboard Sidebar as the base
- Add drag & drop functionality from FolderSidebar
- Ensure consistent experience across all pages

### 2. File Upload Still Broken
**Error Details:** [Need specific error message from user]
- Upload functionality exists in BOTH sidebar implementations
- Each has slightly different code
- Need to debug the actual error

**SOLUTION REQUIRED:**
- Check browser console for specific error
- Verify UploadThing configuration
- Test with simple file upload first
- Ensure mammoth.js is working for .docx extraction

### 3. Drag & Drop Not Working
**Issues:**
- Contracts appear draggable but don't move to folders
- Visual feedback works but actual move fails
- Problem exists in BOTH sidebar implementations

**POSSIBLE CAUSES:**
- `contractsApi.update` might be failing
- Database permissions issue
- State not updating after move

**SOLUTION REQUIRED:**
- Add console.log to track drag & drop flow
- Check network tab for failed API calls
- Verify database update permissions

### 4. Scrolling Issues
- Folders/files section not scrollable in some views
- CSS solution was applied to FolderSidebarCompact only
- Need to apply to FolderSidebar as well

## What Was Attempted vs What Actually Happened

### Attempted Fixes (PARTIAL SUCCESS):
1. **File Upload Error** 
   - ✅ Removed subscription checks from API
   - ❌ BUT only fixed in one sidebar component
   - ❌ File upload still broken due to architecture issue

2. **JSON Parsing Error**
   - ✅ Fixed error handling in contract analysis
   - ✅ This should work across all pages

3. **Drag & Drop Visual Feedback**
   - ✅ CSS changes made to folders.module.css
   - ⚠️  BUT functionality still broken
   - ⚠️  Visual feedback works, actual moving doesn't

4. **Folder Rename Button**
   - ✅ Added to FolderSidebarCompact (dashboard only)
   - ❌ NOT added to FolderSidebar (folders page)
   - ❌ Inconsistent experience across pages

### Root Cause: Bad Architecture
**The main problem is that there are 3 different sidebar implementations, and changes were only made to one of them!**

### Subscription System Status
- **PARTIALLY IMPLEMENTED** - Database schema and code are in place but NOT ACTIVE
- **Simplified to Single Plan**: $100/month with 7-day free trial
- **Stripe Setup Guide**: Created in `STRIPE_SETUP_GUIDE.md`

### What Still Needs to Be Done

1. **Complete Stripe Integration**
   - User needs to follow STRIPE_SETUP_GUIDE.md to set up Stripe account
   - Add environment variables to `.env.local`:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
     ```

2. **Database Migration**
   - Run the subscription migration: `20250615000001_add_subscription_system.sql`
   - This creates profiles, subscription_history, and usage_tracking tables

3. **Remove or Simplify Subscription UI**
   - Currently shows 4 tiers, should show only 1 plan
   - Update `/app/subscription/page.tsx` to show single $100/month plan

4. **Testing**
   - Test file uploads work correctly
   - Test contract analysis works without errors
   - Test drag & drop functionality
   - Test folder renaming

### Important Files Modified (BUT INCOMPLETE!)
- `/components/folders/folder-sidebar-compact.tsx` - Changes ONLY affect dashboard page
- `/components/folders/folder-sidebar.tsx` - NEEDS SAME CHANGES for folders page
- `/app/api/contract/analyze/route.ts` - Removed subscription checks
- `/lib/subscription-tiers.ts` - Simplified to 2 tiers (free trial + pro)
- `/app/folders/folders.module.css` - Enhanced drag/drop styling
- `/app/api/uploadthing/core.ts` - Removed subscription checks from upload middleware

### Changes That Need to Be Applied to FolderSidebar
1. **Edit button visibility** - Currently only in FolderSidebarCompact
2. **Drag & drop enhancements** - Only in FolderSidebarCompact
3. **Scrolling fixes** - Only in FolderSidebarCompact
4. **Remove subscription button** - Still exists in FolderSidebar
5. **File upload fixes** - May need to be applied

### Known Issues
- Subscription code exists but is NOT ACTIVE (all checks removed)
- The `/subscription` page still exists but is not linked from anywhere

## CRITICAL: Recommendations for Next Session (IN ORDER)

### STEP 1: Fix the Architecture Problem FIRST
1. **STOP using multiple sidebar components**
2. **Option A (Quick Fix):** 
   - Copy ALL changes from FolderSidebarCompact to FolderSidebar
   - Delete FolderSidebarCompact
   - Update dashboard to use FolderSidebar
   - Add prop to conditionally show/hide user section
   
3. **Option B (Better Long-term):**
   - Use the modular Dashboard Sidebar components
   - Add missing features (drag & drop, file upload)
   - Replace all sidebar usage with this one component

### STEP 2: Debug File Upload
1. **Get the exact error message** from browser console
2. **Check these common issues:**
   - Is mammoth.js loading correctly?
   - Is the file input accepting .docx files?
   - Is getCurrentUser() returning a user?
   - Is contractsApi.create() failing?
3. **Test with console.log at each step** of the upload process

### STEP 3: Fix Drag & Drop
1. **Add logging to track the flow:**
   ```javascript
   console.log('1. Drag started:', contract.title)
   console.log('2. Drag over folder:', folderId)
   console.log('3. Drop on folder:', folderId)
   console.log('4. API call to update contract')
   console.log('5. API response:', response)
   ```
2. **Check if contractsApi.update is being imported from the correct file**
3. **Verify the API endpoint exists and has proper permissions**

### STEP 4: Complete UI Fixes
1. **Edit button for folders:** Should be visible on hover (not always at 60%)
2. **Scrolling:** Apply same CSS fixes to FolderSidebar
3. **Visual feedback:** Ensure drag & drop styling is consistent

### STEP 5: Clean Up Subscription Code (OPTIONAL)
- Either fully implement it following the Stripe guide
- OR remove it entirely to simplify the codebase

## Code Locations Quick Reference

### Sidebar Components:
- **Main:** `/components/folders/folder-sidebar.tsx` (537 lines)
- **Compact:** `/components/folders/folder-sidebar-compact.tsx` (620 lines)
- **Modular:** `/components/dashboard/sidebar/` (unused but modern)

### Pages Using Sidebars:
- **Dashboard:** `/app/dashboard/page.tsx` → uses FolderSidebarCompact
- **Folders:** `/app/folders/page.tsx` → uses FolderSidebar
- **Contract Creator:** `/app/contract-creator/page.tsx` → uses FolderSidebar

### Key Functions to Check:
- `handleFileUpload()` - in both sidebar components
- `handleFolderDrop()` - for drag & drop
- `contractsApi.update()` - for moving contracts
- `extractTextFromDocx()` - for reading uploaded files

### Critical Note
The subscription system is OPTIONAL. The app works without it. If the user doesn't want subscriptions, you can remove:
- All files in `/lib/services/`
- All subscription-related API routes
- The subscription button from the sidebar
- The middleware subscription checks