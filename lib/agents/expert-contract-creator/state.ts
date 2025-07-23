import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const ExpertContractCreatorState = Annotation.Root({
  // Conversation
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  
  // Session Management
  sessionId: Annotation<string>({
    default: () => "",
  }),
  
  // User Context
  userProfile: Annotation<{
    id?: string;
    organizationType?: string;
    industry?: string;
    companySize?: string;
    primaryJurisdiction?: string;
    additionalJurisdictions?: string[];
    regulatoryRequirements?: string[];
    riskTolerance?: string;
    legalCounsel?: boolean;
  } | null>({
    default: () => null,
  }),
  
  // Request Analysis
  userRequest: Annotation<string>({
    default: () => "",
  }),
  contractType: Annotation<string | null>({
    default: () => null,
  }),
  contractComplexity: Annotation<'simple' | 'moderate' | 'complex'>({
    default: () => 'moderate',
  }),
  jurisdiction: Annotation<string>({
    default: () => "united-states",
  }),
  crossBorderConsiderations: Annotation<string[]>({
    default: () => [],
  }),
  
  // Contract Planning
  plannedSections: Annotation<Array<{
    name: string;
    description: string;
    priority: 'essential' | 'important' | 'optional';
    order: number;
  }>>({
    default: () => [],
  }),
  
  // Information Collection
  requiredInfo: Annotation<Array<{
    key: string;
    label: string;
    description: string;
    required: boolean;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[];
  }>>({
    default: () => [],
  }),
  collectedInfo: Annotation<Record<string, any>>({
    default: () => ({}),
  }),
  pendingClarifications: Annotation<string[]>({
    default: () => [],
  }),
  
  // Research
  researchFindings: Annotation<Array<{
    section: string;
    insights: string[];
    bestPractices: string[];
    keyTerms: string[];
    sources: string[];
  }>>({
    default: () => [],
  }),
  
  // Template Discovery & Integration
  discoveredTemplates: Annotation<Array<{
    source: string;
    url: string;
    contractType: string;
    jurisdiction: string;
    content: string;
    qualityScore: number;
    extractedClauses: string[];
    validationStatus: 'pending' | 'validated' | 'rejected';
  }>>({
    default: () => [],
  }),
  relevantTemplates: Annotation<any[]>({
    default: () => [],
  }),
  relevantClauses: Annotation<any[]>({
    default: () => [],
  }),
  templateSynthesis: Annotation<{
    primaryTemplate: string;
    supplementaryTemplates: string[];
    customClauses: string[];
    synthesisStrategy: string;
  } | null>({
    default: () => null,
  }),
  
  // Contract Drafting
  draftedSections: Annotation<Record<string, {
    content: string;
    status: 'draft' | 'reviewed' | 'final';
    keyPoints: string[];
  }>>({
    default: () => ({}),
  }),
  currentSection: Annotation<number | null>({
    default: () => null,
  }),
  totalSections: Annotation<number | null>({
    default: () => null,
  }),
  
  // Quality Review
  qualityAssessment: Annotation<{
    completeness: number; // 0-100
    legalSoundness: number; // 0-100
    fairness: number; // 0-100
    clarity: number; // 0-100
    issues: string[];
    improvements: string[];
  } | null>({
    default: () => null,
  }),
  
  // Final Contract
  finalContract: Annotation<string | null>({
    default: () => null,
  }),
  generatedContract: Annotation<string | null>({
    default: () => null,
  }),
  editableFields: Annotation<Array<{
    fieldName: string;
    currentValue: string;
    displayName: string;
    section: string;
  }>>({
    default: () => [],
  }),
  
  // Agent Insights
  agentInsights: Annotation<{
    intakeAgent?: string[];
    jurisdictionAgent?: string[];
    researchAgent?: string[];
    architectureAgent?: string[];
    draftingAgent?: string[];
    reviewAgent?: string[];
  }>({
    default: () => ({}),
  }),
  
  // Workflow State
  currentStep: Annotation<string>({
    default: () => "analyze_request",
  }),
  workflowStatus: Annotation<'planning' | 'collecting_info' | 'researching' | 'drafting' | 'reviewing' | 'complete'>({
    default: () => 'planning',
  }),
  activeAgent: Annotation<string | null>({
    default: () => null,
  }),
});