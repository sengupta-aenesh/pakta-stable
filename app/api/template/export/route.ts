import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, title, format } = await request.json()
    
    if (!content || !title || !format) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('📤 Template export request:', { 
      title, 
      format, 
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...'
    })

    if (format === 'docx') {
      return await generateTemplateDocx(content, title)
    } else if (format === 'pdf') {
      return await generateTemplatePdf(content, title)
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Template export error:', error)
    return NextResponse.json({ 
      error: 'Export failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

async function generateTemplateDocx(content: string, title: string) {
  try {
    console.log('📝 Generating DOCX for template:', title)
    
    // Parse content and create document structure
    const paragraphs: Paragraph[] = []
    
    // Add title with template-specific styling
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 36,
            color: '000000',
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    )

    // Add subtitle for template version
    if (title.includes('Version')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Template Version Document',
              italics: true,
              size: 24,
              color: '666666',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      )
    }

    // Split content into sections and format
    const lines = content.split('\n')
    let currentParagraph = ''
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      if (trimmedLine === '') {
        // Empty line - complete current paragraph if exists
        if (currentParagraph.trim()) {
          paragraphs.push(createFormattedParagraph(currentParagraph.trim()))
          currentParagraph = ''
        }
      } else {
        // Add line to current paragraph with space
        currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine
      }
      
      // Handle last line
      if (index === lines.length - 1 && currentParagraph.trim()) {
        paragraphs.push(createFormattedParagraph(currentParagraph.trim()))
      }
    })

    // Create document with professional template styling
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
      numbering: {
        config: [
          {
            reference: "numbered-list",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 },
                  },
                },
              },
            ],
          },
        ],
      },
    })

    // Generate buffer
    const buffer = await Packer.toBuffer(doc)
    console.log('✅ DOCX generated successfully, size:', buffer.length)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(title)}.docx"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('DOCX generation error:', error)
    throw error
  }
}

function createFormattedParagraph(text: string): Paragraph {
  // Check for special formatting patterns
  
  // Headers (text ending with colon or in all caps)
  if (text.endsWith(':') || text === text.toUpperCase()) {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: 26,
        }),
      ],
      spacing: { before: 300, after: 200 },
    })
  }
  
  // Numbered items
  if (text.match(/^\d+\./)) {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          size: 24,
        }),
      ],
      spacing: { before: 100, after: 100 },
      numbering: {
        reference: "numbered-list",
        level: 0,
      },
    })
  }
  
  // Bullet points (starting with - or *)
  if (text.match(/^[-*]\s/)) {
    return new Paragraph({
      children: [
        new TextRun({
          text: text.substring(2), // Remove bullet marker
          size: 24,
        }),
      ],
      spacing: { before: 50, after: 50 },
      bullet: {
        level: 0,
      },
    })
  }
  
  // Template fields (text in brackets or braces)
  if (text.includes('[') || text.includes('{')) {
    const runs: TextRun[] = []
    let lastIndex = 0
    
    // Find all bracketed/braced sections
    const regex = /(\[[^\]]+\]|\{[^}]+\})/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        runs.push(
          new TextRun({
            text: text.substring(lastIndex, match.index),
            size: 24,
          })
        )
      }
      
      // Add the bracketed/braced text with highlighting
      runs.push(
        new TextRun({
          text: match[0],
          bold: true,
          highlight: 'yellow',
          size: 24,
        })
      )
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      runs.push(
        new TextRun({
          text: text.substring(lastIndex),
          size: 24,
        })
      )
    }
    
    return new Paragraph({
      children: runs,
      spacing: { after: 100 },
      alignment: AlignmentType.JUSTIFIED,
    })
  }
  
  // Regular paragraph
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: 24,
      }),
    ],
    spacing: { after: 100 },
    alignment: AlignmentType.JUSTIFIED,
  })
}

async function generateTemplatePdf(content: string, title: string) {
  try {
    console.log('📄 Generating PDF for template:', title)
    
    // Create HTML template for client-side PDF generation
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${escapeHtml(title)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              font-size: 11pt;
              line-height: 1.8;
              margin: 0;
              padding: 40px;
              color: #111827;
              background: white;
              max-width: 8.5in;
              margin: 0 auto;
            }
            
            h1 {
              font-size: 24pt;
              font-weight: 700;
              text-align: center;
              color: #111827;
              margin: 0 0 8px 0;
              letter-spacing: -0.5px;
            }
            
            .subtitle {
              font-size: 14pt;
              font-weight: 400;
              text-align: center;
              color: #6B7280;
              margin: 0 0 32px 0;
              font-style: italic;
            }
            
            .content {
              margin-top: 32px;
            }
            
            p {
              margin: 0 0 16px 0;
              text-align: justify;
              line-height: 1.8;
            }
            
            /* Headers and sections */
            .section-header {
              font-weight: 600;
              font-size: 13pt;
              color: #111827;
              margin: 24px 0 12px 0;
              border-bottom: 1px solid #E5E7EB;
              padding-bottom: 8px;
            }
            
            /* Template fields */
            .template-field {
              background-color: #FEF3C7;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
              color: #92400E;
              display: inline-block;
              margin: 0 2px;
            }
            
            /* Lists */
            .numbered-item {
              margin: 12px 0;
              padding-left: 32px;
              position: relative;
            }
            
            .numbered-item::before {
              content: attr(data-number) ".";
              position: absolute;
              left: 0;
              font-weight: 600;
            }
            
            .bullet-item {
              margin: 8px 0;
              padding-left: 24px;
              position: relative;
            }
            
            .bullet-item::before {
              content: "•";
              position: absolute;
              left: 8px;
              font-weight: 700;
            }
            
            /* Footer */
            .footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 1px solid #E5E7EB;
              text-align: center;
              font-size: 10pt;
              color: #6B7280;
            }
            
            @media print {
              body { 
                margin: 0;
                padding: 20px;
              }
              @page { 
                margin: 0.75in;
                size: letter;
              }
              .template-field {
                background-color: #FEF3C7 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          ${title.includes('Version') ? '<p class="subtitle">Template Version Document</p>' : ''}
          <div class="content">
            ${formatTemplateContentForPdf(content)}
          </div>
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `

    console.log('✅ PDF HTML generated successfully')

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${sanitizeFilename(title)}.html"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}

function formatTemplateContentForPdf(content: string): string {
  const lines = content.split('\n')
  const formattedLines: string[] = []
  let inParagraph = false
  let currentParagraph = ''
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    if (trimmedLine === '') {
      // Empty line - close current paragraph
      if (currentParagraph) {
        formattedLines.push(`<p>${highlightTemplateFields(currentParagraph)}</p>`)
        currentParagraph = ''
        inParagraph = false
      }
    } else if (trimmedLine.endsWith(':') || trimmedLine === trimmedLine.toUpperCase()) {
      // Header line
      if (currentParagraph) {
        formattedLines.push(`<p>${highlightTemplateFields(currentParagraph)}</p>`)
        currentParagraph = ''
      }
      formattedLines.push(`<div class="section-header">${escapeHtml(trimmedLine)}</div>`)
      inParagraph = false
    } else if (trimmedLine.match(/^\d+\./)) {
      // Numbered item
      if (currentParagraph) {
        formattedLines.push(`<p>${highlightTemplateFields(currentParagraph)}</p>`)
        currentParagraph = ''
      }
      const number = trimmedLine.match(/^(\d+)\./)?.[1] || '1'
      const text = trimmedLine.replace(/^\d+\.\s*/, '')
      formattedLines.push(`<div class="numbered-item" data-number="${number}">${highlightTemplateFields(text)}</div>`)
      inParagraph = false
    } else if (trimmedLine.match(/^[-*]\s/)) {
      // Bullet item
      if (currentParagraph) {
        formattedLines.push(`<p>${highlightTemplateFields(currentParagraph)}</p>`)
        currentParagraph = ''
      }
      const text = trimmedLine.replace(/^[-*]\s+/, '')
      formattedLines.push(`<div class="bullet-item">${highlightTemplateFields(text)}</div>`)
      inParagraph = false
    } else {
      // Regular text - add to paragraph
      currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine
      inParagraph = true
    }
  })
  
  // Don't forget the last paragraph
  if (currentParagraph) {
    formattedLines.push(`<p>${highlightTemplateFields(currentParagraph)}</p>`)
  }
  
  return formattedLines.join('\n')
}

function highlightTemplateFields(text: string): string {
  // Escape HTML first
  let escaped = escapeHtml(text)
  
  // Highlight bracketed fields [Field Name]
  escaped = escaped.replace(/\[([^\]]+)\]/g, '<span class="template-field">[$1]</span>')
  
  // Highlight braced fields {Field Name} or {{Field_Name}}
  escaped = escaped.replace(/\{\{?([^}]+)\}?\}/g, '<span class="template-field">{$1}</span>')
  
  return escaped
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

function sanitizeFilename(filename: string): string {
  // Remove or replace characters that are invalid in filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '_')
    .substring(0, 200) // Limit length
}