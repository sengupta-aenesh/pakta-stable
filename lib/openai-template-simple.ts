import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️ OPENAI_API_KEY environment variable is not set!')
}

export interface TemplateVariable {
  id: string
  label: string
  description: string
  placeholder: string
  fieldType: 'text' | 'date' | 'number' | 'email' | 'address'
  occurrences: Array<{
    text: string
    position: number
    length: number
    context: string
  }>
}

export interface TemplateAnalysisResult {
  summary: {
    overview: string
    templateType: string
    totalVariables: number
  }
  variables: TemplateVariable[]
}

const TEMPLATE_ANALYSIS_PROMPT = `You are an expert template analyst. Analyze this legal template and:

1. Provide a brief summary of what this template is for
2. Identify ALL variables/placeholders that need to be filled in

IMPORTANT: Look for these specific patterns:
- Square brackets: [Company Name], [Date], [Amount], [Service Provider Name], etc.
- Underscores: ______ (blanks to be filled)
- Curly braces: {{name}}, {variable}
- Dollar syntax: \${variable}
- Any placeholder text that clearly needs customization

CRITICAL: Find EVERY instance of square brackets [like this] - these are template variables!

For each variable found, track ALL occurrences with their exact position.

Respond with this exact JSON structure:
{
  "summary": {
    "overview": "Brief description of template purpose",
    "templateType": "e.g., Service Agreement Template",
    "totalVariables": number
  },
  "variables": [
    {
      "id": "unique_id",
      "label": "User-friendly name",
      "description": "What this field is for",
      "placeholder": "Example value",
      "fieldType": "text|date|number|email|address",
      "occurrences": [
        {
          "text": "exact text found",
          "position": character_position,
          "length": text_length,
          "context": "surrounding text"
        }
      ]
    }
  ]
}`

export async function analyzeTemplate(content: string): Promise<TemplateAnalysisResult> {
  console.log('🚀 Starting simplified template analysis, content length:', content.length)
  
  // Log first 200 characters of content to verify we're getting actual template content
  console.log('📝 Template preview:', content.substring(0, 200) + '...')
  
  try {
    // For very large templates, we need to be smart about what we send
    let analysisContent = content
    let isPartial = false
    
    if (content.length > 30000) {
      console.log('📄 Large template detected, using smart extraction')
      
      // Extract sections with likely variables
      const lines = content.split('\n')
      const relevantSections: string[] = []
      
      lines.forEach((line, index) => {
        // Look for lines with variable patterns
        if (/\[.*?\]|_{3,}|\{\{.*?\}\}|\$\{.*?\}/.test(line)) {
          // Get context (2 lines before, 2 lines after)
          const start = Math.max(0, index - 2)
          const end = Math.min(lines.length, index + 3)
          relevantSections.push(lines.slice(start, end).join('\n'))
        }
      })
      
      if (relevantSections.length > 0) {
        analysisContent = relevantSections.join('\n---\n')
        isPartial = true
      } else {
        // Fallback: take beginning and end
        analysisContent = content.substring(0, 15000) + '\n\n[...]\n\n' + content.substring(content.length - 10000)
        isPartial = true
      }
    }
    
    console.log('🤖 Calling OpenAI API...')
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: TEMPLATE_ANALYSIS_PROMPT + (isPartial ? '\n\nNOTE: This is a partial template. Some sections may be missing.' : '')
        },
        {
          role: "user",
          content: `Analyze this template and identify ALL variables that need to be filled in.

EXAMPLE: In text like "This Agreement is entered into on [Date] between [Company Name]", you should identify:
- Variable: "Date" (from [Date])
- Variable: "Company Name" (from [Company Name])

Find ALL such variables in square brackets [like this] or other placeholder formats.

TEMPLATE TO ANALYZE:
${analysisContent}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
    })
    
    console.log('🎉 OpenAI API response received')
    
    const rawContent = response.choices[0].message.content || '{}'
    console.log('📝 Raw AI response:', rawContent.substring(0, 500) + '...')
    
    const result = JSON.parse(rawContent)
    
    // If we used partial content, we need to find actual positions in full content
    if (isPartial && result.variables) {
      console.log('📍 Re-mapping variable positions to full content')
      
      result.variables = result.variables.map((variable: any) => {
        const updatedOccurrences: any[] = []
        
        // Find all occurrences in the full content
        if (variable.occurrences && variable.occurrences.length > 0) {
          const searchText = variable.occurrences[0].text
          let position = 0
          
          while (position < content.length) {
            const index = content.indexOf(searchText, position)
            if (index === -1) break
            
            // Get context
            const contextStart = Math.max(0, index - 50)
            const contextEnd = Math.min(content.length, index + searchText.length + 50)
            const context = content.substring(contextStart, contextEnd)
            
            updatedOccurrences.push({
              text: searchText,
              position: index,
              length: searchText.length,
              context: context
            })
            
            position = index + 1
          }
        }
        
        return {
          ...variable,
          occurrences: updatedOccurrences
        }
      })
    }
    
    console.log('✅ Template analysis complete:', {
      variableCount: result.variables?.length || 0,
      templateType: result.summary?.templateType,
      variables: result.variables?.map(v => ({ label: v.label, occurrences: v.occurrences?.length || 0 }))
    })
    
    return result as TemplateAnalysisResult
    
  } catch (error) {
    console.error('❌ Template analysis failed:', error)
    throw error
  }
}

// Helper to normalize template content with detected variables
export function normalizeTemplateContent(content: string, variables: TemplateVariable[]): string {
  console.log('🔄 Normalizing template content with', variables.length, 'variables')
  
  let normalizedContent = content
  
  // Sort variables by position (descending) to replace from end to start
  const allOccurrences = variables.flatMap(v => 
    v.occurrences.map(o => ({ ...o, variableName: v.label }))
  ).sort((a, b) => b.position - a.position)
  
  // Replace each occurrence with standardized format
  for (const occurrence of allOccurrences) {
    const standardizedName = `{{${occurrence.variableName.replace(/\s+/g, '_')}}}`
    
    const before = normalizedContent.substring(0, occurrence.position)
    const after = normalizedContent.substring(occurrence.position + occurrence.length)
    normalizedContent = before + standardizedName + after
  }
  
  return normalizedContent
}