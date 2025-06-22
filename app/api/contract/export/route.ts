import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
// Remove puppeteer import to fix serverless compatibility

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

    if (format === 'docx') {
      return await generateDocx(content, title)
    } else if (format === 'pdf') {
      return await generateSimplePdf(content, title)
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

async function generateDocx(content: string, title: string) {
  try {
    // Parse content and create document structure
    const paragraphs: Paragraph[] = []
    
    // Add title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 32,
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    )

    // Split content into sections and format
    const sections = content.split('\n\n')
    
    sections.forEach(section => {
      if (section.trim()) {
        // Check if it's a legal section (WHEREAS, NOW THEREFORE, etc.)
        if (section.match(/^\s*(WHEREAS|NOW[,\s]*THEREFORE|IN WITNESS WHEREOF)/i)) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.trim(),
                  bold: true,
                  italics: section.match(/^\s*WHEREAS/i) ? true : false,
                }),
              ],
              spacing: { before: 200, after: 200 },
              indent: { left: section.match(/^\s*WHEREAS/i) ? 720 : 0 },
            })
          )
        }
        // Check if it's a numbered section
        else if (section.match(/^\s*\d+\./)) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.trim(),
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 100 },
              numbering: {
                reference: "numbered-list",
                level: 0,
              },
            })
          )
        }
        // Regular paragraph
        else {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.trim(),
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
              alignment: AlignmentType.JUSTIFIED,
            })
          )
        }
      }
    })

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
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

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title}.docx"`,
      },
    })
  } catch (error) {
    console.error('DOCX generation error:', error)
    throw error
  }
}

async function generateSimplePdf(content: string, title: string) {
  try {
    // Create HTML template for client-side PDF generation
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              margin: 1in;
              color: #000;
              max-width: 8.5in;
            }
            h1 {
              font-size: 18pt;
              font-weight: bold;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0 0 24pt 0;
              border-bottom: 2px solid #000;
              padding-bottom: 12pt;
            }
            h2 {
              font-size: 14pt;
              font-weight: bold;
              margin: 24pt 0 12pt 0;
              border-bottom: 1px solid #ccc;
              padding-bottom: 6pt;
            }
            p {
              margin: 0 0 12pt 0;
              text-align: justify;
              text-indent: 0;
            }
            .legal-section {
              margin: 12pt 0;
              padding-left: 24pt;
              border-left: 2px solid #ccc;
              font-style: italic;
            }
            .numbered-section {
              margin: 12pt 0;
              padding-left: 24pt;
            }
            .signature-section {
              margin-top: 36pt;
              border-top: 1px solid #000;
              padding-top: 18pt;
              text-align: center;
            }
            @media print {
              body { margin: 0; }
              @page { margin: 1in; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${formatContentForPdf(content)}
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${title}.html"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}

function formatContentForPdf(content: string): string {
  let formatted = content
  
  // Split into paragraphs
  const paragraphs = formatted.split('\n\n')
  
  const formattedParagraphs = paragraphs.map(paragraph => {
    const trimmed = paragraph.trim()
    if (!trimmed) return ''
    
    // WHEREAS clauses
    if (trimmed.match(/^\s*WHEREAS/i)) {
      return `<p class="legal-section">${trimmed}</p>`
    }
    
    // NOW THEREFORE clause
    if (trimmed.match(/^\s*NOW[,\s]*THEREFORE/i)) {
      return `<p class="legal-section" style="font-weight: bold;">${trimmed}</p>`
    }
    
    // IN WITNESS WHEREOF (signature section)
    if (trimmed.match(/^\s*IN WITNESS WHEREOF/i)) {
      return `<p class="signature-section">${trimmed}</p>`
    }
    
    // Numbered sections
    if (trimmed.match(/^\s*\d+\./)) {
      return `<p class="numbered-section">${trimmed}</p>`
    }
    
    // Regular paragraphs
    return `<p>${trimmed}</p>`
  })
  
  return formattedParagraphs.filter(p => p).join('\n')
}