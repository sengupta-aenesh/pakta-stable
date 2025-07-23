/**
 * Jurisdiction Research Service
 * Manages legal research across multiple jurisdictions with caching
 */

import { perplexityClient, LegalResearchResult } from './perplexity-client'
import { supabase } from '../supabase-client'

export interface JurisdictionContext {
  primary: string
  additional: Array<{
    code: string
    name: string
    purpose: string
    companies?: string[]
    complianceAreas?: string[]
  }>
}

export interface ResearchCache {
  key: string
  results: LegalResearchResult[]
  createdAt: Date
  expiresAt: Date
}

class JurisdictionResearchService {
  private cacheExpirationHours = 24 * 7 // 1 week cache
  private cache = new Map<string, ResearchCache>()

  /**
   * Research legal requirements for all configured jurisdictions
   */
  async researchJurisdictionRequirements(
    jurisdictions: JurisdictionContext,
    contractType?: string,
    contractContent?: string
  ): Promise<{
    research: LegalResearchResult[]
    fromCache: boolean
  }> {
    // Create cache key
    const cacheKey = this.createCacheKey(jurisdictions, contractType)
    
    // Check cache first
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log('📚 Using cached jurisdiction research')
      return { research: cached, fromCache: true }
    }

    console.log('🔍 Performing fresh jurisdiction research...')
    
    // Extract topics from contract if provided
    const topics = contractContent 
      ? this.extractTopicsFromContract(contractContent)
      : this.getDefaultTopics(contractType)

    // Prepare jurisdictions for search
    const allJurisdictions = [
      jurisdictions.primary,
      ...jurisdictions.additional.map(j => j.name)
    ]

    // Perform web search
    const research = await perplexityClient.searchLegalRequirements({
      jurisdictions: allJurisdictions,
      topics,
      contractType
    })

    // Add cross-border analysis if multiple jurisdictions
    if (jurisdictions.additional.length > 0) {
      const crossBorderAnalysis = await perplexityClient.searchCrossBorderRequirements(
        jurisdictions.primary,
        jurisdictions.additional.map(j => j.name),
        contractType
      )

      if (crossBorderAnalysis) {
        research.push({
          jurisdiction: 'Cross-Border Considerations',
          findings: [{
            topic: 'Multi-Jurisdiction Analysis',
            content: crossBorderAnalysis,
            lastUpdated: new Date().toISOString()
          }],
          searchedAt: new Date()
        })
      }
    }

    // Cache results
    this.saveToCache(cacheKey, research)

    return { research, fromCache: false }
  }

  /**
   * Format research results for OpenAI consumption
   */
  formatResearchForAI(research: LegalResearchResult[]): string {
    if (!research || research.length === 0) {
      return 'No jurisdiction-specific research available.'
    }

    let formatted = 'CURRENT JURISDICTION REQUIREMENTS (from web search):\n\n'

    for (const result of research) {
      formatted += `📍 ${result.jurisdiction.toUpperCase()}\n`
      formatted += `Searched: ${new Date(result.searchedAt).toLocaleString()}\n\n`

      for (const finding of result.findings) {
        formatted += `${finding.topic}:\n${finding.content}\n\n`
      }
      formatted += '---\n\n'
    }

    return formatted
  }

  /**
   * Extract relevant topics from contract content
   */
  private extractTopicsFromContract(content: string): string[] {
    const topics: string[] = []
    const contentLower = content.toLowerCase()

    // Check for common contract elements
    const topicPatterns = [
      { pattern: /data\s+(protection|privacy|security)/i, topic: 'data protection' },
      { pattern: /intellectual\s+property|copyright|patent|trademark/i, topic: 'intellectual property' },
      { pattern: /employment|employee|worker|staff/i, topic: 'employment law' },
      { pattern: /tax|taxation|withholding/i, topic: 'tax obligations' },
      { pattern: /export|import|customs|trade/i, topic: 'export controls' },
      { pattern: /confidential|non-disclosure|nda/i, topic: 'confidentiality' },
      { pattern: /payment|invoice|currency|exchange/i, topic: 'payment terms' },
      { pattern: /termination|breach|default/i, topic: 'termination clauses' },
      { pattern: /warranty|guarantee|liability/i, topic: 'warranties and liabilities' },
      { pattern: /dispute|arbitration|mediation|court/i, topic: 'dispute resolution' }
    ]

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(contentLower)) {
        topics.push(topic)
      }
    }

    // Add default topics if few found
    if (topics.length < 3) {
      topics.push('general contract requirements', 'regulatory compliance')
    }

    return [...new Set(topics)] // Remove duplicates
  }

  /**
   * Get default topics based on contract type
   */
  private getDefaultTopics(contractType?: string): string[] {
    const defaultTopics = ['contract formation', 'regulatory compliance', 'dispute resolution']

    const typeSpecificTopics: Record<string, string[]> = {
      'employment': ['employment law', 'worker rights', 'termination procedures'],
      'nda': ['confidentiality', 'intellectual property', 'trade secrets'],
      'service': ['service standards', 'payment terms', 'liability limits'],
      'sales': ['sales regulations', 'warranties', 'delivery terms'],
      'licensing': ['intellectual property', 'usage rights', 'royalties'],
      'partnership': ['partnership law', 'profit sharing', 'dissolution'],
      'vendor': ['procurement rules', 'performance standards', 'payment terms']
    }

    if (contractType) {
      const typeKey = contractType.toLowerCase()
      for (const [key, topics] of Object.entries(typeSpecificTopics)) {
        if (typeKey.includes(key)) {
          return [...defaultTopics, ...topics]
        }
      }
    }

    return defaultTopics
  }

  /**
   * Create cache key from jurisdiction context
   */
  private createCacheKey(jurisdictions: JurisdictionContext, contractType?: string): string {
    const jurisdictionStr = [
      jurisdictions.primary,
      ...jurisdictions.additional.map(j => j.name).sort()
    ].join('|')
    
    return `jurisdiction_research:${jurisdictionStr}:${contractType || 'general'}`
  }

  /**
   * Get from cache if valid
   */
  private getFromCache(key: string): LegalResearchResult[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (new Date() > cached.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return cached.results
  }

  /**
   * Save to cache
   */
  private saveToCache(key: string, results: LegalResearchResult[]): void {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.cacheExpirationHours * 60 * 60 * 1000)

    this.cache.set(key, {
      key,
      results,
      createdAt: now,
      expiresAt
    })

    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = Array.from(this.cache.keys())[0]
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Clear cache for specific jurisdictions
   */
  clearCache(jurisdictions?: JurisdictionContext): void {
    if (!jurisdictions) {
      this.cache.clear()
      return
    }

    // Clear specific jurisdiction entries
    const pattern = this.createCacheKey(jurisdictions, '')
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

// Export singleton instance
export const jurisdictionResearch = new JurisdictionResearchService()