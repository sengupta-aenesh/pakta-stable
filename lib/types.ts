export interface Contract {
  id: string
  user_id: string
  title: string
  content: string | null
  upload_url: string | null
  file_key: string | null
  folder_id: string | null
  creation_session_id: string | null
  analysis_cache: {
    summary?: ContractSummary
    risks?: RiskAnalysis
    complete?: {
      missingInfo: MissingInfoItem[]
      processingSteps?: any
      processedContent?: string
    }
    chat?: Array<{role: string, content: string}>
    lastAnalyzed?: string
  }
  analysis_status: string | null
  analysis_progress: number | null
  last_analyzed_at: string | null
  analysis_retry_count: number | null
  analysis_error: string | null
  created_at: string
  updated_at: string
}

// Template-specific interfaces
export interface Template {
  id: string
  user_id: string
  title: string
  content: string | null
  upload_url: string | null
  file_key: string | null
  folder_id: string | null
  analysis_cache: {
    summary?: ContractSummary
    risks?: RiskAnalysis
    complete?: {
      missingInfo: MissingInfoItem[]
      processingSteps?: any
      processedContent?: string
    }
    lastAnalyzed?: string
  }
  analysis_status: string | null
  analysis_progress: number | null
  last_analyzed_at: string | null
  analysis_retry_count: number | null
  analysis_error: string | null
  resolved_risks: RiskFactor[]
  user_created_variables: UserCreatedVariable[]
  created_at: string
  updated_at: string
}

export interface UserCreatedVariable {
  id: string
  label: string
  fieldType: 'text' | 'email' | 'number' | 'date'
  description?: string
  createdAt: string
  isUserCreated: boolean
}

export interface TemplateFolder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface TemplateVersion {
  id: string
  template_id: string
  version_name: string
  vendor_name: string
  version_data: Record<string, any>
  generated_content: string | null
  created_at: string
  created_by: string
}

export interface ContractSummary {
  overview: string
  contract_type: string
  key_terms: {
    duration?: string
    value?: string
    payment_terms?: string
  }
  important_dates: string[]
  parties: string[]
  obligations: string[]
}

export interface RiskFactor {
  id: string
  clause: string
  clauseLocation: string
  riskLevel: 'high' | 'medium' | 'low'
  riskScore: number // 1-10, where 10 is highest risk
  category: string
  explanation: string
  suggestion: string
  legalPrecedent?: string
  affectedParty: string
}

export interface RiskAnalysis {
  overallRiskScore: number
  totalRisksFound: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  risks: RiskFactor[]
  recommendations: string[]
  executiveSummary: string
  missingProtections?: string[]
  jurisdictionConflicts?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface MissingInfoItem {
  id: string
  label: string
  description: string
  placeholder: string
  fieldType: string
  legalContext?: string
  context?: string
  occurrences: Array<{
    text: string
    position?: { start: number; end: number }
  }>
  userInput: string
}

export interface AnalysisRequest {
  contractId: string
  content: string
  type: 'summary' | 'risks' | 'chat'
  question?: string
  useCache?: boolean
}

export interface UploadResponse {
  url: string
  key: string
  name: string
}

export type RiskCategory = 
  | 'Payment Terms'
  | 'Liability'
  | 'Termination'
  | 'Intellectual Property'
  | 'Confidentiality'
  | 'Dispute Resolution'
  | 'Force Majeure'
  | 'Warranties'
  | 'Indemnification'
  | 'Compliance'
  | 'Other'

export const RISK_LEVEL_CONFIG = {
  high: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    borderColor: 'border-red-500',
    bgLight: 'bg-red-50',
    label: 'High Risk',
    minScore: 7
  },
  medium: {
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-500',
    bgLight: 'bg-amber-50',
    label: 'Medium Risk',
    minScore: 4
  },
  low: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    borderColor: 'border-green-500',
    bgLight: 'bg-green-50',
    label: 'Low Risk',
    minScore: 1
  }
} as const