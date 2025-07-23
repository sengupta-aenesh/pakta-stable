/**
 * Enhanced OpenAI Functions with Jurisdiction Context
 * Extends existing OpenAI functions to include jurisdiction-aware analysis
 */

import OpenAI from 'openai'
import type { ContractSummary, RiskAnalysis, RiskFactor } from './types'
import { JurisdictionContext, jurisdictionResearch } from './services/jurisdiction-research'
import { UserProfile } from './services/subscription'
import { normalizeJurisdiction, getJurisdictionName } from './jurisdiction-utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AnalysisContext {
  userProfile: UserProfile
  jurisdictions: JurisdictionContext
  jurisdictionResearch?: string
}

/**
 * Create jurisdiction-aware system prompt
 */
function createJurisdictionAwarePrompt(basePrompt: string, context?: AnalysisContext): string {
  if (!context) return basePrompt

  let enhancedPrompt = basePrompt + '\n\n'
  
  // Add jurisdiction expertise
  enhancedPrompt += `JURISDICTION EXPERTISE:
- Primary jurisdiction: ${context.jurisdictions.primary}
- Additional jurisdictions: ${context.jurisdictions.additional.map(j => j.name).join(', ')}
- You must analyze this contract considering the laws and regulations of ALL these jurisdictions
- Identify jurisdiction-specific risks and compliance requirements
- Flag any conflicts between different jurisdictional requirements\n\n`

  // Add organization context
  if (context.userProfile.organization_type) {
    enhancedPrompt += `ORGANIZATION CONTEXT:
- Organization type: ${context.userProfile.organization_type}
- Industry: ${context.userProfile.industry || 'Not specified'}
- Company size: ${context.userProfile.company_size || 'Not specified'}
- Risk tolerance: ${context.userProfile.risk_tolerance || 'medium'}\n\n`
  }

  // Add jurisdiction research if available
  if (context.jurisdictionResearch) {
    enhancedPrompt += context.jurisdictionResearch + '\n\n'
  }

  return enhancedPrompt
}

/**
 * Enhanced contract summary with jurisdiction context
 */
export async function summarizeContractWithJurisdiction(
  content: string,
  context?: AnalysisContext
): Promise<ContractSummary | { error: string; message: string }> {
  try {
    const systemPrompt = createJurisdictionAwarePrompt(
      `You are an elite legal contract analyst with 30+ years of experience in corporate law, contract negotiation, and risk assessment. You have:
- JD from Harvard Law School
- Experience as General Counsel for Fortune 500 companies
- Expertise in identifying contractual risks and protecting client interests
- Deep knowledge of legal precedents and industry standards
- Specialization in commercial contracts, employment agreements, NDAs, and service agreements

Your analysis should be thorough, precise, and actionable. Always cite specific clauses and provide practical recommendations.`,
      context
    )

    const userPrompt = `First, determine if this document is a legal contract, agreement, or legal document.

If it is NOT a legal document (e.g., it's a resume, article, letter, etc.), respond with a JSON object:
{
  "error": "NOT_A_CONTRACT",
  "message": "This document does not appear to be a legal contract or agreement. Please upload a valid contract document."
}

If it IS a legal document, analyze it and provide a summary as a JSON object with the following structure:
{
  "overview": "Brief overview of the contract",
  "contract_type": "Type of contract (e.g., Service Agreement, NDA, etc.)",
  "key_terms": {
    "duration": "Contract duration as a string",
    "value": "Contract value as a string", 
    "payment_terms": "Payment terms as a string"
  },
  "important_dates": ["Array of important dates as strings"],
  "parties": ["Array of parties involved as strings"],
  "obligations": ["Array of key obligations as strings"],
  "jurisdiction_notes": "Any jurisdiction-specific considerations or conflicts"
}

${context ? `IMPORTANT: Consider the laws and requirements of ${context.jurisdictions.primary} as the primary jurisdiction, and note any special considerations for ${context.jurisdictions.additional.map(j => j.name).join(', ')}.` : ''}

All values must be strings or arrays of strings. If any information is not found, use "Not specified" or empty array. Respond only with valid JSON.

Document to analyze:
${content}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || "{}")
    
    if (result.error === 'NOT_A_CONTRACT') {
      return {
        error: result.error,
        message: result.message
      }
    }
    
    return {
      overview: result.overview || "No overview available",
      contractType: result.contract_type || "Unknown",
      keyTerms: {
        duration: result.key_terms?.duration || "Not specified",
        value: result.key_terms?.value || "Not specified",
        paymentTerms: result.key_terms?.payment_terms || "Not specified"
      },
      importantDates: result.important_dates || [],
      parties: result.parties || [],
      obligations: result.obligations || [],
      jurisdictionNotes: result.jurisdiction_notes
    } as ContractSummary
  } catch (error) {
    console.error('OpenAI enhanced summary error:', error)
    throw error
  }
}

/**
 * Enhanced risk analysis with jurisdiction context
 */
export async function identifyRiskyTermsWithJurisdiction(
  contractText: string,
  context?: AnalysisContext
): Promise<RiskAnalysis> {
  const systemPrompt = createJurisdictionAwarePrompt(
    `You are an elite legal contract analyst with 30+ years of experience in corporate law, contract negotiation, and risk assessment. You have:
- JD from Harvard Law School
- Experience as General Counsel for Fortune 500 companies
- Expertise in identifying contractual risks and protecting client interests
- Deep knowledge of legal precedents and industry standards
- Specialization in commercial contracts, employment agreements, NDAs, and service agreements

Your analysis should be thorough, precise, and actionable. Always cite specific clauses and provide practical recommendations.`,
    context
  )

  const userPrompt = `Analyze this contract for potential risks and problematic terms. Provide a comprehensive risk analysis as a JSON object with the following structure:

{
  "risks": [
    {
      "severity": "high" | "medium" | "low",
      "category": "liability" | "payment" | "termination" | "intellectual_property" | "confidentiality" | "compliance" | "dispute_resolution" | "general",
      "title": "Brief risk title",
      "description": "Detailed description of the risk",
      "location": "Quote the specific problematic clause or section",
      "recommendation": "Specific actionable recommendation to mitigate this risk",
      "jurisdiction_specific": "Any jurisdiction-specific concerns"
    }
  ],
  "risk_summary": {
    "total_risks": number,
    "high_severity": number,
    "medium_severity": number,
    "low_severity": number,
    "most_critical": "Description of the most critical risk",
    "jurisdiction_conflicts": "Any conflicts between jurisdictional requirements"
  },
  "missing_protections": ["List of standard protections that are missing from this contract"],
  "overall_risk_assessment": "high" | "medium" | "low"
}

${context ? `CRITICAL: Analyze for compliance with laws in:
- Primary: ${context.jurisdictions.primary}
- Additional: ${context.jurisdictions.additional.map(j => `${j.name} (${j.purpose})`).join(', ')}

Flag any terms that may be:
- Illegal or unenforceable in any jurisdiction
- Subject to different interpretations across jurisdictions
- Missing required provisions for any jurisdiction
- Creating conflicts between jurisdictional requirements` : ''}

Be thorough and identify ALL potential risks. Each risk must include the exact location (quoted text) from the contract. Consider industry standards and best practices. Provide specific, actionable recommendations.

Contract to analyze:
${contractText}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || "{}")
    
    return {
      risks: (result.risks || []).map((risk: any) => ({
        severity: risk.severity || 'medium',
        category: risk.category || 'general',
        title: risk.title || 'Unspecified Risk',
        description: risk.description || 'No description provided',
        location: risk.location || 'Not specified',
        recommendation: risk.recommendation || 'Review with legal counsel',
        jurisdictionSpecific: risk.jurisdiction_specific
      })),
      riskSummary: {
        totalRisks: result.risk_summary?.total_risks || 0,
        highSeverity: result.risk_summary?.high_severity || 0,
        mediumSeverity: result.risk_summary?.medium_severity || 0,
        lowSeverity: result.risk_summary?.low_severity || 0,
        mostCritical: result.risk_summary?.most_critical || 'No critical risks identified',
        jurisdictionConflicts: result.risk_summary?.jurisdiction_conflicts
      },
      missingProtections: result.missing_protections || [],
      overallRiskAssessment: result.overall_risk_assessment || 'medium',
      jurisdictionAnalysis: {
        primary: context?.jurisdictions.primary,
        additional: context?.jurisdictions.additional,
        conflicts: result.risk_summary?.jurisdiction_conflicts
      }
    }
  } catch (error) {
    console.error('OpenAI enhanced risk analysis error:', error)
    throw error
  }
}

/**
 * Helper function to perform jurisdiction-aware analysis
 */
export async function performJurisdictionAwareAnalysis(
  content: string,
  userProfile: UserProfile,
  analysisType: 'summary' | 'risks' | 'both' = 'both'
): Promise<{
  summary?: ContractSummary | { error: string; message: string }
  risks?: RiskAnalysis
  jurisdictionResearch?: string
}> {
  // Prepare jurisdiction context with normalization
  const jurisdictions: JurisdictionContext = {
    primary: normalizeJurisdiction(userProfile.primary_jurisdiction),
    additional: Array.isArray(userProfile.additional_jurisdictions) 
      ? userProfile.additional_jurisdictions.map(j => 
          typeof j === 'string' 
            ? { code: j, name: j, purpose: 'general', active: true }
            : j as any
        )
      : []
  }

  // Perform jurisdiction research
  let jurisdictionResearchText = ''
  if (jurisdictions.primary || jurisdictions.additional.length > 0) {
    const { research } = await jurisdictionResearch.researchJurisdictionRequirements(
      jurisdictions,
      undefined, // Contract type will be determined from content
      content
    )
    jurisdictionResearchText = jurisdictionResearch.formatResearchForAI(research)
  }

  // Create analysis context
  const context: AnalysisContext = {
    userProfile,
    jurisdictions,
    jurisdictionResearch: jurisdictionResearchText
  }

  // Perform requested analyses
  const results: any = {}

  if (analysisType === 'summary' || analysisType === 'both') {
    results.summary = await summarizeContractWithJurisdiction(content, context)
  }

  if (analysisType === 'risks' || analysisType === 'both') {
    results.risks = await identifyRiskyTermsWithJurisdiction(content, context)
  }

  results.jurisdictionResearch = jurisdictionResearchText

  return results
}