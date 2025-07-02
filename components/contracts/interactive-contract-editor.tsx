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

  // Function to map risks to exact text positions with improved accuracy
  const mapRisksToText = useCallback((text: string, riskList: RiskFactor[]): RiskHighlight[] => {
    if (!text || !riskList || riskList.length === 0) {
      console.log('🗺️ mapRisksToText: No text or risks to map')
      return []
    }
    
    console.log('🗺️ mapRisksToText called with:', { 
      textLength: text.length, 
      risksCount: riskList.length
    })
    const highlights: RiskHighlight[] = []
    
    riskList.forEach((risk, index) => {
      if (!risk || !risk.clause) {
        console.log(`⚠️ Risk ${index} has no clause, skipping`)
        return
      }
      
      const clauseText = risk.clause.trim()
      console.log(`🔍 Searching for risk ${index}: "${clauseText.substring(0, 50)}..."`)
      
      let foundIndex = -1
      let actualMatchText = clauseText
      
      // Strategy 1: Exact match (most accurate)
      foundIndex = text.indexOf(clauseText)
      if (foundIndex !== -1) {
        actualMatchText = clauseText
        console.log(`✅ Risk ${index} found via exact matching at position ${foundIndex}`)
      }
      
      // Strategy 2: Case-insensitive exact match
      if (foundIndex === -1) {
        const lowerText = text.toLowerCase()
        const lowerClause = clauseText.toLowerCase()
        const lowerIndex = lowerText.indexOf(lowerClause)
        if (lowerIndex !== -1) {
          foundIndex = lowerIndex
          actualMatchText = text.substring(lowerIndex, lowerIndex + clauseText.length)
          console.log(`✅ Risk ${index} found via case-insensitive matching at position ${foundIndex}`)
        }
      }
      
      // Strategy 3: Normalized whitespace match (with correct position mapping)
      if (foundIndex === -1) {
        const normalizedClause = clauseText.replace(/\s+/g, ' ').trim()
        
        // Create a mapping of normalized positions to original positions
        const positionMap: number[] = []
        let normalizedIndex = 0
        let wasSpace = false
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          if (char.match(/\s/)) {
            if (!wasSpace) {
              positionMap[normalizedIndex] = i
              normalizedIndex++
              wasSpace = true
            }
          } else {
            positionMap[normalizedIndex] = i
            normalizedIndex++
            wasSpace = false
          }
        }
        
        const normalizedText = text.replace(/\s+/g, ' ')
        const normalizedMatchIndex = normalizedText.toLowerCase().indexOf(normalizedClause.toLowerCase())
        
        if (normalizedMatchIndex !== -1 && positionMap[normalizedMatchIndex] !== undefined) {
          foundIndex = positionMap[normalizedMatchIndex]
          
          // Find the end position more accurately
          let endPos = foundIndex
          let matchedChars = 0
          for (let i = foundIndex; i < text.length && matchedChars < normalizedClause.length; i++) {
            if (!text[i].match(/\s/) || matchedChars === 0 || !normalizedClause[matchedChars - 1]?.match(/\s/)) {
              matchedChars++
            }
            endPos = i + 1
          }
          
          actualMatchText = text.substring(foundIndex, endPos)
          console.log(`✅ Risk ${index} found via normalized matching at position ${foundIndex}`)
        }
      }
      
      // Strategy 4: Partial phrase matching (only for long clauses)
      if (foundIndex === -1 && clauseText.length > 100) {
        // Split into meaningful phrases and find the longest matching phrase
        const phrases = clauseText
          .split(/[.!?;]/)
          .map(phrase => phrase.trim())
          .filter(phrase => phrase.length > 30) // Only longer phrases
          .sort((a, b) => b.length - a.length) // Try longest first
        
        for (const phrase of phrases) {
          const phraseIndex = text.toLowerCase().indexOf(phrase.toLowerCase())
          if (phraseIndex !== -1) {
            foundIndex = phraseIndex
            actualMatchText = text.substring(phraseIndex, phraseIndex + phrase.length)
            console.log(`✅ Risk ${index} found via phrase matching: "${phrase.substring(0, 50)}..."`)
            break
          }
        }
      }
      
      if (foundIndex !== -1) {
        const matchLength = actualMatchText.length
        const newStart = foundIndex
        const newEnd = foundIndex + matchLength
        
        // Improved overlap detection - check for any overlap, not just containment
        const isOverlapping = highlights.some(existing => {
          const existingStart = existing.textPosition.start
          const existingEnd = existing.textPosition.end
          
          // Check if ranges overlap at all
          return (newStart < existingEnd && newEnd > existingStart)
        })
        
        if (!isOverlapping) {
          console.log(`✅ Risk ${index} mapped successfully at position ${foundIndex}-${foundIndex + matchLength}`)
          highlights.push({
            ...risk,
            textPosition: {
              start: newStart,
              end: newEnd
            },
            elementId: `risk-highlight-${risk.id || index}`
          })
        } else {
          console.log(`⚠️ Risk ${index} overlaps with existing highlight at position ${foundIndex}`)
          
          // For debugging: show what it would overlap with
          const overlapping = highlights.find(existing => {
            const existingStart = existing.textPosition.start
            const existingEnd = existing.textPosition.end
            return (newStart < existingEnd && newEnd > existingStart)
          })
          if (overlapping) {
            console.log(`   Overlaps with existing highlight: ${overlapping.textPosition.start}-${overlapping.textPosition.end}`)
          }
        }
      } else {
        console.log(`❌ Risk ${index} not found in text:`)
        console.log(`   Clause: "${clauseText.substring(0, 100)}${clauseText.length > 100 ? '...' : ''}"`)
        console.log(`   Text sample: "${text.substring(0, 200)}..."`)
      }
    })
    
    // Sort by position to ensure proper rendering order
    const sortedHighlights = highlights.sort((a, b) => a.textPosition.start - b.textPosition.start)
    console.log(`📊 Final risk mapping result: ${sortedHighlights.length}/${riskList.length} risks mapped`)
    return sortedHighlights
  }, [])

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

  // Check if analysis is still in progress
  const isAnalysisInProgress = contract.analysis_status === 'in_progress' || contract.analysis_status === 'pending'
  const analysisProgress = contract.analysis_progress || 0

  if (isAnalysisInProgress) {
    return (
      <div className={styles.analysisInProgress}>
        <div className={styles.analysisMessage}>
          <h3>🤖 AI Analysis in Progress</h3>
          <p>Your contract is being analyzed automatically...</p>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {analysisProgress}% Complete
            </span>
          </div>
          
          <div className={styles.analysisSteps}>
            <div className={`${styles.step} ${analysisProgress >= 33 ? styles.completed : styles.pending}`}>
              ✓ Summary Analysis
            </div>
            <div className={`${styles.step} ${analysisProgress >= 66 ? styles.completed : styles.pending}`}>
              ✓ Risk Analysis  
            </div>
            <div className={`${styles.step} ${analysisProgress >= 100 ? styles.completed : styles.pending}`}>
              ✓ Completeness Check
            </div>
          </div>
          
          <p className={styles.waitMessage}>
            The contract will be available for editing once analysis is complete.
          </p>
        </div>
      </div>
    )
  }

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