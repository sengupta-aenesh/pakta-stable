# CTO Technical Review - Contract Manager Platform

## Last Updated: June 2, 2025

### LATEST IMPLEMENTATION: Folder Organization System
**Status:** ✅ Completed - Dashboard with folder organization
**New Route:** `/folders` - Three-column dashboard layout
**Features Added:**
- Hierarchical folder structure with nested support
- Contract grid view with card-based layout
- Stats panel with quick actions and metrics
- Navigation bar added to contract centre
- Mobile-responsive design maintained

---

## 1. Project Structure

### Package.json Overview
```json
{
  "name": "contract-manager",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.3.2",
    "react": "19.0.0",
    "typescript": "^5",
    "@supabase/supabase-js": "^2.49.0",
    "openai": "^4.73.1",
    "uploadthing": "^7.5.0",
    "mammoth": "^1.8.0",
    "docx": "^8.5.0",
    "zustand": "^5.0.2",
    "@radix-ui/react-*": "Multiple UI components",
    "tailwindcss": "^4.0.0"
  }
}
```

### Project Folder Structure
```
contract-manager/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── contract/analyze/     # Main AI processing endpoint
│   │   └── uploadthing/          # File upload handling
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main application UI
│   └── layout.tsx               # Root layout
├── components/
│   ├── contracts/               # Core contract components
│   └── ui/                      # Reusable UI components
├── lib/                         # Utilities and configurations
│   ├── openai.ts               # OpenAI integration
│   ├── supabase/               # Database clients
│   └── uploadthing.ts          # File upload config
└── middleware.ts               # Auth middleware
```

---

## 2. Core Application Files

### Main API Endpoint: `/api/contract/analyze/route.ts`
**Location:** `app/api/contract/analyze/route.ts`

**Purpose:** Handles all AI-powered contract analysis requests

**Key Functions:**
- Contract summarization using OpenAI GPT-4
- Risk analysis with severity scoring
- AI chat functionality
- Caching analysis results in database

**Critical Code Sections:**
```typescript
// Expert system prompt for contract analysis
const EXPERT_PROMPT = `You are a Harvard Law School JD with 30+ years of experience...`

// Analysis types: 'summary', 'risks', 'chat'
export async function POST(request: Request) {
  // Authentication validation
  // Content extraction and validation
  // OpenAI API integration
  // Database caching
}
```

### OpenAI Integration: `lib/openai.ts`
**Location:** `lib/openai.ts`

**Configuration:**
```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model: gpt-4o-mini for cost efficiency
// Structured JSON responses for analysis
```

### Document Upload: `app/api/uploadthing/core.ts`
**Location:** `app/api/uploadthing/core.ts`

**Features:**
- .docx file validation
- 16MB file size limit
- User authentication required
- Automatic file processing pipeline

### Contract Parsing: `mammoth.js` Integration
**Implementation:** Within contract analysis API route

**Process:**
1. Extract raw text from .docx files using mammoth.js
2. Validate document is a legal contract
3. Process through OpenAI for analysis
4. Cache results in Supabase

---

## 3. Frontend Components

### Contract Upload Component: `components/contracts/contract-list.tsx`
**Location:** `components/contracts/contract-list.tsx`

**Features:**
- Drag-and-drop file upload
- Contract search and filtering
- Real-time upload progress
- Mobile-responsive design

**Key Functions:**
- File validation and upload via UploadThing
- Contract list management with Zustand state
- Search functionality across contract titles

### Contract Analysis Display: `components/contracts/contract-analysis.tsx`
**Location:** `components/contracts/contract-analysis.tsx`

**Features:**
- Tabbed interface (Summary, Risks, Chat)
- Risk severity visualization
- Interactive AI chat
- Loading states and error handling

**Data Structure:**
- Summary: Overview, parties, key terms, obligations
- Risks: 8-12 risk factors with severity scores
- Chat: Contextual Q&A about contract content

### Contract Editor: `components/contracts/contract-editor.tsx`
**Location:** `components/contracts/contract-editor.tsx`

**Features:**
- Full-text editing with textarea
- Real-time auto-save (500ms debounce)
- Word document export functionality
- Change tracking and validation

### Export Functionality
**Implementation:** Within contract editor component

**Process:**
1. Convert edited text to structured document
2. Generate .docx file using docx library
3. Client-side download via file-saver
4. Maintains original document formatting

### New Folder Dashboard Components

#### Folder Sidebar: `components/folders/folder-sidebar.tsx`
**Location:** `components/folders/folder-sidebar.tsx`

**Features:**
- Hierarchical folder tree with expand/collapse
- Search functionality across folders
- "All Contracts" view for uncategorized items
- Create new folder button
- User info and sign-out functionality
- White text on black background matching current design

#### Contract Grid: `components/folders/contract-grid.tsx`
**Location:** `components/folders/contract-grid.tsx`

**Features:**
- Grid layout with contract cards (3-4 columns)
- Card hover effects matching risk analysis design
- Document metadata display (title, type, modified date)
- Empty state messaging
- Click-to-open contract functionality

#### Stats Panel: `components/folders/stats-panel.tsx`
**Location:** `components/folders/stats-panel.tsx`

**Features:**
- Quick stats (total contracts, folders, monthly uploads)
- Recent activity list
- Quick action buttons
- User account information
- Light gray background (#F5F5F5) matching current design

### New Dashboard Page: `/folders`
**Location:** `app/folders/page.tsx`

**Layout:**
- Three-column grid: 280px (sidebar) | 1fr (main) | 320px (stats)
- Matches current contract centre design patterns
- Responsive breakpoints for mobile support
- Navigation integration with contract centre

---

## 4. Database Schema

### Supabase Table Structure: `contracts` (Updated)
**Location:** `lib/database.types.ts`

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  upload_url TEXT,
  file_key TEXT,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  analysis_cache JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### New Table: `folders`
**Migration:** `supabase/migrations/20250602000001_add_folders_table.sql`

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Analysis Cache Structure
```typescript
interface AnalysisCache {
  summary?: ContractSummary;
  risks?: RiskAnalysis;
  lastAnalyzed?: string;
}

interface ContractSummary {
  overview: string;
  contractType: string;
  keyTerms: string[];
  keyDates: Array<{date: string; description: string}>;
  parties: string[];
  obligations: string[];
}

interface RiskAnalysis {
  overallRiskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: RiskFactor[];
  recommendations: string[];
}
```

### Database Queries
**Authentication:** Supabase Auth with RLS policies
**Data Access:** Server-side queries with user context validation
**Caching Strategy:** JSON storage for analysis results to minimize AI API calls

---

## 5. Configuration Files

### Environment Variables Required
```env
# Core Application
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Integration
OPENAI_API_KEY=your_openai_api_key

# File Upload
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS=your_ga_id
```

### UploadThing Configuration: `lib/uploadthing.ts`
```typescript
export const ourFileRouter = {
  contractUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      // User authentication validation
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Post-upload processing
    }),
};
```

### Supabase Configuration
**Client Configuration:** `lib/supabase-client.ts`
**Server Configuration:** `lib/supabase.ts`
**SSR Support:** `lib/supabase/server.ts`

---

## 6. Security & Performance Considerations

### Security Measures
- Row Level Security (RLS) enabled on all tables
- Server-side authentication validation
- File type and size restrictions
- Environment variable protection

### Performance Optimizations
- Analysis result caching in database
- Debounced auto-save (500ms)
- Optimistic UI updates
- Mobile-responsive design patterns

### Error Handling
- Comprehensive error boundaries
- Toast notifications for user feedback
- Graceful degradation for failed AI requests
- File upload error recovery

---

## 7. Development Notes

### Current Implementation Status
- ✅ Core contract upload and analysis
- ✅ AI-powered risk assessment
- ✅ Contract editing and export
- ✅ User authentication and data isolation
- ✅ Mobile-responsive interface

### Known Technical Debt
- Analysis caching could be more sophisticated
- File processing could be moved to background jobs
- Error handling could be more granular
- Testing coverage needs improvement

### Scaling Considerations
- OpenAI API rate limiting management
- Database query optimization for large datasets
- File storage migration from UploadThing to Supabase Storage
- Background job processing for large documents

---

**Technical Contact:** Claude AI Assistant  
**Review Date:** June 6, 2025  
**Next Update:** As changes are implemented