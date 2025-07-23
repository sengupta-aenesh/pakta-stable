/**
 * Perplexity API Client for Legal Research
 * Provides real-time web search for jurisdiction-specific legal requirements
 */

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface PerplexityResponse {
  id: string
  model: string
  created: number
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  object: string
  choices: Array<{
    index: number
    finish_reason: string
    message: {
      role: string
      content: string
    }
    delta: {
      role: string
      content: string
    }
  }>
}

export interface LegalResearchQuery {
  jurisdictions: string[]
  topics: string[]
  contractType?: string
  specificQuestions?: string[]
}

export interface LegalResearchResult {
  jurisdiction: string
  findings: {
    topic: string
    content: string
    lastUpdated?: string
    sources?: string[]
  }[]
  searchedAt: Date
}

class PerplexityClient {
  private apiKey: string
  private baseUrl = 'https://api.perplexity.ai'

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || ''
    if (!this.apiKey) {
      console.warn('⚠️ Perplexity API key not found. Web search features will be disabled.')
    }
  }

  /**
   * Search for jurisdiction-specific legal requirements
   */
  async searchLegalRequirements(query: LegalResearchQuery): Promise<LegalResearchResult[]> {
    if (!this.apiKey) {
      console.log('📍 Perplexity search skipped - no API key configured')
      return []
    }

    const results: LegalResearchResult[] = []

    try {
      // Search for each jurisdiction
      for (const jurisdiction of query.jurisdictions) {
        const jurisdictionResults: LegalResearchResult = {
          jurisdiction,
          findings: [],
          searchedAt: new Date()
        }

        // Search for general requirements and each specific topic
        const searchQueries = [
          `${jurisdiction} contract law requirements ${query.contractType || 'commercial contracts'} 2024`,
          ...query.topics.map(topic => 
            `${jurisdiction} ${topic} compliance requirements foreign companies 2024`
          ),
          ...(query.specificQuestions || []).map(q => `${jurisdiction} ${q}`)
        ]

        for (let i = 0; i < searchQueries.length; i++) {
          const searchQuery = searchQueries[i]
          const topic = i === 0 ? 'General Requirements' : query.topics[i - 1] || 'Specific Query'

          try {
            const response = await this.performSearch(searchQuery)
            jurisdictionResults.findings.push({
              topic,
              content: response,
              lastUpdated: new Date().toISOString()
            })
          } catch (error) {
            console.error(`Failed to search for ${topic} in ${jurisdiction}:`, error)
          }
        }

        results.push(jurisdictionResults)
      }

      return results
    } catch (error) {
      console.error('Perplexity search error:', error)
      return []
    }
  }

  /**
   * Perform a single search query
   */
  private async performSearch(query: string): Promise<string> {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a legal research assistant. Provide concise, accurate information about legal requirements, focusing on practical compliance needs for businesses. Include recent updates and cite sources when possible.'
      },
      {
        role: 'user',
        content: query
      }
    ]

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'pplx-7b-online', // Online model for real-time web search
        messages,
        temperature: 0.2, // Low temperature for factual accuracy
        max_tokens: 1000,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`)
    }

    const data: PerplexityResponse = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  /**
   * Search for cross-border compliance requirements
   */
  async searchCrossBorderRequirements(
    primaryJurisdiction: string,
    additionalJurisdictions: string[],
    contractType?: string
  ): Promise<string> {
    if (!this.apiKey) {
      return ''
    }

    const query = `Cross-border contract requirements between ${primaryJurisdiction} and ${additionalJurisdictions.join(', ')} for ${contractType || 'commercial contracts'}. Focus on: governing law clauses, dispute resolution, enforceability, tax implications, data transfer restrictions.`

    try {
      return await this.performSearch(query)
    } catch (error) {
      console.error('Cross-border search error:', error)
      return ''
    }
  }

  /**
   * Search for recent legal updates
   */
  async searchRecentLegalUpdates(
    jurisdiction: string,
    topics: string[],
    sinceDate?: Date
  ): Promise<string> {
    if (!this.apiKey) {
      return ''
    }

    const dateStr = sinceDate ? sinceDate.toISOString().split('T')[0] : '2024-01-01'
    const query = `Recent legal updates in ${jurisdiction} since ${dateStr} affecting ${topics.join(', ')}. Include new regulations, court decisions, or compliance changes.`

    try {
      return await this.performSearch(query)
    } catch (error) {
      console.error('Legal updates search error:', error)
      return ''
    }
  }
}

// Export singleton instance
export const perplexityClient = new PerplexityClient()