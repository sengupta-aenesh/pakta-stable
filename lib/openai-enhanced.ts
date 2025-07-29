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
    `You are a senior legal counsel with 20+ years of experience in contract analysis, risk management, and multi-jurisdictional compliance. Apply expertise in:
- Commercial contract negotiation and risk identification
- Regulatory compliance across multiple jurisdictions
- Industry-specific legal requirements
- International contract law principles
- IRAC (Issue, Rule, Application, Conclusion) framework for thorough analysis

Your analysis should be systematic, comprehensive, and actionable. Always cite specific clauses and provide practical recommendations with example language.

IMPORTANT: You are being evaluated on THOROUGHNESS. Finding only 5-10 risks means you have FAILED. A proper analysis finds 30-50+ risks minimum.`,
    context
  )

  const userPrompt = `Conduct a comprehensive legal risk analysis using this structured approach:

## SYSTEMATIC RISK IDENTIFICATION CHECKLIST

Use this checklist as a MINIMUM guide - identify ALL risks in EACH category. Multiple risks often exist within each category.

### A. CONTRACTUAL STRUCTURE RISKS
□ Formation issues (offer, acceptance, consideration)
□ Ambiguous or conflicting terms
□ Missing essential terms
□ Integration and amendment provisions
[Find ALL risks in this category - not limited to these examples]

### B. OPERATIONAL RISKS  
□ Performance obligations and standards
□ Payment terms and financial exposure
□ Delivery/timeline requirements
□ Quality standards and acceptance criteria
[Find ALL risks in this category - not limited to these examples]

### C. LEGAL & COMPLIANCE RISKS
□ Regulatory compliance requirements
□ Data protection/privacy compliance
□ Anti-corruption and trade compliance
□ Employment law considerations
[Find ALL risks in this category - not limited to these examples]

### D. FINANCIAL RISKS
□ Payment security and credit risks
□ Currency and exchange rate exposure
□ Tax implications
□ Pricing mechanisms and adjustments
[Find ALL risks in this category - not limited to these examples]

### E. LIABILITY & INDEMNIFICATION
□ Limitation of liability clauses
□ Indemnification scope and exceptions
□ Insurance requirements
□ Warranty provisions and disclaimers
[Find ALL risks in this category - not limited to these examples]

### F. INTELLECTUAL PROPERTY
□ Ownership and licensing terms
□ Third-party IP infringement risks
□ Confidentiality and trade secrets
[Find ALL risks in this category - not limited to these examples]

### G. DISPUTE RESOLUTION
□ Governing law and jurisdiction
□ Arbitration vs. litigation
□ Fee-shifting provisions
[Find ALL risks in this category - not limited to these examples]

### H. TERMINATION & EXIT
□ Termination triggers and notice
□ Post-termination obligations
□ Survival of obligations
[Find ALL risks in this category - not limited to these examples]

### I. FORCE MAJEURE & RISK ALLOCATION
□ Scope of force majeure events
□ Risk allocation mechanisms
[Find ALL risks in this category - not limited to these examples]

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:
1. **MINIMUM REQUIREMENTS**: You MUST find AT LEAST 20-30 risks for any contract over 2 pages
2. **EXHAUSTIVE ANALYSIS**: Analyze EVERY SINGLE SENTENCE for potential risks
3. **MULTIPLE RISKS PER CATEGORY**: Each category should have 3-10 risks minimum
4. **NO STOPPING**: Continue analyzing until you've examined EVERY clause
5. **MISSING CLAUSES COUNT**: Every missing protection is a separate risk
6. **SEVERITY DOESN'T MATTER**: Include ALL risks - high, medium, AND low
7. **BE PARANOID**: If something COULD be a risk, it IS a risk
8. **IRAC FOR EACH**: Apply full IRAC analysis to every single risk

MANDATORY MINIMUMS PER CATEGORY:
- Contractual Structure: Find at least 3-5 risks
- Operational: Find at least 4-6 risks  
- Legal & Compliance: Find at least 3-5 risks
- Financial: Find at least 3-5 risks
- Liability & Indemnification: Find at least 3-5 risks
- Other categories: At least 2-3 risks each

Example for just ONE subcategory (Payment Terms):
- Risk 1: Payment due in 30 days - too long, affects cash flow
- Risk 2: No late payment penalties - no incentive for timely payment
- Risk 3: No interest on overdue amounts - lost opportunity cost
- Risk 4: Currency not specified - exchange rate risk
- Risk 5: No payment security (deposit/guarantee) - credit risk
- Risk 6: Invoice requirements unclear - potential disputes
- Risk 7: No right of setoff clause - can't offset damages
- Risk 8: No acceleration clause - can't demand full payment on breach
- Risk 9: Payment method not specified - wire transfer fees unclear
- Risk 10: No audit rights for invoices - can't verify charges
[... continue finding more]

DO NOT STOP until you have found EVERY POSSIBLE RISK. A typical commercial contract should have 30-50+ risks.

${context && context.jurisdictionResearch ? `
JURISDICTION-SPECIFIC LEGAL REQUIREMENTS:
${context.jurisdictionResearch}
` : ''}

Output as JSON with ALL identified risks:
{
  "risks": [
    // Array of ALL risks found - could be 50+ risks
    {
      "clause": "EXACT problematic text from contract (15-200 words)",
      "clauseLocation": "Section reference",
      "riskLevel": "high|medium|low" (based on severity),
      "riskScore": 1-10 (Critical:9-10, High:7-8, Medium:4-6, Low:1-3),
      "category": "Contractual Structure|Operational|Legal & Compliance|Financial|Liability & Indemnification|Intellectual Property|Dispute Resolution|Termination & Exit|Force Majeure",
      "explanation": "Precise legal issue using IRAC: What's the issue, what law applies, how it applies here, conclusion on risk",
      "suggestion": "Specific mitigation with example contract language",
      "affectedParty": "Client|Vendor|Both parties",
      "legalPrecedent": "Relevant law/regulation if applicable",
      "jurisdictionSpecific": "Specific concerns for the analyzed jurisdictions"
    }
    // ... many more risks
  ],
  "overallRiskScore": 1-10,
  "executiveSummary": "Contract risk profile summary with key concerns",
  "recommendations": ["Top 5 strategic recommendations for risk mitigation"],
  "missingProtections": ["List of critical missing clauses/protections"],
  "jurisdictionConflicts": ["Any cross-jurisdiction issues"]
}

${context ? `JURISDICTION-AWARE ANALYSIS:
Primary Jurisdiction: ${context.jurisdictions.primary}
Additional Jurisdictions: ${context.jurisdictions.additional.map(j => `${j.name} (${j.purpose})`).join(', ')}

For EACH risk, consider:
- Is this term legal in ALL jurisdictions?
- Are there different interpretations across jurisdictions?
- Are required provisions missing for any jurisdiction?
- Do any terms create jurisdictional conflicts?` : ''}

FINAL REMINDER: 
- If you find fewer than 20 risks, you have NOT done your job properly
- Every missing protection is a risk
- Every ambiguous term is a risk  
- Every one-sided clause is a risk
- Every missing deadline is a risk
- Every undefined term is a risk
- KEEP SEARCHING until you've found ALL risks (should be 30-50+ for most contracts)
- DO NOT STOP at 5, 10, or even 20 risks - BE EXHAUSTIVE!

Contract to analyze:
${contractText}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 12000, // Increased for comprehensive analysis
      temperature: 0.2,  // Lower temperature for consistency
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || "{}")
    
    // Process and structure the risks to match UI expectations
    const risks = (result.risks || []).map((risk: any, index: number) => ({
      id: `risk-${index}`,
      clause: risk.clause || "",
      clauseLocation: risk.clauseLocation || "Not specified",
      riskLevel: risk.riskLevel || "medium",
      riskScore: Math.min(Math.max(risk.riskScore || 5, 1), 10),
      category: risk.category || "Other",
      explanation: risk.explanation || "",
      suggestion: risk.suggestion || "",
      legalPrecedent: risk.legalPrecedent,
      affectedParty: risk.affectedParty || "Both parties",
      jurisdictionSpecific: risk.jurisdictionSpecific
    }))
    
    // Count risks by level
    const highRiskCount = risks.filter(r => r.riskLevel === 'high').length
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'medium').length
    const lowRiskCount = risks.filter(r => r.riskLevel === 'low').length
    
    console.log(`✅ Enhanced jurisdiction-aware analysis: ${risks.length} risks found`)
    console.log(`📊 Risk breakdown: ${highRiskCount} high, ${mediumRiskCount} medium, ${lowRiskCount} low`)
    
    return {
      overallRiskScore: Math.min(Math.max(result.overallRiskScore || 5, 1), 10),
      totalRisksFound: risks.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      risks,
      recommendations: result.recommendations || [],
      executiveSummary: result.executiveSummary || "Contract analysis completed.",
      missingProtections: result.missingProtections || [],
      jurisdictionConflicts: result.jurisdictionConflicts || [],
      jurisdictionAnalysis: {
        primary: context?.jurisdictions.primary,
        additional: context?.jurisdictions.additional,
        conflicts: result.jurisdictionConflicts
      }
    }
  } catch (error) {
    console.error('OpenAI enhanced risk analysis error:', error)
    throw error
  }
}

/**
 * Enhanced template summary with jurisdiction context
 */
export async function summarizeTemplateWithJurisdiction(
  templateContent: string,
  context?: AnalysisContext
): Promise<ContractSummary | { error: string; message: string }> {
  const systemPrompt = createJurisdictionAwarePrompt(
    `You are an elite legal template analyst with deep expertise in multi-jurisdictional template management. You specialize in:
- Template structure and organization
- Variable field identification and management
- Cross-jurisdictional template adaptability
- Template standardization best practices
- Industry-specific template requirements

Analyze templates for their structure, NOT their legal content. Focus on template usability, customization points, and jurisdictional adaptability.`,
    context
  )

  const userPrompt = `Analyze this template's structure and provide a comprehensive summary. Focus on TEMPLATE aspects, not legal contract content.

${context && context.jurisdictionResearch ? `
JURISDICTION-SPECIFIC REQUIREMENTS:
${context.jurisdictionResearch}
` : ''}

Provide a JSON response:
{
  "overview": "Comprehensive template overview focusing on structure, purpose, and customization capabilities",
  "contract_type": "Type of template (e.g., Service Agreement Template, NDA Template, etc.)",
  "key_terms": {
    "total_fields": "Number of customizable fields",
    "required_fields": "Number of required fields",
    "optional_fields": "Number of optional fields",
    "jurisdiction_variations": "Number of jurisdiction-specific variations"
  },
  "template_sections": ["List of major template sections"],
  "customization_points": ["List of key customization areas"],
  "variable_fields": ["List of detected variable fields"],
  "jurisdiction_notes": "How well the template adapts to different jurisdictions"
}

${context ? `Consider jurisdiction requirements for:
- Primary: ${context.jurisdictions.primary}
- Additional: ${context.jurisdictions.additional.map(j => j.name).join(', ')}` : ''}

Template to analyze:
${templateContent}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || "{}")
    
    return {
      overview: result.overview || "No overview available",
      contractType: result.contract_type || "Unknown Template Type",
      keyTerms: {
        duration: result.key_terms?.total_fields || "Not specified",
        value: result.key_terms?.required_fields || "Not specified",
        paymentTerms: result.key_terms?.optional_fields || "Not specified"
      },
      importantDates: result.template_sections || [],
      parties: result.customization_points || [],
      obligations: result.variable_fields || [],
      jurisdictionNotes: result.jurisdiction_notes
    } as ContractSummary
  } catch (error) {
    console.error('OpenAI enhanced template summary error:', error)
    throw error
  }
}

/**
 * Enhanced template risk analysis with jurisdiction context
 */
export async function identifyTemplateRisksWithJurisdiction(
  templateContent: string,
  context?: AnalysisContext
): Promise<RiskAnalysis> {
  const systemPrompt = createJurisdictionAwarePrompt(
    `You are an elite legal template analyst with 30+ years of experience in contract templates, legal documentation, and template risk assessment. You have:
- JD from Harvard Law School
- Experience creating and reviewing templates for Fortune 500 companies
- Expertise in template standardization and risk mitigation
- Deep knowledge of template best practices across industries
- Specialization in multi-jurisdictional template compliance

Your analysis should identify ALL template-specific risks, not legal contract risks. Focus on template structure, variable management, customization points, and jurisdictional adaptability.`,
    context
  )

  const userPrompt = `Perform an EXHAUSTIVE template risk analysis. You must identify EVERY SINGLE TEMPLATE RISK, no matter how minor.

CRITICAL INSTRUCTIONS:
1. Find ALL template risks - be completely EXHAUSTIVE with no limitations
2. Do NOT stop until you have analyzed EVERY template element
3. Analyze EVERY template field, variable, and customization point
4. Consider template usability, maintainability, and scalability
5. Include risks of ALL severities (high, medium, low)
6. Focus on TEMPLATE risks, NOT legal/contractual risks

${context && context.jurisdictionResearch ? `
JURISDICTION-SPECIFIC TEMPLATE REQUIREMENTS:
${context.jurisdictionResearch}
` : ''}

Provide your analysis as a JSON object:

{
  "risks": [
    {
      "clause": "EXACT quote of the problematic template text",
      "clauseLocation": "Section or field name where this appears",
      "riskLevel": "high" | "medium" | "low",
      "riskScore": number (1-10, where 10 is highest risk),
      "category": "Field Management" | "Variable Consistency" | "Data Validation" | "Template Structure" | "Version Control" | "Customization Complexity" | "User Guidance" | "Field Dependencies" | "Conditional Logic" | "Formatting Issues" | "Placeholder Management" | "Default Values" | "Required Fields" | "Optional Fields" | "Field Types" | "Input Validation" | "Cross-References" | "Template Sections" | "Reusability" | "Scalability" | "Maintenance" | "Documentation" | "Instructions" | "Examples" | "Error Handling" | "Edge Cases" | "Integration" | "Data Mapping" | "Export/Import" | "Compatibility" | "Performance" | "Template Size" | "Complexity" | "Nested Templates" | "Template Inheritance" | "Multi-Language" | "Accessibility" | "Compliance Fields" | "Jurisdiction Variations" | "Regional Differences" | "Industry Specifics" | "Client Customization" | "Vendor Adaptability" | "Template Evolution" | "Change Management" | "Approval Workflow" | "Template Testing" | "Quality Assurance" | "User Training" | "Template Governance" | "Access Control" | "Template Security" | "Data Privacy" | "Template Metrics" | "Usage Analytics" | "Template Lifecycle" | "Deprecation" | "Migration" | "Backward Compatibility" | "Forward Compatibility" | "Template Standards" | "Best Practices" | "Anti-Patterns" | "Common Mistakes" | "Template Debt" | "Refactoring Needs" | "Optimization" | "Other",
      "explanation": "Detailed explanation of why this is a template risk",
      "suggestion": "Specific recommendation to improve the template",
      "affectedParty": "Template Users" | "Template Administrators" | "End Clients" | "Legal Team" | "All Stakeholders",
      "templateImpact": "Usability" | "Maintainability" | "Scalability" | "Compliance" | "Quality" | "Efficiency",
      "jurisdictionSpecific": "Template concerns for specific jurisdictions"
    }
  ],
  "overallRiskScore": number (1-10),
  "executiveSummary": "High-level summary of the template's risk profile",
  "recommendations": ["Comprehensive list of ALL strategic recommendations for template improvement"],
  "missingFeatures": ["List ALL standard template features missing"],
  "jurisdictionGaps": ["Template gaps for different jurisdictions"]
}

${context ? `JURISDICTION-AWARE TEMPLATE ANALYSIS:
Primary Jurisdiction: ${context.jurisdictions.primary}
Additional Jurisdictions: ${context.jurisdictions.additional.map(j => `${j.name} (${j.purpose})`).join(', ')}

For EACH template risk, consider:
- Does the template support all required fields for each jurisdiction?
- Are there conflicting field requirements across jurisdictions?
- Can the template adapt to different jurisdictional formats?
- Are jurisdiction-specific instructions clear?` : ''}

Remember: Find ALL template risks comprehensively - there is NO LIMIT to the number of risks you should identify. Be EXHAUSTIVE and THOROUGH. Focus on TEMPLATE issues, not legal contract issues. Continue analyzing until you have identified EVERY possible template risk.

Template to analyze:
${templateContent}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 12000,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || "{}")
    
    // Process template risks
    const risks = (result.risks || []).map((risk: any, index: number) => ({
      id: `risk-${index}`,
      clause: risk.clause || "",
      clauseLocation: risk.clauseLocation || "Not specified",
      riskLevel: risk.riskLevel || "medium",
      riskScore: Math.min(Math.max(risk.riskScore || 5, 1), 10),
      category: risk.category || "Other",
      explanation: risk.explanation || "",
      suggestion: risk.suggestion || "",
      affectedParty: risk.affectedParty || "All Stakeholders",
      templateImpact: risk.templateImpact,
      jurisdictionSpecific: risk.jurisdictionSpecific
    }))
    
    const highRiskCount = risks.filter(r => r.riskLevel === 'high').length
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'medium').length
    const lowRiskCount = risks.filter(r => r.riskLevel === 'low').length
    
    console.log(`✅ Enhanced template analysis: ${risks.length} template risks found`)
    console.log(`📊 Risk breakdown: ${highRiskCount} high, ${mediumRiskCount} medium, ${lowRiskCount} low`)
    
    return {
      overallRiskScore: Math.min(Math.max(result.overallRiskScore || 5, 1), 10),
      totalRisksFound: risks.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      risks,
      recommendations: result.recommendations || [],
      executiveSummary: result.executiveSummary || "Template analysis completed.",
      missingFeatures: result.missingFeatures || [],
      jurisdictionGaps: result.jurisdictionGaps || []
    }
  } catch (error) {
    console.error('OpenAI enhanced template risk analysis error:', error)
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