import OpenAI from 'openai'
import type { ContractSummary, RiskAnalysis, RiskFactor } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const LEGAL_EXPERT_SYSTEM_PROMPT = `You are an elite legal contract analyst with 30+ years of experience in corporate law, contract negotiation, and risk assessment. You have:
- JD from Harvard Law School
- Experience as General Counsel for Fortune 500 companies
- Expertise in identifying contractual risks and protecting client interests
- Deep knowledge of legal precedents and industry standards
- Specialization in commercial contracts, employment agreements, NDAs, and service agreements

Your analysis should be thorough, precise, and actionable. Always cite specific clauses and provide practical recommendations.`

export async function extractAndAnalyzeText(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: LEGAL_EXPERT_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Extract and clean the text from this document. Remove any formatting artifacts, fix spacing issues, and ensure the contract text is properly structured with clear paragraph breaks. Preserve all legal language exactly as written.

Document content:
${content}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.1, // Low temperature for accuracy
    })
    
    return response.choices[0].message.content || ""
  } catch (error) {
    console.error('OpenAI extraction error:', error)
    throw error
  }
}

export async function summarizeContract(content: string): Promise<ContractSummary | { error: string; message: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: LEGAL_EXPERT_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `First, determine if this document is a legal contract, agreement, or legal document.

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
  "obligations": ["Array of key obligations as strings"]
}

All values must be strings or arrays of strings. If any information is not found, use "Not specified" or empty array. Respond only with valid JSON.

Document to analyze:
${content}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || "{}")
    
    // Check if it's an error response
    if (result.error === 'NOT_A_CONTRACT') {
      return {
        error: result.error,
        message: result.message
      }
    }
    
    return {
      overview: result.overview || "No overview available",
      contract_type: result.contract_type || "Unknown",
      key_terms: result.key_terms || {},
      important_dates: result.important_dates || [],
      parties: result.parties || [],
      obligations: result.obligations || []
    }
  } catch (error) {
    console.error('OpenAI summarization error:', error)
    throw error
  }
}

export async function identifyRiskyTerms(content: string): Promise<RiskAnalysis> {
  try {
    // For very large contracts, use chunk-based analysis
    const contentLength = content.length
    const maxChunkSize = 25000 // Conservative limit for comprehensive analysis
    
    if (contentLength > maxChunkSize) {
      console.log(`🔍 Large contract detected (${contentLength} chars), using comprehensive chunk analysis`)
      return await performComprehensiveChunkAnalysis(content)
    }
    
    // For normal-sized contracts, use enhanced single-pass analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${LEGAL_EXPERT_SYSTEM_PROMPT}

CRITICAL ANALYSIS INSTRUCTIONS:
- Perform EXHAUSTIVE risk analysis - do not artificially limit the number of risks
- Find ALL significant risks, whether 5 or 50+ risks exist
- Be thorough and comprehensive - every risky clause should be identified
- Prioritize accuracy and completeness over brevity`
        },
        {
          role: "user",
          content: `Perform a COMPREHENSIVE and EXHAUSTIVE legal risk analysis of this contract. Do NOT limit yourself to any specific number of risks - find ALL significant risks that exist in this contract, whether that's 5, 15, 25, or more.

**RISK IDENTIFICATION STRATEGY:**
1. Analyze EVERY clause, sentence, and provision systematically
2. Look for risks in ALL categories: Payment Terms, Liability, Termination, IP, Confidentiality, Dispute Resolution, Force Majeure, Warranties, Indemnification, Compliance, Governing Law, Amendment, Assignment, Severability, Integration, Notice, Performance Standards, Remedies, etc.
3. Consider both obvious and subtle legal risks
4. Identify risks for ALL parties involved, not just one side
5. Look for missing protective clauses as risks
6. Consider enforceability and compliance risks

**TEXT QUOTING RULES FOR ACCURATE MAPPING:**
- Quote the CORE RISKY PHRASE or sentence that contains the risk
- Keep quotes concise but complete enough to be uniquely identifiable
- If a risk spans multiple sentences, quote the most problematic sentence
- Remove excess surrounding text that doesn't contribute to the risk
- Ensure each quote is 15-200 words for optimal mapping accuracy
- Focus on the specific language that creates the legal risk

**EXAMPLES OF GOOD QUOTES:**
✅ GOOD: "shall be liable for all damages, costs, and expenses of any kind"
✅ GOOD: "may terminate this agreement at any time without cause or notice"
✅ GOOD: "confidential information includes any information disclosed by either party"
❌ TOO LONG: [entire 300-word paragraph]
❌ TOO SHORT: "terminate"

For EACH risk found, provide:
1. Precise quote of the risky text (15-200 words, core risk language only)
2. Section/clause location if identifiable
3. Risk level: high (7-10), medium (4-6), or low (1-3)
4. Specific risk score (1-10)
5. Risk category
6. Clear explanation of WHY this creates legal risk (2-3 sentences)
7. Specific improvement suggestion
8. Which party is most negatively affected
9. Relevant legal precedent or standard practice (if applicable)

Also provide:
- Overall risk score (1-10)
- Executive summary (2-3 sentences)
- Top 5 critical recommendations for risk mitigation

Format as JSON:
{
  "overallRiskScore": number,
  "executiveSummary": string,
  "risks": [
    {
      "clause": "precise quoted risky text (15-200 words)",
      "clauseLocation": "Section X.X or description",
      "riskLevel": "high|medium|low",
      "riskScore": number,
      "category": string,
      "explanation": string,
      "suggestion": string,
      "affectedParty": string,
      "legalPrecedent": string (optional)
    }
  ],
  "recommendations": [string, string, string, string, string]
}

**CONTRACT TO ANALYZE:**
${content}

Remember: Find ALL risks comprehensively - do not stop at an arbitrary number. Be exhaustive and thorough.`
        }
      ],
      max_tokens: 12000, // Increased for comprehensive analysis
      temperature: 0.2,  // Lower temperature for consistency
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || "{}")
    
    // Process and structure the risks with enhanced validation
    const risks: RiskFactor[] = (result.risks || []).map((risk: any, index: number) => {
      // Validate and clean the clause text for better mapping
      let clause = (risk.clause || "").trim()
      
      // Remove common formatting artifacts that interfere with mapping
      clause = clause.replace(/^\d+\.\s*/, '') // Remove leading numbers
      clause = clause.replace(/^[a-z]\)\s*/i, '') // Remove leading letters
      clause = clause.replace(/^\s*[-•]\s*/, '') // Remove leading bullets
      clause = clause.replace(/\s+/g, ' ') // Normalize whitespace
      
      return {
        id: `risk-${index}`,
        clause: clause,
        clauseLocation: risk.clauseLocation || "Not specified",
        riskLevel: risk.riskLevel || "medium",
        riskScore: risk.riskScore || 5,
        category: risk.category || "Other",
        explanation: risk.explanation || "",
        suggestion: risk.suggestion || "",
        legalPrecedent: risk.legalPrecedent,
        affectedParty: risk.affectedParty || "All parties"
      }
    })
    
    // Count risks by level
    const highRiskCount = risks.filter(r => r.riskLevel === 'high').length
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'medium').length
    const lowRiskCount = risks.filter(r => r.riskLevel === 'low').length
    
    console.log(`✅ Comprehensive risk analysis completed: ${risks.length} total risks found`)
    console.log(`📊 Risk breakdown: ${highRiskCount} high, ${mediumRiskCount} medium, ${lowRiskCount} low`)
    
    return {
      overallRiskScore: result.overallRiskScore || 5,
      totalRisksFound: risks.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      risks,
      recommendations: result.recommendations || [],
      executiveSummary: result.executiveSummary || "Contract analysis completed."
    }
  } catch (error) {
    console.error('OpenAI risk analysis error:', error)
    throw error
  }
}

// Enhanced chunk-based analysis for large contracts
async function performComprehensiveChunkAnalysis(content: string): Promise<RiskAnalysis> {
  console.log('🔍 Starting comprehensive chunk-based risk analysis...')
  
  // Split contract into logical sections for analysis
  const sections = splitContractIntoSections(content)
  console.log(`📄 Split contract into ${sections.length} sections for analysis`)
  
  const allRisks: RiskFactor[] = []
  let totalHighRisk = 0
  let totalMediumRisk = 0
  let totalLowRisk = 0
  
  // Analyze each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    if (section.content.trim().length < 100) continue // Skip very short sections
    
    console.log(`🔍 Analyzing section ${i + 1}/${sections.length}: ${section.title}`)
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${LEGAL_EXPERT_SYSTEM_PROMPT}
            
You are analyzing a SECTION of a larger contract. Be comprehensive for this section - find ALL risks within this section, whether 1 or 20+ risks exist. Do not limit yourself.`
          },
          {
            role: "user",
            content: `Analyze this CONTRACT SECTION for ALL legal risks. Find every significant risk in this section - do not limit the number of risks.

**SECTION: ${section.title}**
${section.content}

**ANALYSIS REQUIREMENTS:**
- Find ALL risks in this section (comprehensive analysis)
- Quote precise risky phrases (15-200 words each)
- Use section context: "${section.title}"
- Focus on mapping-friendly quotes that can be found in the text

Provide JSON with ALL risks found:
{
  "risks": [
    {
      "clause": "precise risky text quote",
      "clauseLocation": "${section.title}",
      "riskLevel": "high|medium|low",
      "riskScore": number,
      "category": string,
      "explanation": string,
      "suggestion": string,
      "affectedParty": string,
      "legalPrecedent": string (optional)
    }
  ]
}`
          }
        ],
        max_tokens: 6000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
      
      const sectionResult = JSON.parse(response.choices[0].message.content || '{"risks": []}')
      const sectionRisks = (sectionResult.risks || []).map((risk: any, riskIndex: number) => {
        // Clean and validate clause text
        let clause = (risk.clause || "").trim()
        clause = clause.replace(/^\d+\.\s*/, '')
        clause = clause.replace(/^[a-z]\)\s*/i, '')
        clause = clause.replace(/^\s*[-•]\s*/, '')
        clause = clause.replace(/\s+/g, ' ')
        
        const riskData = {
          id: `risk-${i}-${riskIndex}`,
          clause: clause,
          clauseLocation: risk.clauseLocation || section.title,
          riskLevel: risk.riskLevel || "medium",
          riskScore: risk.riskScore || 5,
          category: risk.category || "Other",
          explanation: risk.explanation || "",
          suggestion: risk.suggestion || "",
          legalPrecedent: risk.legalPrecedent,
          affectedParty: risk.affectedParty || "All parties"
        }
        
        // Count by level
        if (riskData.riskLevel === 'high') totalHighRisk++
        else if (riskData.riskLevel === 'medium') totalMediumRisk++
        else totalLowRisk++
        
        return riskData
      })
      
      allRisks.push(...sectionRisks)
      console.log(`✅ Section ${i + 1} analysis: ${sectionRisks.length} risks found`)
      
    } catch (error) {
      console.error(`❌ Error analyzing section ${i + 1}:`, error)
      continue
    }
  }
  
  // Generate overall assessment
  const overallRiskScore = Math.min(10, Math.max(1, 
    Math.round((totalHighRisk * 8 + totalMediumRisk * 5 + totalLowRisk * 2) / Math.max(1, allRisks.length))
  ))
  
  console.log(`✅ Comprehensive chunk analysis completed: ${allRisks.length} total risks`)
  console.log(`📊 Final breakdown: ${totalHighRisk} high, ${totalMediumRisk} medium, ${totalLowRisk} low`)
  
  return {
    overallRiskScore,
    totalRisksFound: allRisks.length,
    highRiskCount: totalHighRisk,
    mediumRiskCount: totalMediumRisk,
    lowRiskCount: totalLowRisk,
    risks: allRisks,
    recommendations: [
      "Review all high-risk items for immediate attention",
      "Consider legal counsel for contract modifications",
      "Implement risk mitigation strategies for medium-risk items",
      "Establish compliance monitoring for regulatory risks",
      "Document all agreed modifications in writing"
    ],
    executiveSummary: `Comprehensive analysis identified ${allRisks.length} legal risks across ${totalHighRisk + totalMediumRisk + totalLowRisk} categories. ${totalHighRisk} high-priority risks require immediate attention.`
  }
}

// Helper function to split contract into logical sections
function splitContractIntoSections(content: string): Array<{title: string, content: string}> {
  const sections: Array<{title: string, content: string}> = []
  
  // Common section patterns in legal contracts
  const sectionPatterns = [
    { pattern: /WHEREAS.*?(?=WHEREAS|NOW THEREFORE)/gis, title: "WHEREAS Clauses" },
    { pattern: /NOW,?\s*THEREFORE.*?(?=\d+\.|ARTICLE|SECTION|IN WITNESS)/gis, title: "Main Agreement" },
    { pattern: /\b(?:ARTICLE|SECTION)\s+[IVX\d]+[:\.].*?(?=ARTICLE|SECTION|IN WITNESS|$)/gis, title: "Article/Section" },
    { pattern: /\d+\.\s*[A-Z][^.]*\..*?(?=\d+\.|ARTICLE|SECTION|IN WITNESS|$)/gis, title: "Numbered Clause" },
    { pattern: /IN WITNESS WHEREOF.*$/gis, title: "Signature Section" }
  ]
  
  let remainingContent = content
  let processedLength = 0
  
  // Extract identifiable sections
  sectionPatterns.forEach((patternObj, patternIndex) => {
    const matches = content.match(patternObj.pattern)
    if (matches) {
      matches.forEach((match, matchIndex) => {
        const sectionContent = match.trim()
        if (sectionContent.length > 200) { // Only include substantial sections
          sections.push({
            title: `${patternObj.title} ${matchIndex + 1}`,
            content: sectionContent
          })
          processedLength += sectionContent.length
        }
      })
    }
  })
  
  // If we haven't captured most of the content with pattern matching, add chunks
  if (processedLength < content.length * 0.7) {
    console.log('📄 Adding additional content chunks for comprehensive coverage')
    
    const chunkSize = 4000
    const overlap = 200
    
    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunk = content.substring(i, i + chunkSize)
      if (chunk.trim().length > 500) {
        sections.push({
          title: `Content Section ${Math.floor(i / chunkSize) + 1}`,
          content: chunk
        })
      }
    }
  }
  
  // Ensure we have reasonable section sizes
  const finalSections = sections.filter(section => 
    section.content.length >= 200 && section.content.length <= 8000
  )
  
  return finalSections.length > 0 ? finalSections : [{ title: "Full Contract", content: content }]
}

export async function chatWithContract(content: string, question: string, previousMessages?: any[]): Promise<string> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: `${LEGAL_EXPERT_SYSTEM_PROMPT}
        
You are now analyzing a specific contract and answering questions about it. Always:
- Cite specific clauses or sections when referencing the contract
- Provide practical, actionable advice
- Explain legal concepts in clear, accessible language
- Warn about potential risks or concerns
- Suggest alternatives when appropriate`
      },
      {
        role: "user" as const,
        content: `Contract for reference:\n${content}`
      }
    ]
    
    // Add previous conversation if exists
    if (previousMessages && previousMessages.length > 0) {
      messages.push(...previousMessages)
    }
    
    // Add current question
    messages.push({
      role: "user" as const,
      content: question
    })
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    })
    
    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again."
  } catch (error) {
    console.error('OpenAI chat error:', error)
    throw error
  }
}

export async function explainLegalText(
  contractContext: string, 
  selectedText: string
): Promise<string> {
  console.log('explainLegalText called with:', { contractContextLength: contractContext.length, selectedTextLength: selectedText.length }) // Debug log
  
  try {
    console.log('Making OpenAI API call for explanation') // Debug log
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${LEGAL_EXPERT_SYSTEM_PROMPT}
          
You are explaining a specific clause or text from a legal contract. Provide:
1. Clear explanation in plain English of what this text means
2. Legal implications and significance for each party
3. Potential risks, benefits, or concerns this creates
4. How this compares to industry standard language
5. Any important legal precedents or considerations

Keep explanations concise but comprehensive (2-4 paragraphs max). Use accessible language while maintaining legal accuracy.`
        },
        {
          role: "user",
          content: `Contract context: ${contractContext}

Selected text to explain: "${selectedText}"

Please explain this legal text, its implications, and any concerns I should be aware of.`
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    })
    
    const result = response.choices[0].message.content || "I apologize, but I couldn't generate an explanation. Please try again."
    console.log('OpenAI explanation result:', result) // Debug log
    return result
  } catch (error) {
    console.error('OpenAI explain error:', error)
    throw new Error(`Explanation failed: ${error.message}`)
  }
}

export async function redraftLegalText(
  contractContext: string, 
  selectedText: string,
  userInstructions?: string
): Promise<{ redraftedText: string; explanation: string }> {
  console.log('redraftLegalText called with:', { contractContextLength: contractContext.length, selectedTextLength: selectedText.length, userInstructions }) // Debug log
  
  try {
    console.log('Making OpenAI API call for redraft') // Debug log
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${LEGAL_EXPERT_SYSTEM_PROMPT}
          
You are redrafting legal text to be clearer, fairer, and less risky while maintaining legal validity. Follow these principles:
1. Maintain legal accuracy and enforceability
2. Use clear, professional legal language appropriate for the document type
3. Preserve the original intent while reducing potential risks
4. Ensure fairness and balance between parties
5. Follow current legal best practices and standards

Respond with a JSON object containing:
{
  "redraftedText": "The improved version of the text",
  "explanation": "Brief explanation of what was changed and why (2-3 sentences)"
}`
        },
        {
          role: "user",
          content: `Contract context: ${contractContext}

Original text: "${selectedText}"

${userInstructions ? `Additional instructions: ${userInstructions}` : 'Please redraft this text to be clearer, fairer, and reduce potential legal risks while maintaining its original purpose.'}

Provide the improved version with explanation of changes.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.4,
      response_format: { type: "json_object" }
    })
    
    const responseContent = response.choices[0].message.content || '{}'
    console.log('OpenAI redraft raw response:', responseContent) // Debug log
    
    const result = JSON.parse(responseContent)
    console.log('Parsed redraft result:', result) // Debug log
    
    const finalResult = {
      redraftedText: result.redraftedText || selectedText,
      explanation: result.explanation || "No specific improvements identified."
    }
    console.log('Final redraft result:', finalResult) // Debug log
    
    return finalResult
  } catch (error) {
    console.error('OpenAI redraft error:', error)
    throw new Error(`Redraft failed: ${error.message}`)
  }
}

// Helper function to attempt completion of truncated JSON
function attemptJSONCompletion(truncatedJSON: string): string {
  console.log('🔧 Attempting to complete truncated JSON...')
  
  let completed = truncatedJSON.trim()
  
  // Count open and close brackets to determine what's missing
  const openBraces = (completed.match(/{/g) || []).length
  const closeBraces = (completed.match(/}/g) || []).length
  const openBrackets = (completed.match(/\[/g) || []).length
  const closeBrackets = (completed.match(/]/g) || []).length
  
  console.log('Bracket counts:', { openBraces, closeBraces, openBrackets, closeBrackets })
  
  // Remove any incomplete object at the end
  if (completed.endsWith(', {')) {
    completed = completed.slice(0, -3)
  } else if (completed.endsWith('{')) {
    completed = completed.slice(0, -1)
  } else if (completed.includes(', {') && !completed.trim().endsWith('}')) {
    // Find the last complete object
    const lastCompleteObject = completed.lastIndexOf('}, {')
    if (lastCompleteObject !== -1) {
      completed = completed.substring(0, lastCompleteObject + 1)
    }
  }
  
  // Add missing closing brackets and braces
  const missingCloseBrackets = openBrackets - closeBrackets
  const missingCloseBraces = openBraces - closeBraces
  
  // Add missing brackets first (arrays close before objects)
  for (let i = 0; i < missingCloseBrackets; i++) {
    completed += ']'
  }
  
  // Add missing braces
  for (let i = 0; i < missingCloseBraces; i++) {
    completed += '}'
  }
  
  console.log('✅ JSON completion attempt finished')
  return completed
}

// Step 1: Enhanced intelligent blank replacement with deep reasoning
export async function intelligentBlankReplacement(content: string): Promise<{ processedContent: string; replacements: any[] }> {
  console.log('intelligentBlankReplacement called with content length:', content.length)
  
  try {
    const response = await openai.chat.completions.create({
      model: "o1-mini", // Use o1-mini for deep reasoning and speed
      messages: [
        {
          role: "user",
          content: `You are an expert legal document processor. Your task is to analyze this contract and replace ALL generic blanks with specific, contextual bracketed placeholders.

**CRITICAL OBJECTIVE**: Every single blank must be replaced. No "_____" should remain in the output.

**CONTRACT TO PROCESS**:
${content}

**REPLACEMENT STRATEGY**:
1. **Find ALL blanks**: Look for any pattern of underscores: _, __, ___, ____, _____, ______, etc.
2. **Analyze context deeply**: What type of information should go in each blank?
3. **Create specific placeholders**: Replace with [Specific_Context_Name]
4. **Ensure completeness**: Verify NO blanks remain unreplaced

**EXAMPLES**:
- "______ day of _______, 2025" → "[Day_Number] day of [Month_Name], 2025"
- "son of _______" → "son of [Father_Full_Name]"
- "aged ____" → "aged [Person_Age]"
- "_______ dollars" → "[Amount_In_Dollars] dollars"
- "Phone: _______" → "Phone: [Phone_Number]"
- "_______ Street" → "[Street_Address] Street"
- "$______" → "$[Dollar_Amount]"

**OUTPUT REQUIREMENTS**:
1. Return the COMPLETE contract text with ALL blanks replaced
2. Use descriptive, specific bracket names
3. Maintain all original formatting and spacing
4. Ensure legal document structure is preserved
5. Every blank must be contextually appropriate

**VERIFICATION**: Before responding, double-check that:
- No "_" patterns remain in the text
- All replacements make contextual sense
- Legal document integrity is maintained

Respond with only the processed contract text with all blanks intelligently replaced with bracketed placeholders. Do not include JSON structure - just return the clean, processed contract text.`
        }
      ],
      max_completion_tokens: 16000,
      temperature: 0.1
    })

    const processedContent = response.choices[0].message.content || content
    
    // Count the replacements made by comparing original vs processed
    const originalBlanks = (content.match(/_+/g) || []).length
    const remainingBlanks = (processedContent.match(/_+/g) || []).length
    const replacementsMade = originalBlanks - remainingBlanks
    
    console.log('Intelligent blank replacement result:', {
      originalLength: content.length,
      processedLength: processedContent.length,
      originalBlanks,
      remainingBlanks,
      replacementsMade,
      conversionRate: `${replacementsMade}/${originalBlanks} (${((replacementsMade/originalBlanks)*100).toFixed(1)}%)`
    })
    
    // Warn if blanks remain
    if (remainingBlanks > 0) {
      console.warn(`⚠️ ${remainingBlanks} blanks still remain in processed content`)
    }
    
    return {
      processedContent: processedContent,
      replacements: [{
        totalOriginalBlanks: originalBlanks,
        totalReplaced: replacementsMade,
        remainingBlanks: remainingBlanks,
        conversionSuccess: remainingBlanks === 0
      }]
    }
  } catch (error) {
    console.error('OpenAI intelligent blank replacement error:', error)
    // Return original content if replacement fails
    return {
      processedContent: content,
      replacements: []
    }
  }
}

// Step 2: Fast quality check the processed contract
export async function qualityCheckContract(processedContent: string, originalContent: string, replacements: any[]): Promise<{ isValid: boolean; issues: string[]; recommendations: string[] }> {
  console.log('qualityCheckContract called')
  
  // Fast local validation checks first
  const localChecks = {
    hasRemainingBlanks: (processedContent.match(/_+/g) || []).length > 0,
    contentLengthChange: Math.abs(processedContent.length - originalContent.length),
    hasBrackets: (processedContent.match(/\[.*?\]/g) || []).length > 0
  }
  
  // If basic checks pass, return quickly without API call
  if (!localChecks.hasRemainingBlanks && localChecks.hasBrackets) {
    console.log('✅ Fast quality check passed - no API call needed')
    return {
      isValid: true,
      issues: [],
      recommendations: ['All blanks successfully converted to bracketed placeholders']
    }
  }
  
  // Only call API if there are potential issues
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use faster model for quality check
      messages: [
        {
          role: "user",
          content: `Quick quality check: This contract had ${replacements[0]?.totalOriginalBlanks || 0} blanks. 
          
After processing: ${replacements[0]?.remainingBlanks || 0} blanks remain.
          
Processed content preview: "${processedContent.substring(0, 500)}..."

Is this acceptable? Respond with JSON:
{
  "isValid": true/false,
  "issues": ["brief list of issues"],
  "overallQuality": "good/poor"
}`
        }
      ],
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    console.log('Quality check result:', result)
    
    return {
      isValid: result.isValid !== false, // Default to true
      issues: result.issues || [],
      recommendations: []
    }
  } catch (error) {
    console.error('OpenAI quality check error:', error)
    return {
      isValid: true, // Default to valid if check fails
      issues: [],
      recommendations: []
    }
  }
}

// Two-step approach: Convert blanks to brackets, then extract for user input
export async function extractMissingInfo(content: string): Promise<any> {
  console.log('extractMissingInfo called with content length:', content.length)
  
  try {
    // Step 1: Check for blank patterns and convert if needed
    const originalBlanks = (content.match(/_+/g) || []).length
    let processedContent = content
    let conversionSuccess = true
    let remainingBlanks = 0
    
    if (originalBlanks > 0) {
      console.log(`🔄 Step 1: Converting ${originalBlanks} blank patterns to bracketed placeholders...`)
      
      // Check if content is too large for single processing
      const contentLength = content.length
      const maxSafeLength = 30000 // Conservative limit for gpt-4o
      
      if (contentLength > maxSafeLength) {
        console.log(`⚠️ Content too large (${contentLength} chars), using fallback strategy`)
        // For very large contracts, skip Step 1 and work with original content
        processedContent = content
        remainingBlanks = originalBlanks
        conversionSuccess = false
        console.log('🔄 Step 1: Skipped due to size - will work with original underscore patterns')
      } else {
        const step1Response = await openai.chat.completions.create({
          model: "gpt-4o", // Use reliable model
          messages: [
            {
              role: "system",
              content: `You are an expert legal document processor. Your task is to find ALL underscore patterns (blanks) in the contract and replace them with specific, contextual bracketed placeholders.

CRITICAL RULES:
1. Find EVERY underscore pattern: _, __, ___, ____, _____, ______, etc.
2. Replace each with a descriptive bracketed placeholder like [Execution_Date], [Company_Name], etc.
3. Preserve ALL original text except the underscore patterns
4. Use context to determine what type of information belongs in each blank
5. Make placeholder names specific and descriptive
6. Ensure NO underscore patterns remain in the output`
            },
            {
              role: "user",
              content: `Convert ALL underscore patterns in this contract to bracketed placeholders:

${content}

Examples of conversions:
- "made at Mumbai on the _______________" → "made at Mumbai on the [Execution_Date]"
- "having CIN No. ____________" → "having CIN No. [CIN_Number]"
- "__________, having DIN _________" → "[Director_Name], having DIN [Director_DIN]"

Return the complete contract with ALL blanks converted to bracketed placeholders. Preserve all formatting and spacing.`
            }
          ],
          max_completion_tokens: 16000,
          temperature: 0.1
        })

        processedContent = step1Response.choices[0].message.content || content
        
        // Debug the response
        console.log('Step 1 raw response length:', processedContent.length)
        console.log('Step 1 response preview:', processedContent.substring(0, 500) + '...')
        
        // Count conversion success
        remainingBlanks = (processedContent.match(/_+/g) || []).length
        conversionSuccess = remainingBlanks === 0
        
        console.log(`Step 1 Results: ${originalBlanks} blanks found, ${remainingBlanks} remaining, ${conversionSuccess ? 'SUCCESS' : 'PARTIAL'}`)
        
        if (!conversionSuccess) {
          console.warn(`⚠️ ${remainingBlanks} blanks still remain after conversion`)
          // If Step 1 completely failed, we might need a different approach
          if (remainingBlanks === originalBlanks) {
            console.warn('🚨 Step 1 completely failed - no conversion happened. Using original content.')
            processedContent = content
          }
        }
      }
    } else {
      console.log('🔄 Step 1: No underscore blanks found, skipping conversion step')
    }

    // Step 2: Comprehensive missing information detection
    console.log('🔄 Step 2: Analyzing contract for ALL missing information...')
    
    // Use a more focused approach if Step 1 failed completely
    const useOriginalContent = (remainingBlanks === originalBlanks && originalBlanks > 0)
    const contentToAnalyze = useOriginalContent ? content : processedContent
    const contentLength = contentToAnalyze.length
    
    console.log(`Using ${useOriginalContent ? 'original' : 'processed'} content for analysis (${contentLength} chars)`)
    
    // For very large contracts, we need to be more strategic
    let analysisContent = contentToAnalyze
    let truncated = false
    
    if (contentLength > 25000) {
      // For large contracts, focus on sections most likely to have blanks
      console.log('⚠️ Large contract detected - using strategic analysis')
      
      // Extract sections with more comprehensive pattern matching
      const extractedSections: string[] = []
      
      // Method 1: Find all lines with underscore patterns and their context
      const lines = contentToAnalyze.split('\n')
      const linesWithBlanks: string[] = []
      
      lines.forEach((line, index) => {
        if (/_+/.test(line)) {
          // Include 2 lines before and after for context
          const contextStart = Math.max(0, index - 2)
          const contextEnd = Math.min(lines.length, index + 3)
          const contextLines = lines.slice(contextStart, contextEnd)
          linesWithBlanks.push(contextLines.join('\n'))
        }
      })
      
      if (linesWithBlanks.length > 0) {
        extractedSections.push(...linesWithBlanks)
        console.log(`📍 Found ${linesWithBlanks.length} sections with underscore patterns`)
      }
      
      // Method 2: Extract key legal sections that commonly have blanks
      const keyPatterns = [
        /this\s+agreement.*?made.*?on.*?between.*?(?=\n\n|\r\n\r\n|whereas|now therefore)/si, // Agreement header
        /whereas.*?(?=now therefore)/si, // Whereas clauses  
        /now therefore.*?(?=in witness|$)/si, // Main agreement body
        /in witness.*?(?=$)/si, // Signature section
        /party.*?(?:name|address).*?(?=\n\n|\r\n\r\n|party|whereas)/si, // Party information
        /signed.*?dated.*?(?=\n\n|\r\n\r\n|$)/si, // Signature and date sections
        /amount.*?(?:rupees|dollars|inr|usd).*?(?=\n\n|\r\n\r\n|$)/si, // Amount sections
        /schedule.*?(?=\n\n|\r\n\r\n|$)/si, // Schedule/Annexure sections
        /annexure.*?(?=\n\n|\r\n\r\n|$)/si // Annexure sections
      ]
      
      keyPatterns.forEach(pattern => {
        const matches = contentToAnalyze.match(pattern)
        if (matches) {
          extractedSections.push(...matches)
        }
      })
      
      // Method 3: If we still don't have enough content, use sliding windows
      if (extractedSections.join('').length < 15000) {
        console.log('📄 Adding sliding window sections for comprehensive analysis')
        const windowSize = 3000
        const overlap = 500
        
        for (let i = 0; i < contentToAnalyze.length; i += windowSize - overlap) {
          const window = contentToAnalyze.substring(i, i + windowSize)
          if (/_+/.test(window) || /\[.*?\]/.test(window)) {
            extractedSections.push(window)
          }
        }
      }
      
      // If we found key sections, use them; otherwise truncate intelligently
      if (extractedSections.length > 0) {
        analysisContent = extractedSections.join('\n\n')
        console.log(`📝 Extracted ${extractedSections.length} key sections (${analysisContent.length} chars)`)
      } else {
        // Fallback: take first and last parts of the contract
        const firstPart = contentToAnalyze.substring(0, 12000)
        const lastPart = contentToAnalyze.substring(contentToAnalyze.length - 8000)
        analysisContent = firstPart + '\n\n[... MIDDLE SECTION TRUNCATED ...]\n\n' + lastPart
        truncated = true
        console.log(`📄 Using truncated analysis (${analysisContent.length} chars)`)
      }
    }
    
    const step2Response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert legal analyst. Your task is to identify ALL information that is missing, incomplete, or needs to be filled in a contract${truncated ? ' (note: this is a large contract and some middle sections may be truncated)' : ''}. 

Focus on:
1. Underscore patterns: _, __, ___, ____, _____, etc.
2. Bracketed placeholders like [Something]
3. Generic terms that should be specific (e.g., "the parties", "the company")
4. Missing dates, amounts, names, addresses
5. Incomplete clauses or sections
6. Template fields that weren't filled
7. Any information a lawyer would need to complete before execution

Be comprehensive and think like a legal professional reviewing a contract for completeness.`
        },
        {
          role: "user",
          content: `Analyze this contract section by section and identify EVERY piece of missing or incomplete information:

CONTRACT${truncated ? ' (EXTRACTED SECTIONS)' : ''}:
${analysisContent}

**CRITICAL INSTRUCTIONS:**
1. Scan EVERY line for underscore patterns: _, __, ___, ____, _____, etc.
2. Look for bracketed placeholders: [Something]
3. Find generic terms that need specifics: "the Company", "such amount", "the parties"
4. Identify incomplete dates, names, addresses, amounts
5. Don't miss any fields - be exhaustive and systematic

**SEARCH PATTERNS TO FIND:**
- Date blanks: "dated ____", "on the ____", "__ day of __"
- Name blanks: "____, having", "Mr./Ms. ____", "son/daughter of ____"
- Address blanks: "residing at ____", "office at ____"
- Amount blanks: "Rs. ____", "amount of ____", "sum of ____"
- Legal blanks: "CIN No. ____", "PAN ____", "DIN ____"
- Signature blanks: "signed by ____", "witness ____"

**CRITICAL DATE STANDARDIZATION RULES:**
ALL date expressions should be standardized to the format: "9th day of January, 2025"

**DATE PATTERN REPLACEMENT STRATEGY:**
1. Identify the ENTIRE date expression that needs standardization
2. Replace the COMPLETE expression with a single date field
3. The user will input a date, and it will be converted to "Xth day of Month, Year" format

**EXAMPLES OF CORRECT DATE STANDARDIZATION:**
❌ WRONG: "27th day of _____ of April" → Multiple separate fields
✅ CORRECT: "27th day of _____ of April" → targetText: "27th day of _____ of April", fieldType: "date", label: "Date", description: "Will be formatted as 'Xth day of Month, Year'"

❌ WRONG: "__ day of April, 2024" → Separate day field
✅ CORRECT: "__ day of April, 2024" → targetText: "__ day of April, 2024", fieldType: "date", label: "Date", description: "Will be formatted as 'Xth day of Month, Year'"

❌ WRONG: "dated ____" → Keep as is
✅ CORRECT: "dated ____" → targetText: "dated ____", fieldType: "date", label: "Date", description: "Will be formatted as 'dated Xth day of Month, Year'"

**IDENTIFY COMPLETE DATE EXPRESSIONS:**
Look for these patterns and replace the ENTIRE expression:
- "X day of Y, Z" or "X day of Y of Z"
- "__ day of ____" or "__ day of ____, ____"
- "dated ____" or "on ____" or "this __ day of ____"
- Any combination that represents a date structure

**TARGET TEXT SHOULD BE THE FULL DATE EXPRESSION, NOT INDIVIDUAL BLANKS**

For EACH blank found, provide:
- Exact underscore pattern to replace
- What SPECIFIC PART of information goes there (not full date if it's part of a larger date structure)
- Context around the blank

Respond with JSON:
{
  "missingInfo": [
    {
      "id": "unique_id",
      "label": "User Friendly Label",
      "description": "What information is needed",
      "placeholder": "Input placeholder",
      "fieldType": "text|date|number|email|address",
      "importance": "critical|important|optional",
      "legalContext": "Why this is legally required",
      "targetText": "exact underscore pattern to replace",
      "context": "surrounding text with the blank",
      "userInput": ""
    }
  ]
}

BE COMPREHENSIVE - Don't miss any blanks! Every underscore pattern should be identified.`
        }
      ],
      max_tokens: 8000,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })

    const step2Content = step2Response.choices[0].message.content || '{}'
    
    // Parse Step 2 response with robust error handling
    let extractionResult
    try {
      extractionResult = JSON.parse(step2Content)
      console.log('✅ Successfully parsed extraction result:', extractionResult.missingInfo?.length || 0, 'items')
    } catch (parseError) {
      console.error('❌ JSON Parse Error in Step 2:', parseError)
      console.log('Raw response length:', step2Content.length)
      console.log('Raw response preview:', step2Content.substring(0, 1000) + '...')
      console.log('Raw response ending:', '...' + step2Content.substring(step2Content.length - 500))
      
      // Try to repair truncated JSON
      try {
        const repairedJSON = attemptJSONCompletion(step2Content)
        extractionResult = JSON.parse(repairedJSON)
        console.log('✅ Successfully parsed repaired JSON:', extractionResult.missingInfo?.length || 0, 'items')
      } catch (repairError) {
        console.error('❌ JSON repair also failed:', repairError)
        // Try to extract partial data by looking for the missingInfo array start
        try {
          const missingInfoMatch = step2Content.match(/"missingInfo"\s*:\s*\[(.*?)(?:\]|}|$)/s)
          if (missingInfoMatch) {
            const partialArray = '[' + missingInfoMatch[1] + ']'
            const partialData = JSON.parse(partialArray)
            extractionResult = { missingInfo: partialData }
            console.log('🔧 Extracted partial data:', partialData.length, 'items')
          } else {
            extractionResult = { missingInfo: [] }
          }
        } catch (partialError) {
          console.error('❌ Partial extraction failed:', partialError)
          extractionResult = { missingInfo: [] }
        }
      }
    }

    const missingInfo = extractionResult.missingInfo || []

    // Validation: Check if we missed any underscore patterns
    const allUnderscorePatterns = (contentToAnalyze.match(/_+/g) || [])
    const uniquePatterns = [...new Set(allUnderscorePatterns)]
    const detectedPatterns = missingInfo.map(item => item.targetText).filter(text => /_+/.test(text))
    
    console.log(`📊 Validation: ${uniquePatterns.length} unique underscore patterns found, ${detectedPatterns.length} detected by AI`)
    
    // If we missed significant patterns, add them as generic items
    if (detectedPatterns.length < uniquePatterns.length * 0.8) {
      console.log('⚠️ Potential missing patterns detected, adding fallback items')
      
      uniquePatterns.forEach((pattern, index) => {
        const alreadyDetected = missingInfo.some(item => item.targetText === pattern)
        if (!alreadyDetected) {
          // Find first occurrence for context
          const patternIndex = contentToAnalyze.indexOf(pattern)
          if (patternIndex !== -1) {
            const contextStart = Math.max(0, patternIndex - 60)
            const contextEnd = Math.min(contentToAnalyze.length, patternIndex + pattern.length + 60)
            const context = contentToAnalyze.substring(contextStart, contextEnd)
            
            // Intelligent analysis of what this pattern might be for
            let label = `Missing Information ${index + 1}`
            let description = `Information needed for underscore pattern: ${pattern}`
            let placeholder = 'Enter required information'
            let fieldType = 'text'
            
            // Smart detection for date components
            const contextLower = context.toLowerCase()
            if (contextLower.includes('day of') && contextLower.includes('month')) {
              if (contextLower.match(/\d+(st|nd|rd|th)?\s+day\s+of.*?month\s+of/)) {
                label = 'Month Name'
                description = 'Name of the month'
                placeholder = 'Enter month (e.g., January, February, March)'
                fieldType = 'text'
              }
            } else if (contextLower.match(/day\s+of.*?,\s*\d{4}/)) {
              label = 'Month Name'
              description = 'Name of the month'
              placeholder = 'Enter month (e.g., January, February, March)'
              fieldType = 'text'
            } else if (contextLower.match(/^\s*\w*\s+day\s+of/)) {
              label = 'Day Number'
              description = 'Day of the month with ordinal'
              placeholder = 'Enter day (e.g., 1st, 2nd, 27th)'
              fieldType = 'text'
            } else if (contextLower.includes('dated') || contextLower.includes('date')) {
              label = 'Date'
              description = 'Complete date'
              placeholder = 'Enter date'
              fieldType = 'date'
            } else if (contextLower.includes('cin') || contextLower.includes('corporate identification')) {
              label = 'CIN Number'
              description = 'Corporate Identification Number'
              placeholder = 'Enter CIN (e.g., L12345AB1234PLC567890)'
              fieldType = 'text'
            } else if (contextLower.includes('pan')) {
              label = 'PAN Number'
              description = 'Permanent Account Number'
              placeholder = 'Enter PAN (e.g., ABCDE1234F)'
              fieldType = 'text'
            } else if (contextLower.includes('din')) {
              label = 'DIN Number'
              description = 'Director Identification Number'
              placeholder = 'Enter DIN (e.g., 12345678)'
              fieldType = 'text'
            } else if (contextLower.includes('rupees') || contextLower.includes('amount') || contextLower.includes('rs.')) {
              label = 'Amount'
              description = 'Monetary amount'
              placeholder = 'Enter amount'
              fieldType = 'number'
            } else if (contextLower.includes('address') || contextLower.includes('residing')) {
              label = 'Address'
              description = 'Complete address'
              placeholder = 'Enter address'
              fieldType = 'address'
            } else if (contextLower.includes('name') || contextLower.includes('having din') || contextLower.includes('son of') || contextLower.includes('daughter of')) {
              label = 'Name'
              description = 'Person or entity name'
              placeholder = 'Enter name'
              fieldType = 'text'
            }
            
            missingInfo.push({
              id: `fallback_${index}`,
              label: label,
              description: description,
              placeholder: placeholder,
              fieldType: fieldType,
              importance: 'important',
              legalContext: 'Required field identified in contract',
              targetText: pattern,
              context: context,
              userInput: ''
            })
          }
        }
      })
      
      console.log(`📝 Added ${missingInfo.length - extractionResult.missingInfo.length} fallback items`)
    }

    // Additional step: Standardize date expressions to uniform format
    console.log('🔄 Standardizing date expressions to uniform format...')
    
    // Find date patterns that should be combined into single standardized expressions
    const datePatterns = [
      // Pattern: "27th day of _____ of April" or similar
      /(\d+(?:st|nd|rd|th)?\s+day\s+of\s+_+\s+of\s+\w+)/gi,
      // Pattern: "__ day of Month, Year" 
      /(_+\s+day\s+of\s+\w+,?\s*\d{4})/gi,
      // Pattern: "this __ day of ____"
      /(this\s+_+\s+day\s+of\s+_+)/gi,
      // Pattern: "dated ____"
      /(dated\s+_+)/gi,
      // Pattern: "on the ____"
      /(on\s+the\s+_+)/gi
    ]
    
    const processedPatterns = new Set()
    const newDateItems: any[] = []
    
    datePatterns.forEach(pattern => {
      const matches = contentToAnalyze.match(pattern)
      if (matches) {
        matches.forEach(match => {
          if (!processedPatterns.has(match.toLowerCase())) {
            processedPatterns.add(match.toLowerCase())
            
            // Check if this pattern is already covered by existing items
            const alreadyCovered = missingInfo.some(item => 
              item.targetText && match.toLowerCase().includes(item.targetText.toLowerCase())
            )
            
            if (!alreadyCovered) {
              // Find context for this pattern
              const patternIndex = contentToAnalyze.toLowerCase().indexOf(match.toLowerCase())
              if (patternIndex !== -1) {
                const contextStart = Math.max(0, patternIndex - 60)
                const contextEnd = Math.min(contentToAnalyze.length, patternIndex + match.length + 60)
                const context = contentToAnalyze.substring(contextStart, contextEnd)
                
                newDateItems.push({
                  id: `date_${newDateItems.length}`,
                  label: 'Date',
                  description: 'Date that will be formatted as "Xth day of Month, Year"',
                  placeholder: 'Select date',
                  fieldType: 'date',
                  importance: 'critical',
                  legalContext: 'Date field requiring standardized format',
                  targetText: match,
                  context: context,
                  userInput: ''
                })
                
                console.log(`📅 Found date pattern for standardization: "${match}"`)
              }
            }
          }
        })
      }
    })
    
    // Add the new standardized date items
    missingInfo.push(...newDateItems)
    
    // Remove individual date component items that are now covered by standardized expressions
    const filteredMissingInfo = missingInfo.filter(item => {
      // If this item is part of a larger date expression that we now handle, remove it
      const isPartOfLargerDate = newDateItems.some(dateItem => 
        dateItem.targetText.toLowerCase().includes(item.targetText?.toLowerCase() || '')
      )
      
      if (isPartOfLargerDate) {
        console.log(`📅 Removed component date field: "${item.label}" (now part of standardized date)`)
        return false
      }
      return true
    })
    
    // Replace missingInfo with filtered version
    missingInfo.length = 0
    missingInfo.push(...filteredMissingInfo)

    // Step 3: Find actual occurrences in the processed content for replacement
    console.log('🔄 Step 3: Mapping target text occurrences for replacement...')
    const processedMissingInfo = missingInfo.map((item: any, index: number) => {
      const targetText = item.targetText || item.bracketedPlaceholder || ''
      const allOccurrences: any[] = []
      
      if (targetText) {
        // Find ALL occurrences of this target text in the FULL original content
        // (even if we analyzed a truncated version, we need to replace in the full content)
        let searchIndex = 0
        while (true) {
          const index = contentToAnalyze.indexOf(targetText, searchIndex)
          if (index === -1) break
          
          // Get surrounding context (80 chars before and after for better context)
          const contextStart = Math.max(0, index - 80)
          const contextEnd = Math.min(contentToAnalyze.length, index + targetText.length + 80)
          const contextText = contentToAnalyze.substring(contextStart, contextEnd)
          
          allOccurrences.push({
            text: targetText,
            position: {
              start: index,
              end: index + targetText.length
            },
            context: contextText
          })
          
          searchIndex = index + 1
        }
      }
      
      console.log(`📍 Found ${allOccurrences.length} occurrences for "${item.label}": "${targetText}"`)
      
      return {
        id: item.id || `field_${index}`,
        label: item.label || `Field ${index + 1}`,
        description: item.description || 'Information needed',
        placeholder: item.placeholder || 'Enter information',
        fieldType: item.fieldType || 'text',
        importance: item.importance || 'important',
        legalContext: item.legalContext || '',
        context: item.context || (allOccurrences[0]?.context || ''),
        occurrences: allOccurrences,
        userInput: ''
      }
    })

    // Filter out items with no occurrences
    const validMissingInfo = processedMissingInfo.filter(item => item.occurrences.length > 0)
    
    console.log(`✅ Final result: ${validMissingInfo.length} fields ready for user input`)
    
    return {
      missingInfo: validMissingInfo,
      processedContent: processedContent, // Include processed content for contract update
      processingSteps: {
        step1: {
          name: originalBlanks > 0 ? 'Blank to Bracket Conversion' : 'Blank Detection',
          originalBlanks: originalBlanks,
          remainingBlanks: originalBlanks > 0 ? remainingBlanks : 0,
          conversionSuccess: conversionSuccess,
          skipped: originalBlanks === 0 || contentLength > 30000,
          sizeLimited: contentLength > 30000
        },
        step2: {
          name: 'Smart Contract Analysis',
          itemsDetected: missingInfo.length,
          validItems: validMissingInfo.length,
          analysisType: truncated ? 'strategic_sections' : useOriginalContent ? 'full_original' : 'full_processed',
          contentAnalyzed: analysisContent.length,
          originalSize: contentLength
        },
        step3: {
          name: 'Occurrence Mapping',
          totalOccurrences: validMissingInfo.reduce((sum, item) => sum + item.occurrences.length, 0),
          mappingStrategy: 'full_content_search'
        }
      }
    }
  } catch (error) {
    console.error('OpenAI missing info extraction error:', error)
    throw new Error(`Missing info extraction failed: ${error.message}`)
  }
}