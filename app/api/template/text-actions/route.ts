import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { apiErrorHandler } from '@/lib/api-error-handler'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const POST = apiErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, templateContent, selectedText, instructions } = await request.json()

  if (!action || !templateContent || !selectedText) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    if (action === 'explain') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a template analysis assistant. Explain the selected text from a template in clear, simple terms. Focus on what the text means, why it might be included in a template, and any important implications for customization or usage.'
          },
          {
            role: 'user',
            content: `Please explain this text from a template:\n\n"${selectedText}"\n\nContext: This is from a template document that will be customized for different use cases.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      return NextResponse.json({
        explanation: completion.choices[0].message.content
      })
    } else if (action === 'redraft') {
      const userInstructions = instructions || 'Improve this text to be more flexible and suitable for a template that will be customized for various use cases.'
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a template optimization assistant. Redraft the selected text to make it more suitable for a template document. Focus on making it flexible, clear, and easy to customize. Identify areas that should be variable fields.'
          },
          {
            role: 'user',
            content: `Please redraft this template text according to these instructions: ${userInstructions}\n\nOriginal text:\n"${selectedText}"\n\nProvide an improved version that is template-friendly. Use [Field Name] format for variable fields.`
          }
        ],
        temperature: 0.8,
        max_tokens: 800,
      })

      const redraftedText = completion.choices[0].message.content || ''
      
      // Generate explanation of changes
      const explanationCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a template optimization assistant. Briefly explain the improvements made to the template text in 2-3 bullet points.'
          },
          {
            role: 'user',
            content: `Original text: "${selectedText}"\n\nImproved text: "${redraftedText}"\n\nExplain the key improvements made.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      })
      
      return NextResponse.json({
        redraftedText: redraftedText,
        explanation: explanationCompletion.choices[0].message.content || 'Text has been improved for template use.'
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Template text action error:', error)
    throw error
  }
})