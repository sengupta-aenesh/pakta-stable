# Template Analysis Flow - Complete Dependency Map

## Overview
The template analysis system is complex with multiple components and dependencies. This document maps out the complete flow and identifies what can be simplified.

## Current Analysis Flow

### 1. **Entry Points**
- **Standard Analysis**: `/api/template/auto-analyze/route.ts`
- **Enhanced Analysis**: `/api/template/auto-analyze-enhanced/route.ts` (when user has jurisdiction configuration)

### 2. **Analysis Pipeline**

#### Standard Analysis Flow (`auto-analyze/route.ts`):
1. **Authentication & Validation** (5%)
   - Check user authentication
   - Validate templateId
   - Fetch template from database
   - Check for existing analysis (cache)

2. **Jurisdiction Check** (10%)
   - Check if user has jurisdiction configuration
   - If yes → redirect to enhanced analysis
   - If no → continue with standard analysis

3. **Summary Analysis** (10% → 50%)
   - Calls `summarizeTemplate()` from `/lib/openai.ts`
   - Analyzes template type, overview, key terms
   - Caches result in `analysis_cache.summary`
   - Updates status to `summary_complete`

4. **Template Field Extraction** (50% → 90%)
   - Calls `extractTemplateFields()` from `/lib/openai.ts`
   - Detects ALL template variables/placeholders
   - Maps occurrences and positions
   - Returns as `missingInfo` array

5. **Content Normalization** (90% → 95%)
   - **CRITICAL STEP**: Normalizes detected variables to `{{Variable_Name}}` format
   - Updates the actual template content in database
   - Ensures consistency for variable replacement

6. **Cache & Complete** (95% → 100%)
   - Caches field extraction results in `analysis_cache.complete`
   - Updates status to `complete`

#### Enhanced Analysis Flow (`auto-analyze-enhanced/route.ts`):
- Similar to standard but includes:
  - Jurisdiction research step
  - Uses `summarizeTemplateWithJurisdiction()` instead
  - Same field extraction and normalization process

### 3. **OpenAI Functions**

#### `summarizeTemplate()`:
- **Purpose**: Basic template summary
- **Focus**: Template type, fields count, reusability
- **Output**: Summary object with overview, contract_type, key_terms
- **NOT USED FOR**: Risk analysis (templates don't have legal risks)

#### `extractTemplateFields()`:
- **Purpose**: Core variable detection
- **Complex Logic**:
  - Handles large templates with chunking
  - Detects multiple placeholder patterns: `[Field]`, `___`, `{{Field}}`, `${Field}`
  - Maps exact positions for each occurrence
  - Returns comprehensive field metadata
- **Output**: `missingInfo` array with all detected variables

#### `identifyTemplateRisks()`:
- **NOTE**: Currently exists but NOT USED in the analysis flow
- **Original Purpose**: Template-specific risks (not legal risks)
- **Could be removed** to simplify

### 4. **UI Dependencies**

#### `template-analysis.tsx` Component:
- **Summary Tab**: 
  - Displays `analysis_cache.summary` data
  - Shows template overview and type
  - No dependencies on risk analysis

- **Variables Tab** (CRITICAL):
  - Displays `analysis_cache.complete.missingInfo` as variables
  - Allows user input for each variable
  - **Variable Creation Mode**: 
    - Edit mode for selecting text to create new variables
    - Stores in `user_created_variables` array
  - **Occurrence Tracking**: 
    - Shows where each variable appears
    - Click-to-scroll functionality
  - **Template Version Creation**:
    - Uses variable values to create filled templates
    - Calls `/api/template/create-version`

### 5. **Critical Dependencies**

1. **Variable Detection Accuracy**:
   - The entire Variables tab depends on `extractTemplateFields()`
   - Must detect ALL placeholder patterns correctly
   - Position mapping must be accurate for occurrence tracking

2. **Content Normalization**:
   - Variables must be normalized to `{{Variable_Name}}` format
   - This ensures consistent replacement when creating versions
   - Database content is actually modified

3. **Analysis Cache Structure**:
   - `summary`: Basic template info
   - `complete.missingInfo`: All detected variables
   - Used by UI to populate Variables tab

## What Can Be Simplified

### 1. **Remove Unused Functions**
- `identifyTemplateRisks()` - Not used in current flow
- Risk-related UI components for templates

### 2. **Simplify Analysis Pipeline**
- Combine summary and field extraction into single AI call
- Remove multiple status updates (just pending → complete)
- Simplify progress tracking

### 3. **Optimize for Core Purpose**
The template analysis essentially needs to:
1. Identify template type (basic summary)
2. Find ALL variables/placeholders
3. Normalize content to standard format

### 4. **Potential Single-Step Analysis**
Instead of multiple AI calls:
```typescript
async function analyzeTemplate(content: string) {
  // Single AI call that returns:
  return {
    summary: {
      overview: "Template purpose",
      type: "Template type"
    },
    variables: [
      {
        label: "Company_Name",
        occurrences: [...],
        fieldType: "text"
      }
    ]
  }
}
```

### 5. **Simplify Status Tracking**
Current statuses: `pending`, `in_progress`, `summary_complete`, `risks_complete`, `complete`, `failed`

Could be simplified to: `pending`, `analyzing`, `complete`, `failed`

## Key Risks of Simplification

1. **Variable Detection**: Must maintain high accuracy
2. **Large Templates**: Current chunking logic handles templates >30KB
3. **UI Expectations**: Variables tab expects specific data structure
4. **Backward Compatibility**: Existing templates have cached analysis

## Recommendations

1. **Phase 1**: Remove unused risk analysis functions
2. **Phase 2**: Combine summary + field extraction into single operation
3. **Phase 3**: Simplify status tracking and progress updates
4. **Maintain**: Variable detection accuracy and normalization process

The core value is in accurate variable detection and the Variables tab functionality. Everything else can be simplified as long as these are preserved.