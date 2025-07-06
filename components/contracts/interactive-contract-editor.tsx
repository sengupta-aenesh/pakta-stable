'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Contract, RiskFactor } from '@/lib/types'
import SelectionToolbar from './selection-toolbar'
import styles from './interactive-contract-editor.module.css'

// Document export utilities
async function downloadDocx(content: string, title: string) {
  try {
    const response = await fetch('/api/contract/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        title, 
        format: 'docx' 
      })
    })
    
    if (!response.ok) throw new Error('Export failed')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('DOCX export failed:', error)
    alert('Failed to export DOCX. Please try again.')
  }
}

async function downloadPdf(content: string, title: string) {
  try {
    const response = await fetch('/api/contract/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        title, 
        format: 'pdf' 
      })
    })
    
    if (!response.ok) throw new Error('Export failed')
    
    const html = await response.text()
    
    // Open the HTML in a new window and trigger print dialog
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Close the window after printing (optional)
          printWindow.onafterprint = () => printWindow.close()
        }, 500)
      }
    } else {
      throw new Error('Popup blocked. Please allow popups for PDF export.')
    }
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('Failed to export PDF. Please try again.')
  }
}

interface TextPosition {
  start: number
  end: number
}

interface RiskHighlight {
  id: string
  clause: string
  clauseLocation: string
  riskLevel: 'high' | 'medium' | 'low'
  riskScore: number
  category: string
  explanation: string
  suggestion: string
  legalPrecedent?: string
  affectedParty: string
  textPosition: TextPosition
  elementId: string
}

interface TextSelection {
  text: string
  position: { x: number; y: number }
  range: Range
}

interface InteractiveContractEditorProps {
  contract: Contract | null
  risks: RiskFactor[]
  onContentChange: (content: string) => void
  onRiskClick?: (riskId: string) => void
  onHighlightClick?: (riskId: string) => void
  onComment?: (text: string, position: TextPosition) => void
  onReanalyzeRisks?: (() => Promise<void>) | null
  onRegisterUpdateFunction?: (updateFunction: (content: string | null) => void) => void
  className?: string
}

export default function InteractiveContractEditor({
  contract,
  risks,
  onContentChange,
  onRiskClick,
  onHighlightClick,
  onComment,
  onReanalyzeRisks,
  onRegisterUpdateFunction,
  className
}: InteractiveContractEditorProps) {
  const [content, setContent] = useState('')
  const [riskHighlights, setRiskHighlights] = useState<RiskHighlight[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [textSelection, setTextSelection] = useState<TextSelection | null>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const downloadRef = useRef<HTMLDivElement>(null)

  // Update content when contract changes
  useEffect(() => {
    if (contract) {
      setContent(contract.content || '')
    } else {
      setContent('')
    }
  }, [contract])

  // Use ref to store the latest onContentChange function to avoid stale closures
  const onContentChangeRef = useRef(onContentChange)
  onContentChangeRef.current = onContentChange

  // Register content update function with parent
  useEffect(() => {
    if (!onRegisterUpdateFunction) return

    const updateContentFunction = (newContent: string | null) => {
      const safeContent = newContent || ''
      console.log('📝 External content update received:', { 
        newLength: safeContent.length,
        wasNull: newContent === null 
      })
      setContent(safeContent)
      // Use ref to get the latest function to avoid stale closures
      if (onContentChangeRef.current) {
        onContentChangeRef.current(safeContent)
      }
    }

    onRegisterUpdateFunction(updateContentFunction)
  }, [onRegisterUpdateFunction])

  // Enhanced fuzzy string matching function
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    // Normalize strings for comparison
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
    const s1 = normalize(str1)
    const s2 = normalize(str2)
    
    if (s1 === s2) return 1.0
    if (s1.length === 0 || s2.length === 0) return 0.0
    
    // Use Jaro-Winkler-like similarity for fuzzy matching
    const longer = s1.length > s2.length ? s1 : s2
    const shorter = s1.length > s2.length ? s2 : s1
    
    if (longer.length === 0) return 1.0
    
    // Calculate character-level similarity
    const editDistance = levenshteinDistance(s1, s2)
    const maxLength = Math.max(s1.length, s2.length)
    const similarity = (maxLength - editDistance) / maxLength
    
    // Boost score for substring matches
    if (longer.includes(shorter)) {
      return Math.max(similarity, 0.8)
    }
    
    return similarity
  }, [])

  // Simple Levenshtein distance calculation
  const levenshteinDistance = useCallback((str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }, [])

  // Advanced text search with multiple strategies
  const findTextInDocument = useCallback((text: string, searchClause: string): Array<{start: number, end: number, confidence: number, matchText: string}> => {
    const matches: Array<{start: number, end: number, confidence: number, matchText: string}> = []
    const clauseText = searchClause.trim()
    
    if (!clauseText || clauseText.length < 5) return matches
    
    // Strategy 1: Exact match (highest confidence)
    let searchIndex = 0
    while (true) {
      const exactIndex = text.indexOf(clauseText, searchIndex)
      if (exactIndex === -1) break
      
      matches.push({
        start: exactIndex,
        end: exactIndex + clauseText.length,
        confidence: 1.0,
        matchText: clauseText
      })
      searchIndex = exactIndex + 1
    }
    
    // Strategy 2: Case-insensitive exact match
    if (matches.length === 0) {
      const lowerText = text.toLowerCase()
      const lowerClause = clauseText.toLowerCase()
      searchIndex = 0
      
      while (true) {
        const caseIndex = lowerText.indexOf(lowerClause, searchIndex)
        if (caseIndex === -1) break
        
        const actualText = text.substring(caseIndex, caseIndex + clauseText.length)
        matches.push({
          start: caseIndex,
          end: caseIndex + clauseText.length,
          confidence: 0.95,
          matchText: actualText
        })
        searchIndex = caseIndex + 1
      }
    }
    
    // Strategy 3: Normalized whitespace matching
    if (matches.length === 0) {
      const normalizedClause = clauseText.replace(/\s+/g, ' ').trim()
      const normalizedText = text.replace(/\s+/g, ' ')
      const normalizedLower = normalizedText.toLowerCase()
      const clauseLower = normalizedClause.toLowerCase()
      
      const normalizedIndex = normalizedLower.indexOf(clauseLower)
      if (normalizedIndex !== -1) {
        // Map back to original text positions
        let originalStart = 0
        let normalizedPos = 0
        
        for (let i = 0; i < text.length && normalizedPos < normalizedIndex; i++) {
          if (text[i].match(/\s/)) {
            if (i === 0 || !text[i-1].match(/\s/)) {
              normalizedPos++
            }
          } else {
            normalizedPos++
          }
          originalStart = i + 1
        }
        
        // Find end position
        let originalEnd = originalStart
        let matchedChars = 0
        for (let i = originalStart; i < text.length && matchedChars < normalizedClause.length; i++) {
          if (!text[i].match(/\s/)) {
            matchedChars++
          } else if (matchedChars > 0 && normalizedClause[matchedChars] === ' ') {
            matchedChars++
          }
          originalEnd = i + 1
        }
        
        const actualText = text.substring(originalStart, originalEnd)
        matches.push({
          start: originalStart,
          end: originalEnd,
          confidence: 0.85,
          matchText: actualText
        })
      }
    }
    
    // Strategy 4: Fuzzy matching with sliding window
    if (matches.length === 0 && clauseText.length >= 20) {
      const windowSize = clauseText.length
      const threshold = clauseText.length > 100 ? 0.7 : 0.8
      
      for (let i = 0; i <= text.length - windowSize; i += Math.max(1, Math.floor(windowSize / 4))) {
        const window = text.substring(i, i + windowSize)
        const similarity = calculateSimilarity(window, clauseText)
        
        if (similarity >= threshold) {
          matches.push({
            start: i,
            end: i + windowSize,
            confidence: similarity * 0.8, // Reduce confidence for fuzzy matches
            matchText: window
          })
          break // Take first good fuzzy match to avoid duplicates
        }
      }
    }
    
    // Strategy 5: Key phrase extraction for long clauses
    if (matches.length === 0 && clauseText.length > 50) {
      // Extract meaningful phrases (non-stop words, 15+ chars)
      const phrases = clauseText
        .split(/[.!?;,]/)
        .map(phrase => phrase.trim())
        .filter(phrase => phrase.length >= 15)
        .filter(phrase => !phrase.match(/^(the|and|or|but|if|when|where|which|that|this|shall|will|may|must|should|could|would)\s/i))
        .sort((a, b) => b.length - a.length) // Try longest phrases first
      
      for (const phrase of phrases) {
        const phraseMatches = findTextInDocument(text, phrase)
        if (phraseMatches.length > 0) {
          // Extend the match to include more context if possible
          const bestMatch = phraseMatches[0]
          const contextStart = Math.max(0, bestMatch.start - 50)
          const contextEnd = Math.min(text.length, bestMatch.end + 50)
          
          // Try to find sentence boundaries for better highlighting
          let expandedStart = bestMatch.start
          let expandedEnd = bestMatch.end
          
          // Expand to sentence start
          for (let i = bestMatch.start - 1; i >= contextStart; i--) {
            if (text[i].match(/[.!?]/)) break
            if (text[i].match(/[A-Z]/) && i > 0 && text[i-1].match(/\s/)) break
            expandedStart = i
          }
          
          // Expand to sentence end
          for (let i = bestMatch.end; i < contextEnd; i++) {
            expandedEnd = i + 1
            if (text[i].match(/[.!?]/)) break
          }
          
          const expandedText = text.substring(expandedStart, expandedEnd).trim()
          matches.push({
            start: expandedStart,
            end: expandedEnd,
            confidence: bestMatch.confidence * 0.7, // Lower confidence for expanded matches
            matchText: expandedText
          })
          break
        }
      }
    }
    
    // Remove overlapping matches, keeping highest confidence
    const uniqueMatches = matches
      .sort((a, b) => b.confidence - a.confidence)
      .filter((match, index, arr) => {
        return !arr.slice(0, index).some(existingMatch => 
          (match.start < existingMatch.end && match.end > existingMatch.start)
        )
      })
    
    return uniqueMatches
  }, [calculateSimilarity])

  // Enhanced function to map risks to exact text positions
  const mapRisksToText = useCallback((text: string, riskList: RiskFactor[]): RiskHighlight[] => {
    if (!text || !riskList || riskList.length === 0) {
      console.log('🗺️ mapRisksToText: No text or risks to map')
      return []
    }
    
    console.log('🗺️ Enhanced risk mapping started:', { 
      textLength: text.length, 
      risksCount: riskList.length
    })
    
    const highlights: RiskHighlight[] = []
    const processedRanges: Array<{start: number, end: number}> = []
    
    riskList.forEach((risk, index) => {
      if (!risk || !risk.clause) {
        console.log(`⚠️ Risk ${index} has no clause, skipping`)
        return
      }
      
      const clauseText = risk.clause.trim()
      console.log(`🔍 Enhanced search for risk ${index}: "${clauseText.substring(0, 50)}..."`)
      
      const matches = findTextInDocument(text, clauseText)
      
      if (matches.length > 0) {
        // Select best match that doesn't overlap with existing highlights
        let bestMatch = null
        
        for (const match of matches) {
          // Check for overlap with already processed ranges
          const hasOverlap = processedRanges.some(range => 
            (match.start < range.end && match.end > range.start)
          )
          
          if (!hasOverlap) {
            bestMatch = match
            break
          }
        }
        
        if (bestMatch) {
          console.log(`✅ Risk ${index} mapped with confidence ${bestMatch.confidence.toFixed(2)} at position ${bestMatch.start}-${bestMatch.end}`)
          
          highlights.push({
            ...risk,
            textPosition: {
              start: bestMatch.start,
              end: bestMatch.end
            },
            elementId: `risk-highlight-${risk.id || index}`
          })
          
          // Track this range as processed
          processedRanges.push({
            start: bestMatch.start,
            end: bestMatch.end
          })
        } else {
          console.log(`⚠️ Risk ${index} found matches but all overlap with existing highlights`)
          // Log overlapping matches for debugging
          matches.forEach((match, matchIndex) => {
            console.log(`   Match ${matchIndex}: ${match.start}-${match.end} (confidence: ${match.confidence.toFixed(2)})`)
          })
        }
      } else {
        console.log(`❌ Risk ${index} not found with any strategy:`)
        console.log(`   Clause: "${clauseText.substring(0, 100)}${clauseText.length > 100 ? '...' : ''}"`)
        
        // For debugging: try to find partial matches
        const words = clauseText.split(/\s+/).filter(word => word.length > 3)
        const foundWords = words.filter(word => text.toLowerCase().includes(word.toLowerCase()))
        console.log(`   Found ${foundWords.length}/${words.length} key words in text: ${foundWords.slice(0, 3).join(', ')}`)
      }
    })
    
    // Sort by position to ensure proper rendering order
    const sortedHighlights = highlights.sort((a, b) => a.textPosition.start - b.textPosition.start)
    
    console.log(`📊 Enhanced mapping result: ${sortedHighlights.length}/${riskList.length} risks mapped (${((sortedHighlights.length / riskList.length) * 100).toFixed(1)}% success rate)`)
    
    // Log detailed mapping statistics
    const mappedRisks = sortedHighlights.length
    const totalRisks = riskList.length
    const successRate = ((mappedRisks / totalRisks) * 100).toFixed(1)
    
    console.log(`📈 Mapping Statistics:`)
    console.log(`   • Successfully mapped: ${mappedRisks}/${totalRisks} risks`)
    console.log(`   • Success rate: ${successRate}%`)
    console.log(`   • Average risk text length: ${Math.round(riskList.reduce((sum, risk) => sum + (risk.clause?.length || 0), 0) / totalRisks)} chars`)
    console.log(`   • Contract length: ${text.length} chars`)
    
    return sortedHighlights
  }, [findTextInDocument])

  // Document beautification function
  const beautifyContent = useCallback((rawContent: string): string => {
    if (!rawContent) return ''
    
    let beautified = rawContent
    
    // Clean up excessive whitespace
    beautified = beautified.replace(/\s+/g, ' ').trim()
    
    // Add proper paragraph breaks for legal sections
    beautified = beautified.replace(/\.\s+([A-Z])/g, '.\n\n$1')
    
    // Format WHEREAS clauses
    beautified = beautified.replace(/\b(WHEREAS\b.*?)(?=WHEREAS|NOW THEREFORE|$)/gi, (match) => {
      return match.trim() + '\n\n'
    })
    
    // Format NOW THEREFORE clause
    beautified = beautified.replace(/\b(NOW,?\s*THEREFORE\b.*?)(?=IN WITNESS|$)/gi, (match) => {
      return '\n' + match.trim() + '\n\n'
    })
    
    // Format numbered/lettered sections
    beautified = beautified.replace(/\b(\d+\.|\([a-z]\)|\([A-Z]\)|\([0-9]+\))\s*/g, '\n\n$1 ')
    
    // Format signature section
    beautified = beautified.replace(/\b(IN WITNESS WHEREOF\b.*?)$/gi, '\n\n$1')
    
    // Clean up multiple line breaks
    beautified = beautified.replace(/\n{3,}/g, '\n\n')
    
    // Ensure proper title formatting (all caps titles)
    beautified = beautified.replace(/^([A-Z\s]{10,})$/gm, (match) => {
      return '\n' + match.trim() + '\n'
    })
    
    return beautified.trim()
  }, [])

  // Get formatted content for display
  const getFormattedContent = useCallback(() => {
    return beautifyContent(content)
  }, [content, beautifyContent])

  // Map risks to text positions when content or risks change
  useEffect(() => {
    console.log('🔍 Risk mapping useEffect triggered:', { 
      contentLength: content.length, 
      risksCount: risks.length,
      currentHighlights: riskHighlights.length
    })
    
    if (content && risks.length > 0) {
      console.log('📍 Starting risk mapping process...')
      // Use original content for risk mapping since risks were mapped to original text
      const mappedRisks = mapRisksToText(content, risks)
      console.log('✅ Setting risk highlights:', mappedRisks.length, 'highlights mapped')
      setRiskHighlights(mappedRisks)
    } else {
      console.log('❌ Clearing risk highlights - no content or risks')
      setRiskHighlights([])
    }
  }, [content, risks, mapRisksToText])

  // Function to render content with risk highlights
  const renderHighlightedContent = useCallback(() => {
    if (!content) {
      console.log('📄 No content to render')
      return ''
    }
    
    // For now, always use original content to maintain risk highlighting
    // TODO: Implement smart risk position mapping for beautified content
    const displayContent = content
    
    console.log('🎨 Rendering content with highlights:', { 
      contentLength: displayContent.length, 
      highlightsCount: riskHighlights.length
    })
    
    if (riskHighlights.length === 0) {
      console.log('📄 Rendering plain content (no highlights)')
      // If no risks, we can show beautified content
      const contentToShow = isEditing ? content : getFormattedContent()
      return contentToShow.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < contentToShow.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))
    }
    
    console.log('🌈 Rendering highlighted content with', riskHighlights.length, 'highlights')

    const parts: React.ReactElement[] = []
    let lastIndex = 0

    riskHighlights.forEach((highlight, index) => {
      const { start, end } = highlight.textPosition
      
      // Add text before this highlight (with line break conversion)
      if (lastIndex < start) {
        const beforeText = displayContent.substring(lastIndex, start)
        parts.push(
          <React.Fragment key={`text-${index}`}>
            {beforeText.split('\n').map((line, lineIndex) => (
              <React.Fragment key={`${index}-${lineIndex}`}>
                {line}
                {lineIndex < beforeText.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        )
      }
      
      // Add the highlighted risk text
      const highlightText = displayContent.substring(start, end)
      parts.push(
        <span
          key={highlight.elementId}
          id={highlight.elementId}
          className={`${styles.riskHighlight} ${styles[highlight.riskLevel]}`}
          onClick={(e) => {
            // Only handle click if no text is selected (to allow text selection)
            const selection = window.getSelection()
            if (!selection || selection.toString().trim().length === 0) {
              e.stopPropagation()
              handleHighlightTextClick(highlight)
            }
          }}
          title={`${highlight.category} Risk: ${highlight.explanation.substring(0, 100)}... (Click to view risk details)`}
          data-risk-id={highlight.id}
        >
          {highlightText.split('\n').map((line, lineIndex) => (
            <React.Fragment key={`highlight-${index}-${lineIndex}`}>
              {line}
              {lineIndex < highlightText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      )
      
      lastIndex = end
    })
    
    // Add remaining text (with line break conversion)
    if (lastIndex < displayContent.length) {
      const remainingText = displayContent.substring(lastIndex)
      parts.push(
        <React.Fragment key="text-end">
          {remainingText.split('\n').map((line, lineIndex) => (
            <React.Fragment key={`end-${lineIndex}`}>
              {line}
              {lineIndex < remainingText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>
      )
    }
    
    return parts
  }, [content, riskHighlights, isEditing, getFormattedContent])

  // Handle clicking on risk highlights (from risk panel)
  const handleRiskHighlightClick = (highlight: RiskHighlight) => {
    if (onRiskClick) {
      onRiskClick(highlight.id || '')
    }
  }

  // Handle clicking on highlighted text in the editor
  const handleHighlightTextClick = (highlight: RiskHighlight) => {
    if (onHighlightClick) {
      onHighlightClick(highlight.id || '')
    }
  }

  // Handle text selection in the viewer
  const handleTextSelection = useCallback(() => {
    if (isEditing) return // Don't handle selection in edit mode
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowToolbar(false)
      setTextSelection(null)
      return
    }

    const selectedText = selection.toString().trim()
    console.log('Text selection detected:', selectedText) // Debug log
    
    if (selectedText.length === 0) {
      setShowToolbar(false)
      setTextSelection(null)
      return
    }

    // Check if selection is within our content area
    const range = selection.getRangeAt(0)
    const isWithinContent = contentRef.current?.contains(range.commonAncestorContainer)
    
    if (!isWithinContent) {
      console.log('Selection not within content area') // Debug log
      setShowToolbar(false)
      setTextSelection(null)
      return
    }

    const rect = range.getBoundingClientRect()
    console.log('Selection rect:', rect) // Debug log
    
    // Calculate toolbar position - simplified
    const position = {
      x: Math.max(10, rect.left + (rect.width / 2) - 150), // Center but keep in viewport
      y: Math.max(10, rect.top + window.scrollY - 80) // Position above with scroll offset
    }

    console.log('Setting toolbar visible with position:', position) // Debug log

    setTextSelection({
      text: selectedText,
      position,
      range
    })
    setShowToolbar(true)
  }, [isEditing])

  // Add event listeners for text selection
  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      console.log('Mouse up detected') // Debug log
      // Small delay to ensure selection is complete
      setTimeout(handleTextSelection, 50) // Increased delay
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      // Handle keyboard text selection (Shift + arrows, Ctrl+A, etc.)
      if (event.shiftKey || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        setTimeout(handleTextSelection, 50)
      }
    }

    // No click outside handler needed - SelectionToolbar handles its own closing logic

    console.log('Setting up event listeners, isEditing:', isEditing) // Debug log

    if (!isEditing) {
      // Attach to document for broader coverage
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('keyup', handleKeyUp)
      
      return () => {
        console.log('Cleaning up event listeners') // Debug log
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('keyup', handleKeyUp)
      }
    }
  }, [handleTextSelection, isEditing])

  // Close toolbar when switching to edit mode
  useEffect(() => {
    if (isEditing) {
      setShowToolbar(false)
      setTextSelection(null)
    }
  }, [isEditing])

  // Handle toolbar actions
  const handleCommentAction = useCallback((text: string) => {
    console.log('handleCommentAction called with text:', text) // Debug log
    
    if (textSelection && onComment) {
      console.log('Calling onComment with text selection') // Debug log
      // Calculate text position in the content
      const range = textSelection.range
      const containerNode = contentRef.current
      if (containerNode) {
        const startOffset = getTextOffset(containerNode, range.startContainer, range.startOffset)
        const endOffset = startOffset + text.length
        
        console.log('Calculated position:', { start: startOffset, end: endOffset }) // Debug log
        onComment(text, { start: startOffset, end: endOffset })
      }
    } else {
      console.log('No textSelection or onComment handler:', { textSelection: !!textSelection, onComment: !!onComment }) // Debug log
    }
    setShowToolbar(false)
    setTextSelection(null)
  }, [textSelection, onComment])

  const handleExplainAction = useCallback(async (text: string) => {
    if (!contract?.content) {
      return Promise.reject(new Error('No contract content available'))
    }
    
    try {
      const response = await fetch('/api/contract/text-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain',
          contractContent: contract.content,
          selectedText: text
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.explanation) {
        throw new Error('No explanation received from AI')
      }
      
      // The toolbar will handle displaying this via its internal state
      return data.explanation
    } catch (error) {
      console.error('Error explaining text:', error)
      throw error
    }
  }, [contract])

  const handleRedraftAction = useCallback(async (text: string) => {
    if (!contract?.content) {
      return Promise.reject(new Error('No contract content available'))
    }
    
    try {
      const response = await fetch('/api/contract/text-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redraft',
          contractContent: contract.content,
          selectedText: text
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.redraftedText) {
        throw new Error('No redraft suggestion received from AI')
      }
      
      // Return structured data for the toolbar to handle
      return {
        originalText: text,
        redraftedText: data.redraftedText,
        explanation: data.explanation || 'No explanation provided',
        onAccept: async () => {
          // Replace the selected text in the content
          const newContent = content.replace(text, data.redraftedText)
          console.log('🔄 Redraft accepted, updating content:', { 
            oldLength: content.length, 
            newLength: newContent.length,
            originalText: text.substring(0, 50) + '...',
            redraftedText: data.redraftedText.substring(0, 50) + '...'
          })
          
          // Update content immediately
          setContent(newContent)
          onContentChange(newContent)
          
          // Close toolbar and clear selection first
          setShowToolbar(false)
          setTextSelection(null)
          
          // Trigger full risk reanalysis instead of trying to remap old risks
          if (onReanalyzeRisks) {
            console.log('🔄 Triggering full risk reanalysis after redraft...')
            try {
              await onReanalyzeRisks()
              console.log('✅ Risk reanalysis completed successfully')
            } catch (error) {
              console.error('❌ Risk reanalysis failed:', error)
            }
          } else {
            console.log('⚠️ No reanalysis function available, risks may not be updated')
          }
        },
        onReject: () => {
          // Just close the toolbar
          setShowToolbar(false)
          setTextSelection(null)
        }
      }
    } catch (error) {
      console.error('Error redrafting text:', error)
      throw error
    }
  }, [contract, content, onContentChange])

  // Helper function to get text offset within container
  const getTextOffset = (container: Node, node: Node, offset: number): number => {
    let textOffset = 0
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )
    
    let currentNode = walker.nextNode()
    while (currentNode && currentNode !== node) {
      textOffset += currentNode.textContent?.length || 0
      currentNode = walker.nextNode()
    }
    
    return textOffset + offset
  }

  // Scroll to specific risk highlight
  const scrollToRisk = useCallback((riskId: string) => {
    const element = document.getElementById(`risk-highlight-${riskId}`)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      
      // Add temporary emphasis animation
      element.classList.add(styles.emphasized)
      setTimeout(() => {
        element.classList.remove(styles.emphasized)
      }, 2000)
    }
  }, [])

  // Expose scrollToRisk function to parent components
  useEffect(() => {
    if (contract) {
      // Store reference for external access
      (window as any).scrollToContractRisk = scrollToRisk
    }
  }, [scrollToRisk, contract])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false)
      }
    }

    if (showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDownloadDropdown])

  // Handle content editing
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onContentChange(newContent)
  }

  // Save current scroll position
  const saveScrollPosition = () => {
    const scrollContainer = contentRef.current || editorRef.current
    if (scrollContainer) {
      const currentScroll = scrollContainer.scrollTop
      setScrollPosition(currentScroll)
      console.log('📍 Saved scroll position:', currentScroll)
    }
  }

  // Restore saved scroll position
  const restoreScrollPosition = () => {
    setTimeout(() => {
      const scrollContainer = contentRef.current || editorRef.current
      if (scrollContainer && scrollPosition > 0) {
        scrollContainer.scrollTop = scrollPosition
        console.log('🎯 Restored scroll position:', scrollPosition)
      }
    }, 100) // Small delay to ensure DOM is ready
  }

  // Toggle between view and edit modes
  const toggleEditMode = () => {
    // Save current scroll position before switching modes
    saveScrollPosition()
    
    setIsEditing(!isEditing)
    
    // Focus and restore scroll position when entering edit mode
    if (!isEditing) {
      setTimeout(() => {
        // Focus the appropriate element (contentEditable or textarea)
        if (riskHighlights.length > 0) {
          contentRef.current?.focus()
        } else {
          editorRef.current?.focus()
        }
        restoreScrollPosition()
      }, 150)
    } else {
      // Restore scroll position when returning to view mode
      restoreScrollPosition()
    }
  }

  // Handle download actions
  const handleDownload = async (format: 'docx' | 'pdf') => {
    if (!contract || !content) return
    
    const formattedContent = getFormattedContent()
    const title = contract.title || 'Contract'
    
    setShowDownloadDropdown(false)
    
    if (format === 'docx') {
      await downloadDocx(formattedContent, title)
    } else {
      await downloadPdf(formattedContent, title)
    }
  }

  if (!contract) {
    return (
      <div className={styles.noContract}>
        <p>Select a contract to view</p>
      </div>
    )
  }

  // Analysis progress is now handled by the analysis panel to avoid duplicate loaders

  console.log('InteractiveContractEditor render:', { 
    isEditing, 
    showToolbar, 
    textSelection: !!textSelection,
    textSelectionText: textSelection?.text,
    contentLength: content.length,
    risksCount: riskHighlights.length
  }) // Debug log

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Toggle between view and edit modes */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button 
            className={`${styles.modeToggle} ${isEditing ? styles.editing : styles.viewing}`}
            onClick={toggleEditMode}
          >
            {isEditing ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Done Editing
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Contract
              </>
            )}
          </button>

          {/* Download Button */}
          <div className={styles.downloadContainer} ref={downloadRef}>
            <button 
              className={styles.downloadButton}
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              disabled={!content.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Download
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            
            {showDownloadDropdown && (
              <div className={styles.downloadDropdown}>
                <button 
                  className={styles.downloadOption}
                  onClick={() => handleDownload('docx')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="21"/>
                    <line x1="8" y1="13" x2="16" y2="21"/>
                  </svg>
                  Download as DOCX
                </button>
                <button 
                  className={styles.downloadOption}
                  onClick={() => handleDownload('pdf')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                    <line x1="12" y1="12" x2="12" y2="18"/>
                  </svg>
                  Download as PDF
                </button>
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className={styles.riskInfo}>
            {riskHighlights.length > 0 && (
              <span className={styles.riskCount}>
                {riskHighlights.length} risk{riskHighlights.length !== 1 ? 's' : ''} highlighted
              </span>
            )}
            <span className={styles.selectionHint}>
              Select any text to explain or redraft with AI
            </span>
            {showToolbar && (
              <span className={styles.toolbarStatus}>
                ✓ Toolbar active
              </span>
            )}
          </div>
        )}
        
        {isEditing && riskHighlights.length > 0 && (
          <div className={styles.riskInfo}>
            <span className={styles.riskCount}>
              Editing mode with risk highlighting preserved
            </span>
            <span className={styles.selectionHint}>
              Risks remain highlighted while editing
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {isEditing ? (
          // Edit mode: Use contentEditable if we have risks to highlight, otherwise plain textarea
          riskHighlights.length > 0 ? (
            <div
              ref={contentRef}
              className={`${styles.viewer} ${styles.editableViewer}`}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const newContent = e.currentTarget.textContent || ''
                handleContentChange(newContent)
              }}
              onPaste={(e) => {
                e.preventDefault()
                const paste = e.clipboardData?.getData('text/plain') || ''
                document.execCommand('insertText', false, paste)
              }}
            >
              <div className={styles.highlightedContent}>
                {renderHighlightedContent()}
              </div>
            </div>
          ) : (
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className={styles.editor}
              placeholder="Enter contract content..."
            />
          )
        ) : (
          // View mode: Highlighted content
          <div 
            ref={contentRef}
            className={styles.viewer}
          >
            <div className={styles.highlightedContent}>
              {content ? renderHighlightedContent() : (
                <div className={styles.emptyState}>
                  <p>This contract is empty. Click "Edit Contract" to add content.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selection Toolbar */}
      {console.log('Toolbar render check:', { hasTextSelection: !!textSelection, showToolbar, textSelection })}
      <SelectionToolbar
        selectedText={textSelection?.text || ''}
        position={textSelection?.position || { x: 0, y: 0 }}
        onExplain={handleExplainAction}
        onRedraft={handleRedraftAction}
        onClose={() => {
          console.log('Toolbar onClose called - closing toolbar')
          setShowToolbar(false)
          setTextSelection(null)
        }}
        isVisible={!!(textSelection && showToolbar)}
      />
    </div>
  )
}

// Export the scrollToRisk function for external use
export const scrollToContractRisk = (riskId: string) => {
  if (typeof window !== 'undefined' && (window as any).scrollToContractRisk) {
    (window as any).scrollToContractRisk(riskId)
  }
}