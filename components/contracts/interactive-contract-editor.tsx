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
  const [editingContent, setEditingContent] = useState('') // Separate state for editing
  const [riskHighlights, setRiskHighlights] = useState<RiskHighlight[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [textSelection, setTextSelection] = useState<TextSelection | null>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const downloadRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Document beautification function - moved up to prevent hoisting issues
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

  // Update content when contract changes
  useEffect(() => {
    if (contract) {
      const newContent = contract.content || ''
      setContent(newContent)
      // Set editing content to beautified version for consistent formatting
      setEditingContent(beautifyContent(newContent))
    } else {
      setContent('')
      setEditingContent('')
    }
  }, [contract, beautifyContent])

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

  // PERFORMANCE FIX: Removed expensive fuzzy matching functions
  // These functions (calculateSimilarity, levenshteinDistance) were causing browser crashes
  // due to creating massive matrices for large contracts. Now using simple text search instead.

  // PERFORMANCE FIX: Removed expensive findTextInDocument function
  // This function contained multiple complex search strategies that caused browser crashes
  // Now using simple text search (findSimpleTextPosition) instead

  // PERFORMANCE FIX: Accurate text position finder with context awareness
  const findSimpleTextPosition = useCallback((text: string, clause: string): TextPosition => {
    if (!text || !clause) {
      return { start: 0, end: 0 }
    }
    
    // Clean and normalize both texts for better matching
    const normalizeText = (str: string) => str.replace(/\s+/g, ' ').trim()
    const normalizedClause = normalizeText(clause)
    
    // Strategy 1: Try exact match first (fastest)
    const exactIndex = text.indexOf(clause)
    if (exactIndex !== -1) {
      return { start: exactIndex, end: exactIndex + clause.length }
    }
    
    // Strategy 2: Try case-insensitive match
    const lowerText = text.toLowerCase()
    const lowerClause = clause.toLowerCase()
    const caseIndex = lowerText.indexOf(lowerClause)
    if (caseIndex !== -1) {
      return { start: caseIndex, end: caseIndex + clause.length }
    }
    
    // Strategy 3: Try normalized whitespace matching
    const normalizedText = normalizeText(text)
    const normalizedLowerText = normalizedText.toLowerCase()
    const normalizedLowerClause = normalizedClause.toLowerCase()
    
    const normalizedIndex = normalizedLowerText.indexOf(normalizedLowerClause)
    if (normalizedIndex !== -1) {
      // Map back to original text positions
      let originalPosition = 0
      let normalizedPosition = 0
      
      // Find the original position by walking through the text
      for (let i = 0; i < text.length && normalizedPosition < normalizedIndex; i++) {
        if (text[i].match(/\s/)) {
          // Skip multiple consecutive spaces in normalized version
          if (i === 0 || !text[i-1].match(/\s/)) {
            normalizedPosition++
          }
        } else {
          normalizedPosition++
        }
        originalPosition = i + 1
      }
      
      return { start: originalPosition, end: originalPosition + clause.length }
    }
    
    // Strategy 4: Try partial matching for significant substrings
    if (clause.length > 20) {
      // Try the first and last significant parts
      const firstPart = clause.substring(0, Math.floor(clause.length / 2)).trim()
      const lastPart = clause.substring(Math.floor(clause.length / 2)).trim()
      
      if (firstPart.length > 10) {
        const firstIndex = lowerText.indexOf(firstPart.toLowerCase())
        if (firstIndex !== -1) {
          // Found first part, try to extend to find full match
          const potentialEnd = Math.min(text.length, firstIndex + clause.length + 50)
          const extendedText = text.substring(firstIndex, potentialEnd)
          
          // Check if this extended text contains most of our clause
          const wordsInClause = clause.split(/\s+/).filter(w => w.length > 3)
          const wordsInExtended = extendedText.split(/\s+/).filter(w => w.length > 3)
          const matchingWords = wordsInClause.filter(word => 
            wordsInExtended.some(extWord => extWord.toLowerCase().includes(word.toLowerCase()))
          )
          
          if (matchingWords.length >= wordsInClause.length * 0.7) {
            return { start: firstIndex, end: Math.min(firstIndex + clause.length, potentialEnd) }
          }
        }
      }
    }
    
    // Strategy 5: Find best matching sentence/paragraph
    const clauseWords = clause.split(/\s+/).filter(w => w.length > 3)
    if (clauseWords.length >= 3) {
      const sentences = text.split(/[.!?]+/)
      let bestMatch = { start: 0, end: clause.length, score: 0 }
      
      sentences.forEach(sentence => {
        const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 3)
        const matchingWords = clauseWords.filter(word => 
          sentenceWords.some(sentWord => sentWord.toLowerCase().includes(word.toLowerCase()))
        )
        
        const score = matchingWords.length / clauseWords.length
        if (score > bestMatch.score && score >= 0.5) {
          const sentenceIndex = text.indexOf(sentence)
          if (sentenceIndex !== -1) {
            bestMatch = {
              start: sentenceIndex,
              end: sentenceIndex + sentence.length,
              score: score
            }
          }
        }
      })
      
      if (bestMatch.score >= 0.5) {
        return { start: bestMatch.start, end: bestMatch.end }
      }
    }
    
    // If no match found, return position at start (graceful degradation)
    return { start: 0, end: clause.length }
  }, [])

  // DEPRECATED: Keeping for reference but not using (causes browser crashes)
  // const mapRisksToText = useCallback((text: string, riskList: RiskFactor[]): RiskHighlight[] => {
  //   // This function contained expensive Levenshtein distance calculations
  //   // that caused browser crashes. Now using simple text search instead.
  //   return []
  // }, [])

  // Get editing content - preserve formatting for better editing experience
  const getEditingContent = useCallback(() => {
    // Use beautified content for editing to maintain readability
    return beautifyContent(content)
  }, [content, beautifyContent])

  // Get formatted content for display
  const getFormattedContent = useCallback(() => {
    return beautifyContent(content)
  }, [content, beautifyContent])

  // PERFORMANCE FIX: Load pre-mapped risks from backend instead of expensive text processing
  useEffect(() => {
    console.log('🔍 Loading cached risk highlights:', { 
      contentLength: content.length, 
      risksCount: risks.length,
      currentHighlights: riskHighlights.length,
      isEditing
    })
    
    if (content && risks.length > 0) {
      console.log('📍 Using cached risk data (no heavy processing)...')
      // PERFORMANCE FIX: Use risks directly from backend cache - they already have positions
      // Convert RiskFactor[] to RiskHighlight[] format for display
      const cachedHighlights: RiskHighlight[] = risks.map((risk, index) => ({
        id: risk.id || `risk-${index}`,
        clause: risk.clause || '',
        clauseLocation: risk.clauseLocation || '',
        riskLevel: risk.riskLevel || 'medium',
        riskScore: risk.riskScore || 5,
        category: risk.category || 'General',
        explanation: risk.explanation || '',
        suggestion: risk.suggestion || '',
        legalPrecedent: risk.legalPrecedent,
        affectedParty: risk.affectedParty || '',
        // Use simple text search for position (fast fallback)
        textPosition: findSimpleTextPosition(content, risk.clause || ''),
        elementId: `risk-highlight-${risk.id || index}`
      }))
      
      console.log('✅ Setting cached risk highlights:', cachedHighlights.length, 'highlights loaded')
      setRiskHighlights(cachedHighlights)
    } else {
      console.log('❌ Clearing risk highlights - no content or risks')
      setRiskHighlights([])
    }
  }, [content, risks, findSimpleTextPosition]) // Added findSimpleTextPosition to dependencies

  // Function to render content with risk highlights
  const renderHighlightedContent = useCallback(() => {
    if (!content) {
      console.log('📄 No content to render')
      return ''
    }
    
    // Use beautified content for better readability, but map risks to original positions
    const displayContent = getFormattedContent()
    
    console.log('🎨 Rendering content with highlights:', { 
      contentLength: displayContent.length, 
      highlightsCount: riskHighlights.length,
      isEditing
    })
    
    if (riskHighlights.length === 0) {
      console.log('📄 Rendering plain content (no highlights)')
      // Show beautified content when no risks
      return displayContent.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < displayContent.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))
    }
    
    console.log('🌈 Rendering highlighted content with', riskHighlights.length, 'highlights')

    // Re-map risk positions to the beautified content for accurate highlighting
    const remappedHighlights = riskHighlights.map(highlight => ({
      ...highlight,
      textPosition: findSimpleTextPosition(displayContent, highlight.clause || '')
    }))

    const parts: React.ReactElement[] = []
    let lastIndex = 0

    remappedHighlights.forEach((highlight, index) => {
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
  }, [content, riskHighlights, getFormattedContent, findSimpleTextPosition])

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

  // Handle editing content change (immediate local state update)
  const handleEditingContentChange = (newEditingContent: string) => {
    // Update editing content immediately (no cursor issues)
    setEditingContent(newEditingContent)
    
    // Update raw content for saving (this becomes the source of truth)
    setContent(newEditingContent)
    
    // Don't save immediately - use debounced save instead
    debouncedSave(newEditingContent)
  }

  // Debounced save function - only saves after user stops typing for 2 seconds
  const debouncedSave = useCallback((newContent: string) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set new timeout to save after 2 seconds of no typing
    saveTimeoutRef.current = setTimeout(() => {
      console.log('💾 Auto-saving contract after 2 seconds of no typing...')
      onContentChange(newContent)
      saveTimeoutRef.current = null
    }, 2000) // 2 seconds delay
  }, [onContentChange])

  // Force save when switching modes or component unmounts
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      console.log('💾 Force saving contract...')
      onContentChange(content)
      saveTimeoutRef.current = null
    }
  }, [content, onContentChange])

  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    // Save scroll position from the parent scrollable container
    const scrollContainer = contentRef.current?.parentElement || editorRef.current?.parentElement
    if (scrollContainer) {
      const currentScroll = scrollContainer.scrollTop
      setScrollPosition(currentScroll)
      console.log('📍 Saved scroll position:', currentScroll)
    }
  }, [])

  // Restore saved scroll position
  const restoreScrollPosition = useCallback(() => {
    setTimeout(() => {
      // Restore scroll position to the parent scrollable container
      const scrollContainer = contentRef.current?.parentElement || editorRef.current?.parentElement
      if (scrollContainer && scrollPosition > 0) {
        scrollContainer.scrollTop = scrollPosition
        console.log('🎯 Restored scroll position:', scrollPosition)
      }
    }, 200) // Increased delay to ensure DOM is ready and content is rendered
  }, [scrollPosition])

  // Handle done editing - trigger analysis relaunch
  const handleDoneEditing = useCallback(async () => {
    console.log('🔄 Done editing - triggering analysis relaunch')
    
    // Force save any pending changes before exiting edit mode
    forceSave()
    
    // Save current scroll position
    saveScrollPosition()
    
    // Update content with the final edited content
    setContent(editingContent)
    
    // Exit edit mode
    setIsEditing(false)
    
    // Trigger full analysis relaunch after content changes
    if (onReanalyzeRisks) {
      console.log('🔄 Triggering full analysis relaunch after editing...')
      try {
        await onReanalyzeRisks()
        console.log('✅ Analysis relaunch completed successfully')
      } catch (error) {
        console.error('❌ Analysis relaunch failed:', error)
      }
    } else {
      console.log('⚠️ No reanalysis function available')
    }
    
    // Restore scroll position after analysis
    setTimeout(() => {
      restoreScrollPosition()
    }, 500)
  }, [onReanalyzeRisks, saveScrollPosition, restoreScrollPosition, forceSave, editingContent])

  // Toggle between view and edit modes
  const toggleEditMode = useCallback(() => {
    if (isEditing) {
      // User clicked "Done Editing" - trigger analysis relaunch
      handleDoneEditing()
    } else {
      // User clicked "Edit Contract" - enter edit mode
      // Save current scroll position before switching modes
      saveScrollPosition()
      
      // Initialize editing content with beautified version
      setEditingContent(beautifyContent(content))
      
      setIsEditing(true)
      
      // Focus and restore scroll position when entering edit mode
      setTimeout(() => {
        // Always focus on textarea in edit mode
        editorRef.current?.focus()
        restoreScrollPosition()
      }, 150)
    }
  }, [isEditing, handleDoneEditing, saveScrollPosition, restoreScrollPosition, content, beautifyContent])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

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
        
        {isEditing && (
          <div className={styles.riskInfo}>
            <span className={styles.riskCount}>
              Editing mode - formatted content preserved
            </span>
            <span className={styles.selectionHint}>
              Click "Done Editing" to refresh risk analysis
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {isEditing ? (
          // Edit mode: Use separate editing state for cursor stability
          <textarea
            ref={editorRef}
            value={editingContent}
            onChange={(e) => {
              // Update editing content directly (no cursor issues)
              const newEditingContent = e.target.value
              handleEditingContentChange(newEditingContent)
            }}
            className={styles.editor}
            placeholder="Enter contract content..."
            style={{
              fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '16px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              padding: '32px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              color: '#1f2937'
            }}
          />
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